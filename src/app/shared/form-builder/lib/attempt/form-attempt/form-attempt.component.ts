import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  Output,
  EventEmitter,
  Renderer2,
  Inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { QuestionPaperAttemptContext, Answer } from '../../model/context';
import {
  FormElementTransientSettings,
  FormElementType,
} from '../../model/form-elements';
import { FormAttemptService } from '../services/form-attempt.service';
import { QuestionPage } from '../services/question-paper-pagination';
import { timer, of } from 'rxjs';
import { FormBuilderBackendService } from '../../services/form-builder-backend.service';
import { map, switchMap, tap, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-form-attempt',
  templateUrl: './form-attempt.component.html',
  styleUrls: ['./form-attempt.component.scss'],
  providers: [FormAttemptService],
  encapsulation: ViewEncapsulation.None,
})
export class FormAttemptComponent implements OnInit, OnDestroy {
  title = 'question-forms-attempt';
  containerids: Array<string> = [];
  allFormElementTypes = FormElementTransientSettings.getAllFormElementTypes();
  @Input() attemptId: number;
  qpContext: QuestionPaperAttemptContext;
  currentPage: QuestionPage;
  sectionGroups: Array<{
    sectionTitle: string;
    totalMarks: number;
    questions: Array<{
      questionName: string;
      questionNumber: number;
      title: string;
      status: 'answered' | 'not-answered' | 'not-seen';
      marks: number;
    }>;
  }> = [];
  totalMarks: number = 0;
  selectedQuestionName: string;
  visitedQuestions: Set<string> = new Set<string>();
  FormElementType = FormElementType;
  @Input() examTitle: string;
  @Input() subjectTitle: string;
  @Input() timeDiff: number;
  hours: string;
  minutes: string;
  seconds: string;
  timeRemaining: string;
  sub: any;
  showForm: boolean = true;
  showSaveConfirm: boolean = false;
  timeleft: number = null;
  @Output() save: EventEmitter<boolean> = new EventEmitter<boolean>();
  totalQuestions: number;
  maxScore: number;
  answered: number;
  confirmMsg: string;
  isNextChanging: boolean = false;
  isPreviousChanging: boolean = false;
  isPageLoading: boolean = false;

  get isPageChanging(): boolean {
    return this.isNextChanging || this.isPreviousChanging;
  }

  get currentQuestionIndex(): number {
    if (!this.qpContext || !this.selectedQuestionName) {
      return 0;
    }
    return this.qpContext.questionNumbers?.[this.selectedQuestionName] || 0;
  }

  get progressPercent(): number {
    if (!this.totalQuestions || !this.currentQuestionIndex) {
      return 0;
    }
    return Math.round((this.currentQuestionIndex / this.totalQuestions) * 100);
  }

