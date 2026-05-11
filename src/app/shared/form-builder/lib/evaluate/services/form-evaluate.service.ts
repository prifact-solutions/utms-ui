import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Answer, EvalEntry, QuestionPaperEvaluateContext } from '../../model/context';
import { FormElement, QuestionElement, SectionElement } from '../../model/form-elements';


@Injectable({
  providedIn: 'root'
})
export class FormEvaluateService {


  constructor() {


  }

  public qpContext: BehaviorSubject<QuestionPaperEvaluateContext> = new BehaviorSubject(null);
  public selected_element: BehaviorSubject<FormElement> = new BehaviorSubject(null);

  setQuestionPaperContext(qpContext: QuestionPaperEvaluateContext) {
    this.qpContext.next(qpContext);
    this.selected_element.next(null);
  }


  setSelectedElement(ele: FormElement) {
    this.selected_element.next(ele);
  }


  getEvalEntryFor(question: QuestionElement): EvalEntry {
    let existing = this.qpContext.value.evaluation.entries.find(x => x.question_name == question.name);
    return existing;
  }


  setEvalEntryFor(question: QuestionElement, entry: EvalEntry) {
    //Write validation here again?  for marks and question name?

    let index = this.qpContext.value.evaluation.entries.findIndex(x => x.question_name == question.name);
    if (index >= 0) {
      this.qpContext.value.evaluation.entries.splice(index, 1)
    }
    this.qpContext.value.evaluation.entries.push(entry);
  }

  getAnswerFor(question: QuestionElement): Answer {
    let answer = this.qpContext.value.answers.find(x => x.question_name == question.name)
    return answer;
  }



  getMarksSectionSummary(s: SectionElement) {
    let totalSectionMarks: number = 0;
    let scoredSectionMarks: number = 0;

    for (let q of s.questions) {
      if (q.isQuestion()) {
        totalSectionMarks += +(<QuestionElement>q).marks;
        let evalEntry = this.getEvalEntryFor(<QuestionElement>q);
        if (evalEntry)
          scoredSectionMarks += +evalEntry.marks_awarded;

      }
    }

    return { totalSectionMarks: totalSectionMarks, scoredSectionMarks: scoredSectionMarks };
  }





}
