import { Component, ViewEncapsulation } from '@angular/core';
import { ComponentBase } from 'src/app/common/componentbase';
import { ProgramsService } from '../services/programs.service';
import { Category, Program } from '../models/program.model';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { AuthService } from 'src/app/utms-auth/services/auth.service';
import { RecentProgramsService } from 'src/app/common/recent-programs.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DetailsComponent extends ComponentBase {
  public catalog: Program | null = null;
  public progress: { [id: string]: string; } = {}
  public openSections: Set<number> = new Set([0]); // Default first section open
  public categories: Array<Category> = [];
  public showVideo: boolean = false;
  public isAuthenticated: boolean = false;

  constructor(private programService: ProgramsService, private authService: AuthService, private route: ActivatedRoute, private router: Router, private recentProgramsService: RecentProgramsService) { super(); }

  public getTotalContents(): number {
    if (!this.catalog) return 0;
    return (this.catalog.modules || []).reduce((acc, m) => acc + (m.module_contents?.length || 0), 0);
  }

  getCategoryLabel(id: number) {
    return this.categories.find(c => c.id === id)?.name;
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
    this.showVideo = true;
  }

  public navigateToLesson(lesson: any) {
    if (this.catalog && lesson) {
      if (lesson.content_type == "LESSON") {
        this.router.navigate(["modules", lesson.module_id, "contents", lesson.id, "lesson"], { relativeTo: this.route });
      } else {
        this.router.navigate(["modules", lesson.module_id, "contents", lesson.id, "exam"], { relativeTo: this.route });
      }
    }
  }

  public isChildRouteActive(): boolean {
    return this.route.firstChild !== null;
  }

  public getStatus(lesson: any): string {
    if (lesson && this.progress[lesson.id]) {
      return this.progress[lesson.id];
    }
    return "LOCKED";
  }

  public isActiveLesson(lessonId: number): boolean {
    let child = this.route.firstChild;
    while (child) {
      if (child.snapshot.params['module_content_id'] == lessonId) {
        return true;
      }
      child = child.firstChild;
    }
    return false;
  }

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.programService.getAllCategories().subscribe(categories => {
      this.categories = categories;
    });

    let sub1 = this.route.params.pipe(
      switchMap(params => {
        return this.programService.getProgramCatalog(params["program_id"]);
      })
    )
      .subscribe((res) => {
        this.catalog = res;
        // Record access for the dashboard's recently accessed section
        if (res) {
          this.recentProgramsService.recordAccess(res.id, res.title, res.thumbnail, res.preview_video);
        }
      });
    this.registerSubscription(sub1);

    let sub2 = this.authService.currentUser$.pipe(
      filter(user => {
        return user != null;
      }),
      switchMap((user) => this.route.params),
      switchMap(params => {
        return this.programService.getProgramProgress(params["program_id"]);
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
