import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ComponentBase } from 'src/app/common/componentbase';
import { Category, Program } from 'src/app/programs/models/program.model';
import { ProgramsService } from 'src/app/programs/services/programs.service';

@Component({
  selector: 'app-edit-program',
  templateUrl: './edit-program.component.html',
  styleUrls: ['./edit-program.component.scss']
})
export class EditProgramComponent extends ComponentBase implements OnInit {
  programForm: FormGroup;
  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  thumbnailPreview: string | null = null;
  thumbnailFile: File | null = null;

  videoPreviewUrl: string | null = null;
  videoFile: File | null = null;

  program: Program | null = null;
  isLoading = false;

  categories: Array<Category> = [];
  
  @Input() inModal: boolean = false;
  @Input() set programId(id: number) {
    if (id) {
       this._programId = id;
    }
  }
  get programId(): number {
    return this._programId;
  }
  private _programId: number = 0;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private programsService: ProgramsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
    this.programForm = this.fb.group({});
  }

  ngOnInit(): void {
    if (!this.programId && this.route.snapshot.params['program_id']) {
      this.programId = +this.route.snapshot.params['program_id'];
    }
    this.loadProgram();
    this.programsService.getAllCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }

  loadProgram(): void {
    this.isLoading = true;
    const subscription = this.programsService.getProgramById(this.programId).subscribe({
      next: (program) => {
        this.program = program;
        this.initializeForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading program:', error);
        this.errorMessage = 'Failed to load program. Please try again.';
        this.isLoading = false;
      }
    });
    this.registerSubscription(subscription);
  }

  initializeForm(): void {
    if (!this.program) return;

    this.programForm = this.fb.group({
      title: [this.program.title, [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      description: [this.program.description, [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      duration: [this.program.duration.toString(), [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
      is_active: [this.program.is_active, Validators.required],
      categories: [this.program.categories || []],
      difficulty: [this.program.difficulty || 'Beginner', Validators.required],
      video_hours: [this.program.video_hours || 0]
    });

    if (this.program.thumbnail) {
      this.thumbnailPreview = this.program.thumbnail;
    }

    if (this.program.preview_video) {
      this.videoPreviewUrl = this.program.preview_video;
    }
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
      // Revoke previous object URL if it was a local blob
      if (this.videoPreviewUrl && this.videoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.videoPreviewUrl);
      }
      this.videoPreviewUrl = URL.createObjectURL(file);
    }
  }

  private uploadProgramMedia(): Observable<any> {
    const uploads: Observable<any>[] = [];

    if (this.thumbnailFile) {
      const file = this.thumbnailFile;
      const upload$ = this.programsService
        .getProgramThumbnailUploadUrl(this.programId, file.name)
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
        .getProgramVideoUploadUrl(this.programId, file.name)
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
      is_active: formValue.is_active,
      difficulty: formValue.difficulty,
      video_hours: formValue.video_hours,
      categories: categories
    };

    const subscription = this.programsService.updateProgram(this.programId, fd).pipe(
      switchMap(() => this.uploadProgramMedia())
    ).subscribe({
      next: () => {
        this.successMessage = 'Program updated successfully!';
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
        console.error('Error updating program:', error);
        this.errorMessage = error.error?.detail || 'Failed to update program. Please try again.';
        this.isSubmitting = false;
      }
    });
    this.registerSubscription(subscription);
  }

  cancel(): void {
    if (this.inModal) {
        this.closed.emit();
    } else {
        this.router.navigateByUrl('/programs-builder');
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  resetForm(): void {
    this.initializeForm();
    this.thumbnailFile = null;
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