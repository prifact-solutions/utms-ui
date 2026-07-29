import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSettings } from 'src/app/common/appsettings';
import { AchievementsResponse } from '../models/achievements.model';

@Injectable({
  providedIn: 'root',
})
export class AchievementsService {
  constructor(private http: HttpClient) {}

  getAchievements(): Observable<AchievementsResponse> {
    return this.http.get<AchievementsResponse>(
      `${AppSettings.apiUrl}/learners/achievements/`,
    );
  }
}
