import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ProgramsService } from '../services/programs.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentBase } from 'src/app/common/componentbase';
import { combineLatest, map, Subject, switchMap, tap } from 'rxjs';
import { ModuleContent, ModuleContentFile } from '../models/program.model';

@Component({
  selector: 'app-view-lesson',
  templateUrl: './view-lesson.component.html',
  styleUrls: ['./view-lesson.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ViewLessonComponent extends ComponentBase {
  lesson: ModuleContent | null = null;
  files: Array<ModuleContentFile> = [];
  progress: { [id: string]: string } = {};

  markAsCompleteSubject$: Subject<void> = new Subject<void>();

  next_module_content: ModuleContent | null = null;
  previous_module_content: ModuleContent | null = null;
  isLastContent: boolean = false;

  program_id: number = 0;
  module_id: number = 0;
  isLoading: boolean = true;
  errorMessage = '';
  showErrorToast = false;
  wasNextButtonDisabledInitially: boolean = false;

  constructor(
    private programService: ProgramsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    super();
  }

  ngOnInit() {
    this.errorMessage = '';
    this.showErrorToast = false;
    let sub = this.route.params
      .pipe(
        map((params) => {
          return {
            program_id: params['program_id'],
            module_id: params['module_id'],
            module_content_id: params['module_content_id'],
          };
        }),
        tap((params) => {
          this.program_id = params.program_id;
          this.module_id = params.module_id;
          this.isLoading = true;
          this.lesson = null;
          this.progress = {};
          this.isLastContent = false;
          this.wasNextButtonDisabledInitially = false;
        }),
        switchMap((params) => {
          return combineLatest([
            this.programService.getLesson(
              params.program_id,
              params.module_id,
              params.module_content_id,
            ),
            this.programService.getProgramCatalog(params.program_id),
            this.programService.getProgramProgress(params.program_id),
          ]);
        }),
      )
      .subscribe({
        next: ([lesson, catalog, progresses]) => {
          this.lesson = lesson.content;
          this.files = lesson.files;
          progresses?.forEach((progress) => {
            this.progress[progress.content_id] = progress.status;
          });
          this.isLoading = false;

          if (catalog && catalog.modules) {
            const contents = catalog.modules.flatMap(
              (m) => m.module_contents || [],
            );
            const currentIndex = contents.findIndex(
              (c) => c.id == this.lesson?.id,
            );

            if (currentIndex > 0) {
              this.previous_module_content = contents[currentIndex - 1];
            } else {
              this.previous_module_content = null;
            }

            if (currentIndex < contents.length - 1) {
              this.next_module_content = contents[currentIndex + 1];
            } else {
              this.next_module_content = null;
            }
            this.isLastContent = currentIndex === contents.length - 1;
          }

          this.wasNextButtonDisabledInitially = this.isNextButtonDisabled();
          if (this.files.length == 0) {
            this.markAsCompleteSubject$.next();
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.lesson = null;
          this.files = [];
          this.errorMessage =
            err?.error?.error || err?.message || 'Failed to load content';
          this.triggerErrorToast();
        },
      });
    this.registerSubscription(sub);
    let sub1 = this.markAsCompleteSubject$.subscribe(() => {
      this.markAsComplete();
    });
    this.registerSubscription(sub1);
  }

  markAsComplete() {
    if (this.lesson) {
      this.programService
        .updateLessonStatus(
          this.program_id,
          this.module_id,
          this.lesson?.id,
          'COMPLETED',
        )
        .subscribe((res) => {
          this.next_module_content = res;
          this.progress[this.lesson!.id] = 'COMPLETED';
          if (res) {
            this.progress[res.id] = this.progress[res.id] || 'IN_PROGRESS';
          }
        });
    }
  }
  onNextContentAvailable(next_content: ModuleContent) {
    this.next_module_content = next_content;
    this.progress[next_content.id] =
      this.progress[next_content.id] || 'IN_PROGRESS';
  }
  goToCatalog() {
    this.router.navigateByUrl(`/programs/${this.program_id}/details`);
  }
  goToPreviousContent() {
    if (this.isPreviousContentLocked()) {
      return;
    }

    if (this.previous_module_content) {
      this.goToContent(this.previous_module_content);
    }
  }

  goToNextContent() {
    if (this.isNextContentLocked()) {
      return;
    }

    if (this.next_module_content) {
      this.goToContent(this.next_module_content);
    } else {
      this.goToCourseCompleted();
    }
  }

  public isContentLocked(content: ModuleContent | null): boolean {
    return !!content && this.getContentStatus(content) === 'LOCKED';
  }

  public isNextContentLocked(): boolean {
    return this.isContentLocked(this.next_module_content);
  }

  public isPreviousContentLocked(): boolean {
    return this.isContentLocked(this.previous_module_content);
  }

  public isNextButtonDisabled(): boolean {
    return this.isNextContentLocked() || (!this.next_module_content && !this.isLastContent);
  }

  public getNextStatusNote(): string | null {
    if (!this.wasNextButtonDisabledInitially) {
      return null;
    }

    if (this.isNextButtonDisabled()) {
      return this.getLockedContentTooltip(this.next_module_content);
    }

    if (this.next_module_content) {
      const contentType = this.next_module_content.content_type === 'EXAM' ? 'exam' : 'lesson';
      return `You have successfully completed this content and can now go to the next ${contentType}.`;
    }

    if (this.isLastContent) {
      return 'You have successfully completed this content and can now complete the course.';
    }

    return null;
  }

  public isPreviousButtonDisabled(): boolean {
    return this.isPreviousContentLocked() || !this.previous_module_content;
  }

  public getLockedContentTooltip(content: ModuleContent | null): string | null {
    if (!this.isContentLocked(content)) {
      return null;
    }

    const contentType = content?.content_type === 'EXAM' ? 'exam' : 'lesson';
    if (this.lesson?.content_type === 'EXAM') {
      return `Please pass the current exam to go to the next ${contentType}.`;
    }

    if (this.isCurrentLessonVideo()) {
      return `Please complete watching the current video to go to the next ${contentType}.`;
    }

    return `Please complete the current content to go to the next ${contentType}.`;
  }

  private isCurrentLessonVideo(): boolean {
    return this.files.some((file) => {
      return file.file_content_type === 'VIDEO' || file.mime_type?.startsWith('video/');
    });
  }

  private getContentStatus(content: ModuleContent): string {
    return this.progress[content.id] || 'LOCKED';
  }

  private goToCourseCompleted(): void {
    this.router.navigateByUrl(`/programs/${this.program_id}/details/completed`);
  }

  private triggerErrorToast(): void {
    this.showErrorToast = true;
    setTimeout(() => {
      this.showErrorToast = false;
      this.errorMessage = '';
    }, 5000);
  }

  private goToContent(content: ModuleContent) {
    const path = content.content_type == 'LESSON' ? 'lesson' : 'exam';
    this.router.navigateByUrl(
      `/programs/${this.program_id}/details/modules/${content.module_id}/contents/${content.id}/${path}`,
    );
  }
}
