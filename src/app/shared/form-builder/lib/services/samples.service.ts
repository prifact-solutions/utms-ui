import { Injectable } from '@angular/core';
import { QuestionPaperSchemaDefn } from '../model/question-paper';
import { RichTextString, SectionElement, FormElementType } from '../model/form-elements';
import { FormDesignerService } from '../design/services/form-designer.service';
import { QuestionPaperDesignContext, QPStatus, QuestionPaperEvaluateContext, StudentInfo, EvaluationStatus, EvaluationResult, QuestionPaperAttemptContext } from '../model/context';

  export class SamplesService {

    private questionDesignContext = 
    {
      "status": "draft",
      "schema": {
        "instructions": {
          "value": "Enter detailed instructions applicable to answer the question paper here",
          "isHtml": false
        },
        "sections": [
          {
            "elementType": "section",
            "title": "Section A",
            "description": {
              "value": "Enter description for this section here",
              "isHtml": false
            },
            "questions": [
              {
                "elementType": "paragraph",
               
                "content": {
                  "value": "<h2>What is Lorem Ipsum?</h2><p><strong>Lorem Ipsum</strong>&#160;is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>",
                  "isHtml": false
                }
              },
              {
                "elementType": "multiple_choice",
               
                "name": "S-1:Q-2",
                "marks": 1,
                "questionContent": {
                  "value": "Form the multiple choice question here...",
                  "isHtml": false
                },
                "options": [
                  {
                    "choiceContent": {
                      "value": "Choice 0",
                      "isHtml": false
                    },
                    "choiceValue": 0
                  },
                  {
                    "choiceContent": {
                      "value": "Choice 1",
                      "isHtml": false
                    },
                    "choiceValue": 1
                  },
                  {
                    "choiceContent": {
                      "value": "Choice 2",
                      "isHtml": false
                    },
                    "choiceValue": 2
                  },
                  {
                    "choiceContent": {
                      "value": "Choice 3",
                      "isHtml": false
                    },
                    "choiceValue": 3
                  }
                ],
                "correctAnswer": 1
              },
              {
                "elementType": "descriptive",
               
                "name": "S-1:Q-3",
                "marks": 1,
                "questionContent": {
                  "value": "<h2>Where does it come from?</h2>",
                  "isHtml": false
                }
              },
              {
                "elementType": "multiple_choice",
                
                "name": "S-1:Q-4",
                "marks": 1,
                "questionContent": {
                  "value": "<span>1. Which of the following selector selects all elements of E that have the attribute attr that end with the given value?</span>",
                  "isHtml": false
                },
                "options": [
                  {
                    "choiceContent": {
                      "value": "E[attr^=value]",
                      "isHtml": false
                    },
                    "choiceValue": 0
                  },
                  {
                    "choiceContent": {
                      "value": "E[attr$=value]",
                      "isHtml": false
                    },
                    "choiceValue": 1
                  },
                  {
                    "choiceContent": {
                      "value": "E[attr*=value]",
                      "isHtml": false
                    },
                    "choiceValue": 2
                  },
                  {
                    "choiceContent": {
                      "value": "None of the above",
                      "isHtml": false
                    },
                    "choiceValue": 3
                  }
                ],
                "correctAnswer": 1
              }
            ]
          },
          {
            "elementType": "section",
            
            "title": "Section B",
            "description": {
              "value": "",
              "isHtml": false
            },
            "questions": [
              {
                "elementType": "multiple_choice",
               
                "name": "S-2:Q-1",
                "marks": 1,
                "questionContent": {
                  "value": "Form the multiple choice question here...",
                  "isHtml": false
                },
                "options": [
                  {
                    "choiceContent": {
                      "value": "Choice 0",
                      "isHtml": false
                    },
                    "choiceValue": 0
                  },
                  {
                    "choiceContent": {
                      "value": "Choice 1",
                      "isHtml": false
                    },
                    "choiceValue": 1
                  },
                  {
                    "choiceContent": {
                      "value": "Choice 2",
                      "isHtml": false
                    },
                    "choiceValue": 2
                  },
                  {
                    "choiceContent": {
                      "value": "Choice 3",
                      "isHtml": false
                    },
                    "choiceValue": 3
                  }
                ],
                "correctAnswer": 1
              },
              {
                "elementType": "descriptive",
               
                "name": "S-2:Q-2",
                "marks": 1,
                "questionContent": {
                  "value": "Enter the descriptive question here.  Feel free to use rich text formatting and images",
                  "isHtml": false
                }
              }
            ]
          }
        ]
      }
    };
  
  
    getDummyQuestionDesignContextJson()
    {
      return this.questionDesignContext;
    }

    
  sample_text_question = {
    "id": null,
    "elementType": "descriptive",
    "questionContent": {
        "value": "Enter the descriptive question here.  Feel free to use rich text formatting and images",
        "isHtml": false
    },
    "marks": 1
  }


  constructor() { }

  static getDefaultQuestionPaper() : QuestionPaperSchemaDefn
  {
    let defaultQp = new QuestionPaperSchemaDefn();
    defaultQp.instructions = RichTextString.fromTextContent("Enter detailed instructions applicable to answer the question paper here")
    

    defaultQp.sections = new Array<SectionElement>();
    let defaultSec = <SectionElement> FormDesignerService.constructDefaultElement(FormElementType.section)
    defaultQp.sections.push(defaultSec);

    FormDesignerService.do_reassignQuestionNames(defaultQp)

    return defaultQp;
  }


  static  generateDesignerContext()
  {
    let context:QuestionPaperDesignContext  = new QuestionPaperDesignContext()
    context.schema = this.getDefaultQuestionPaper();
    context.status = QPStatus.draft;
  }


  static generateSampleEvaluationContextFor(designContext:QuestionPaperDesignContext):QuestionPaperEvaluateContext
  {
    let evalContext:QuestionPaperEvaluateContext  = new QuestionPaperEvaluateContext()
    evalContext.schema = designContext.schema;
    evalContext.student_info = new StudentInfo({display_name:"Pranav Rajesh", serial_number:'123', image_url:'/something/some.jpg'});
    evalContext.evaluation = new EvaluationResult();
    return evalContext
  }


  static generateSampleAttemptContextFor(designContext: QuestionPaperDesignContext): QuestionPaperAttemptContext {

    let attemptContext:QuestionPaperAttemptContext  = new QuestionPaperAttemptContext()
    attemptContext.schema = designContext.schema;
    return attemptContext;
  }



}
