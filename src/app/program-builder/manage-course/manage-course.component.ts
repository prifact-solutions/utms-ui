import {
  Component,
  OnInit,
  OnDestroy,
  Renderer2,
  Inject,
  ViewEncapsulation,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentBase } from 'src/app/common/componentbase';
import {
  Program,
  Category,
  Module,
  ModuleContent,
} from 'src/app/programs/models/program.model';
import { ProgramsService } from 'src/app/programs/services/programs.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-manage-course',
  templateUrl: './manage-course.component.html',
  styleUrls: ['./manage-course.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ManageCourseComponent
  extends ComponentBase
  implements OnInit, OnDestroy
{
  public activeTab: 'curriculum' | 'question-papers' = 'curriculum';
  public programId!: number;
  public program: Program | null = null;
  public categories: Category[] = [];
  public isLoading: boolean = true;
  public showEditModal: boolean = false;
  public showViewModal: boolean = false;
  public showAddLessonModal: boolean = false;
  public showAddExamModal: boolean = false;
  public showEditModuleModal: boolean = false;
  public showAddModuleModal: boolean = false;
  public showDeleteConfirmModal: boolean = false;
  public showDeleteContentConfirmModal: boolean = false;
  public showEditLessonModal: boolean = false;
  public showEditExamModal: boolean = false;
  public selectedModule: Module | null = null;
  public moduleToEdit: Module | null = null;
  public lessonToEdit: ModuleContent | null = null;
  public examToEdit: ModuleContent | null = null;
  public moduleToDelete: Module | null = null;
  public contentToDelete: ModuleContent | null = null;
  public isPublishing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private programService: ProgramsService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
  ) {
    super();
  }

  ngOnInit(): void {
    this.programId = +this.route.snapshot.params['program_id'];
    
    const tab = this.route.snapshot.queryParams['tab'];
    if(tab == 'question-papers') {
      this.activeTab = 'question-papers';
    }

    this.loadData();
    this.renderer.addClass(this.document.body, 'manage-course-view');
  }

  setTab(tab: 'curriculum' | 'question-papers'): void {
    this.activeTab = tab;
  }

  override ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, 'manage-course-view');
    super.ngOnDestroy();
  }

  loadData(): void {
    this.isLoading = true;
    const sub = this.programService.getAllCategories().subscribe((cats) => {
      this.categories = cats;
      this.loadProgram();
    });
    this.registerSubscription(sub);
  }

  loadProgram(): void {
    const sub = this.programService
      .getProgramById(this.programId)
      .pipe(
        switchMap((program) => {
          this.program = program;
          return this.programService.getModulesForProgram(this.programId);
        }),
      )
      .subscribe({
        next: (modules) => {
          if (this.program) {
            this.program.modules =
              modules.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];
          }
          this.isLoading = false;

          // Auto-select first module if none selected
          if (this.program?.modules?.length && !this.selectedModule) {
            this.selectedModule = this.program.modules[0];
          } else if (this.selectedModule) {
            // Refresh selected module reference
            this.selectedModule =
              this.program?.modules?.find(
                (m: Module) => m.id === this.selectedModule?.id,
              ) ||
              this.program?.modules?.[0] ||
              null;
          }

          if (this.selectedModule) {
            this.fetchModuleContents(this.selectedModule);
          }
        },
        error: (err: any) => {
          console.error('Error loading program', err);
          this.isLoading = false;
        },
      });
    this.registerSubscription(sub);
  }

  getCategoryLabel(id: number): string | undefined {
    return this.categories.find((c) => c.id === id)?.name;
  }

  /** Published courses: structure changes are disabled in the UI (unpublish to edit). */
  get isCurriculumReadonly(): boolean {
    return this.program?.status === 'ACTIVE';
  }
  
  openViewModal(): void {
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
  }

  openEditModal(): void {
    this.showViewModal = false;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  onProgramUpdated(): void {
    this.showEditModal = false;
    this.loadProgram();
  }

  goBack(): void {
    this.router.navigate(['/programs-builder']);
  }

  selectModule(module: Module): void {
    this.selectedModule = module;
    this.fetchModuleContents(module);
  }

  fetchModuleContents(module: Module): void {
    const sub = this.programService
      .getModuleContentsForModule(this.programId, module.id)
      .subscribe({
        next: (contents) => {
          module.module_contents = contents.sort(
            (a, b) => (a.order || 0) - (b.order || 0),
          );
        },
        error: (err: any) => {
          console.error('Error fetching module contents', err);
        },
      });
    this.registerSubscription(sub);
  }

  addModule(): void {
    if (this.isCurriculumReadonly) {
      return;
    }
    this.showAddModuleModal = true;
  }

  closeAddModuleModal(): void {
    this.showAddModuleModal = false;
  }

  onModuleAdded(): void {
    this.showAddModuleModal = false;
    this.loadProgram();
  }

  openAddLessonModal(): void {
    if (this.isCurriculumReadonly) {
      return;
    }
    this.showAddLessonModal = true;
  }

  closeAddLessonModal(): void {
    this.showAddLessonModal = false;
  }

  onLessonAdded(): void {
    this.showAddLessonModal = false;
    if (this.selectedModule) {
      this.fetchModuleContents(this.selectedModule);
    }
  }

  openAddExamModal(): void {
    if (this.isCurriculumReadonly) {
      return;
    }
    this.showAddExamModal = true;
  }

  closeAddExamModal(): void {
    this.showAddExamModal = false;
  }

  onExamAdded(): void {
    this.showAddExamModal = false;
    if (this.selectedModule) {
      this.fetchModuleContents(this.selectedModule);
    }
  }

  addExam(): void {
    if (this.isCurriculumReadonly) {
      return;
    }
    if (this.selectedModule) {
      this.router.navigate([
        '/programs-builder',
        this.programId,
        'modules',
        this.selectedModule.id,
        'exams',
        'add',
      ]);
    }
  }

  editModule(module: Module, event: Event): void {
    event.stopPropagation();
    if (this.isCurriculumReadonly) {
      return;
    }
    this.moduleToEdit = module;
    this.showEditModuleModal = true;
  }

  closeEditModuleModal(): void {
    this.showEditModuleModal = false;
    this.moduleToEdit = null;
  }

  onModuleUpdated(): void {
    this.showEditModuleModal = false;
    this.moduleToEdit = null;
    this.loadProgram();
  }

  deleteModule(module: Module, event: Event): void {
    event.stopPropagation();
    if (this.isCurriculumReadonly) {
      return;
    }
    this.moduleToDelete = module;
    this.showDeleteConfirmModal = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirmModal = false;
    this.moduleToDelete = null;
  }

  confirmDeleteModule(): void {
    if (!this.moduleToDelete || this.isCurriculumReadonly) {
      return;
    }

    const sub = this.programService
      .deleteModule(this.programId, this.moduleToDelete.id)
      .subscribe({
        next: () => {
          if (this.selectedModule?.id === this.moduleToDelete?.id) {
            this.selectedModule = null;
          }
          this.closeDeleteConfirm();
          this.loadProgram();
        },
        error: (err: any) => {
          console.error('Error deleting module', err);
          alert('Failed to delete module');
          this.closeDeleteConfirm();
        },
      });
    this.registerSubscription(sub);
  }

  editContent(content: ModuleContent): void {
    if (this.isCurriculumReadonly) {
      return;
    }
    if (content.content_type === 'LESSON') {
      this.lessonToEdit = content;
      this.showEditLessonModal = true;
    } else if (content.content_type === 'EXAM') {
      this.examToEdit = content;
      this.showEditExamModal = true;
    }
  }

  deleteContent(content: ModuleContent): void {
    if (this.isCurriculumReadonly) {
      return;
    }
    this.contentToDelete = content;
    this.showDeleteContentConfirmModal = true;
  }

  closeDeleteContentConfirm(): void {
    this.showDeleteContentConfirmModal = false;
    this.contentToDelete = null;
  }

  confirmDeleteContent(): void {
    if (this.isCurriculumReadonly || !this.contentToDelete) {
      return;
    }

    const content = this.contentToDelete;
    const sub = this.programService
      .deleteModuleContent(this.programId, content.module_id, content.id)
      .subscribe({
        next: () => {
          this.closeDeleteContentConfirm();
          if (this.selectedModule) {
            this.fetchModuleContents(this.selectedModule);
          }
        },
        error: (err) => {
          console.error('Error deleting content', err);
          alert('Failed to delete content');
          this.closeDeleteContentConfirm();
        },
      });
    this.registerSubscription(sub);
  }

  closeEditLessonModal(): void {
    this.showEditLessonModal = false;
    this.lessonToEdit = null;
  }

  onLessonUpdated(): void {
    this.showEditLessonModal = false;
    this.lessonToEdit = null;
    if (this.selectedModule) {
      this.fetchModuleContents(this.selectedModule);
    }
  }

  closeEditExamModal(): void {
    this.showEditExamModal = false;
    this.examToEdit = null;
  }

  onExamUpdated(): void {
    this.showEditExamModal = false;
    this.examToEdit = null;
    if (this.selectedModule) {
      this.fetchModuleContents(this.selectedModule);
    }
  }

  togglePublish(): void {
    if (!this.program) return;
    this.router.navigateByUrl(`/programs-builder/${this.programId}/organize-contents`);

    // this.isPublishing = true;
    // const newStatus = this.program.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    // const newIsActive = newStatus === 'ACTIVE';

    // const payload: any = {
    //   title: this.program.title,
    //   description: this.program.description,
    //   duration: this.program.duration,
    //   is_active: newIsActive,
    //   status: newStatus,
    //   difficulty: this.program.difficulty || 'Beginner',
    //   video_hours: this.program.video_hours || 0,
    //   categories: this.program.categories || [],
    // };

    // const sub = this.programService
    //   .updateProgram(this.programId, payload)
    //   .subscribe({
    //     next: (updatedProgram) => {
    //       if (this.program) {
    //         this.program.status = updatedProgram?.status || newStatus;
    //         this.program.is_active =
    //           updatedProgram?.is_active !== undefined
    //             ? updatedProgram.is_active
    //             : newIsActive;
    //       }
    //       this.isPublishing = false;
    //     },
    //     error: (err) => {
    //       console.error('Error updating program status', err);
    //       this.isPublishing = false;
    //       alert(
    //         'Failed to update course status. Please ensure all required course details are filled.',
    //       );
    //     },
    //   });
    // this.registerSubscription(sub);
  }
}
