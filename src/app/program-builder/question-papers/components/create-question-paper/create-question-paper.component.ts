import { Component } from '@angular/core';
import { ComponentBase } from 'src/app/common/componentbase';
import { CreateQuestionPaper } from '../../models/create-question-paper';
import { QuestionPapersService } from '../../services/question-papers.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-create-question-paper',
  templateUrl: './create-question-paper.component.html',
  styleUrls: ['./create-question-paper.component.scss'],
})
export class CreateQuestionPaperComponent extends ComponentBase {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questionPapersService: QuestionPapersService
  ) {
    super();
  }

  title!: string;
  programId!: number;
  loading: boolean = true;

  ngOnInit() {
    this.programId = this.route.snapshot.params['program_id'];
    this.loading = false;
  }

  saveQP() {
    let createQpObj = new CreateQuestionPaper();
    createQpObj.programId = this.programId;
    createQpObj.name = this.title;
    let sub = this.questionPapersService
      .createQuestionPaper(this.programId, createQpObj)
      .subscribe((newQp) => {
        this.router.navigate([
          `/programs-builder/${this.programId}/question-papers/${newQp.id}/design`,
        ]);
      });
    this.registerSubscription(sub);
  }

  onCancel() {
    this.router.navigate([
      `/programs-builder/${this.programId}/question-papers/`,
    ]);
  }
}
