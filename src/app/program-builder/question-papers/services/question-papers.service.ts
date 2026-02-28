import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppSettings } from 'src/app/common/appsettings';
import { Observable } from 'rxjs';
import { CreateQuestionPaper } from '../models/create-question-paper';
import { QuestionPaper, QuestionPaperStatus } from '../models/question-paper';

@Injectable({
  providedIn: 'root',
})
export class QuestionPapersService {
  constructor(public http: HttpClient) {}

  getAllQuestionPapersForProgram(
    programId: number,
  ): Observable<Array<QuestionPaper>> {
    return this.http.get<Array<QuestionPaper>>(
      `${AppSettings.apiUrl}/programs/${programId}/question-papers`,
    );
  }

  createQuestionPaper(
    programId: number,
    createQpObj: CreateQuestionPaper,
  ): Observable<QuestionPaper> {
    return this.http.post<QuestionPaper>(
      `${AppSettings.apiUrl}/programs/${programId}/question-papers`,
      createQpObj,
    );
  }

  changeQuestionPaperStatus(
    questionPaperId: number,
    programId: number,
    status: QuestionPaperStatus,
  ) {
    return this.http.patch<QuestionPaper>(
      `${AppSettings.apiUrl}/programs/${programId}/question-papers/${questionPaperId}`,
      { status: status },
    );
  }

  cloneQuestionPaper(
    questionPaperId: number,
    programId: number,
  ): Observable<QuestionPaper> {
    return this.http.post<QuestionPaper>(
      `${AppSettings.apiUrl}/programs/${programId}/question-papers/${questionPaperId}/clone`,
      {},
    );
  }

  updateQuestionPaperTitle(
    questionPaperId: number,
    programId: number,
    QpObj: CreateQuestionPaper,
  ): Observable<any> {
    return this.http.patch<any>(
      `${AppSettings.apiUrl}/programs/${programId}/question-papers/${questionPaperId}`,
      QpObj,
    );
  }

  shareUnshareQuestionPaper(
    questionPaperId: number,
    programId: number,
    isShared: boolean,
  ): Observable<any> {
    return this.http.patch<any>(
      `${AppSettings.apiUrl}/programs/${programId}/question-papers/${questionPaperId}/share?share=${isShared}`,
      {},
    );
  }
}
