import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProgramsService } from 'src/app/programs/services/programs.service';
import { ModuleContent, ModuleContentWithFiles } from 'src/app/programs/models/program.model';

interface UploadFile {
  file: File;
  progress: number;
  uploaded: boolean;
  error: string | null;
}

@Component({
  selector: 'app-edit-lesson',
  templateUrl: './edit-lesson.component.html',
  styleUrls: ['./edit-lesson.component.scss']
})
export class EditLessonComponent implements OnInit, OnDestroy {
  lessonForm!: FormGroup;
  programId!: number;
  moduleId!: number;
  lessonId!: number;
  lesson: ModuleContentWithFiles | null = null;

  filesToUpload: UploadFile[] = [];
  isSubmitting = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  contentTypes = ['EXAM', 'LESSON'];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private programsService: ProgramsService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.programId = this.route.snapshot.params['program_id'];
    this.moduleId = this.route.snapshot.params['module_id'];
    this.lessonId = this.route.snapshot.params['lesson_id'];
    this.loadLesson();
  }

  private loadLesson(): void {
    this.isLoading = true;
    this.programsService.getLesson(this.programId, this.moduleId, this.lessonId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (lesson: ModuleContentWithFiles) => {
          this.lesson = lesson;
          this.initializeForm();
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Failed to load lesson';
          this.isLoading = false;
        }
      });
  }

  private initializeForm(): void {
    if (!this.lesson) return;

    this.lessonForm = this.fb.group({
      title: [this.lesson.content.title, [Validators.required, Validators.minLength(3)]],
      context_text: [this.lesson.content.context_text || ''],
      order: [this.lesson.content.order, Validators.required]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => {
        const uploadFile: UploadFile = {
          file,
          progress: 0,
          uploaded: false,
          error: null
        };
        this.filesToUpload.push(uploadFile);
      });
    }
    // Reset input
    if (input) input.value = '';
  }

  removeFile(index: number): void {
    this.filesToUpload.splice(index, 1);
  }

  onSubmit(): void {
    if (this.lessonForm.invalid) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const lessonPayload: Partial<ModuleContent> = {
      title: this.lessonForm.get('title')?.value,
      context_text: this.lessonForm.get('context_text')?.value,
      order: this.lessonForm.get('order')?.value,
      previous_content_id: this.lesson?.content.previous_content_id
    };

    this.programsService.updateLesson(this.programId, this.moduleId, this.lessonId, lessonPayload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (lesson: ModuleContent) => {
          this.uploadFiles();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Failed to update lesson';
          this.isSubmitting = false;
        }
      });
  }

  private uploadFiles(): void {
    if (this.filesToUpload.length === 0) {
      this.successMessage = 'Lesson updated successfully!';
      this.isSubmitting = false;
      setTimeout(() => {
        this.router.navigateByUrl(`/programs-builder/${this.programId}/modules/${this.moduleId}/lessons`);
      }, 2000);
      return;
    }

    let uploadedCount = 0;
    this.filesToUpload.forEach((uploadFile, index) => {
      this.programsService.getSignedUrlForUpload(
        this.programId,
        this.moduleId,
        this.lessonId,
        uploadFile.file.name,
        uploadFile.file.type
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: { url: string; mime_type: string; }) => {
            this.uploadFileToSignedUrl(uploadFile, response.url, response.mime_type, index, () => {
              uploadedCount++;
              if (uploadedCount === this.filesToUpload.length) {
                this.successMessage = 'Lesson and files updated successfully!';
                this.isSubmitting = false;
                setTimeout(() => {
                  this.router.navigateByUrl(`/programs-builder/${this.programId}/modules/${this.moduleId}/lessons`);
                }, 2000);
              }
            });
          },
          error: (error) => {
            uploadFile.error = error?.error?.message || 'Failed to get signed URL';
            uploadedCount++;
            if (uploadedCount === this.filesToUpload.length) {
              this.errorMessage = 'Some files failed to upload';
              this.isSubmitting = false;
            }
          }
        });
    });
  }

  private uploadFileToSignedUrl(uploadFile: UploadFile, signedUrl: string, mimeType: string, index: number, onComplete: () => void): void {
    this.programsService.uploadFileToSignedUrl(signedUrl, mimeType, uploadFile.file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          uploadFile.uploaded = true;
          uploadFile.progress = 100;
          onComplete();
        },
        error: (error) => {
          uploadFile.error = error?.message || 'Upload failed';
          onComplete();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}