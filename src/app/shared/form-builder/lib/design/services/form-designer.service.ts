import { CdkDrag } from '@angular/cdk/drag-drop';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { QPStatus, QuestionPaperDesignContext } from '../../model/context';
import { AnswerChoice, FormElement, FormElementTransientSettings, FormElementType, MCQElement, QuestionElement, RichTextString, SectionElement, StaticElement, TextElement, FileUploadElement } from '../../model/form-elements';
import { QuestionPaperSchemaDefn } from '../../model/question-paper';

@Injectable({
  providedIn: 'root'
})
export class FormDesignerService {

  constructor() {


  }

  public qpContext: BehaviorSubject<QuestionPaperDesignContext> = new BehaviorSubject(null);
  public containderids: BehaviorSubject<Array<string>> = new BehaviorSubject(null);
  public selected_element: BehaviorSubject<FormElement | null> = new BehaviorSubject<FormElement | null>(null);
  public total_marks: BehaviorSubject<number> = new BehaviorSubject(null);


  private getAllDropTargets(): Array<string> {
    let allContainers: Array<string> = [];
    for (let s of this.qpContext.value.schema.sections) {
      allContainers.push(s.settings.uniqueId);
    }
    allContainers.push('root-form-container')
    return allContainers;

  }

  setQuestionPaperContext(qpContext: QuestionPaperDesignContext) {
    this.qpContext.next(qpContext);
    this.containderids.next(this.getAllDropTargets());
    this.selected_element.next(null);
    let totalMarks: number = 0;
    qpContext.schema.sections.forEach(sec => {
      sec.questions.forEach(q => {
        if(q.isQuestion()){
          totalMarks += +q.marks;
        }
      });
    });
    this.total_marks.next(totalMarks);
  }

  refreshDropTargets() {
    this.containderids.next(this.getAllDropTargets())
  }

  setSelectedElement(ele: FormElement | null) {
    this.selected_element.next(ele);
  }


  static constructDefaultElement(elementType: FormElementType): FormElement {
    if (elementType == FormElementType.section) {
      let el = new SectionElement();
      el.title = "Section A"
      el.description = RichTextString.fromTextContent("Enter description for this section here");
      el.questions.push(<MCQElement>this.constructDefaultElement(FormElementType.multiple_choice));
      return el;
    }
    else if (elementType == FormElementType.descriptive) {
      let el = new TextElement();
      el.questionContent = RichTextString.fromTextContent("Enter the descriptive question here.  Feel free to use rich text formatting and images");
      el.marks = 1;
      return el;
    }
    else if (elementType == FormElementType.file_upload) {
      let el = new FileUploadElement();
      el.questionContent = RichTextString.fromTextContent("Enter the question to which answer should be uploaded here.  Feel free to use rich text formatting and images");
      el.marks = 1;
      return el;
    }
    else if (elementType == FormElementType.multiple_choice) {
      let el = new MCQElement();
      el.questionContent = RichTextString.fromTextContent("Form the multiple choice question here...");
      el.marks = 1;

      let i = 0
      while (i < 4) {
        let choiceContent = RichTextString.fromTextContent("Choice " + i)
        let answerChoice = new AnswerChoice();
        answerChoice.choiceContent = choiceContent;
        answerChoice.choiceValue = i;
        el.options.push(answerChoice)
        i++;
      }
      el.correctAnswer = 1;

      return el;
    }
    else if (elementType == FormElementType.paragraph) {
      let el = new StaticElement();
      el.content = RichTextString.fromTextContent("Enter rich static content here");
      return el;
    }

    throw new Error("Invalid type -" + elementType)
  }


  reAssignValuesForOptions(mcq: MCQElement) {

    let correctOption = mcq.options.find(x => x.choiceValue == mcq.correctAnswer)
    //Here there is an implicit assumption that options is part of the object this.qpContext.value

    if (this.qpContext.value.status == QPStatus.completed) {
      throw new Error('Cannot reassign values once the QP is in published state')
    }

    let index = 0;
    for (let op of mcq.options) {
      op.choiceValue = index;
      index++;
    }

    if (correctOption)
      mcq.correctAnswer = correctOption.choiceValue;
  }


  resolveDraggedElementType(drag: CdkDrag<FormElementTransientSettings | FormElement>): FormElementType {

    //It is true we can do below without type checks - 
    //In the interest of future safety, doing the right way
    if (drag.data instanceof FormElement) {
      let el: FormElement = <FormElement>drag.data;
      return el.elementType
    }

    if (drag.data instanceof FormElementTransientSettings) {
      let el: FormElementTransientSettings = <FormElementTransientSettings>drag.data;
      return el.elementType
    }

    //What? not expected. 
    throw ('dropped item is of unknown type - ' + typeof (drag))
  }


  removeElement(uniqueId: string): boolean {
    let section_index = 0;
    for (let s of this.qpContext.value.schema.sections) {
      if (s.settings.uniqueId == uniqueId) {
        this.qpContext.value.schema.sections.splice(section_index, 1)
        this.selected_element.next(null)
        return true;
      }

      let q_index = 0;
      for (let q of s.questions) {
        if (q.settings.uniqueId == uniqueId) {
          s.questions.splice(q_index, 1)
          this.selected_element.next(null)
          return true;
        }
        q_index++;
      }
      section_index++;
    }

    return false;
  }



  reassignQuestionNames() {
    FormDesignerService.do_reassignQuestionNames(this.qpContext.value.schema)
  }


  static do_reassignQuestionNames(schema: QuestionPaperSchemaDefn) {
    let section_index = 1;
    for (let s of schema.sections) {
      let q_index = 1;
      for (let q of s.questions) {
        if (q.isQuestion()) {
          (<QuestionElement>q).name = 'S-' + section_index + ':Q-' + q_index;
        }
        q_index++;
      }
      section_index++;
    }
  }

}
