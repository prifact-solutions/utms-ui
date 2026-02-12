import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppSettings } from 'src/app/common/appsettings';
import { Module, ModuleContent, ModuleContentFileUrl, ModuleContentWithFiles, Program } from '../models/program.model';
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
  public getCreatedPrograms() {
    return this.http.get<Array<Program>>(`${AppSettings.apiUrl}/programs/created-by-me`);
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
  public getNextContentIfEligible(program_id: number, module_id: number, module_content_id: number) {
    return this.http.get<ModuleContent>(`${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents/${module_content_id}/next`);
  }
  public getLessonFileUrl(program_id: number, module_id: number, module_content_id: number, file_id: number) {
    return this.http.get<ModuleContentFileUrl>(`${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents/${module_content_id}/files/${file_id}`);
  }
  public enroll(id: number) {
    return this.http.post(`${AppSettings.apiUrl}/learners/${id}/enroll/`, {});
  }
  public updateFileStatus(program_id: number, module_id: number, module_content_id: number, file_id: number, status: string) {
    return this.http.post<ModuleContent>(`${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents/${module_content_id}/files/${file_id}/status`, { "status": status });
  }
  public updateLessonStatus(program_id: number, module_id: number, module_content_id: number, status: string) {
    return this.http.post<ModuleContent>(`${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents/${module_content_id}/status`, { "status": status });
  }
  public createProgram(program: Partial<Program>) {
    return this.http.post<Program>(`${AppSettings.apiUrl}/programs/`, program);
  }
  public updateProgram(id: number, program: Partial<Program>) {
    return this.http.put<Program>(`${AppSettings.apiUrl}/programs/${id}/`, program);
  }

  public createModule(program_id: number, module_payload: any) {
    return this.http.post<Module>(`${AppSettings.apiUrl}/programs/${program_id}/modules`, module_payload);
  }
  public getModulesForProgram(program_id: number) {
    return this.http.get<Array<Module>>(`${AppSettings.apiUrl}/programs/${program_id}/modules`);
  }
  public getModuleContentsForModule(program_id: number, module_id: number) {
    return this.http.get<Array<ModuleContent>>(`${AppSettings.apiUrl}/programs/${program_id}/modules/${module_id}/contents`);
  }
}
