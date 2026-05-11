import { Answer } from './context';

export class QuestionAnswer {
	public name: string;
	public isAnswered: boolean;

	constructor(answer: Answer) {
		this.name = answer.question_name;
		this.isAnswered = answer.isAnswered();
	}
}