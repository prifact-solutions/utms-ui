
export class RichTextString {
  value: string;
  isHtml: boolean;

  static fromHtmlContent(content: string) {
    let rt = new RichTextString();
    rt.value = content;
    rt.isHtml = true;
    return rt;
  }

  static fromTextContent(content: string) {
    let rt = new RichTextString();
    rt.value = content;
    rt.isHtml = false;
    return rt;
  }
}

export class AnswerChoice {
  choiceContent: RichTextString;
  choiceValue: number;

  constructor(init?: Partial<AnswerChoice>) {
    if (init != null)
      Object.assign(this, init);
  }
}

export const FormElementType =
{
  section: "section",
  paragraph: "paragraph",
  multiple_choice: "multiple_choice",
  descriptive: "descriptive",
  file_upload: "file_upload"
}

export type FormElementType = typeof FormElementType[keyof typeof FormElementType];

export class FormElementTransientSettings {
  elementType: FormElementType;
  label: string;
  icon: string;
  uniqueId: string;
  toggle: boolean;

  static next_element_id: number = 0;

  static constructSettings(elementType: FormElementType, generateNewHtmlElementId: boolean): FormElementTransientSettings {
    let settings: FormElementTransientSettings = new FormElementTransientSettings();
    settings.elementType = elementType;


    if (generateNewHtmlElementId) {
      settings.uniqueId = elementType + '_' + FormElementTransientSettings.next_element_id;
      FormElementTransientSettings.next_element_id++;
    }

    if (elementType == FormElementType.descriptive) {
      settings.icon = "fas fa-text-width"
      settings.label = "Descriptive Question"
    }
    else if (elementType == FormElementType.multiple_choice) {
      settings.icon = "fas fa-list-ul"
      settings.label = "Multiple Choice Question"
    }
    else if (elementType == FormElementType.paragraph) {
      settings.icon = "fas fa-align-justify"
      settings.label = "Static Text"

    }
    else if (elementType == FormElementType.section) {
      settings.icon = "far fa-list-alt"
      settings.label = "Section"
    }
    else if(elementType == FormElementType.file_upload){
      settings.icon = "far fa-file"
      settings.label = "File Upload Question"
    }
    else {
      throw new Error("Unknown form element type - " + elementType)
    }
    return settings;
  }


  static getAllFormElementTypes(): FormElementTransientSettings[] {
    let allElementSettings = new Array<FormElementTransientSettings>();
    for (var name in FormElementType) {
      allElementSettings.push(FormElementTransientSettings.constructSettings(name, false));
    }
    return allElementSettings;
  }

}

export abstract class FormElement {
  id?: number;
  elementType: FormElementType;
  settings?: FormElementTransientSettings

  constructor(id: number, elementType: FormElementType) {
    this.id = id;
    this.elementType = elementType;
    this.settings = FormElementTransientSettings.constructSettings(this.elementType, true)
  }

  isQuestion(): boolean {
    return this.elementType == FormElementType.multiple_choice || this.elementType == FormElementType.descriptive || this.elementType == FormElementType.file_upload;
  }

  abstract validationErrors(): Array<string>;

  static parseFormElement<T extends FormElement>(obj: Partial<T>): T {
    if (obj == null)
      throw new Error("Input object is null. Unable to parse for FormElement")

    if (obj.elementType == null) {
      throw new Error("Element type not specified. Unable to parse.")
    }

    let ele = null;
    switch (obj.elementType) {
      case FormElementType.descriptive: {
        ele = new TextElement(obj);
        break;
      }
      case FormElementType.multiple_choice: {
        ele = new MCQElement(obj);
        break;
      }
      case FormElementType.paragraph: {
        ele = new StaticElement(obj);
        break;
      }
      case FormElementType.file_upload: {
        ele = new FileUploadElement(obj);
        break;
      }
      case FormElementType.section: {
        ele = new SectionElement(obj);
        break;
      }
      default: {
        throw new Error('Unknown element type to parse - ' + obj.elementType)
      }
    }
    return ele;
  }


}


export class SectionElement extends FormElement {
  title: string;
  description: RichTextString;
  questions: Array<QuestionElement>

  validationErrors(): string[] {
    let errArr = [];
    if(this.title == null || this.title == ""){
      errArr.push("Please enter title for Section")
    }
    return errArr;
  }

  constructor(init?: Partial<SectionElement>) {

    if (init == null) {
      init = { elementType: FormElementType.section }
    }

    if (init.elementType != FormElementType.section) {
      throw new Error("Invalid type used to initialize - " + init.elementType + " Expected - " + FormElementType.section);
    }

    super(init.id, FormElementType.section)

    this.title = init.title;

    this.description = RichTextString.fromTextContent("");
    if (init.description) {
      this.description = RichTextString.fromHtmlContent(init.description.value);
    }

    this.questions = new Array<QuestionElement>();

    if (init.questions) {
      for (let q of init.questions) {
        this.questions.push(FormElement.parseFormElement(q))
      }
    }
  }

}

