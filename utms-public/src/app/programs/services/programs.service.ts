import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppSettings } from 'src/app/common/appsettings';
import { Program } from '../models/program.model';

@Injectable({
  providedIn: 'root'
})
export class ProgramsService {

  constructor(private http: HttpClient) { }

  public getAllCourses() {
    return this.http.get<Array<Program>>(`${AppSettings.apiUrl}/programs/`);
  }
}
