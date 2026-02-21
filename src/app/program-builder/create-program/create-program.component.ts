import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ComponentBase } from 'src/app/common/componentbase';
import { Program } from 'src/app/programs/models/program.model';
import { ProgramsService } from 'src/app/programs/services/programs.service';

@Component({
  selector: 'app-create-program',
  templateUrl: './create-program.component.html',
  styleUrls: ['./create-program.component.scss']
})
export class CreateProgramComponent extends ComponentBase implements OnInit {
  programForm: FormGroup;
  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  thumbnailPreview: string | null = null;

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
  }

  initializeForm(): void {
    this.programForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      duration: ['', [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
      is_active: [true, Validators.required],
      difficulty: ['Beginner', Validators.required],
      video_hours: [0],
      preview_video_url: [''],
      thumbnail: [null]
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

    const categories = this.programForm.get('categories')?.value || [];
    if (categories.length === 0) {
      this.errorMessage = 'Please select at least one category';
      this.programForm.get('categories')?.markAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formValue = this.programForm.value;
    const programData: Partial<Program> = {
      title: formValue.title,
      description: formValue.description,
      duration: parseFloat(formValue.duration),
      is_active: formValue.is_active,
      categories: formValue.categories,
      difficulty: formValue.difficulty,
      video_hours: formValue.video_hours,
      preview_video_url: formValue.preview_video_url,
      thumbnail: this.thumbnailPreview || null
    };

    const subscription = this.programsService.createProgram(programData).subscribe({
      next: (program) => {
        this.successMessage = 'Program created successfully!';
        this.isSubmitting = false;
        setTimeout(() => {
          this.router.navigateByUrl('/programs-builder');
        }, 1500);
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

  resetForm(): void {
    this.programForm.reset({ is_active: true, categories: [] });
    this.thumbnailPreview = null;
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
