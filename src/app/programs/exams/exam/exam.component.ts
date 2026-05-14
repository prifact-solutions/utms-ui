import { Component, ViewEncapsulation } from '@angular/core';
import {
  Exam,
  ModuleContent,
  ModuleContentFile,
} from '../../models/program.model';
import { QuestionPaperAttemptContext } from '../../../shared/form-builder/lib/model/context';
import {
  EMPTY,
  catchError,
  forkJoin,
  map,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { ProgramsService } from '../../services/programs.service';
import {
  ExamAttemptStatus,
  ExamBackendService,
} from 'src/app/shared/services/exam-backend.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentBase } from 'src/app/common/componentbase';

@Component({
  selector: 'app-exam',
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ExamComponent extends ComponentBase {
  lesson: ModuleContent | null = null;
  files: Array<ModuleContentFile> = [];

  next_module_content: ModuleContent | null = null;
  previous_module_content: ModuleContent | null = null;

  program_id: number = 0;
  module_id: number = 0;
  module_content_id: number = 0;
  loading: boolean = true;
  errors: Error[] = [];
  attemptId!: number;
  timeDiff!: number;
  exam!: Exam;
  examContent!: ModuleContent;
  errorMessage = '';
  showErrorToast = false;
  showSaveConfirm: boolean = false;
  emittedEvent: QuestionPaperAttemptContext | undefined;
  private dateSubject = new Subject<string>();

  constructor(
    private programService: ProgramsService,
    private examService: ExamBackendService,
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
          this.module_content_id = params.module_content_id;
          this.loading = true;
        }),
        switchMap((params) => {
          return forkJoin([
            //TO-DO: Send ExamId as input instead of fetch here
            this.programService.getExam(
              params.program_id,
              params.module_id,
              params.module_content_id,
            ),
            // .pipe(
            //   switchMap((examDetails) => {
            //     this.examContent = examDetails.content;
            //     this.exam = examDetails.exam;
            //     this.timeDiff =
            //       examDetails.exam.duration_hours * 60 * 60 * 1000;
            //     return this.examService
            //       .getExamAttempt(this.program_id, examDetails.exam.id)
            //       .pipe(
            //         switchMap((attempt) => {
            //           if (attempt) {
            //             return of(attempt);
            //           } else {
            //             return this.examService.attemptExam(
            //               params.program_id,
            //               params.module_id,
            //               params.module_content_id,
            //               examDetails.exam.id,
            //             );
            //           }
            //         }),
            //       );
            //   }),
            // )
            this.programService.getProgramCatalog(params.program_id),
          ]).pipe(
            catchError((err) => {
              this.handleLoadError(err);
              return EMPTY;
            }),
          );
        }),
        switchMap(([examDetails, catalog]) => {
          this.examContent = examDetails.content;
          this.exam = examDetails.exam;
          this.timeDiff = examDetails.exam.duration_hours * 60 * 60 * 1000;
          if (catalog && catalog.modules) {
            const contents = catalog.modules.flatMap(
              (m) => m.module_contents || [],
            );
            const currentIndex = contents.findIndex(
              (c) => c.id == this.examContent.id,
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
          }
          return this.examService
            .getExamAttempt(this.program_id, examDetails.exam.id)
            .pipe(
              switchMap((attempt) => {
                if (attempt) {
                  return of(attempt);
                } else {
                  return this.examService.attemptExam(
                    this.program_id,
                    this.module_id,
                    this.module_content_id,
                    examDetails.exam.id,
                  );
                }
              }),
              catchError((err) => {
                this.handleLoadError(err);
                return EMPTY;
              }),
            );
        }),
      )
      .subscribe({
        next: (attempt) => {
          this.attemptId = attempt.id;

          if (attempt.status == ExamAttemptStatus.COMPLETED) {
            this.router.navigate(['exam-result', this.exam.id], {
              relativeTo: this.route,
            });
          } else {
            this.router.navigate(['take-exam', this.exam.id], {
              relativeTo: this.route,
            });
          }
          this.loading = false;
        },
      });
    this.registerSubscription(sub);
  }

  onSave(event: any) {
    let sub = this.examService
      .completeAttempt(this.program_id, this.attemptId)
      .subscribe({
        next: (_) => {
          // this.router.navigateByUrl(
          //   `/programs/${this.program_id}/modules/${this.module_id}/contents/${this.module_content_id}/exam-success/${this.exam.id}`,
          // );
          this.router.navigate(['exam-result', this.exam.id], {
            relativeTo: this.route,
          });
        },
        error: (error) => {
          this.errors.push({
            name: (error as Error & { code?: string })?.code ?? 'error',
            message: error?.message ?? 'Unknown error',
          });
          this.errorMessage =
            error?.error?.error || error?.message || 'Failed to submit exam';
          this.triggerErrorToast();
        },
      });
    this.registerSubscription(sub);
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
          this.goToNextContent();
        });
    }
  }
  goToPreviousContent() {
    if (this.previous_module_content) {
      this.goToContent(this.previous_module_content);
    }
  }
  private goToContent(content: ModuleContent) {
    const path = content.content_type == 'LESSON' ? 'lesson' : 'exam';
    this.router.navigateByUrl(
      `/programs/${this.program_id}/details/modules/${content.module_id}/contents/${content.id}/${path}`,
    );
  }
  onNextContentAvailable(next_content: ModuleContent) {
    this.next_module_content = next_content;
  }
  private triggerErrorToast(): void {
    this.showErrorToast = true;
    setTimeout(() => {
      this.showErrorToast = false;
      this.errorMessage = '';
    }, 5000);
  }

  private handleLoadError(err: any): void {
    this.loading = false;
    this.errorMessage =
      err?.error?.error || err?.message || 'Failed to load content';
    this.triggerErrorToast();
  }

  goToCatalog() {
    this.router.navigateByUrl(`/programs/${this.program_id}/details`);
  }
  goToNextContent() {
    if (this.next_module_content) {
      if (this.next_module_content?.content_type == 'LESSON') {
        this.router.navigateByUrl(
          `/programs/${this.program_id}/details/modules/${this.next_module_content.module_id}/contents/${this.next_module_content.id}/lesson`,
        );
      } else {
        this.router.navigateByUrl(
          `/programs/${this.program_id}/details/modules/${this.next_module_content.module_id}/contents/${this.next_module_content.id}/exam`,
        );
      }
    } else {
      this.router.navigateByUrl(`/programs/${this.program_id}/details`);
    }
  }
}
