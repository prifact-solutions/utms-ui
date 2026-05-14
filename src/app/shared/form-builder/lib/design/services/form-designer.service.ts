import { CdkDrag } from '@angular/cdk/drag-drop';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { QPStatus, QuestionPaperDesignContext } from '../../model/context';
import { AnswerChoice, FormElement, FormElementTransientSettings, FormElementType, MCQElement, QuestionElement, RichTextString, SectionElement, StaticElement, TextElement, FileUploadElement } from '../../model/form-elements';
import { QuestionPaperSchemaDefn } from '../../model/question-paper';
import { UtilsService } from '../../services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class FormDesignerService {

  constructor() {


  }

  public qpContext: BehaviorSubject<QuestionPaperDesignContext> = new BehaviorSubject(null);
  public containderids: BehaviorSubject<Array<string>> = new BehaviorSubject(null);
  public selected_element: BehaviorSubject<FormElement | null> = new BehaviorSubject<FormElement | null>(null);
  /** Deep clone of the selected canvas element; property panel and overlay preview bind to this until Save. */
  public editingDraft: BehaviorSubject<FormElement | null> = new BehaviorSubject<FormElement | null>(null);
  public total_marks: BehaviorSubject<number> = new BehaviorSubject(null);

  private editingLiveTarget: FormElement | null = null;


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
    this.editingLiveTarget = null;
    this.selected_element.next(null);
    this.editingDraft.next(null);
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
    this.editingLiveTarget = ele;
    if (ele == null) {
      this.editingDraft.next(null);
    } else {
      this.editingDraft.next(FormDesignerService.cloneFormElementForEdit(ele));
    }
  }

  commitEditingDraft(): boolean {
    const live = this.editingLiveTarget;
    const draft = this.editingDraft.value;
    if (live == null || draft == null || live.elementType !== draft.elementType) {
      return false;
    }
    const oldMarks = live.isQuestion() ? +(<QuestionElement>live).marks || 0 : 0;
    const newMarks = draft.isQuestion() ? +(<QuestionElement>draft).marks || 0 : 0;
    FormDesignerService.applyDraftOntoLive(live, draft);
    if (live.isQuestion()) {
      const cur = this.total_marks.value ?? 0;
      this.total_marks.next(cur - oldMarks + newMarks);
    }
    this.setSelectedElement(null);
    return true;
  }

  private static cloneFormElementForEdit(el: FormElement): FormElement {
    const plain = UtilsService.jsonCopy(el);
    const clone = FormElement.parseFormElement(plain);
    FormDesignerService.restoreDesignSettingsFromPlainJson(clone, plain);
    return clone;
  }

  private static restoreDesignSettingsFromPlainJson(node: FormElement, plain: any): void {
    if (plain?.settings != null && node.settings != null) {
      node.settings.uniqueId = plain.settings.uniqueId;
      node.settings.toggle = plain.settings.toggle;
      node.settings.label = plain.settings.label;
      node.settings.icon = plain.settings.icon;
      node.settings.elementType = plain.settings.elementType;
    }
    if (node.elementType === FormElementType.section) {
      const sec = node as SectionElement;
      const psec = plain;
      if (psec?.questions != null) {
        for (let i = 0; i < sec.questions.length; i++) {
          FormDesignerService.restoreDesignSettingsFromPlainJson(sec.questions[i], psec.questions[i]);
        }
      }
    }
  }

  private static applyDraftOntoLive(live: FormElement, draft: FormElement): void {
    if (live.elementType !== draft.elementType) {
      return;
    }
    switch (draft.elementType) {
      case FormElementType.section: {
        const L = live as SectionElement;
        const D = draft as SectionElement;
        L.title = D.title;
        L.description.value = D.description.value;
        L.description.isHtml = D.description.isHtml;
        break;
      }
      case FormElementType.paragraph: {
        const L = live as StaticElement;
        const D = draft as StaticElement;
        L.content.value = D.content.value;
        L.content.isHtml = D.content.isHtml;
        break;
      }
      case FormElementType.descriptive: {
        const L = live as TextElement;
        const D = draft as TextElement;
        L.name = D.name;
        L.marks = D.marks;
        L.questionContent.value = D.questionContent.value;
        L.questionContent.isHtml = D.questionContent.isHtml;
        break;
      }
      case FormElementType.multiple_choice: {
        const L = live as MCQElement;
        const D = draft as MCQElement;
        L.name = D.name;
        L.marks = D.marks;
        L.questionContent.value = D.questionContent.value;
        L.questionContent.isHtml = D.questionContent.isHtml;
        L.correctAnswer = D.correctAnswer;
        L.options.length = 0;
        for (const op of D.options) {
          const ac = new AnswerChoice();
          ac.choiceValue = op.choiceValue;
          const rc = new RichTextString();
          rc.value = op.choiceContent.value;
          rc.isHtml = !!op.choiceContent.isHtml;
          ac.choiceContent = rc;
          L.options.push(ac);
        }
        break;
      }
      case FormElementType.file_upload: {
        const L = live as FileUploadElement;
        const D = draft as FileUploadElement;
        L.name = D.name;
        L.marks = D.marks;
        L.questionContent.value = D.questionContent.value;
        L.questionContent.isHtml = D.questionContent.isHtml;
        L.showTextBox = D.showTextBox;
        break;
      }
      default:
        break;
    }
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
        this.setSelectedElement(null)
        return true;
      }

      let q_index = 0;
      for (let q of s.questions) {
        if (q.settings.uniqueId == uniqueId) {
          s.questions.splice(q_index, 1)
          this.setSelectedElement(null)
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
