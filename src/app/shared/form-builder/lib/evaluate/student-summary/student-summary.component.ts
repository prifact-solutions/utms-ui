import { Component, Input, OnInit, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { QuestionPaperEvaluateContext } from '../../model/context';
import { FormEvaluateService } from '../services/form-evaluate.service';

@Component({
  selector: 'app-student-summary',
  templateUrl: './student-summary.component.html',
  styleUrls: ['./student-summary.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StudentSummaryComponent implements OnInit {

  constructor(private formEvalService: FormEvaluateService) { }

  @Input() qpContext: QuestionPaperEvaluateContext;
  @Output() marksCommitted: EventEmitter<boolean> = new EventEmitter<boolean>();
  showImg: boolean = true;

  ngOnInit(): void {
  }

  getTotalMarksSummary() {
    let totalMarks: number = 0;
    let marksScored: number = 0;
    for (let s of this.qpContext.schema.sections) {
      let summary = this.formEvalService.getMarksSectionSummary(s);
      totalMarks += summary.totalSectionMarks;
      marksScored += summary.scoredSectionMarks;
    }
    this.qpContext.marks_scored = marksScored;
    return marksScored + "/" + totalMarks
  }

  onCommitMarks() {
    this.marksCommitted.emit(true);
  }

  noImg(){
    this.showImg = false;
  }

}
