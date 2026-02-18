import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Answer, EvaluationResult, FormBuilderBackendService, QuestionPaperAttemptContext, QuestionPaperDesignContext, QuestionPaperEvaluateContext, QuestionPaperSchemaDefn } from 'form-builder';
import { Observable } from 'rxjs';
import { AppSettings } from 'src/app/common/appsettings';

@Injectable({
  providedIn: 'root'
})
export class ExamBackendService extends FormBuilderBackendService {

  constructor(private http: HttpClient) { super();}
  getQuestionPaperDesignContext(questionPaperId: number): Observable<QuestionPaperDesignContext> {
    return this.http.get<QuestionPaperDesignContext>(`${AppSettings.apiUrl}/questionPaper/${questionPaperId}/definition`)
  }
  saveQuestionPaperSchema(questionPaperId: number, qData: QuestionPaperSchemaDefn): Observable<any> {
    let maxScore = 0;
    let qpObj = new SaveQuestionPaper();
    qpObj.definition = qData;
    qData.sections.forEach(section => {
      section.questions.forEach(question => {
        if (question.isQuestion()) {
          qpObj.questions.push({
            "unique_name": question.name,
            "total_marks": question.marks
          })
          maxScore += +question.marks;
        }
      });
    });
    qpObj.max_score = maxScore;
    return this.http.put<any>(`${AppSettings.apiUrl}questionPaper/${questionPaperId}/definition`, qpObj);
  }
  getQuestionPaperAttemptContext(attemptKey: string): Observable<QuestionPaperAttemptContext> {
    throw new Error("Method not implemented.");
  }
  saveAnswers(attemptKey: string, answers: Answer[]) {
    throw new Error("Method not implemented.");
  }
  getAnswers(attemptKey: string, questions: string[]): Observable<Answer[]> {
    throw new Error("Method not implemented.");
  }
  getAttemptStatus(attemptKey: string): Observable<{ timeRemaining: number; }> {
    throw new Error("Method not implemented.");
  }
  getQuestionPaperEvalContext(attemptKey: string): Observable<QuestionPaperEvaluateContext> {
    return this.http.get<QuestionPaperEvaluateContext>(`${AppSettings.apiUrl}/attempt/${+attemptKey}/evaluation`);
  }
  saveEvalResults(attemptKey: string, evaluation: EvaluationResult, marks_scored: number, isEvalComplete: boolean) {
    // let evalObj = new SaveEvaluationResult();
    // evalObj.marks_scored = marks_scored;
    // evalObj.evaluation_results = evaluation;
    // evalObj.is_eval_complete = isEvalComplete;
    // return this.http.post(`${AppSettings.apiUrl}attempt/${+attemptKey}/evaluation`, evalObj);
  }
}

export class SaveQuestionPaper {
	public definition!: QuestionPaperSchemaDefn;
	public questions: Array<Question> = [];
	public max_score!: number;
}

export class Question {
	public unique_name!: string;
	public total_marks!: number;
}