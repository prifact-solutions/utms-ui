import { Component, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { ComponentBase } from 'src/app/common/componentbase';
import { ProgramsService } from '../services/programs.service';
import { Category, ModuleContent, Program } from '../models/program.model';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { AuthService } from 'src/app/utms-auth/services/auth.service';
import { RecentProgramsService } from 'src/app/common/recent-programs.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DetailsComponent extends ComponentBase {
  public catalog: Program | null = null;
  public progress: { [id: string]: string } = {};
  public openSections: Set<number> = new Set([0]); // Default first section open
  public categories: Array<Category> = [];
  public showVideo: boolean = false;
  public isAuthenticated: boolean = false;
  public isLoading: boolean = true;
  public isEnrolled: boolean = false;
  public programId!: number;
  public showEnrollModal: boolean = false;
  public isSubmitting: boolean = false;
  public showToast: boolean = false;

  constructor(
    private programService: ProgramsService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private recentProgramsService: RecentProgramsService,
    private cdRef: ChangeDetectorRef,
  ) {
    super();
  }

  public getTotalContents(): number {
    if (!this.catalog) return 0;
    return (this.catalog.modules || []).reduce(
      (acc, m) => acc + (m.module_contents?.length || 0),
      0,
    );
  }

  getCategoryLabel(id: number) {
    return this.categories.find((c) => c.id === id)?.name;
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
      case 'VIDEO':
        return '📹';
      case 'DOCUMENT':
        return '📄';
      case 'EXAM':
        return '📝';
      default:
        return '📖';
    }
  }

  public playPreview(): void {
    this.showVideo = true;
  }

  public navigateToLesson(lesson: any) {
    if (this.catalog && lesson) {
      if (lesson.content_type == 'LESSON') {
        this.router.navigate(
          ['modules', lesson.module_id, 'contents', lesson.id, 'lesson'],
          { relativeTo: this.route },
        );
      } else {
        this.router.navigate(
          ['modules', lesson.module_id, 'contents', lesson.id, 'exam'],
          { relativeTo: this.route },
        );
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
    return 'LOCKED';
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
    this.isLoading = true;
    this.programService.getAllCategories().subscribe((categories) => {
      this.categories = categories;
    });

    let sub1 = this.route.params
      .pipe(
        switchMap((params) => {
          this.isLoading = true;
          this.catalog = null;
          this.isEnrolled = false; // Reset enrollment state
          this.programId = +params['program_id']; // Ensure it's a number
          return this.programService.getProgramCatalog(params['program_id']);
        }),
        switchMap((res) => {
          this.catalog = res;
          // Record access for the dashboard's recently accessed section
          if (res) {
            this.recentProgramsService.recordAccess(
              res.id,
              res.title,
              res.thumbnail,
              res.preview_video,
            );
          }
          return this.programService.getMyPrograms();
        }),
      )
      .subscribe((programs) => {
        if (programs.find((o) => o.id == this.programId)) {
          this.isEnrolled = true;
        }
        this.isLoading = false;
      });
    this.registerSubscription(sub1);

    let sub2 = this.authService.currentUser$
      .pipe(
        filter((user) => {
          return user != null;
        }),
        switchMap((user) => this.route.params),
        switchMap((params) => {
          return this.programService.getProgramProgress(params['program_id']);
        }),
      )
      .subscribe((progresses) => {
        progresses?.forEach((progress) => {
          this.progress[progress.content_id] = progress.status;
        });
      });
    this.registerSubscription(sub2);
  }

  onContinueLearning() {
    if (!this.catalog || !this.catalog.modules) return;
    const sortedModules = [...this.catalog.modules].sort(
      (a, b) => (a.order || 0) - (b.order || 0),
    );

    for (const module of sortedModules) {
      if (module.module_contents && module.module_contents.length > 0) {
        const sortedContents = [...module.module_contents].sort(
          (a, b) => a.order - b.order,
        );
        const nextContent = sortedContents.find(
          (content) => this.getStatus(content) !== 'COMPLETED',
        );

        if (nextContent) {
          this.navigateToLesson(nextContent);
          return;
        }
      }
    }

    this.navigateToLesson(this.catalog?.modules?.[0]?.module_contents?.[0]);
  }
  public openEnrollModal(): void {
    if (!this.authService.isAuthenticated()) {
      // Pass the current relative URL for return after login
      this.authService.keycloakLogin(`programs/${this.programId}/details`);
      return;
    }
    this.isSubmitting = false;
    this.showEnrollModal = true;
    this.cdRef.detectChanges();
  }

  public closeEnrollModal(): void {
    this.showEnrollModal = false;
  }

  public confirmEnrollment(): void {
    if (!this.catalog) return;
    this.isSubmitting = true;
    this.cdRef.detectChanges();

    this.programService.enroll(this.catalog.id).subscribe({
      next: (res: any) => {
        this.isEnrolled = true;
        this.showEnrollModal = false;
        this.isSubmitting = false;

        // Force refresh progress
        this.programService
          .getProgramProgress(this.programId)
          .subscribe((progresses) => {
            if (progresses) {
              progresses.forEach((p) => {
                this.progress[p.content_id] = p.status;
              });
            }
            this.cdRef.detectChanges();
          });

        this.triggerToast();
        this.cdRef.detectChanges();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Enrollment failed', err);

        // If already enrolled, treat as success
        if (err.status === 400 || err.status === 409) {
          this.isEnrolled = true;
          this.showEnrollModal = false;
          this.triggerToast();
        }
        this.cdRef.detectChanges();
      },
    });
  }

  private triggerToast(): void {
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 5000);
  }

  getDisplayDuration(content: ModuleContent) {
    if (content.content_type == 'LESSON') {
      return content.duration + ' min';
    } else {
      const duration = content.duration;
      return duration > 59 ? duration/60 + ' hrs' : duration + ' min';
    }
  }
}
