import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, ViewEncapsulation, SimpleChange } from '@angular/core';
import { AngularEditorComponent, AngularEditorConfig } from '@kolkov/angular-editor';
import { globalEditorConfig } from '../../../model/editor-configs';
import { AnswerChoice, MCQElement, RichTextString } from '../../../model/form-elements';
import { UtilsService } from '../../../services/utils.service';
import { FormDesignerService } from '../../services/form-designer.service';

@Component({
  selector: 'app-radio-properties',
  templateUrl: './radio-properties.component.html',
  styleUrls: ['./radio-properties.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RadioPropertiesComponent implements OnInit {

  constructor(private formSvc: FormDesignerService) { }
  @Input()
  item: MCQElement
  globalEditorConfig = globalEditorConfig;
  toolBarConfig: AngularEditorConfig = UtilsService.jsonCopy(globalEditorConfig);
  noToolBarConfig: AngularEditorConfig = UtilsService.jsonCopy(globalEditorConfig);
  showDelConfirm: boolean = false;
  selectedOption: AnswerChoice;
  initialMarks: number;

  ngOnInit(): void {
    this.noToolBarConfig.showToolbar = false;
  }

  ngOnChanges(changes: SimpleChange) {
    if(changes['item'].currentValue) {
      this.initialMarks = +changes['item'].currentValue.marks;
    }
  }

  removeOption(option) {
    this.selectedOption = option;
    document.getElementById('form-design').style.overflowY = "hidden";
    this.showDelConfirm = true;
  }

  delConfirmAction(event: boolean) {
    this.showDelConfirm = false;
    document.getElementById('form-design').style.overflowY = "visible";
    if(this.selectedOption.choiceValue == this.item.correctAnswer){
      this.item.correctAnswer = null;
    }
    this.item.options.splice(this.item.options.indexOf(this.selectedOption), 1)
  }

  cancelDelAction(event: boolean) {
    this.showDelConfirm = false;
    document.getElementById('form-design').style.overflowY = "visible";
  }

  addOption() {
    let newChoice = new AnswerChoice();
    newChoice.choiceContent = RichTextString.fromTextContent("New choice");
    this.item.options.push(newChoice);

    this.formSvc.reAssignValuesForOptions(this.item)
  }

  log(str) {
    console.log(str)
  }

  onEditorFocus(editor: AngularEditorComponent) {
    editor.config = this.toolBarConfig;
  }

  onEditorBlur(editor: AngularEditorComponent) {
    editor.config = this.noToolBarConfig;
  }

  setCorrectChoice(option: AnswerChoice) {
    this.item.correctAnswer = option.choiceValue;

  }

  onMarksChange() {
    if(this.item.marks && !isNaN(this.item.marks) && this.item.marks > 0){
      let diff: number;
      diff = this.item.marks - this.initialMarks;
      this.initialMarks = this.item.marks;
      let currentMarks: number = this.formSvc.total_marks.value + (diff);
      this.formSvc.total_marks.next(currentMarks);
    }
    else{
      let currentMarks: number = this.formSvc.total_marks.value - this.initialMarks;
      this.initialMarks = 0;
      this.formSvc.total_marks.next(currentMarks);
    }
  }

  onDrop(event: CdkDragDrop<any[]>) {

    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    this.formSvc.reAssignValuesForOptions(this.item)
  }


}
