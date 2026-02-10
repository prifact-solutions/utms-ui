import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppSettings } from 'src/app/common/appsettings';
import { ModuleContentFileUrl, ModuleContentWithFiles, Program } from '../models/program.model';
import { ProgramProgress } from '../models/program_progress.model';

@Injectable({
  providedIn: 'root'
})
export class ProgramsService {

  constructor(private http: HttpClient) { }

  public getAllPrograms() {
    return this.http.get<Array<Program>>(`${AppSettings.apiUrl}/programs/`);
  }
  public getMyPrograms() {
    return this.http.get<Array<Program>>(`${AppSettings.apiUrl}/learners/my_programs`);
  }
  public getProgramById(id: number) {
    return this.http.get<Program>(`${AppSettings.apiUrl}/programs/${id}`);
  }
  public getProgramCatalog(id: number) {
    return this.http.get<Program>(`${AppSettings.apiUrl}/programs/${id}/catalog`);
  }
  public getProgramProgress(id: number) {
    return this.http.get<Array<ProgramProgress>>(`${AppSettings.apiUrl}/programs/${id}/progress`);
  }
  public getLesson(program_id: number, module_id: number, module_content_id: number) {
    return this.http.get<ModuleContentWithFiles>(`${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents/${module_content_id}/lesson`);
  }
  public getLessonFileUrl(program_id: number, module_id: number, module_content_id: number, file_id: number) {
    return this.http.get<ModuleContentFileUrl>(`${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents/${module_content_id}/files/${file_id}`);
  }
  public enroll(id: number) {
    return this.http.post(`${AppSettings.apiUrl}/learners/${id}/enroll/`, {});
  }
  public updateFileStatus(program_id: number, module_id: number, module_content_id: number, file_id: number, status: string) {
    return this.http.post(`${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents/${module_content_id}/files/${file_id}/status`, { "status": status });
  }
  public updateLessonStatus(program_id: number, module_id: number, module_content_id: number, status: string) {
    return this.http.post(`${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents/${module_content_id}/status`, { "status": status });
  }
}