export class StaticElement extends FormElement {
  content: RichTextString;
  validationErrors(): string[] {
    let errArr = [];
    if(this.content.value == null || this.content.value == ""){
      errArr.push("Please enter content for Static text")
    }
    return errArr;
  }

  constructor(init?: Partial<StaticElement>) {

    if (init == null) {
      init = { elementType: FormElementType.paragraph }
    }

    if (init.elementType != FormElementType.paragraph) {
      throw new Error("Invalid type used to initialize - " + init.elementType + " Expected - " + FormElementType.paragraph);
    }
    super(init.id, FormElementType.paragraph)

    this.content = new RichTextString();
    if (init.content)
      this.content = RichTextString.fromHtmlContent(init.content.value);
  }

}


export abstract class QuestionElement extends FormElement {
  name: string;
  marks: number;

  constructor(init: Partial<QuestionElement>) {
    //init must have element type set
    if (init.elementType != FormElementType.descriptive &&
      init.elementType != FormElementType.multiple_choice && 
      init.elementType != FormElementType.file_upload) {
      throw new Error("Invalid type used to initialize - " + init.elementType + " Expected - a question type");
    }
    super(init.id, init.elementType)

    this.name = init.name;
    this.marks = init.marks;
  }
}



export class TextElement extends QuestionElement {
  questionContent: RichTextString;
  validationErrors(): string[] {
    let errArr = [];
    if(this.questionContent.value == null || this.questionContent.value == ""){
      errArr.push("Please enter a valid question for Descriptive question")
    }
    if(this.marks.toString() == "" || this.marks <= 0){
      errArr.push("Please enter a valid mark for Descriptive question")
    }
    return errArr;
  }

  constructor(init?: Partial<TextElement>) {
    if (init == null) {
      init = { elementType: FormElementType.descriptive }
    }

    if (init.elementType != FormElementType.descriptive) {
      throw new Error("Invalid type used to initialize - " + init.elementType + " Expected - " + FormElementType.descriptive);
    }

    super(init)

    this.questionContent = new RichTextString();
    if (init.questionContent)
      this.questionContent = RichTextString.fromHtmlContent(init.questionContent.value);

  }

}

export class MCQElement extends QuestionElement {
  validationErrors(): string[] {
    let errArr = [];
    if(this.questionContent.value == null || this.questionContent.value == "") {
      errArr.push("Please enter a valid question for Multiple choice question")
    }
    if(this.marks.toString() == "" || this.marks <= 0) {
      errArr.push("Please enter a valid mark for Multiple choice question")
    }
    if(this.options.length == 0) {
      errArr.push("Please add choices for Multiple choice question")
    }
    if(this.correctAnswer == null) {
      errArr.push("Please select a correct answer for Multiple choice question")
    }
    return errArr;
  }
  questionContent: RichTextString;
  options: Array<AnswerChoice>;
  correctAnswer?: number;  //Note this should not be returned / used during 'Attempt'


  constructor(init?: Partial<MCQElement>) {
    if (init == null) {
      init = { elementType: FormElementType.multiple_choice }
    }

    if (init.elementType != FormElementType.multiple_choice) {
      throw new Error("Invalid type used to initialize - " + init.elementType + " Expected - " + FormElementType.multiple_choice);
    }

    super(init)

    this.questionContent = new RichTextString();
    if (init.questionContent)
      this.questionContent = RichTextString.fromHtmlContent(init.questionContent.value);

    this.options = new Array<AnswerChoice>();

    if (init.options) {
      for (let opt of init.options) {
        let ansChoice = new AnswerChoice(opt);
        this.options.push(ansChoice)
      }
    }

    this.correctAnswer = init.correctAnswer;

  }

}

export class FileUploadElement extends QuestionElement {
  validationErrors(): string[] {
    let errArr = [];
    if(this.questionContent.value == null || this.questionContent.value == ""){
      errArr.push("Please enter a valid question for File upload question")
    }
    if(this.marks.toString() == "" || this.marks <= 0){
      errArr.push("Please enter a valid mark for File upload question")
    }
    return errArr;
  }
  questionContent: RichTextString;
  showTextBox: boolean;


  constructor(init?: Partial<FileUploadElement>) {
    if (init == null) {
      init = { elementType: FormElementType.file_upload }
    }

    if (init.elementType != FormElementType.file_upload) {
      throw new Error("Invalid type used to initialize - " + init.elementType + " Expected - " + FormElementType.file_upload);
    }

    super(init)

    this.questionContent = new RichTextString();
    if (init.questionContent){
      this.questionContent = RichTextString.fromHtmlContent(init.questionContent.value);
    }

    this.showTextBox = init.showTextBox;
    
  }

}

 


