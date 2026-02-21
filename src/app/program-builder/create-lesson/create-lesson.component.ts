import { Component, OnInit, OnDestroy } from '@angular/core';
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
}

@Component({
  selector: 'app-create-lesson',
  templateUrl: './create-lesson.component.html',
  styleUrls: ['./create-lesson.component.scss']
})
export class CreateLessonComponent extends ComponentBase implements OnInit, OnDestroy {
  program: Program | null = null;
  module: Module | null = null;
  lessonForm!: FormGroup;
  programId!: number;
  moduleId!: number;
  previous_content_id: number | null = null;
  moduleContentId: number | null = null;
  previous_order: number = 1;

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
    this.programId = +this.route.snapshot.params['program_id'];
    this.moduleId = +this.route.snapshot.params['module_id'];
    this.moduleContentId = this.route.snapshot.params['module_content_id'] || null;
    this.previous_content_id = this.route.snapshot.queryParams['previous_content_id'] || null;
    this.previous_order = +this.route.snapshot.queryParams['previous_order'] || 1;
    this.initializeForm();
    this.fetchData();
  }

  private fetchData(): void {
    this.programsService.getProgramById(this.programId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(program => this.program = program);

    this.programsService.getModulesForProgram(this.programId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(modules => {
        this.module = modules.find(m => m.id === this.moduleId) || null;
      });
  }

  private initializeForm(): void {
    this.lessonForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content_type: ['LESSON', Validators.required],
      context_text: [''],
      order: [this.previous_order + 1, Validators.required]
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
      content_type: this.lessonForm.get('content_type')?.value,
      context_text: this.lessonForm.get('context_text')?.value,
      order: this.lessonForm.get('order')?.value,
      previous_content_id: this.previous_content_id
    };

    this.programsService.createLesson(this.programId, this.moduleId, lessonPayload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (lesson: ModuleContent) => {
          this.moduleContentId = lesson.id;
          this.uploadFiles();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Failed to create lesson';
          this.isSubmitting = false;
        }
      });
  }

  private uploadFiles(): void {
    if (this.filesToUpload.length === 0 || !this.moduleContentId) {
      this.successMessage = 'Lesson created successfully!';
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

  override ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
