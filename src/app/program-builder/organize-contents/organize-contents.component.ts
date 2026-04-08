import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { ComponentBase } from 'src/app/common/componentbase';
import { Module, ModuleContent, Program } from 'src/app/programs/models/program.model';
import { ProgramsService } from 'src/app/programs/services/programs.service';

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
export class OrganizeContentsComponent extends ComponentBase implements OnInit {
  program: Program | null = null;
  organizedModules: OrganizedModule[] = [];
  isLoading = false;
  isSaving = false;
  programId: number = 0;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private programsService: ProgramsService
  ) {
    super();
  }

  ngOnInit(): void {
    this.programId = +this.route.snapshot.params['program_id'];
    this.loadData();
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

  updateOrderAndPrevious(): void {
    let globalOrder = 1;
    const allContents: OrganizedContent[] = [];

    // First pass: collect all contents in order and assign global orders
    this.organizedModules.forEach(moduleGroup => {
      moduleGroup.contents.forEach(content => {
        content.order = globalOrder++;
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
  }

  onPreviousContentChange(content: OrganizedContent, previousId: number): void {
    // No longer used directly from UI, but kept if needed programatically
    content.previous_content_id = previousId || null;
  }

  saveAllChanges(): void {
    if (!this.program) return;

    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;

    // Collect all contents from all modules
    const allContents = this.organizedModules.flatMap(mg => mg.contents);

    // Prepare content updates array
    const contentUpdates = allContents.map(content => ({
      content_id: content.id,
      previous_content_id: content.previous_content_id == 0 ? null : content.previous_content_id,
      order: content.order
    }));

    // Make single API call
    this.programsService.updateContentOrganization(this.program.id, contentUpdates).subscribe({
      next: () => {
        this.successMessage = 'Content organization saved successfully!';
        this.isSaving = false;
        setTimeout(() => {
          this.router.navigate(['/programs-builder', this.programId, 'modules']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error saving changes:', err);
        // this.errorMessage = 'Failed to save changes. Please try again.';
        this.errorMessage = 'Failed to save changes. ' + err.error.error + '.';
        this.isSaving = false;
      }
    });
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