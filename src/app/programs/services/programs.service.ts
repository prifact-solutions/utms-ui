import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppSettings } from 'src/app/common/appsettings';
import {
  Category,
  Exam,
  Module,
  ModuleContent,
  ModuleContentFileUrl,
  ModuleContentWithExam,
  ModuleContentWithFiles,
  Program,
  ProgramSummary,
  StudentProgramReportDetails,
} from '../models/program.model';
import { ProgramProgress } from '../models/program_progress.model';
import { QuestionPaper } from 'src/app/program-builder/question-papers/models/question-paper';
import { BehaviorSubject, of, ReplaySubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProgramsService {
  constructor(private http: HttpClient) { }

  private _currentProgramId = new BehaviorSubject<string | null>(null);

  public programId$ = this._currentProgramId.asObservable();

  setProgramId(id: string | null) {
    this._currentProgramId.next(id);
  }
  private categoriesCache$: ReplaySubject<Array<Category>> = new ReplaySubject(1);

  private httpInProgress = false;
  private cacheLoaded = false;

  public getAllCategories() {
    if (this.cacheLoaded) {
      return this.categoriesCache$;
    }
    if (this.httpInProgress) {
      return this.categoriesCache$;
    } else {
      this.httpInProgress = true;
      return this.http
        .get<Array<Category>>(`${AppSettings.apiUrl}/categories/`)

        .pipe(
          tap((categories) => {
            this.categoriesCache$.next(categories);
            this.cacheLoaded = true;
            this.httpInProgress = false;
          }));
    }
  }

  public getAllPrograms() {
    return this.http.get<Array<Program>>(`${AppSettings.apiUrl}/programs/`);
  }
  public getMyPrograms() {
    return this.http.get<Array<Program>>(
      `${AppSettings.apiUrl}/learners/my_programs/`,
    );
  }
  public getCreatedPrograms() {
    return this.http.get<Array<Program>>(
      `${AppSettings.apiUrl}/programs/created-by-me/`,
    );
  }
  public getProgramById(id: number) {
    console.log(`Fetching program with ID ${id} from API`);
    return this.http.get<Program>(`${AppSettings.apiUrl}/programs/${id}/`);
  }
  public getProgramCatalog(id: number) {
    return this.http.get<Program>(
      `${AppSettings.apiUrl}/programs/${id}/catalog/`,
    );
  }
  public getProgramProgress(id: number) {
    return this.http.get<Array<ProgramProgress>>(
      `${AppSettings.apiUrl}/programs/${id}/progress/`,
    );
  }
  public getLesson(
    program_id: number,
    module_id: number,
    module_content_id: number,
  ) {
    return this.http.get<ModuleContentWithFiles>(
      `${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents/${module_content_id}/lesson/`,
    );
  }
  public getNextContentIfEligible(
    program_id: number,
    module_id: number,
    module_content_id: number,
  ) {
    return this.http.get<ModuleContent>(
      `${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents/${module_content_id}/next`,
    );
  }
  public getLessonFileUrl(
    program_id: number,
    module_id: number,
    module_content_id: number,
    file_id: number,
  ) {
    return this.http.get<ModuleContentFileUrl>(
      `${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents/${module_content_id}/files/${file_id}`,
    );
  }
  public enroll(id: number) {
    return this.http.post(`${AppSettings.apiUrl}/learners/${id}/enroll/`, {});
  }
  public updateFileStatus(
    program_id: number,
    module_id: number,
    module_content_id: number,
    file_id: number,
    status: string,
  ) {
    return this.http.post<ModuleContent>(
      `${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents/${module_content_id}/files/${file_id}/status`,
      { status: status },
    );
  }
  public updateLessonStatus(
    program_id: number,
    module_id: number,
    module_content_id: number,
    status: string,
  ) {
    return this.http.post<ModuleContent>(
      `${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents/${module_content_id}/status`,
      { status: status },
    );
  }
  public createProgram(program: Partial<Program>) {
    return this.http.post<Program>(`${AppSettings.apiUrl}/programs/`, program);
  }

  public archiveProgram(program_id: number) {
    return this.http.delete<Program>(
      `${AppSettings.apiUrl}/programs/${program_id}/`,
    );
  }

  public updateProgram(id: number, program: Partial<Program> | FormData) {
    return this.http.put<Program>(
      `${AppSettings.apiUrl}/programs/${id}/`,
      program,
    );
  }

  public createModule(program_id: number, module_payload: any) {
    return this.http.post<Module>(
      `${AppSettings.apiUrl}/programs/${program_id}/modules`,
      module_payload,
    );
  }
  public updateModule(
    program_id: number,
    module_id: number,
    module_payload: any,
  ) {
    return this.http.put<Module>(
      `${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}`,
      module_payload,
    );
  }
  public deleteModule(program_id: number, module_id: number) {
    return this.http.delete(
      `${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}`,
    );
  }
  public getModulesForProgram(program_id: number) {
    return this.http.get<Array<Module>>(
      `${AppSettings.apiUrl}/programs/${program_id}/modules`,
    );
  }
  public getModuleContentsForModule(program_id: number, module_id: number) {
    return this.http.get<Array<ModuleContent>>(
      `${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents`,
    );
  }
  public createLesson(
    program_id: number,
    module_id: number,
    lesson: Partial<ModuleContent>,
  ) {
    return this.http.post<ModuleContent>(
      `${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents`,
      lesson,
    );
  }
  public createExam(program_id: number, module_id: number, exam: any) {
    return this.http.post<ModuleContent>(
      `${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents/exam`,
      exam,
    );
  }

  public updateExam(
    program_id: number,
    module_id: number,
    exam_id: number,
    exam: any,
  ) {
    return this.http.put<ModuleContent>(
      `${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/exams/${exam_id}`,
      exam,
    );
  }
  public updateLesson(
    program_id: number,
    module_id: number,
    lesson_id: number,
    lesson: Partial<ModuleContent>,
  ) {
    return this.http.put<ModuleContent>(
      `${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents/${lesson_id}/`,
      lesson,
    );
  }
  public updateContentOrganization(
    program_id: number,
    contentUpdates: Array<{
      content_id: number;
      previous_content_id: number | null;
      order: number;
    }>,
  ) {
    return this.http.put(
      `${AppSettings.apiUrl}/programs/${program_id}/organize-contents/`,
      { contents: contentUpdates },
    );
  }
  public getSignedUrlForUpload(
    program_id: number,
    module_id: number,
    module_content_id: number,
    file_name: string,
    file_type: string,
  ) {
    return this.http.post<{ url: string; mime_type: string }>(
      `${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents/${module_content_id}/upload-url`,
      {
        file_name: file_name,
        file_type: file_type,
      },
    );
  }

  public deleteFiles(
    program_id: number,
    module_id: number,
    module_content_id: number,
    file_ids: number[],
  ) {
    return this.http.post(
      `${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents/${module_content_id}/files/delete`,
      {
        file_ids: file_ids
      },
    );
  }

  public getProgramThumbnailUploadUrl(program_id: number, file_name: string) {
    return this.http.post<{ url: string; mime_type: string }>(
      `${AppSettings.apiUrl}/programs/${program_id}/thumbnail/`,
      { file_name },
    );
  }

  public getProgramVideoUploadUrl(program_id: number, file_name: string) {
    return this.http.post<{ url: string; mime_type: string }>(
      `${AppSettings.apiUrl}/programs/${program_id}/preview-video/`,
      { file_name },
    );
  }

  public getProgramThumbnailViewUrl(program_id: number) {
    return this.http.post<{ file_url: string }>(
      `${AppSettings.apiUrl}/programs/${program_id}/get-thumbnail/`,
      {},
    );
  }

  public getProgramVideoViewUrl(program_id: number) {
    return this.http.post<{ file_url: string }>(
      `${AppSettings.apiUrl}/programs/${program_id}/get-preview-video/`,
      {},
    );
  }

  public deleteModuleContent(
    program_id: number,
    module_id: number,
    module_content_id: number,
  ) {
    return this.http.delete(
      `${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents/${module_content_id}/`,
    );
  }
  public uploadFileToSignedUrl(
    signed_url: string,
    mime_type: string,
    file: File,
  ) {
    return this.http.put(signed_url, file, {
      headers: {
        'Content-Type': mime_type,
      },
    });
  }

  public getExam(
    program_id: number,
    module_id: number,
    module_content_id: number,
  ) {
    return this.http.get<ModuleContentWithExam>(
      `${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents/${module_content_id}/exam`,
    );
  }

  public getSummaryReport() {
    return this.http.get<ProgramSummary[]>(
      `${AppSettings.apiUrl}/programs/reports`,
    );
  }

  public getProgramReport(programId: number) {
    return this.http.get<StudentProgramReportDetails[]>(
      `${AppSettings.apiUrl}/programs/reports/${programId}`,
    );
  }
}
