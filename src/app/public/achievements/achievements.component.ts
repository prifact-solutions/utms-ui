import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ComponentBase } from 'src/app/common/componentbase';
import {
  AchievementBadge,
  AchievementCourse,
  AchievementsStats,
} from './models/achievements.model';
import { AchievementsService } from './services/achievements.service';

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss'],
})
export class AchievementsComponent extends ComponentBase implements OnInit {
  loading = true;
  loadError = false;

  stats: AchievementsStats = {
    badges_earned: 0,
    courses_completed: 0,
    courses_in_progress: 0,
    estimated_hours: 0,
    avg_exam_score_pct: null,
  };
  badges: AchievementBadge[] = [];
  courses: AchievementCourse[] = [];

  constructor(
    private achievementsService: AchievementsService,
    private router: Router,
  ) {
    super();
  }

  ngOnInit(): void {
    const sub = this.achievementsService
      .getAchievements()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => {
          this.stats = data.stats;
          this.badges = data.badges;
          this.courses = data.courses;
          this.loadError = false;
        },
        error: () => {
          this.loadError = true;
        },
      });
    this.registerSubscription(sub);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'Completed';
      case 'IN_PROGRESS':
        return 'In progress';
      default:
        return status;
    }
  }

  openCourse(course: AchievementCourse): void {
    this.router.navigate(['/programs', course.program_id, 'details']);
  }
}
