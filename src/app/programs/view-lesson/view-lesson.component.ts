import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ProgramsService } from '../services/programs.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentBase } from 'src/app/common/componentbase';
import { combineLatest, map, Subject, switchMap, tap } from 'rxjs';
import { ModuleContent, ModuleContentFile } from '../models/program.model';

@Component({
  selector: 'app-view-lesson',
  templateUrl: './view-lesson.component.html',
  styleUrls: ['./view-lesson.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ViewLessonComponent extends ComponentBase {
  lesson: ModuleContent | null = null;
  files: Array<ModuleContentFile> = [];

  markAsCompleteSubject$: Subject<void> = new Subject<void>();

  next_module_content: ModuleContent | null = null;
  previous_module_content: ModuleContent | null = null;
  isLastContent: boolean = false;

  program_id: number = 0;
  module_id: number = 0;
  isLoading: boolean = true;
  errorMessage = '';
  showErrorToast = false;

  constructor(
    private programService: ProgramsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    super();
  }

  ngOnInit() {
    this.errorMessage = '';
    this.showErrorToast = false;
    let sub = this.route.params
      .pipe(
        map((params) => {
          return {
            program_id: params['program_id'],
            module_id: params['module_id'],
            module_content_id: params['module_content_id'],
          };
        }),
        tap((params) => {
          this.program_id = params.program_id;
          this.module_id = params.module_id;
          this.isLoading = true;
          this.lesson = null;
          this.isLastContent = false;
        }),
        switchMap((params) => {
          return combineLatest([
            this.programService.getLesson(
              params.program_id,
              params.module_id,
              params.module_content_id,
            ),
            this.programService.getProgramCatalog(params.program_id),
          ]);
        }),
      )
      .subscribe({
        next: ([lesson, catalog]) => {
          this.lesson = lesson.content;
          this.files = lesson.files;
          this.isLoading = false;
          if (this.files.length == 0) {
            this.markAsCompleteSubject$.next();
          }

          if (catalog && catalog.modules) {
            const contents = catalog.modules.flatMap(
              (m) => m.module_contents || [],
            );
            const currentIndex = contents.findIndex(
              (c) => c.id == this.lesson?.id,
            );

            if (currentIndex > 0) {
              this.previous_module_content = contents[currentIndex - 1];
            } else {
              this.previous_module_content = null;
            }

            if (currentIndex < contents.length - 1) {
              this.next_module_content = contents[currentIndex + 1];
            } else {
              this.next_module_content = null;
            }
            this.isLastContent = currentIndex === contents.length - 1;
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.lesson = null;
          this.files = [];
          this.errorMessage =
            err?.error?.error || err?.message || 'Failed to load content';
          this.triggerErrorToast();
        },
      });
    this.registerSubscription(sub);
    let sub1 = this.markAsCompleteSubject$.subscribe(() => {
      this.markAsComplete();
    });
    this.registerSubscription(sub1);
  }

  markAsComplete() {
    if (this.lesson) {
      this.programService
        .updateLessonStatus(
          this.program_id,
          this.module_id,
          this.lesson?.id,
          'COMPLETED',
        )
        .subscribe((res) => {
          this.next_module_content = res;
        });
    }
  }
  onNextContentAvailable(next_content: ModuleContent) {
    this.next_module_content = next_content;
  }
  goToCatalog() {
    this.router.navigateByUrl(`/programs/${this.program_id}/details`);
  }
  goToPreviousContent() {
    if (this.previous_module_content) {
      this.goToContent(this.previous_module_content);
    }
  }

  goToNextContent() {
    if (this.next_module_content) {
      this.goToContent(this.next_module_content);
    } else {
      this.goToCourseCompleted();
    }
  }

  private goToCourseCompleted(): void {
    this.router.navigateByUrl(`/programs/${this.program_id}/details/completed`);
  }

  private triggerErrorToast(): void {
    this.showErrorToast = true;
    setTimeout(() => {
      this.showErrorToast = false;
      this.errorMessage = '';
    }, 5000);
  }

  private goToContent(content: ModuleContent) {
    const path = content.content_type == 'LESSON' ? 'lesson' : 'exam';
    this.router.navigateByUrl(
      `/programs/${this.program_id}/details/modules/${content.module_id}/contents/${content.id}/${path}`,
    );
  }
}
