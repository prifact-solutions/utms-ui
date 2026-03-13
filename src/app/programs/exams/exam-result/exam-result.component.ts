import { CompilerConfig } from '@angular/compiler';
import { Component } from '@angular/core';
import { ComponentBase } from 'src/app/common/componentbase';
import { ProgramsService } from '../../services/programs.service';
import {
  ExamAttemptStatus,
  ExamBackendService,
  ExamResultStatus,
} from 'src/app/shared/services/exam-backend.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-exam-result',
  templateUrl: './exam-result.component.html',
  styleUrls: ['./exam-result.component.scss'],
})
export class ExamResultComponent extends ComponentBase {
  constructor(
    private programService: ProgramsService,
    private examService: ExamBackendService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    super();
  }
  program_id: number = 0;
  module_id: number = 0;
  module_content_id: number = 0;
  loading: boolean = true;
  errors: Error[] = [];
  examId!: number;
  score: number = 0;
  passing_score: number = 0;
  isExamPassed: boolean = false;
  attemptId!: number;

  ngOnInit() {
    let sub = this.route.params
      .pipe(
        map((params) => {
          return {
            program_id: params['program_id'],
            module_id: params['module_id'],
            module_content_id: params['module_content_id'],
            exam_id: params['exam_id'],
          };
        }),
        tap((params) => {
          this.program_id = params.program_id;
          this.module_id = params.module_id;
          this.module_content_id = params.module_content_id;
          this.examId = params.exam_id;
        }),
        switchMap((params) => {
          return this.examService.getExamAttempt(this.program_id, this.examId);
        }),
      )
      .subscribe((attempt) => {
        if (attempt && attempt.status == ExamAttemptStatus.COMPLETED) {
          this.attemptId = attempt.id;
          if (attempt.score) {
            this.score = attempt.score;
          }
          this.passing_score = attempt.passing_score;
          this.isExamPassed =
            attempt.result != undefined &&
            attempt.result == ExamResultStatus.PASSED;
          this.loading = false;
        } else {
          this.loading = false;
          // this.router.navigateByUrl(
          //   `/programs/${this.program_id}/modules/${this.module_id}/contents/${this.module_content_id}/exam`,
          // );
        }
      });
    this.registerSubscription(sub);
  }

  next() {
    var nextContent = null;
    this.programService
      .getProgramCatalog(this.program_id)
      .subscribe((catalog) => {
        if (catalog && catalog.modules) {
          const contents = catalog.modules.flatMap(
            (m) => m.module_contents || [],
          );
          const currentIndex = contents.findIndex(
            (c) => c.id == this.module_content_id,
          );

          if (currentIndex < contents.length - 1) {
            nextContent = contents[currentIndex + 1];
          } else {
            nextContent = null;
          }

          if (nextContent) {
            const path =
              nextContent.content_type == 'LESSON' ? 'lesson' : 'exam';
            this.router.navigateByUrl(
              `/programs/${this.program_id}/details/modules/${nextContent.module_id}/contents/${nextContent.id}/${path}`,
            );
          }
        }
      });
  }
  retakeExam() {
    let sub = this.examService
      .archiveAttempt(this.program_id, this.attemptId)
      .subscribe({
        next: (_) => {
          this.router.navigate(['../../take-exam', this.examId], {
            relativeTo: this.route,
          });
        },
        error: (error) => {
          this.errors.push({ name: error.code, message: error.message });
        },
      });

    this.registerSubscription(sub);
  }
  redirectToDashboard() {
    // let route = new PrifactRoute();
    // route.url = '/pages/dashboard';
    // route.clear_history = true;
    // this.routingService.navigate(route);
  }
}
