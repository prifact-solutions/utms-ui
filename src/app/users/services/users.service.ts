import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserModel } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from 'src/app/common/appsettings';

export interface UserUpdatePayload {
  first_name: string;
  last_name: string;
  is_staff: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(`${AppSettings.apiUrl}/users`);
  }

  updateUser(userId: number, body: UserUpdatePayload): Observable<UserModel> {
    return this.http.put<UserModel>(
      `${AppSettings.apiUrl}/users/${userId}`,
      body,
    );
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${AppSettings.apiUrl}/users/${userId}`);
  }
}
