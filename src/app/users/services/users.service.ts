import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserModel } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from 'src/app/common/appsettings';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}
  getAllUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(`${AppSettings.apiUrl}/users`);
  }
}
