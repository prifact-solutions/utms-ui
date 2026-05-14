import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { ComponentBase } from 'src/app/common/componentbase';
import { Module, Program } from 'src/app/programs/models/program.model';
import { ProgramsService } from 'src/app/programs/services/programs.service';

@Component({
  selector: 'app-edit-module',
  templateUrl: './edit-module.component.html',
  styleUrls: ['./edit-module.component.scss']
})
export class EditModuleComponent extends ComponentBase implements OnInit {

  @Input() programId: number = 0;
  @Input() module: Module | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  moduleForm = this.fb.group({
    title: ['', Validators.required],
    order: [1, [Validators.required, Validators.min(1)]]
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private programService: ProgramsService
  ) { super(); }

  isLoading = false;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  ngOnInit() {
    if (this.module) {
      this.moduleForm.patchValue({
        title: this.module.title,
        order: this.module.order
      });
    }
  }



  onSubmit() {
    if (this.moduleForm.invalid) return;
    if (!this.programId || !this.module) {
      this.errorMessage = 'Missing module data. Please try again.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    const moduleData = {
      title: this.moduleForm.value.title,
      order: this.moduleForm.value.order,
    };

    this.programService.updateModule(this.programId, this.module.id, moduleData)
      .subscribe({
        next: () => {
          this.successMessage = 'Module updated successfully';
          this.isSubmitting = false;

          this.saved.emit();

        },
        error: err => {
          console.error(err);
          this.errorMessage = 'Failed to update module';
          this.isSubmitting = false;
        }
      });
  }

  get f() {
    return this.moduleForm.controls;
  }
}