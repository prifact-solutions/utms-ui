import { Component, Input, OnInit, OnDestroy, ViewEncapsulation, Output, EventEmitter, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { QuestionPaperAttemptContext, Answer } from '../../model/context';
import { FormElementTransientSettings, FormElementType } from '../../model/form-elements';
import { FormAttemptService } from '../services/form-attempt.service';
import { QuestionPage } from '../services/question-paper-pagination';
import { timer, of } from 'rxjs';
import { FormBuilderBackendService } from '../../services/form-builder-backend.service';
import { map, switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-form-attempt',
  templateUrl: './form-attempt.component.html',
  styleUrls: ['./form-attempt.component.scss'],
  providers: [FormAttemptService],
  encapsulation: ViewEncapsulation.None
})
export class FormAttemptComponent implements OnInit, OnDestroy {
  
  title = 'question-forms-attempt';
  containerids: Array<string> = []
  allFormElementTypes = FormElementTransientSettings.getAllFormElementTypes();
  @Input() attemptId: number;
  qpContext: QuestionPaperAttemptContext;
  currentPage: QuestionPage;
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
  answered:number;
  confirmMsg: string;

  constructor(
    public formSvc: FormAttemptService,
    private formBackEndService: FormBuilderBackendService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {

  }

  ngOnInit() {
    this.renderer.addClass(this.document.body, 'form-attempt-page');
    if(this.attemptId){
      this.formBackEndService.getQuestionPaperAttemptContext(this.attemptId.toString())
      .pipe(
        map(res => {
          return new QuestionPaperAttemptContext(res);
        })
      )
      .subscribe(res => {
        this.qpContext = res;
        this.formSvc.setQuestionPaperContext(this.qpContext)
        this.totalQuestions = this.qpContext.totalQuestions;
        this.maxScore = this.qpContext.maxScore;
      })
      this.sub = timer(0, 1000).subscribe(res => {
        this.timeleft = this.timeDiff - (res * 1000);

        let hours = Math.floor((this.timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((this.timeleft % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((this.timeleft % (1000 * 60)) / 1000);

        this.hours = hours + "h "
        this.minutes = minutes + "m "
        this.seconds = seconds + "s "
        this.timeRemaining = this.hours + " : " + this.minutes + " : " + this.seconds;
        if (this.timeleft < 0) {
          this.timeRemaining = "Time is up!"
          this.showForm = false;
          this.onSave(true);
          this.sub.unsubscribe(); 
        }
      }); 
    }
    this.formSvc.qpContext.subscribe(newQp => this.qpContext = newQp);
    this.formSvc.selected_page.pipe(
      switchMap(pg => {
        let qUniqueNames = [];
        this.currentPage = pg;
        this.currentPage.sections.forEach(sec => {
          sec.questions.forEach(q => {
            if(q.isQuestion()){
              qUniqueNames.push(q.name)
            }
          });
        });
        if(qUniqueNames.length){
          return this.formBackEndService.getAnswers(this.attemptId.toString(), qUniqueNames);
        }
        else{
          return of([]);
        }
      })
    ).subscribe(res =>{
      if(res.length){
        let ans = [];
        res.forEach(a => {
          ans.push(Answer.parseAnswer(a));
        });
        this.qpContext.answers = ans;
      }
      this.formSvc.ensureAnswerObjectCreated();
      if(this.currentPage.isPreview){
        this.answered = 0;
        this.qpContext.answers.forEach(ans => {
          if(ans.isAnswered()){
            this.answered ++;
          }
        });
      }
    })
    
  }

  ngOnDestroy(){
    this.renderer.removeClass(this.document.body, 'form-attempt-page');
    this.sub.unsubscribe();
  }

  onNext() {
    this.formSvc.onNextPage(this.currentPage, null)
    .subscribe();
  }

  onPrevious() {
    this.formSvc.onPrevPage(this.currentPage, null)
    .subscribe();
  }

  onSave(autoSave: boolean) {
    if(!autoSave){
      this.confirmMsg = "Are you sure you want to submit the exam?"
      let unanswered = this.totalQuestions - this.answered;
      if(unanswered > 0) {
        this.confirmMsg = "You have " + unanswered + " unanswered question(s)! \n Are you sure you want to submit the exam?"
      }
      this.showSaveConfirm = true;
    }
    else{
      this.formSvc.saveAnswersOfPage(this.currentPage)
      .subscribe(_ => {
        this.save.emit(true);
      })      
    }
  }

  confirmSaveAction(event: boolean) {
    this.showSaveConfirm = false;
    this.formBackEndService.saveAnswers(this.attemptId.toString(), this.qpContext.answers)
    .subscribe(_ => {
      this.save.emit(true);
    })
  }

  cancelSaveAction(event: boolean){
    this.showSaveConfirm = false;
  }

  onReview() {
    this.formSvc.saveAnswersOfPage(this.currentPage)
      .subscribe(_ => {
        let reviewPage = this.formSvc.pageSplitter.getReviewPage(this.qpContext.schema);
        this.formSvc.selected_page.next(reviewPage);
      })
  }

}
