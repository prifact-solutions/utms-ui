import { Component } from '@angular/core';
import { ComponentBase } from 'src/app/common/componentbase';
import { ProgramsService } from '../services/programs.service';
import { Program } from '../models/program.model';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { AuthService } from 'src/app/utms-auth/services/auth.service';
import { RecentProgramsService } from 'src/app/common/recent-programs.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent extends ComponentBase {
  public catalog: Program | null = null;
  public progress: { [id: string]: string; } = {}
  public openSections: Set<number> = new Set([0]); // Default first section open

  constructor(private programService: ProgramsService, private authService: AuthService, private route: ActivatedRoute, private router: Router, private recentProgramsService: RecentProgramsService) { super(); }

  public getTotalContents(): number {
    if (!this.catalog) return 0;
    return (this.catalog.modules || []).reduce((acc, m) => acc + (m.module_contents?.length || 0), 0);
  }

  public toggleAccordion(index: number): void {
    if (this.openSections.has(index)) {
      this.openSections.delete(index);
    } else {
      this.openSections.add(index);
    }
  }

  public isOpen(index: number): boolean {
    return this.openSections.has(index);
  }

  public getContentIcon(type: string): string {
    switch (type) {
      case 'VIDEO': return '📹';
      case 'DOCUMENT': return '📄';
      case 'EXAM': return '📝';
      default: return '📖';
    }
  }

  public playPreview(): void {
    console.log('Playing preview...');
  }

  public navigateToLesson(lesson: any) {
    if (this.catalog && lesson) {
      if (lesson.content_type == "LESSON") {
        this.router.navigate(["programs", this.catalog.id, "modules", lesson.module_id, "contents", lesson.id, "lesson"]);
      } else {
        this.router.navigate(["programs", this.catalog.id, "modules", lesson.module_id, "contents", lesson.id, "exam"]);
      }
    }
  }

  public getStatus(lesson: any): string {
    if (lesson && this.progress[lesson.id]) {
      return this.progress[lesson.id];
    }
    return "LOCKED";
  }

  ngOnInit() {
    let sub1 = this.route.params.pipe(
      switchMap(params => {
        return this.programService.getProgramCatalog(params["id"]);
      })
    )
      .subscribe((res) => {
        this.catalog = res;
        // Record access for the dashboard's recently accessed section
        if (res) {
          this.recentProgramsService.recordAccess(res.id, res.title, res.thumbnail);
        }
      });
    this.registerSubscription(sub1);

    let sub2 = this.authService.currentUser$.pipe(
      filter(user => {
        return user != null;
      }),
      switchMap((user) => this.route.params),
      switchMap(params => {
        return this.programService.getProgramProgress(params["id"]);
      })
    )
      .subscribe((progresses) => {
        progresses?.forEach((progress) => {
          this.progress[progress.content_id] = progress.status;
        });
      });
    this.registerSubscription(sub2);
  }
}
