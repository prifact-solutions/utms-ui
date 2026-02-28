import { Component } from '@angular/core';
import { ComponentBase } from 'src/app/common/componentbase';
import { ProgramsService } from '../../services/programs.service';
import {
  ExamAttemptStatus,
  ExamBackendService,
} from 'src/app/shared/services/exam-backend.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-exam-success',
  templateUrl: './exam-success.component.html',
  styleUrls: ['./exam-success.component.scss'],
})
export class ExamSuccessComponent extends ComponentBase {
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
  score!: number;

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
        if (
          attempt &&
          attempt.status == ExamAttemptStatus.COMPLETED &&
          attempt.score
        ) {
          this.score = attempt.score;
          this.loading = false;
        } else {
          this.router.navigateByUrl(
            `/programs/${this.program_id}/modules/${this.module_id}/contents/${this.module_content_id}/exam`,
          );
        }
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
