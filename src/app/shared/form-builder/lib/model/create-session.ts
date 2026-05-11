import { CreateSessionModel } from 'file-upload-session';

export class CreateSession extends CreateSessionModel {
	public question_name: string;
	public question_title: string;
	public attempt_id: number;
}