import { Component } from '@angular/core';
import {
  Exam,
  ModuleContent,
  ModuleContentFile,
} from '../../models/program.model';
import { QuestionPaperAttemptContext } from 'form-builder';
import { forkJoin, map, of, Subject, switchMap, tap } from 'rxjs';
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
})
export class ExamComponent extends ComponentBase {
  lesson: ModuleContent | null = null;
  files: Array<ModuleContentFile> = [];

  next_module_content: ModuleContent | null = null;

  program_id: number = 0;
  module_id: number = 0;
  module_content_id: number = 0;
  loading: boolean = true;
  errors: Error[] = [];
  attemptId!: number;
  timeDiff!: number;
  exam!: Exam;
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
        }),
        switchMap((params) => {
          return forkJoin([
            //TO-DO: Send ExamId as input instead of fetch here
            this.programService
              .getExam(
                params.program_id,
                params.module_id,
                params.module_content_id,
              )
              .pipe(
                switchMap((examDetails) => {
                  this.exam = examDetails.exam;
                  this.timeDiff =
                    examDetails.exam.duration_hours * 60 * 60 * 1000;
                  return this.examService
                    .getExamAttempt(this.program_id, examDetails.exam.id)
                    .pipe(
                      switchMap((attempt) => {
                        if (attempt) {
                          return of(attempt);
                        } else {
                          return this.examService.attemptExam(
                            params.program_id,
                            params.module_id,
                            params.module_content_id,
                            examDetails.exam.id,
                          );
                        }
                      }),
                    );
                }),
              ),
          ]);
        }),
      )
      .subscribe(([attempt]) => {
        this.attemptId = attempt.id;

        if (attempt.status == ExamAttemptStatus.COMPLETED) {
          this.router.navigate(['exam-result', this.exam.id], {
            relativeTo: this.route,
          });
        }else{
          this.router.navigate(['take-exam', this.exam.id], {
            relativeTo: this.route,
          });
        }
        this.loading = false;
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
          this.errors.push({ name: error.code, message: error.message });
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
  onNextContentAvailable(next_content: ModuleContent) {
    this.next_module_content = next_content;
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
