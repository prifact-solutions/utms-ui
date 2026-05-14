import { FormElementType } from './form-elements';
import { QuestionPaperSchemaDefn } from './question-paper';

/************* DESIGN ****************/

export const QPStatus =
{
    draft: "draft",
    completed: "published"
}

export type QPStatus = typeof QPStatus[keyof typeof QPStatus];




export class QuestionPaperDesignContext {
    id: number
    title: string;
    schema: QuestionPaperSchemaDefn
    totalMarks: number
    status: QPStatus;


    constructor(initObj?: any) {        
        let init: Partial<QuestionPaperDesignContext> = initObj;
        
        if (init == null)
            init = {}

        this.id = init.id
        this.title = init.title
        this.totalMarks = init.totalMarks
        this.status = init.status
        if (this.status == null)
            this.status = QPStatus.draft;
        this.schema = new QuestionPaperSchemaDefn(init.schema)
    }

}



/************* EVALUATION ****************/

export class EvalEntry {
    question_name: string;
    marks_awarded: number;
    remarks: string;

    constructor(init?: Partial<EvalEntry>) {
        if (init == null)
            init = {}
        this.question_name = init.question_name;
        this.marks_awarded = init.marks_awarded;
        this.remarks = init.remarks;
    }
}

export const EvaluationStatus =
{
    pending: "pending",
    completed: "completed"
}

export type EvaluationStatus = typeof EvaluationStatus[keyof typeof EvaluationStatus];


export class EvaluationResult {
    status: EvaluationStatus;
    //answers: Array<Answer>;
    entries: Array<EvalEntry>


    constructor(init?: Partial<EvaluationResult>) {

        if (init == null)
        {
            init = {}
        }

        this.status = init.status;

        if (this.status == null)
            this.status = EvaluationStatus.pending;

        // this.answers = new Array<Answer>();
        // if (init && init.answers) {
        //     for (let answer of init.answers) {
        //         this.answers.push(Answer.parseAnswer(answer));
        //     }
        // }

        this.entries = new Array<EvalEntry>();
        if (init.entries) {
            for (let entry of init.entries) {
                this.entries.push(new EvalEntry(entry));
            }
        }

    }
}

export class StudentInfo {
    display_name: string;
    serial_number: string;
    image_url: string;

    constructor(init?: Partial<StudentInfo>) {
        if (init == null)
            init = {};
        
        this.display_name = init.display_name;
        this.serial_number = init.serial_number;
        this.image_url = init.image_url;
    }
}

export class QuestionPaperEvaluateContext {
    attempt_key: string;
    schema: QuestionPaperSchemaDefn;
    student_info: StudentInfo;
    evaluation: EvaluationResult;
    answers: Array<Answer>;
    marks_scored: number = 0;

    constructor(init?: Partial<QuestionPaperEvaluateContext>) {

        if (init == null)
            init = {};

        this.attempt_key = init.attempt_key;
        this.schema = new QuestionPaperSchemaDefn(init.schema);
        this.student_info = new StudentInfo(init.student_info);
        this.evaluation = new EvaluationResult(init.evaluation);
        this.answers = new Array<Answer>();
        if (init.answers) {
            for (let answer of init.answers) {
                this.answers.push(Answer.parseAnswer(answer));
            }
        }
    }
}


/************* ATTEMPT ****************/

export abstract class Answer {
    question_name: string;
    elementType: FormElementType;

    constructor(elementType: FormElementType, question_name: string) {
        this.question_name = question_name;
        this.elementType = elementType;
    }

    abstract isAnswered(): boolean;

    static parseAnswer<T extends Answer>(obj: Partial<T>): T {
        if (obj == null)
            throw new Error("Input object is null. Unable to parse for answer")

        if (obj.elementType == null) {
            throw new Error("Element type not specified. Unable to parse.")
        }

        if (obj.question_name == null) {
            throw new Error("Question name not specified. Unable to parse.")
        }

        let ele = null;
        switch (obj.elementType) {
            case FormElementType.descriptive: {
                ele = new TextAnswer(obj);
                break;
            }
            case FormElementType.multiple_choice: {
                ele = new MCQAnswer(obj);
                break;
            }
            case FormElementType.file_upload: {
                ele = new FileUploadAnswer(obj);
                break;
            }
            default: {
                throw new Error('Unknown question element type to parse - ' + obj.elementType)
            }
        }
        return ele;
    }

}

export class TextAnswer extends Answer {
    answerContent: string;
    isAnswered(): boolean {
        if(!this.answerContent || this.answerContent.trim() == ""){
            return false;
        }
        return true;
    }

    constructor(init?: Partial<TextAnswer>) {
        if (init == null) {
            init = { elementType: FormElementType.descriptive }
        }

        if (init.elementType == null) {
            init.elementType = FormElementType.descriptive
        }

        if (init.elementType != FormElementType.descriptive) {
            throw new Error("Invalid type used to initialize - " + init.elementType + " Expected - " + FormElementType.descriptive);
        }

        if (!init.question_name) {
            throw new Error("Question name is requried for Answer");
        }

        super(init.elementType, init.question_name)
        this.answerContent = init.answerContent;
    }
}

export class MCQAnswer extends Answer {
    answerChoiceValue: string;
    isAnswered(): boolean {
        if(!this.answerChoiceValue){
            return false;
        }
        return true;
    }

    constructor(init?: Partial<MCQAnswer>) {
        if (init == null) {
            init = { elementType: FormElementType.multiple_choice }
        }

        if (init.elementType == null) {
            init.elementType = FormElementType.multiple_choice
        }

        if (init.elementType != FormElementType.multiple_choice) {
            throw new Error("Invalid type used to initialize - " + init.elementType + " Expected - " + FormElementType.multiple_choice);
        }

        if (!init.question_name) {
            throw new Error("Question name is requried for Answer");
        }

        super(init.elementType, init.question_name)

        this.answerChoiceValue = init.answerChoiceValue;
    }
}

export class FileUploadAnswer extends Answer {
    answerContent: string;
    sessionKey: string;
    hasAnswer: boolean;
    isAnswered(): boolean {
        return this.hasAnswer;
    }

    constructor(init?: Partial<FileUploadAnswer>) {
        if (init == null) {
            init = { elementType: FormElementType.file_upload }
        }

        if (init.elementType == null) {
            init.elementType = FormElementType.file_upload
        }

        if (init.elementType != FormElementType.file_upload) {
            throw new Error("Invalid type used to initialize - " + init.elementType + " Expected - " + FormElementType.file_upload);
        }

        if (!init.question_name) {
            throw new Error("Question name is requried for Answer");
        }

        super(init.elementType, init.question_name)

        this.answerContent = init.answerContent;
        this.sessionKey = init.sessionKey;
        this.hasAnswer = init.hasAnswer;
    }
}


export class QuestionPaperAttemptContext {
    attemptkey: string;
    schema: QuestionPaperSchemaDefn;  //Should NOT have the correct answer specified for objective
    answers: Array<Answer> = [];
    questionNumbers: Object = {};
    totalQuestions: number = 0;
    maxScore: number = 0;

    constructor(init?: Partial<QuestionPaperAttemptContext>) {
        if (init == null)
            init = {};

        this.attemptkey = init.attemptkey
        this.schema = new QuestionPaperSchemaDefn(init.schema)

        this.answers = new Array<Answer>();
         if (init.answers) {
             for (let answer of init.answers) {
                 this.answers.push(Answer.parseAnswer(answer));
             }
        }

    }
}
