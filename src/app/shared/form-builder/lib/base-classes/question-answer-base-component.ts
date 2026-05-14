import { Output, EventEmitter } from '@angular/core';
import { QuestionAnswer } from '../model/question-answer';

export class QuestionAnswerBaseComponent {
	onSetAnswer: EventEmitter<QuestionAnswer> = new EventEmitter<QuestionAnswer>();
}