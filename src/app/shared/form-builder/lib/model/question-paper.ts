import { RichTextString, SectionElement, StaticElement } from './form-elements';

export const QuestionPaperViewMode = 
{
  design: "design",
  preview: "preview",
  attempt: "attempt",
  evaluate : "evaluate"
}
export type  QuestionPaperViewMode = typeof QuestionPaperViewMode[keyof typeof QuestionPaperViewMode];


export class QuestionPaperSchemaDefn
{
  instructions : RichTextString
  sections : Array<SectionElement>
  
  constructor(init?:Partial<QuestionPaperSchemaDefn>) {

    this.instructions =  RichTextString.fromHtmlContent("")
    this.sections = new Array<SectionElement>();

    if (init != null)
    {
      if (init.instructions)
        this.instructions = RichTextString.fromHtmlContent(init.instructions.value)

      if (init.sections)
      {
        for (let s of init.sections)
        {
          let sec = new SectionElement(s);
          this.sections.push(sec);
        }
      }
    }
      
  }

}
