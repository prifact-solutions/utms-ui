import { Component, Renderer2 } from '@angular/core';
import { ComponentBase } from 'src/app/common/componentbase';
import { QuestionPapersService } from '../../services/question-papers.service';
import { combineLatest } from 'rxjs';
import { CreateQuestionPaper } from '../../models/create-question-paper';
import { ActivatedRoute, Router } from '@angular/router';
import {
  QuestionPaper,
  QuestionPaperStatus,
} from '../../models/question-paper';

@Component({
  selector: 'app-question-papers-list',
  templateUrl: './question-papers-list.component.html',
  styleUrls: ['./question-papers-list.component.scss'],
})
export class QuestionPapersListComponent extends ComponentBase {
  constructor(
    private qpService: QuestionPapersService,
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    //private userService: UserService,
    //private alertService: AlertPopupService,
  ) {
    super();
  }

  loading: boolean = true;
  questionPapers: QuestionPaper[] = [];
  selectedQP: QuestionPaper | null = null;
  showDelConfirm: boolean = false;
  editQpId: number | null = null;
  programId!: number;
  moduleId!: number;
  statusEnum!: QuestionPaperStatus;
  //user: ProfileInfo;

  ngOnInit() {
    //this.pageHeadingService.menuOnChange(MenuUtils.getMenuItem("Question papers"));
    this.renderer.removeClass(document.body, 'menu-clicked');
    this.programId = this.route.snapshot.params['program_id'];
    this.moduleId = this.route.snapshot.params['module_id'];
    // let sub = combineLatest(
    //   this.userService.getLoggedInUser(),
    //   this.qpService.getAllQuestionPapers(),
    // ).subscribe(([res1, res2]) => {
    //   this.loading = false;
    //   this.user = res1;
    //   this.questionPapers = res2.sort((a, b) =>
    //     a.updated_date > b.updated_date ? -1 : 1,
    //   );
    //   this.questionPapers.forEach((qp) => {
    //     this.loadOptionForQP(qp);
    //   });
    // });
    let sub = this.qpService
      .getAllQuestionPapersForProgram(this.programId)
      .subscribe((questionPaperList) => {
        this.loading = false;
        this.questionPapers = questionPaperList.sort((a, b) =>
          a.updated_date > b.updated_date ? -1 : 1,
        );
        this.questionPapers.forEach((qp) => {
          this.loadOptionForQP(qp);
        });
      });
    this.registerSubscription(sub);
  }

  loadOptionForQP(qp: QuestionPaper) {
    qp.is_qplinked = true;
    if (qp.is_qplinked && qp.status == QuestionPaperStatus.ACTIVE) {
      qp.actions = ['Clone'];
    } else if (!qp.is_qplinked && qp.status == QuestionPaperStatus.ACTIVE) {
      qp.actions = ['Mark as Draft', 'Clone', 'Rename', 'Delete'];
    } else if (qp.status == QuestionPaperStatus.DRAFT) {
      qp.actions = [
        'Design question paper',
        'Mark as Final',
        'Clone',
        'Rename',
        'Delete',
      ];
    }
  }

  dotMenuOptionSelected(clickedIndex: any, qp: QuestionPaper) {
    let action: string = qp.actions[clickedIndex];
    switch (action) {
      case 'Design question paper': {
        this.router.navigate([
          `/programs-builder/${this.programId}/question-papers/${qp.id}/design`,
        ]);
        break;
      }
      case 'Rename': {
        this.editQpId = qp.id;
        break;
      }
      case 'Mark as Final': {
        this.qpService
          .changeQuestionPaperStatus(
            qp.id,
            this.programId,
            QuestionPaperStatus.ACTIVE,
          )
          .subscribe(
            (updatedQP) => {
              qp.status = QuestionPaperStatus.ACTIVE;
              //qp.updated_date = new Date().toDateString();
              this.loadOptionForQP(updatedQP);
              this.questionPapers = this.questionPapers.map((qp) =>
                qp.id === updatedQP.id ? updatedQP : qp,
              );
            },
            (err) => {
              //this.alertService.newAlert(err.error.message);
            },
          );
        break;
      }
      case 'Mark as Draft': {
        this.qpService
          .changeQuestionPaperStatus(
            qp.id,
            this.programId,
            QuestionPaperStatus.DRAFT,
          )
          .subscribe(
            (updatedQP) => {
              qp.status = QuestionPaperStatus.DRAFT;
              //qp.updated_date = new Date().toDateString();
              this.loadOptionForQP(qp);
              this.questionPapers = this.questionPapers.map((qp) =>
                qp.id === updatedQP.id ? updatedQP : qp,
              );
            },
            (err) => {
              //this.alertService.newAlert(err.error.message);
            },
          );
        break;
      }
      case 'Clone': {
        this.qpService
          .cloneQuestionPaper(qp.id, this.programId)
          .subscribe((res: QuestionPaper) => {
            res.created_by_full_name = '';
            res.is_shared = false;
            this.loadOptionForQP(res);
            this.questionPapers.push(res);
            //this.alertService.newAlert('Question paper cloned successfully');
          });
        break;
      }
      case 'Delete': {
        this.selectedQP = qp;
        this.showDelConfirm = true;
        break;
      }
    }

    let sub = this.qpService
      .getAllQuestionPapersForProgram(this.programId)
      .subscribe((questionPaperList) => {
        this.loading = false;
        this.questionPapers = questionPaperList.sort((a, b) =>
          a.updated_date > b.updated_date ? -1 : 1,
        );
        this.questionPapers.forEach((qp) => {
          this.loadOptionForQP(qp);
        });
      });
    this.registerSubscription(sub);
  }

  delConfirmAction(event: any) {
    this.showDelConfirm = false;
    if (this.selectedQP) {
      this.qpService
        .changeQuestionPaperStatus(
          this.selectedQP.id,
          this.programId,
          QuestionPaperStatus.ARCHIVED,
        )
        .subscribe(
          (_) => {
            let index = this.questionPapers.indexOf(
              this.selectedQP as QuestionPaper,
            );
            this.questionPapers.splice(index, 1);
            this.selectedQP = null;
          },
          (err) => {
            //this.alertService.newAlert(err.error.message);
          },
        );
    }
  }

  cancelDelAction(evet: any) {
    this.showDelConfirm = false;
  }

  addQuestionPaper() {
    this.router.navigate([
      `/programs-builder/${this.programId}/question-papers/add`,
    ]);
  }

  updateTitle(newTitle: string, qp: QuestionPaper) {
    if (newTitle != undefined && newTitle.trim() != '') {
      let QpObj = new CreateQuestionPaper();
      QpObj.programId = qp.programId;
      QpObj.name = newTitle;
      let sub = this.qpService
        .updateQuestionPaperTitle(qp.id, this.programId, QpObj)
        .subscribe((_) => {
          this.editQpId = null;
          qp.updated_date = new Date().toDateString();
          qp.name = newTitle;
        });
      this.registerSubscription(sub);
    }
  }

  onCheckboxClick(qp: QuestionPaper) {
    let sub = this.qpService
      .shareUnshareQuestionPaper(qp.id, this.programId, qp.is_shared)
      .subscribe((_) => {
        qp.updated_date = new Date().toDateString();
      });
    this.registerSubscription(sub);
  }
}
