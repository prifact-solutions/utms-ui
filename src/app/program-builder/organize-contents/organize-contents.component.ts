import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DOCUMENT, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { ComponentBase } from 'src/app/common/componentbase';
import { ContentOrganizationUpdate, Module, ModuleContent, Program } from 'src/app/programs/models/program.model';
import { ProgramsService } from 'src/app/programs/services/programs.service';
import { PreviewSession } from 'src/app/programs/preview-session';

type SaveMode = 'preview' | 'publish';

interface OrganizedContent extends ModuleContent {
  module_title?: string;
  previous_content_options?: { id: number; title: string }[];
}

interface OrganizedModule {
  module: Module;
  contents: OrganizedContent[];
}

@Component({
  selector: 'app-organize-contents',
  templateUrl: './organize-contents.component.html',
  styleUrls: ['./organize-contents.component.scss']
})
export class OrganizeContentsComponent extends ComponentBase implements OnInit, OnDestroy {
  program: Program | null = null;
  organizedModules: OrganizedModule[] = [];
  selectedModuleGroup: OrganizedModule | null = null;
  isLoading = false;
  isSaving = false;
  savingAction: SaveMode | null = null;
  programId: number = 0;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private programsService: ProgramsService,
    private renderer: Renderer2,
    private location: Location,
    @Inject(DOCUMENT) private document: Document
  ) {
    super();
  }

  ngOnInit(): void {
    this.renderer.addClass(this.document.body, 'manage-course-view');
    this.programId = +this.route.snapshot.params['program_id'];
    this.loadData();
  }

  override ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, 'manage-course-view');
    super.ngOnDestroy();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.route.params.pipe(
      switchMap(params => {
        return this.programsService.getProgramCatalog(params["program_id"]);
      })
    ).subscribe({
      next: (program) => {
        this.program = program;
        this.organizeContents(program.modules || []);
        this.selectedModuleGroup = this.organizedModules[0] || null;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading program catalog:', error);
        this.errorMessage = 'Failed to load program data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  organizeContents(modules: Module[]): void {
    this.organizedModules = [];

    // Sort modules by order
    const sortedModules = modules.sort((a, b) => (a.order || 0) - (b.order || 0));

    sortedModules.forEach(module => {
      // Sort contents by order
      const sortedContents = module.module_contents.sort((a, b) => a.order - b.order);

      const organizedContents: OrganizedContent[] = sortedContents.map(content => ({
        ...content,
        module_title: module.title
      }));

      this.organizedModules.push({
        module,
        contents: organizedContents
      });
    });

    this.updateOrderAndPrevious();
  }

  selectModuleGroup(moduleGroup: OrganizedModule): void {
    this.selectedModuleGroup = moduleGroup;
  }

  updateOrderAndPrevious(): void {
    let globalModuleOrder = 1, globalContentOrder = 1;
    const allContents: OrganizedContent[] = [];

    //This recalculated order is only for display purposes and is not saved to DB
    this.organizedModules.forEach(moduleGroup => {
      moduleGroup.module.order = globalModuleOrder++;
    })

    // First pass: collect all contents in order and assign global orders
    this.organizedModules.forEach(moduleGroup => {
      moduleGroup.contents.forEach(content => {
        content.order = globalContentOrder++;
        allContents.push(content);
      });
    });

    // Second pass: set previous content options and relationships
    this.organizedModules.forEach(moduleGroup => {
      moduleGroup.contents.forEach((content, moduleContentIndex) => {
        const contentIndex = allContents.indexOf(content);

        // Previous content options: all contents before this one in the global sequence
        content.previous_content_options = [
          { id: 0, title: 'None (First Content)' },
          ...allContents.slice(0, contentIndex).map(c => ({ id: c.id, title: c.title }))
        ];

        // Auto-set previous content to the immediately previous content in sequence
        if (contentIndex > 0) {
          content.previous_content_id = allContents[contentIndex - 1].id;
        } else {
          content.previous_content_id = null;
        }
      });
    });
  }

  onOrderChange(content: OrganizedContent, newOrderStr: string): void {
    const newOrder = parseInt(newOrderStr, 10);
    if (isNaN(newOrder)) return;

    // Find which module this content belongs to
    const moduleGroup = this.organizedModules.find(mg =>
      mg.contents.some(c => c.id === content.id)
    );

    if (!moduleGroup) return;

    // Remove the content from current position
    const moduleContents = moduleGroup.contents;
    const currentIndex = moduleContents.findIndex(c => c.id === content.id);
    if (currentIndex === -1) return;

    const [item] = moduleContents.splice(currentIndex, 1);

    // Insert at new position (clamped between 1 and max contents)
    const normalizedOrder = Math.max(1, Math.min(newOrder, moduleContents.length + 1));
    moduleContents.splice(normalizedOrder - 1, 0, item);

    // Reassign continuous ordering 1...N
    moduleContents.forEach((c, index) => {
      c.order = index + 1;
    });

    // Update all internal relationships (like previous_content_id)
    this.updateOrderAndPrevious();

    // Trigger explicit change detection by re-assigning organizedModules reference
    this.organizedModules = [...this.organizedModules];
    this.selectedModuleGroup = this.organizedModules.find(mg =>
      mg.module.id === moduleGroup.module.id
    ) || null;
  }

  getContentTypeClass(content: OrganizedContent): string {
    return content.content_type === 'EXAM' ? 'exam' : 'lesson';
  }

  onPreviousContentChange(content: OrganizedContent, previousId: number): void {
    // No longer used directly from UI, but kept if needed programatically
    content.previous_content_id = previousId || null;
  }

  onPreview(): void {
    if (this.isSaving) return;
    // Open the tab synchronously in the click handler so popup blockers allow it.
    // A named target reuses this course's preview tab instead of piling up new ones.
    const previewTab = window.open('', this.previewTabName);
    this.saveCourse('preview', previewTab);
  }

  onPublish(): void {
    if (this.isSaving) return;
    this.saveCourse('publish');
  }

  /** Shared save for preview and publish: validates, saves ordering, then runs the mode-specific step. */
  private saveCourse(mode: SaveMode, previewTab: Window | null = null): void {
    if (!this.program) {
      this.discardPreviewTab(previewTab);
      return;
    }

    this.errorMessage = null;
    this.successMessage = null;

    if (this.organizedModules.some((module) => module.contents.length == 0)) {
      this.errorMessage =
        'This course contains modules without any content. Please remove them to proceed.';
      this.discardPreviewTab(previewTab);
      return;
    }

    const contentUpdates: ContentOrganizationUpdate[] = this.organizedModules
      .flatMap(mg => mg.contents)
      .map(content => ({
        content_id: content.id,
        previous_content_id: content.previous_content_id || null,
        order: content.order
      }));

    const request$ = mode === 'preview'
      ? this.programsService.previewProgram(this.program.id, contentUpdates)
      : this.programsService.updateContentOrganization(this.program.id, contentUpdates);

    this.isSaving = true;
    this.savingAction = mode;

    request$.subscribe({
      next: () => {
        this.savingAction = null;
        if (mode === 'preview') {
          this.isSaving = false;
          this.openPreview(previewTab);
          return;
        }
        // Keep buttons disabled until we leave: the course is now published
        this.successMessage = 'Course published successfully!';
        setTimeout(() => {
          this.router.navigate(['/programs-builder', this.programId, 'manage']);
        }, 1500);
      },
      error: (err) => {
        console.error(`Error saving course (${mode}):`, err);
        this.discardPreviewTab(previewTab);
        const reason = err?.error?.error;
        this.errorMessage = `Failed to ${mode} the course.` + (reason ? ` ${reason}.` : ' Please try again.');
        this.isSaving = false;
        this.savingAction = null;
      }
    });
  }

  /** Close the preview tab only if we just opened it blank; never close a preview the user is using. */
  private discardPreviewTab(previewTab: Window | null): void {
    try {
      if (previewTab && !previewTab.closed && previewTab.location.href === 'about:blank') {
        previewTab.close();
      }
    } catch {
      // Not accessible: leave it open
    }
  }

  private get previewTabName(): string {
    return `course-preview-${this.programId}`;
  }

  private openPreview(previewTab: Window | null): void {
    const path = this.location.prepareExternalUrl(
      this.router.serializeUrl(this.router.createUrlTree(
        ['/programs', this.programId, 'details'],
        { queryParams: { [PreviewSession.QUERY_PARAM]: 1 } }
      ))
    );
    // Absolute URL: don't rely on the blank tab inheriting this page's base URL
    const url = new URL(path, window.location.href).href;
    if (previewTab && !previewTab.closed) {
      // A reused tab still holds the old preview's state; with hash routing a
      // URL change alone won't reload it, so force a fresh load after the reset.
      let reused = false;
      try {
        reused = previewTab.location.href !== 'about:blank';
      } catch {
        reused = true;
      }
      previewTab.location.href = url;
      if (reused) {
        previewTab.location.reload();
      }
      previewTab.focus();
    } else if (!window.open(url, this.previewTabName)) {
      this.errorMessage = 'Preview is ready, but the new tab was blocked. Please allow pop-ups for this site and try again.';
      return;
    }
    this.successMessage = 'Course saved. Preview opened in a new tab.';
  }

  getPreviousContentTitle(content: OrganizedContent): string {
    if (!content.previous_content_id) return 'None';
    const allContents = this.organizedModules.flatMap(mg => mg.contents);
    const prevContent = allContents.find(c => c.id === content.previous_content_id);
    return prevContent ? prevContent.title : 'Unknown';
  }

  trackByContentId(index: number, content: OrganizedContent): number {
    return content.id;
  }
}
