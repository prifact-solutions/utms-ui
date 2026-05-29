import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProgramsService } from 'src/app/programs/services/programs.service';
import { Module, ModuleContent, Program } from 'src/app/programs/models/program.model';
import { ComponentBase } from 'src/app/common/componentbase';

interface UploadFile {
  file: File;
  progress: number;
  uploaded: boolean;
  error: string | null;
  videoMinutes?: number;
}

@Component({
  selector: 'app-create-lesson',
  templateUrl: './create-lesson.component.html',
  styleUrls: ['./create-lesson.component.scss']
})
export class CreateLessonComponent extends ComponentBase implements OnInit, OnDestroy {

  @Input() moduleId: number = 0;
  @Input() programId: number = 0;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  @Input() program: Program | null = null;
  module: Module | null = null;
  lessonForm!: FormGroup;
  moduleContentId: number | null = null;
  previous_order: number = 0;

  filesToUpload: UploadFile[] = [];
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  contentTypes = ['EXAM', 'LESSON'];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private programsService: ProgramsService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    super();
  }

  ngOnInit(): void {

    this.initializeForm();
  }

  private initializeForm(): void {
    this.lessonForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content_type: ['LESSON', Validators.required],
      context_text: [''],
      duration: ['', Validators.required],
      order: [this.previous_order + 1, Validators.required]
    });
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (const file of Array.from(input.files)) {
        const uploadFile: UploadFile = {
          file,
          progress: 0,
          uploaded: false,
          error: null
        };
        this.filesToUpload.push(uploadFile);

        if (file.type.startsWith('video/') && !this.lessonForm.get('duration')?.dirty) {
          try {
            const minutes = await this.getVideoDurationMinutes(file);
            uploadFile.videoMinutes = minutes;
            this.bumpDuration(minutes);
          } catch {
            console.log('Could not read video duration');
          }
        }
      }
    }
    // Reset input
    if (input) input.value = '';
  }

  removeFile(index: number): void {
    const item = this.filesToUpload[index];
    if (item.videoMinutes && !this.lessonForm.get('duration')?.dirty) {
      this.bumpDuration(-item.videoMinutes);
    }
    this.filesToUpload.splice(index, 1);
  }

  private getVideoDurationMinutes(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const url = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(Math.max(0, Math.ceil(video.duration / 60)));
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Could not read video duration'));
      };
      video.src = url;
    });
  }

  private bumpDuration(deltaMinutes: number): void {
    const ctrl = this.lessonForm.get('duration');
    const current = Number(ctrl?.value) || 0;
    ctrl?.setValue(Math.max(0, current + deltaMinutes), { emitEvent: false });
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
      content_type: this.lessonForm.get('content_type')?.value,
      context_text: this.lessonForm.get('context_text')?.value,
      duration: this.lessonForm.get('duration')?.value,
      order: this.lessonForm.get('order')?.value
    };

    this.programsService.createLesson(this.programId, this.moduleId, lessonPayload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (lesson: ModuleContent) => {
          this.moduleContentId = lesson.id;
          this.uploadFiles();
        },
        error: (err) => {
          this.errorMessage = err?.error?.error || 'Failed to create lesson';
          this.isSubmitting = false;
        }
      });
  }

  private uploadFiles(): void {
    if (this.filesToUpload.length === 0 || !this.moduleContentId) {
      this.successMessage = 'Lesson created successfully!';
      this.isSubmitting = false;


      this.saved.emit();

      return;
    }

    let uploadedCount = 0;
    this.filesToUpload.forEach((uploadFile, index) => {
      this.programsService.getSignedUrlForUpload(
        this.programId,
        this.moduleId,
        this.moduleContentId!,
        uploadFile.file.name,
        uploadFile.file.type
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: { url: string; mime_type: string; }) => {
            this.uploadFileToSignedUrl(uploadFile, response.url, response.mime_type, index, () => {
              uploadedCount++;
              if (uploadedCount === this.filesToUpload.length) {
                this.successMessage = 'Lesson and files created successfully!';
                this.isSubmitting = false;


                this.saved.emit();

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

  override ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
