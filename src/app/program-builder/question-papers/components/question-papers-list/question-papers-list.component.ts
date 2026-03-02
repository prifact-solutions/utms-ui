import { Component, Renderer2 } from '@angular/core';
import { ComponentBase } from 'src/app/common/componentbase';
import { QuestionPapersService } from '../../services/question-papers.service';
import { combineLatest, switchMap } from 'rxjs';
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
    if (qp.is_linked && qp.status == QuestionPaperStatus.ACTIVE) {
      qp.actions = ['Clone'];
    } else if (!qp.is_linked && qp.status == QuestionPaperStatus.ACTIVE) {
      qp.actions = ['Mark as Draft', 'Clone', 'Rename', 'Delete'];
    } else if (qp.status == QuestionPaperStatus.DRAFT) {
      qp.actions = [
        'Design question paper',
        'Mark as Active',
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
      case 'Mark as Active': {
        this.qpService
          .changeQuestionPaperStatus(
            qp.id,
            this.programId,
            QuestionPaperStatus.ACTIVE,
          )
          .pipe(
            switchMap((_) => {
              return this.qpService.getAllQuestionPapersForProgram(
                this.programId,
              );
            }),
          )
          .subscribe(
            (questionPaperList) => {
              this.loading = false;
              this.questionPapers = questionPaperList.sort((a, b) =>
                a.updated_date > b.updated_date ? -1 : 1,
              );
              this.questionPapers.forEach((qp) => {
                this.loadOptionForQP(qp);
              });
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
          .pipe(
            switchMap((_) => {
              return this.qpService.getAllQuestionPapersForProgram(
                this.programId,
              );
            }),
          )
          .subscribe(
            (questionPaperList) => {
              this.loading = false;
              this.questionPapers = questionPaperList.sort((a, b) =>
                a.updated_date > b.updated_date ? -1 : 1,
              );
              this.questionPapers.forEach((qp) => {
                this.loadOptionForQP(qp);
              });
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
          .pipe(
            switchMap((_) => {
              return this.qpService.getAllQuestionPapersForProgram(
                this.programId,
              );
            }),
          )
          .subscribe((questionPaperList) => {
            this.loading = false;
            this.questionPapers = questionPaperList.sort((a, b) =>
              a.updated_date > b.updated_date ? -1 : 1,
            );
            this.questionPapers.forEach((qp) => {
              this.loadOptionForQP(qp);
            });
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
        .pipe(
          switchMap((_) => {
            return this.qpService.getAllQuestionPapersForProgram(
              this.programId,
            );
          }),
        )
        .subscribe(
          (questionPaperList) => {
            this.loading = false;
            this.questionPapers = questionPaperList.sort((a, b) =>
              a.updated_date > b.updated_date ? -1 : 1,
            );
            this.questionPapers.forEach((qp) => {
              this.loadOptionForQP(qp);
            });
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
        .pipe(
          switchMap((_) => {
            return this.qpService.getAllQuestionPapersForProgram(
              this.programId,
            );
          }),
        )
        .subscribe((questionPaperList) => {
          this.loading = false;
          this.questionPapers = questionPaperList.sort((a, b) =>
            a.updated_date > b.updated_date ? -1 : 1,
          );
          this.questionPapers.forEach((qp) => {
            this.loadOptionForQP(qp);
          });
          this.editQpId = null;
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
