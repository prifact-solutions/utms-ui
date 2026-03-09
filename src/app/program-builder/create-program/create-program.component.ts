import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ComponentBase } from 'src/app/common/componentbase';
import { Category, Program } from 'src/app/programs/models/program.model';
import { ProgramsService } from 'src/app/programs/services/programs.service';

@Component({
  selector: 'app-create-program',
  templateUrl: './create-program.component.html',
  styleUrls: ['./create-program.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateProgramComponent extends ComponentBase implements OnInit {
  programForm: FormGroup;
  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  thumbnailPreview: string | null = null;
  thumbnailFile: File | null = null;

  videoPreviewUrl: string | null = null;
  videoFile: File | null = null;

  categories: Array<Category> = [];
  @Input() inModal = false;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private programsService: ProgramsService,
    private router: Router
  ) {
    super();
    this.programForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.initializeForm();
    this.programsService.getAllCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }

  initializeForm(): void {
    this.programForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      duration: ['', [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
      video_hours: [0],
      categories: []
    });
  }

  onCategoryChange(categoryValue: number, event: any): void {
    const categoriesArray = (this.programForm.get('categories')?.value || []).slice();

    if (event.target.checked) {
      if (!categoriesArray.includes(categoryValue)) {
        categoriesArray.push(categoryValue);
      }
    } else {
      const index = categoriesArray.indexOf(categoryValue);
      if (index > -1) {
        categoriesArray.splice(index, 1);
      }
    }

    this.programForm.patchValue({ categories: categoriesArray });
  }

  isCategoryChecked(categoryValue: number): boolean {
    const categories = this.programForm.get('categories')?.value || [];
    return categories.includes(categoryValue);
  }

  onThumbnailSelected(event: any): void {
    const file: File = event.target.files?.[0];
    if (file) {
      this.thumbnailFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.thumbnailPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onVideoSelected(event: any): void {
    const file: File = event.target.files?.[0];
    if (file) {
      this.videoFile = file;
      if (this.videoPreviewUrl) {
        URL.revokeObjectURL(this.videoPreviewUrl);
      }
      this.videoPreviewUrl = URL.createObjectURL(file);
    }
  }

  private uploadProgramMedia(programId: number): Observable<any> {
    const uploads: Observable<any>[] = [];

    if (this.thumbnailFile) {
      const file = this.thumbnailFile;
      const upload$ = this.programsService
        .getProgramThumbnailUploadUrl(programId, file.name)
        .pipe(
          switchMap((res) =>
            this.programsService.uploadFileToSignedUrl(res.url, res.mime_type, file)
          )
        );
      uploads.push(upload$);
    }

    if (this.videoFile) {
      const file = this.videoFile;
      const upload$ = this.programsService
        .getProgramVideoUploadUrl(programId, file.name)
        .pipe(
          switchMap((res) =>
            this.programsService.uploadFileToSignedUrl(res.url, res.mime_type, file)
          )
        );
      uploads.push(upload$);
    }

    return uploads.length > 0 ? forkJoin(uploads) : of(null);
  }

  onSubmit(): void {
    if (this.programForm.invalid) {
      this.markFormGroupTouched(this.programForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formValue = this.programForm.value;
    const categories: number[] = formValue.categories || [];

    const fd: any = {
      title: formValue.title,
      description: formValue.description,
      duration: parseFloat(formValue.duration),
      is_active: false,
      difficulty: 'Beginner',
      video_hours: formValue.video_hours ?? 0,
      categories: categories,
      thumbnail: null
    };

    const subscription = this.programsService.createProgram(fd).pipe(
      switchMap((program: Program) => this.uploadProgramMedia(program.id))
    ).subscribe({
      next: () => {
        this.successMessage = 'Program created successfully!';
        this.isSubmitting = false;
        if (this.inModal) {
          this.saved.emit();
        } else {
          setTimeout(() => {
            this.router.navigateByUrl('/programs-builder');
          }, 1500);
        }
      },
      error: (error) => {
        console.error('Error creating program:', error);
        this.errorMessage = error.error?.detail || 'Failed to create program. Please try again.';
        this.isSubmitting = false;
      }
    });
    this.registerSubscription(subscription);
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  cancel(): void {
    if (this.inModal) {
      this.closed.emit();
    } else {
      this.router.navigateByUrl('/programs-builder');
    }
  }

  resetForm(): void {
    this.programForm.reset({ categories: [] });
    this.thumbnailPreview = null;
    this.thumbnailFile = null;
    if (this.videoPreviewUrl) {
      URL.revokeObjectURL(this.videoPreviewUrl);
    }
    this.videoPreviewUrl = null;
    this.videoFile = null;
    this.successMessage = null;
    this.errorMessage = null;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.programForm.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }
    if (control.errors['required']) return `${fieldName} is required`;
    if (control.errors['minlength']) return `${fieldName} must be at least ${control.errors['minlength'].requiredLength} characters`;
    if (control.errors['maxlength']) return `${fieldName} must be at most ${control.errors['maxlength'].requiredLength} characters`;
    if (control.errors['min']) return `${fieldName} must be at least ${control.errors['min'].min}`;
    if (control.errors['pattern']) return `${fieldName} format is invalid`;
    return 'Invalid input';
  }
}
