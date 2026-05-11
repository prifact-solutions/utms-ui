import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentBase } from 'src/app/common/componentbase';
import { CreateQuestionPaper } from '../../models/create-question-paper';
import { QuestionPapersService } from '../../services/question-papers.service';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionPaper } from '../../models/question-paper';
import { finalize } from 'rxjs';

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
  isSaving: boolean = false;

  @Input() inModal: boolean = false;
  @Input() programIdInput?: number;
  @Output() saved = new EventEmitter<QuestionPaper>();
  @Output() closed = new EventEmitter<void>();

  ngOnInit() {
    const routeProgramId = Number(this.route.snapshot.params['program_id']);
    this.programId = this.programIdInput ?? routeProgramId;
    this.loading = false;
  }

  saveQP() {
    if (this.isSaving) return;

    let createQpObj = new CreateQuestionPaper();
    createQpObj.programId = this.programId;
    createQpObj.name = this.title;

    this.isSaving = true;
    let sub = this.questionPapersService
      .createQuestionPaper(this.programId, createQpObj)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (newQp) => {
          if (this.inModal) {
            this.saved.emit(newQp);
            this.closed.emit();
            //return;
          }
          this.router.navigate([
            `/programs-builder/${this.programId}/question-papers/${newQp.id}/design`,
          ]);
        },
        error: () => {
          // keep the modal open; user can retry
        },
      });
    this.registerSubscription(sub);
  }

  onCancel() {
    if (this.inModal) {
      this.closed.emit();
      return;
    }
    this.router.navigate([
      `/programs-builder/${this.programId}/question-papers/`,
    ]);
  }
}
