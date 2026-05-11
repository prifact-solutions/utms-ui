import { QuestionPaperSchemaDefn } from '../../../shared/form-builder/lib/model/question-paper';

export class SaveQuestionPaper {
	public schema!: QuestionPaperSchemaDefn;
	public questions: Array<Question> = [];
	public total_score!: number;
}

export class Question {
	public unique_name!: string;
	public total_marks!: number;
}