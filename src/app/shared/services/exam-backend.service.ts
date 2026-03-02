import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Answer,
  EvaluationResult,
  FormBuilderBackendService,
  QuestionPaperAttemptContext,
  QuestionPaperDesignContext,
  QuestionPaperEvaluateContext,
  QuestionPaperSchemaDefn,
} from 'form-builder';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';
import { AppSettings } from 'src/app/common/appsettings';
import { QuestionPaper } from 'src/app/program-builder/question-papers/models/question-paper';
import { SaveQuestionPaper } from 'src/app/program-builder/question-papers/models/save-question-paper';
import { ProgramsService } from 'src/app/programs/services/programs.service';

@Injectable({
  providedIn: 'root',
})
export class ExamBackendService extends FormBuilderBackendService {
  constructor(
    private http: HttpClient,
    private programsService: ProgramsService,
  ) {
    super();
  }
  getQuestionPaperDesignContext(
    questionPaperId: number,
  ): Observable<QuestionPaperDesignContext> {
    return this.programsService.programId$.pipe(
      switchMap((id) => {
        return this.http.get<QuestionPaper>(
          `${AppSettings.apiUrl}/programs/${id}/question-papers/${questionPaperId}`,
        );
      }),
      map((qp) => {
        var qpDesign = new QuestionPaperDesignContext();
        qpDesign.id = qp.id;
        qpDesign.title = qp.name;
        qpDesign.schema = qp.schema;
        qpDesign.totalMarks = qp.total_score;
        qpDesign.status = qp.status;
        return qpDesign;
      }),
    );
  }
  saveQuestionPaperSchema(
    questionPaperId: number,
    qData: QuestionPaperSchemaDefn,
  ): Observable<any> {
    let maxScore = 0;
    let qpObj = new SaveQuestionPaper();
    qpObj.schema = qData;
    qData.sections.forEach((section) => {
      section.questions.forEach((question) => {
        if (question.isQuestion()) {
          qpObj.questions.push({
            unique_name: question.name,
            total_marks: question.marks,
          });
          maxScore += +question.marks;
        }
      });
    });
    qpObj.total_score = maxScore;
    return this.programsService.programId$.pipe(
      switchMap((id) => {
        return this.http.put<any>(
          `${AppSettings.apiUrl}/programs/${id}/question-papers/${questionPaperId}`,
          qpObj,
        );
      }),
    );
  }
  getQuestionPaperAttemptContext(
    attemptKey: string,
  ): Observable<QuestionPaperAttemptContext> {
    return this.programsService.programId$.pipe(
      switchMap((id) => {
        return this.http.get<QuestionPaperAttemptContext>(
          `${AppSettings.apiUrl}/programs/${id}/examattempt/${+attemptKey}/details`,
        );
      })
    );
  }
  saveAnswers(attemptKey: string, answers: Answer[]) {
    return this.programsService.programId$.pipe(
      switchMap((id) => {
        return this.http.post<Answer[]>(
          `${AppSettings.apiUrl}/programs/${id}/examattempt/${+attemptKey}/answers`,
          answers,
        );
      }),
    );
  }
  getAnswers(attemptKey: string, questions: string[]): Observable<Answer[]> {
    let qNames = questions.join(',');
    return this.programsService.programId$.pipe(
      switchMap((id) => {
        return this.http.get<ExamAnswer[]>(
          `${AppSettings.apiUrl}/programs/${id}/examattempt/${+attemptKey}/answers?questions=${qNames}`,
        );
      }),map(examAnswers => {
        return examAnswers.map(examAnswer => examAnswer.answer);
      })
    );
  }
  getAttemptStatus(attemptKey: string): Observable<{ timeRemaining: number }> {
    throw new Error('Method not implemented.');
  }
  getQuestionPaperEvalContext(
    attemptKey: string,
  ): Observable<QuestionPaperEvaluateContext> {
    return this.http.get<QuestionPaperEvaluateContext>(
      `${AppSettings.apiUrl}/attempt/${+attemptKey}/evaluation`,
    );
  }
  saveEvalResults(
    attemptKey: string,
    evaluation: EvaluationResult,
    marks_scored: number,
    isEvalComplete: boolean,
  ) {
    throw new Error('Method not implemented.');
  }

  attemptExam(
    programId: number,
    moduleId: number,
    contentId: number,
    examId: number,
  ) {
    return this.http.post<any>(
      `${AppSettings.apiUrl}/programs/${programId}/modules/${moduleId}/contents/${contentId}/examattempt`,
      { exam: examId },
    );
  }

  getExamAttempt(
    programId: number,
    examId: number,
  ): Observable<ExamAttempt | null> {
    return this.http
      .get<any>(
        `${AppSettings.apiUrl}/programs/${programId}/exam/${examId}/examattempt`,
      )
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            return of(null);
          }
          return throwError(() => error);
        }),
      );
  }

  completeAttempt(programId: number, attemptId: number) {
    return this.http.patch(
      `${AppSettings.apiUrl}/programs/${programId}/examattempt/${attemptId}`,
      {
        status: ExamAttemptStatus.COMPLETED,
      },
    );
  }
}

export class ExamAttempt {
  public id!: number;
  public exam_id!: number;
  public score?: number;
  public result?: ExamResultStatus;
  public status!: ExamAttemptStatus;
}

export class ExamAnswer {
  public id!: number;
  public answer!: Answer;
  public created_at!: string;
  public exam_attempt!: number;
  public question!: number;
}

export enum ExamAttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum ExamResultStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
}
