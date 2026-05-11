import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, ViewEncapsulation, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { QuestionPaperDesignContext } from '../../model/context';
import { FormElementTransientSettings, FormElementType, SectionElement, MCQElement } from '../../model/form-elements';
import { FormDesignerService } from '../services/form-designer.service';
import { QuestionPaperSchemaDefn } from '../../model/question-paper';
import { FormBuilderBackendService } from '../../services/form-builder-backend.service';
import { switchMap, map } from 'rxjs/operators';
import { SamplesService } from '../../services/samples.service';


@Component({
  selector: 'app-form-designer',
  templateUrl: './form-designer.component.html',
  styleUrls: ['./form-designer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FormDesignerComponent implements OnInit {

  title = 'question-forms-designer';
  containerids: Array<string> = []
  allFormElementTypes = FormElementTransientSettings.getAllFormElementTypes();
  filteredElementTypes: FormElementTransientSettings[] = [];
  qpContext: QuestionPaperDesignContext;
  @Input() qpId: number;
  @Input() selectedQuestionTypes: FormElementType[] = [];
  FormElementType = FormElementType;
  next_containerid: number = 0
  @Output() back: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() save: EventEmitter<boolean> = new EventEmitter<boolean>();
  loading: boolean = true;
  showBackConfirm: boolean = false;
  errorMessages: string[] = [];
  total_marks: number;

  constructor(private formSvc: FormDesignerService, private formBackendService: FormBuilderBackendService) { }

  ngOnInit() {
    if (this.qpId) {
      this.formBackendService.getQuestionPaperDesignContext(this.qpId)
        .pipe(
          map(qp => {
            return new QuestionPaperDesignContext(qp);
          })
        )
        .subscribe(res => {
          this.loading = false;
          if (res.schema.sections.length == 0) {
            res.schema = SamplesService.getDefaultQuestionPaper();
          }
          else {
            res.schema = res.schema
          }
          this.qpContext = res;
          this.savedSchema = JSON.stringify(this.qpContext.schema);
          this.formSvc.setQuestionPaperContext(this.qpContext)
        })
    }
    this.formSvc.qpContext.subscribe((newQp) => { if (newQp != null) this.qpContext = newQp });
    this.formSvc.containderids.subscribe((ids) => { if (ids != null) this.containerids = ids });
    this.formSvc.total_marks.subscribe((totalMarks) => { if (totalMarks != null) this.total_marks = totalMarks });
  }
  private savedSchema = "";
  
  ngOnChanges(_: SimpleChanges): void {
    if (this.selectedQuestionTypes && this.selectedQuestionTypes.length > 0) {
      this.filteredElementTypes = this.allFormElementTypes.filter(element => 
        this.selectedQuestionTypes.includes(element.elementType)
      );
    } else {
      this.filteredElementTypes = [...this.allFormElementTypes];
    }
  }
  
  onSave() {
    if (this.validateQp()) {
      this.formBackendService.saveQuestionPaperSchema(this.qpId, this.qpContext.schema)
        .subscribe(_ => {
          this.savedSchema = JSON.stringify(this.qpContext.schema);
          this.save.emit(true);
        });
    }
  }

  validateQp() {
    this.errorMessages = [];
    let sec = this.qpContext.schema.sections;
    for (let i = 0; i < sec.length; i++) {
      let qCount = 0;
      let secErrors = sec[i].validationErrors();
      if (secErrors.length) {
        this.showError(secErrors);
        return false;
      }
      for (let j = 0; j < sec[i].questions.length; j++) {
        let que = sec[i].questions[j];
        let qErrors = que.validationErrors();
        if (que.isQuestion()) {
          qCount++;
          if (qErrors.length) {
            qErrors.unshift("Error(s) in " + sec[i].title + ", question number " + qCount + ":")
            this.showError(qErrors);
            return false;
          }
        }
        else {
          if (qErrors.length) {
            qErrors.unshift("Error in " + sec[i].title + ", static text:")
            this.showError(qErrors);
            return false;
          }
        }
      }
    }
    return true;
  }

  showError(errors: string[]) {
    this.errorMessages = errors;
    setTimeout(() => {
      this.errorMessages = [];
    }, 3000);
  }

  onBack() {
    if (JSON.stringify(this.qpContext.schema) == this.savedSchema) {
      this.back.emit(true);
      return;
    }
    if (!this.qpContext.schema.sections.length) {
      this.back.emit(true)
    }
    else {
      this.showBackConfirm = true;
      document.getElementById('form-design').style.overflowY = "hidden";
    }
  }

  confirmBackAction(event: boolean) {
    this.showBackConfirm = false;
    document.getElementById('form-design').style.overflowY = "visible";
    this.back.emit(true);
  }

  cancelBackAction(event: boolean) {
    this.showBackConfirm = false;
    document.getElementById('form-design').style.overflowY = "visible";
  }

  addContainerId() {
    let string_id = 'section-container-' + this.next_containerid;
    this.next_containerid++;
    this.containerids.push(string_id)
    return string_id;
  }

  canDrop(drag: CdkDrag<FormElementTransientSettings>, drop: CdkDropList) {
    return this.formSvc.resolveDraggedElementType(drag) == FormElementType.section;
  }

  onDrop(event: CdkDragDrop<any[]>) {
    let droppedFieldType = event.previousContainer.data[event.previousIndex];

    //if the dropped field is another container, register a target

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      event.container.data.splice(event.currentIndex, 0, new SectionElement({ elementType: "section", title: "Section A" }))
      this.formSvc.refreshDropTargets();
    }

    this.formSvc.reassignQuestionNames();
  }
}
