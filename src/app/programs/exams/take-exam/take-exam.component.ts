import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentBase } from 'src/app/common/componentbase';
import {
  forkJoin,
  map,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { QuestionPaperAttemptContext } from 'form-builder';
import { ExamBackendService } from 'src/app/shared/services/exam-backend.service';
import {
  Exam,
  ModuleContent,
  ModuleContentFile,
} from '../../models/program.model';
import { ProgramsService } from '../../services/programs.service';

@Component({
  selector: 'app-take-exam',
  templateUrl: './take-exam.component.html',
  styleUrls: ['./take-exam.component.scss'],
})
export class TakeExamComponent extends ComponentBase {
  lesson: ModuleContent | null = null;
  files: Array<ModuleContentFile> = [];

  next_module_content: ModuleContent | null = null;

  program_id: number = 0;
  module_id: number = 0;
  module_content_id: number = 0;
  loading: boolean = true;
  errors: Error[] = [];
  attemptId!: number;
  timeDiff: number | undefined;
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
        this.loading = false;
      });
    this.registerSubscription(sub);
  }

  onSave(event: any) {
    let sub = this.examService
      .completeAttempt(this.program_id, this.attemptId)
      .subscribe(
        (_) => {
          this.router.navigateByUrl(
            `/programs/${this.program_id}/modules/${this.module_id}/contents/${this.module_content_id}/exam-success/${this.exam.id}`,
          );
        },
        (err) => {
          this.errors.push({ name: err.code, message: err.message });
        },
      );
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
          `/programs/${this.program_id}/modules/${this.next_module_content.module_id}/contents/${this.next_module_content.id}/lesson`,
        );
      } else {
        this.router.navigateByUrl(
          `/programs/${this.program_id}/modules/${this.next_module_content.module_id}/contents/${this.next_module_content.id}/exam`,
        );
      }
    } else {
      this.router.navigateByUrl(`/programs/${this.program_id}/details`);
    }
  }
}
