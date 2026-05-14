import { QuestionPaperSchemaDefn } from '../../../shared/form-builder/lib/model/question-paper';

export class QuestionPaper {
	public id!: number;
	public name!: string;
	public total_score!: number;
	public programId!: number;
	public status!: QuestionPaperStatus;
	public status_display!: string;
	public schema!: QuestionPaperSchemaDefn;
	public created_by!: number;
	public created_by_full_name!: string;
	public updated_date!: string;
	public is_shared!: boolean;
	public is_linked!: boolean;
	public actions!: string[];
}

export enum QuestionPaperStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED'
}