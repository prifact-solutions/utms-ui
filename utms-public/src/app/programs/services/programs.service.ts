import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppSettings } from 'src/app/common/appsettings';
import { Program } from '../models/program.model';
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
  public enroll(id: number) {
    return this.http.post(`${AppSettings.apiUrl}/learners/${id}/enroll/`, {});
  }
}
