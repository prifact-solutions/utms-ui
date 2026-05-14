import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
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

  ngOnInit(): void {
    this.noToolBarConfig.showToolbar = false;
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

  onDrop(event: CdkDragDrop<any[]>) {

    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    this.formSvc.reAssignValuesForOptions(this.item)
  }


}
