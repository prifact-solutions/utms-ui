import { Component, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { ComponentBase } from 'src/app/common/componentbase';
import { ProgramsService } from '../services/programs.service';
import { Category, ModuleContent, Program } from '../models/program.model';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, startWith, switchMap } from 'rxjs';
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
  public showVideo: boolean = true;
  public isAuthenticated: boolean = false;
  public isLoading: boolean = true;
  public isEnrolled: boolean = false;
  public programId!: number;
  public showEnrollModal: boolean = false;
  public isSubmitting: boolean = false;
  public showToast: boolean = false;
  public isRedirectingToContent: boolean = false;
  private progressLoaded: boolean = false;
  private hasAutoNavigatedToContent: boolean = false;
  public courseCompletionStatus: string = 'INCOMPLETE';

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

  public getCourseContentSummary(): string {
    if (!this.catalog) {
      return '';
    }
    const modules = this.catalog.modules || [];
    let lessonCount = 0;
    let examCount = 0;
    for (const m of modules) {
      for (const c of m.module_contents ?? []) {
        if (c.content_type === 'LESSON') {
          lessonCount++;
        } else if (c.content_type === 'EXAM') {
          examCount++;
        }
      }
    }
    const moduleCount = modules.length;
    const parts: string[] = [];
    parts.push(`${moduleCount} ${moduleCount === 1 ? 'module' : 'modules'}`);
    if (lessonCount > 0) {
      parts.push(`${lessonCount} ${lessonCount === 1 ? 'lesson' : 'lessons'}`);
    }
    if (examCount > 0) {
      parts.push(`${examCount} ${examCount === 1 ? 'exam' : 'exams'}`);
    }
    return parts.join(' • ');
  }

  public getModuleContentSummary(moduleId: number): string {
    const module = this.catalog.modules.find((module) => module.id == moduleId);
    if (!module) {
      return '';
    }
    let lessonCount = 0;
    let examCount = 0;
    for (const c of module.module_contents ?? []) {
      if (c.content_type === 'LESSON') {
        lessonCount++;
      } else if (c.content_type === 'EXAM') {
        examCount++;
      }
    }
    const parts: string[] = [];
    if (lessonCount > 0) {
      parts.push(`${lessonCount} ${lessonCount === 1 ? 'lesson' : 'lessons'}`);
    }
    if (examCount > 0) {
      parts.push(`${examCount} ${examCount === 1 ? 'exam' : 'exams'}`);
    }
    return parts.join(' • ');
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

  private openActiveModuleSection(): void {
    const activeModuleId = this.getActiveModuleId();
    if (!this.catalog?.modules || !activeModuleId) {
      return;
    }

    const activeModuleIndex = this.catalog.modules.findIndex(
      (module) => module.id === activeModuleId,
    );
    if (activeModuleIndex >= 0) {
      this.openSections.add(activeModuleIndex);
    }
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
    if (this.catalog && lesson && this.getStatus(lesson) !== 'LOCKED') {
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
    if (this.isFirstCourseContent(lesson)) {
      return 'IN_PROGRESS';
    }
    return 'LOCKED';
  }

  private isFirstCourseContent(content: any): boolean {
    if (!content || !this.catalog?.modules) {
      return false;
    }

    const firstContent = this.catalog.modules
      .flatMap((module) => module.module_contents || [])
      .sort((a, b) => {
        if (a.module_id !== b.module_id) {
          const moduleA = this.catalog?.modules?.find((module) => module.id === a.module_id);
          const moduleB = this.catalog?.modules?.find((module) => module.id === b.module_id);
          return (moduleA?.order || 0) - (moduleB?.order || 0);
        }
        return (a.order || 0) - (b.order || 0);
      })[0];

    return firstContent?.id === content.id;
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

  private getActiveModuleId(): number | null {
    let child = this.route.firstChild;
    while (child) {
      const moduleId = child.snapshot.params['module_id'];
      if (moduleId) {
        return +moduleId;
      }
      child = child.firstChild;
    }
    return null;
  }

  public isCourseCompletedRouteActive(): boolean {
    return this.route.firstChild?.snapshot.routeConfig?.path === 'completed';
  }

  public navigateToCourseCompleted(): void {
    if (this.courseCompletionStatus !== 'COMPLETED') {
      return;
    }

    this.router.navigateByUrl(`/programs/${this.programId}/details/completed`);
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
          this.progress = {};
          this.progressLoaded = false;
          this.hasAutoNavigatedToContent = false;
          this.isRedirectingToContent = false;
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
          this.openActiveModuleSection();
          return this.programService.getMyPrograms();
        }),
      )
      .subscribe((programs) => {
        if (programs.find((o) => o.id == this.programId)) {
          this.isEnrolled = true;
        }
        this.isLoading = false;
        this.openActiveModuleSection();
        this.redirectEnrolledUserToContent();
      });
    this.registerSubscription(sub1);

    const subRoute = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
      )
      .subscribe(() => {
        this.openActiveModuleSection();
      });
    this.registerSubscription(subRoute);

    let sub2 = this.authService.currentUser$
      .pipe(
        filter((user) => {
          return user != null;
        }),
        switchMap((user) => this.router.events),
        filter(event => event instanceof NavigationEnd),
        startWith(null),
        switchMap((params) => {
          return this.programService.getProgramProgress(this.programId);
        }),
      )
      .subscribe((progresses) => {
        const contentCount = (this.catalog?.modules || []).reduce(
          (count, module) => count + (module.module_contents?.length || 0),
          0,
        );
        let completedCount = 0;
        progresses?.forEach((progress) => {
          this.progress[progress.content_id] = progress.status;
          if (progress.status === 'COMPLETED') {
            completedCount++;
          }
        });
        this.courseCompletionStatus =
          contentCount > 0 && completedCount >= contentCount ? 'COMPLETED' : 'INCOMPLETE';
        this.progressLoaded = true;
        this.redirectEnrolledUserToContent();
      });
    this.registerSubscription(sub2);
  }

  private redirectEnrolledUserToContent(): void {
    if (
      this.hasAutoNavigatedToContent ||
      !this.isEnrolled ||
      !this.progressLoaded ||
      !this.catalog ||
      this.isChildRouteActive()
    ) {
      return;
    }

    this.hasAutoNavigatedToContent = true;
    this.isRedirectingToContent = true;
    this.cdRef.detectChanges();

    setTimeout(() => {
      this.onContinueLearning();
    });
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
            this.progressLoaded = true;
            this.redirectEnrolledUserToContent();
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
      return duration > 59 ? duration / 60 + ' hrs' : duration + ' min';
    }
  }
}
