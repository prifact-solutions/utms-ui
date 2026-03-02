import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ComponentBase } from 'src/app/common/componentbase';
import { Program } from 'src/app/programs/models/program.model';
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
  programId: number;
  program: Program | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private programsService: ProgramsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
    this.programId = +this.route.snapshot.params['program_id'];
    this.programForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.loadProgram();
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
      video_hours: [this.program.video_hours || 0],
      preview_video_url: [this.program.preview_video_url || ''],
      thumbnail: [null]
    });

    if (this.program.thumbnail) {
      this.thumbnailPreview = this.program.thumbnail;
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
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.thumbnailPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      this.programForm.patchValue({ thumbnail: file });
    }
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
    const thumbnailFile: File | null = formValue.thumbnail;
    // Hardcode category to 1 as requested temporarily
    const categories: number[] = [1];

    const fd = new FormData();
    fd.append('title', formValue.title);
    fd.append('description', formValue.description);
    fd.append('duration', parseFloat(formValue.duration).toString());
    fd.append('is_active', formValue.is_active ? 'true' : 'false');
    fd.append('difficulty', formValue.difficulty);
    fd.append('video_hours', (formValue.video_hours ?? 0).toString());
    fd.append('preview_video_url', formValue.preview_video_url || '');
    categories.forEach(c => fd.append('categories', c.toString()));
    if (thumbnailFile) {
      fd.append('thumbnail', thumbnailFile, thumbnailFile.name);
    }

    const subscription = this.programsService.updateProgram(this.programId, fd).subscribe({
      next: (program) => {
        this.successMessage = 'Program updated successfully!';
        this.isSubmitting = false;
        setTimeout(() => {
          this.router.navigateByUrl('/programs-builder');
        }, 1500);
      },
      error: (error) => {
        console.error('Error updating program:', error);
        this.errorMessage = error.error?.detail || 'Failed to update program. Please try again.';
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

  resetForm(): void {
    this.initializeForm();
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