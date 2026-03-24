import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Note } from '../models/note.model';
import { AppSettings } from 'src/app/common/appsettings';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  constructor(public http: HttpClient) {}
  createNote(title: string, content: string): Observable<Note> {
    return this.http.post<Note>(`${AppSettings.apiUrl}/learners/notes/`, {
      title: title,
      content: content,
    });
  }

  getNotesForUser(): Observable<Note[]> {
    return this.http.get<Note[]>(`${AppSettings.apiUrl}/learners/notes/`);
  }

  updateNote(id: Number, title: string, content: string): Observable<Note> {
    return this.http.put<Note>(`${AppSettings.apiUrl}/learners/notes/${id}`, {
      title: title,
      content: content,
    });
  }

  deleteNote(id: Number) {
    return this.http.delete<Note>(`${AppSettings.apiUrl}/learners/notes/${id}`);
  }
}
