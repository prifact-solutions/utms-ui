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
  filter,
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
  ExamResultStatus,
} from 'src/app/shared/services/exam-backend.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
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
  isLastContent: boolean = false;
  hasPassedExam: boolean = false;

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
  isSubmittingExam: boolean = false;
  showSaveConfirm: boolean = false;
  emittedEvent: QuestionPaperAttemptContext | undefined;
  wasNextButtonDisabledInitially: boolean = false;
  private dateSubject = new Subject<string>();

  get canGoToNextContent(): boolean {
    return this.hasPassedExam && (!!this.next_module_content || this.isLastContent);
  }

  get shouldShowNextContentTooltip(): boolean {
    return !this.hasPassedExam && (!!this.next_module_content || this.isLastContent);
  }

  get nextContentTooltip(): string | null {
    if (!this.shouldShowNextContentTooltip) {
      return null;
    }

    const contentType = this.next_module_content?.content_type === 'EXAM' ? 'exam' : 'lesson';
    return `Please pass the current exam to go to the next ${contentType}.`;
  }

  get nextStatusNote(): string | null {
    if (!this.wasNextButtonDisabledInitially) {
      return null;
    }

    if (!this.canGoToNextContent) {
      return this.nextContentTooltip;
    }

    if (this.next_module_content) {
      const contentType = this.next_module_content.content_type === 'EXAM' ? 'exam' : 'lesson';
      return `You have successfully completed this exam and can now go to the next ${contentType}.`;
    }

    if (this.isLastContent) {
      return 'You have successfully completed this exam and can now complete the course.';
    }

    return null;
  }

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
          this.isLastContent = false;
          this.hasPassedExam = false;
          this.wasNextButtonDisabledInitially = false;
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
            this.isLastContent = currentIndex === contents.length - 1;
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
          this.hasPassedExam = attempt.result === ExamResultStatus.PASSED;
          this.wasNextButtonDisabledInitially = !this.canGoToNextContent;

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

    const routeSub = this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        filter(() => this.router.url.includes('/exam-result/')),
      )
      .subscribe(() => {
        this.refreshExamAttemptState();
      });
    this.registerSubscription(routeSub);
  }

  onSave(event: any) {
    if (this.isSubmittingExam) {
      return;
    }

    this.isSubmittingExam = true;
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
          this.isSubmittingExam = false;
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
    if (!this.canGoToNextContent) {
      return;
    }

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
      this.router.navigateByUrl(`/programs/${this.program_id}/details/completed`);
    }
  }

  private refreshExamAttemptState(): void {
    if (!this.exam?.id) {
      return;
    }

    const sub = this.examService
      .getExamAttempt(this.program_id, this.exam.id)
      .subscribe((attempt) => {
        this.hasPassedExam = attempt?.result === ExamResultStatus.PASSED;
      });
    this.registerSubscription(sub);
  }
}