  constructor(
    public formSvc: FormAttemptService,
    private formBackEndService: FormBuilderBackendService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit() {
    this.renderer.addClass(this.document.body, 'form-attempt-page');
    if (this.attemptId) {
      this.formBackEndService
        .getQuestionPaperAttemptContext(this.attemptId.toString())
        .pipe(
          map((res) => {
            return new QuestionPaperAttemptContext(res);
          }),
        )
        .subscribe((res) => {
          this.qpContext = res;
          this.formSvc.setQuestionPaperContext(this.qpContext);
          this.totalQuestions = this.qpContext.totalQuestions;
          this.maxScore = this.qpContext.maxScore;
        });
      this.sub = timer(0, 1000).subscribe((res) => {
        this.timeleft = this.timeDiff - res * 1000;

        let hours = Math.floor(
          (this.timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        let minutes = Math.floor(
          (this.timeleft % (1000 * 60 * 60)) / (1000 * 60),
        );
        let seconds = Math.floor((this.timeleft % (1000 * 60)) / 1000);

        this.hours = hours + 'h ';
        this.minutes = minutes + 'm ';
        this.seconds = seconds + 's ';
        this.timeRemaining =
          this.hours + ' : ' + this.minutes + ' : ' + this.seconds;
        if (this.timeleft < 0) {
          this.timeRemaining = 'Time is up!';
          this.showForm = false;
          this.onSave(true);
          this.sub.unsubscribe();
        }
      });
    }
    this.formSvc.qpContext.subscribe((newQp) => {
      this.qpContext = newQp;
      this.buildQuestionList();
    });
    this.formSvc.selected_page
      .pipe(
        switchMap((pg) => {
          let qUniqueNames = [];
          this.currentPage = pg;
          this.updateSelectedQuestionName(pg);
          this.markPageSeen(pg);
          this.currentPage.sections.forEach((sec) => {
            sec.questions.forEach((q) => {
              if (q.isQuestion()) {
                qUniqueNames.push(q.name);
              }
            });
          });
          if (qUniqueNames.length) {
            return this.formBackEndService.getAnswers(
              this.attemptId.toString(),
              qUniqueNames,
            );
          } else {
            return of([]);
          }
        }),
      )
      .subscribe((res) => {
        if (res.length) {
          let ans = [];
          res.forEach((a) => {
            ans.push(Answer.parseAnswer(a));
          });
          this.qpContext.answers = ans;
        }
        this.formSvc.ensureAnswerObjectCreated();
        this.refreshQuestionStatuses();
        if (this.currentPage.isPreview) {
          this.answered = 0;
          this.qpContext.answers.forEach((ans) => {
            if (ans.isAnswered()) {
              this.answered++;
            }
          });
        }
        this.isPageLoading = false;
      });
  }

  ngOnDestroy() {
    this.renderer.removeClass(this.document.body, 'form-attempt-page');
    this.sub.unsubscribe();
  }

  onNext() {
    if (this.isPageChanging) {
      return;
    }
    this.isNextChanging = true;
    this.isPageLoading = true;
    this.formSvc
      .onNextPage(this.currentPage, null)
      .pipe(finalize(() => (this.isNextChanging = false)))
      .subscribe();
  }

  onPrevious() {
    if (this.isPageChanging) {
      return;
    }
    this.isPreviousChanging = true;
    this.isPageLoading = true;
    this.formSvc
      .onPrevPage(this.currentPage, null)
      .pipe(finalize(() => (this.isPreviousChanging = false)))
      .subscribe();
  }

  onSave(autoSave: boolean) {
    if (!autoSave) {
      this.confirmMsg = 'Are you sure you want to submit the exam?';
      let unanswered = this.totalQuestions - this.answered;
      if (unanswered > 0) {
        this.confirmMsg =
          'You have ' +
          unanswered +
          ' unanswered question(s)! \n Are you sure you want to submit the exam?';
      }
      this.showSaveConfirm = true;
    } else {
      this.formSvc.saveAnswersOfPage(this.currentPage).subscribe((_) => {
        this.save.emit(true);
      });
    }
  }

  onBackToQuestions() {
    if (!this.formSvc.pages?.length) {
      return;
    }
    this.isPageLoading = true;
    this.formSvc.saveAnswersOfPage(this.currentPage).subscribe(() => {
      const firstQuestionPage = this.formSvc.pages[0];
      if (firstQuestionPage) {
        this.formSvc.selected_page.next(firstQuestionPage);
      }
      this.isPageLoading = false;
    });
  }

  confirmSaveAction(event: boolean) {
    this.showSaveConfirm = false;
    this.formBackEndService
      .saveAnswers(this.attemptId.toString(), this.qpContext.answers)
      .subscribe((_) => {
        this.save.emit(true);
      });
  }

  cancelSaveAction(event: boolean) {
    this.showSaveConfirm = false;
  }

  goToQuestion(questionName: string) {
    if (!this.formSvc.pages) {
      return;
    }

    this.isPageLoading = true;
    this.formSvc
      .saveAnswersOfPage(this.currentPage)
      .pipe(
        tap((_) => {
          // if (currentPage.isLast) {
          //   let reviewPage = this.pageSplitter.getReviewPage(this.qpContext.value.schema);
          //   this.selected_page.next(reviewPage);
          //   return;
          // }

          const selectedPage = this.formSvc.pages.find((p) =>
            p.sections.some((sec) =>
              sec.questions.some((q) => q.name === questionName),
            ),
          );
          if (selectedPage) {
            this.formSvc.selected_page.next(selectedPage);
            this.selectedQuestionName = questionName;
          }
        }),
      )
      .subscribe();
  }

  private updateSelectedQuestionName(page: QuestionPage) {
    if (!page || page.isPreview) {
      this.selectedQuestionName = null;
      return;
    }
    const questions =
      page.sections[0]?.questions?.filter((q) => q.isQuestion()) || [];
    this.selectedQuestionName = questions.length
      ? questions[questions.length - 1].name
      : null;
  }

  private markPageSeen(page: QuestionPage) {
    if (!page || page.isPreview) {
      return;
    }
    page.sections.forEach((sec) => {
      sec.questions.forEach((q) => {
        if (q.isQuestion()) {
          this.visitedQuestions.add(q.name);
        }
      });
    });
    this.refreshQuestionStatuses();
  }

  private refreshQuestionStatuses() {
    if (!this.sectionGroups || !this.qpContext) {
      return;
    }
    this.sectionGroups.forEach((group) => {
      group.questions.forEach((item) => {
        const answer = this.qpContext.answers?.find(
          (a) => a.question_name === item.questionName,
        );
        if (answer?.isAnswered()) {
          item.status = 'answered';
        } else if (this.visitedQuestions.has(item.questionName)) {
          item.status = 'not-answered';
        } else {
          item.status = 'not-seen';
        }
      });
    });
  }

  private buildQuestionList() {
    if (!this.qpContext?.schema?.sections) {
      this.sectionGroups = [];
      this.totalMarks = 0;
      return;
    }
    const groups: {
      [key: string]: {
        sectionTitle: string;
        totalMarks: number;
        questions: any[];
      };
    } = {};
    this.qpContext.schema.sections.forEach((sec) => {
      if (!groups[sec.title]) {
        groups[sec.title] = {
          sectionTitle: sec.title,
          totalMarks: 0,
          questions: [],
        };
      }
      sec.questions.forEach((question) => {
        if (question.isQuestion()) {
          const number = this.qpContext.questionNumbers[question.name];
          const q = {
            questionName: question.name,
            questionNumber: number,
            title: this.getQuestionTitle(question),
            status: 'not-seen',
            marks: question.marks,
          };
          groups[sec.title].questions.push(q);
          groups[sec.title].totalMarks += question.marks;
        }
      });
    });
    this.sectionGroups = Object.values(groups);
    this.totalMarks = this.sectionGroups.reduce(
      (sum, group) => sum + group.totalMarks,
      0,
    );
    this.refreshQuestionStatuses();
  }

  private getQuestionTitle(question: any): string {
    const content = question?.questionContent?.value || '';
    const stripped = content.replace(/<[^>]*>/g, '').trim();
    const truncated = stripped.split('\n')[0].trim();
    return truncated.length > 80
      ? truncated.substring(0, 80) + '...'
      : truncated || 'Question';
  }

  onReview() {
    this.formSvc.saveAnswersOfPage(this.currentPage).subscribe((_) => {
      let reviewPage = this.formSvc.pageSplitter.getReviewPage(
        this.qpContext.schema,
      );
      this.formSvc.selected_page.next(reviewPage);
    });
  }

  get totalQuestionCount(): number {
    return (
      this.sectionGroups?.reduce((sum, g) => sum + g.questions.length, 0) || 0
    );
  }

  getQuestionNumber(groupIndex: number, questionIndex: number): number {
    let count = 0;

    for (let i = 0; i < groupIndex; i++) {
      count += this.sectionGroups[i].questions.length;
    }

    return count + questionIndex + 1;
  }
}
