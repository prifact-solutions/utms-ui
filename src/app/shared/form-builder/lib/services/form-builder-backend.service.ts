import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { QuestionPaperSchemaDefn } from '../model/question-paper';
import { QuestionPaperDesignContext, QuestionPaperAttemptContext, Answer, QuestionPaperEvaluateContext, EvaluationResult, EvalEntry, EvaluationStatus } from '../model/context';

@Injectable()
export abstract class FormBuilderBackendService {
    abstract getQuestionPaperDesignContext(questionPaperId: number): Observable<QuestionPaperDesignContext> ;
    abstract saveQuestionPaperSchema(questionPaperId: number, qData: QuestionPaperSchemaDefn): Observable<any> ;
    abstract getQuestionPaperAttemptContext(attemptKey: string): Observable<QuestionPaperAttemptContext> ;
    abstract saveAnswers(attemptKey: string, answers: Answer[]) ;
    abstract getAnswers(attemptKey: string, questions: string[]): Observable<Answer[]> ;
    abstract getAttemptStatus(attemptKey: string): Observable<{ timeRemaining: number; }> ;
    abstract getQuestionPaperEvalContext(attemptKey: string): Observable<QuestionPaperEvaluateContext> ;
    abstract saveEvalResults(attemptKey: string, evaluation: EvaluationResult, marks_scored: number, isEvalComplete: boolean) ;
}