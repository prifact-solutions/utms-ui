import { Component, Input, OnInit } from '@angular/core';
import { QuestionPaperEvaluateContext } from '../../model/context';
import { QuestionElement, SectionElement } from '../../model/form-elements';
import { FormEvaluateService } from '../services/form-evaluate.service';

@Component({
  selector: 'app-marks-summary',
  templateUrl: './marks-summary.component.html',
  styleUrls: ['./marks-summary.component.scss']
})
export class MarksSummaryComponent implements OnInit {


  constructor(private formEvalService: FormEvaluateService) { }


  @Input()
  qpContext: QuestionPaperEvaluateContext;

  ngOnInit(): void {
  }

  onQuestionClicked(questionName: string) {
  }

  getMarksSectionSummary(s: SectionElement) {
    let summary = this.formEvalService.getMarksSectionSummary(s);
    return summary.scoredSectionMarks + "/" + summary.totalSectionMarks;
  }

  getEvaluationForQuestion(q: QuestionElement) {
    let evalEntry = this.formEvalService.getEvalEntryFor(q);
    if (evalEntry) {
      return evalEntry.marks_awarded;
    }
    return "?";
  }

}
