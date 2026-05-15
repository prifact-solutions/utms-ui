import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, of } from 'rxjs';
import { Answer, MCQAnswer, QuestionPaperAttemptContext, TextAnswer, FileUploadAnswer } from '../../model/context';
import { FormElementType, QuestionElement } from '../../model/form-elements';
import { DefaultQuestionPaperPagination, QuestionPage } from './question-paper-pagination';
import { FormBuilderBackendService } from '../../services/form-builder-backend.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class FormAttemptService {

  constructor(private formBackEndService: FormBuilderBackendService) {
  }

  public qpContext: BehaviorSubject<QuestionPaperAttemptContext> = new BehaviorSubject(null);
  public selected_page: ReplaySubject<QuestionPage> = new ReplaySubject(1);
  pages: Array<QuestionPage> = null;
  pageSplitter = new DefaultQuestionPaperPagination();

  setQuestionPaperContext(qpContext: QuestionPaperAttemptContext) {
    //Save results...
    this.qpContext.next(qpContext);
    //ensure there is answer object place holder created 
    //this.ensureAnswerObjectCreated()
    this.qpContext.value.schema.sections.forEach(sec => {
      let i = 1;
      sec.questions.forEach(q => {
        if (q.isQuestion()) {
          this.qpContext.value.totalQuestions ++;
          this.qpContext.value.maxScore += +q.marks;
          this.qpContext.value.questionNumbers[q.name] = i++;
        }
      });
    });

    this.pages = this.pageSplitter.getSplit(this.qpContext.value.schema);

    //Instead of showing the review page, directly jump to Q.1
    if (this.pages.length > 0) {
      this.selected_page.next(this.pages[0]);
    } else {
      // optional fallback if there are no question pages
      this.selected_page.next(this.pageSplitter.getReviewPage(this.qpContext.value.schema));
    }
    // let reviewPage = this.pageSplitter.getReviewPage(this.qpContext.value.schema);
    // this.selected_page.next(reviewPage);
  }

  ensureAnswerObjectCreated() {
    for (let s of this.qpContext.value.schema.sections) {
      for (let q of s.questions) {
        if (q.isQuestion()) {
          let answer = this.qpContext.value.answers.find(x => x.question_name == (<QuestionElement>q).name)
          if (!answer) {
            answer = this.constructEmptyAnswerObjectForQuestion(<QuestionElement>q);
            this.qpContext.value.answers.push(answer);
          }
        }
      }
    }
  }

  saveAnswersOfPage(currentPage: QuestionPage): Observable<any>{
    let ans: Answer[] = [];
    currentPage.sections.forEach(sec => {
      sec.questions.forEach(q => {
        if(q.isQuestion()){
          ans.push(this.getAnswerForQuestion(q))
        }
      });
    });
    if(ans.length){
      return this.formBackEndService.saveAnswers(this.qpContext.value.attemptkey, ans);
    }
    else{
      return of([])
    }
  }

  onNextPage(currentPage: QuestionPage, answers: Array<Answer>): Observable<any>{
    //Save results...
    return this.saveAnswersOfPage(currentPage)
      .pipe(
        tap(_ => {
          if (currentPage.isLast) {
            let reviewPage = this.pageSplitter.getReviewPage(this.qpContext.value.schema);
            this.selected_page.next(reviewPage);
            return;
          }

          let index = this.pages.findIndex(x => x == currentPage);
          index++;
          //Get the answers in selected_page for student from server and update the context
          this.selected_page.next(this.pages[index]);
        })
      )
  }

  onPrevPage(currentPage: QuestionPage, answers: Array<Answer>): Observable<any> {
    //Save results
    return this.saveAnswersOfPage(currentPage)
      .pipe(
        tap(_ => {
          if (currentPage.isFirst) {
            return null;
          }
          let index = this.pages.findIndex(x => x == currentPage);
          index--;
          //Get the answers in selected_page for student from server and update the context
          this.selected_page.next(this.pages[index]);
        })
      )
  }

  getAnswerForQuestion(question: QuestionElement): Answer {
    let answer = this.qpContext.value.answers.find(x => x.question_name == question.name)
    if (!answer) {
      // throw new Error("Unexpected - answer object not found")
      answer = this.constructEmptyAnswerObjectForQuestion(question)
    }
    return answer;
  }
  
  constructEmptyAnswerObjectForQuestion(question: QuestionElement) {
    if (question.elementType == FormElementType.descriptive) {
      return new TextAnswer({ question_name: question.name });
    }
    if (question.elementType == FormElementType.multiple_choice) {
      return new MCQAnswer({ question_name: question.name });
    }
    if (question.elementType == FormElementType.file_upload) {
      return new FileUploadAnswer({ question_name: question.name })
    }
    throw new Error("Unknown question element type")
  }
}
