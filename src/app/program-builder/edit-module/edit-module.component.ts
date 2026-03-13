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
  @Input() inModal = false;
  @Input() set programIdInput(id: number) { 
    if (id !== undefined && id !== null) {
      this.programId = id;
      if (this.moduleId) this.loadData();
    }
  }
  @Input() set moduleIdInput(id: number) { 
    if (id !== undefined && id !== null) {
      this.moduleId = id;
      if (this.programId) this.loadData();
    }
  }
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

  public program: Program | null = null;
  public module: Module | null = null;
  public programId: number = 0;
  public moduleId: number = 0;
  isLoading = false;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  ngOnInit() {
    if (!this.inModal) {
      this.programId = +this.route.snapshot.params['program_id'];
      this.moduleId = +this.route.snapshot.params['module_id'];
      this.loadData();
    }
  }

  loadData() {
    if (!this.programId || !this.moduleId) return;
    this.isLoading = true;
    this.programService.getProgramById(this.programId).pipe(
      switchMap(program => {
        this.program = program;
        return this.programService.getModulesForProgram(this.programId);
      })
    ).subscribe({
      next: (modules) => {
        if (this.program) {
          this.program.modules = modules || [];
          // Find the module
          this.module = this.program.modules.find(m => m.id === this.moduleId) || null;
          if (this.module) {
            this.moduleForm.patchValue({
              title: this.module.title,
              order: this.module.order
            });
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading module data:', error);
        this.errorMessage = 'Failed to load module. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.moduleForm.invalid) return;
    if (!this.program || !this.module) {
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

    this.programService.updateModule(this.program.id, this.module.id, moduleData)
      .subscribe({
        next: () => {
          this.successMessage = 'Module updated successfully';
          this.isSubmitting = false;
          if (this.inModal) {
            this.saved.emit();
          } else {
            setTimeout(() => {
              this.router.navigate(['/programs-builder', this.programId, 'modules']);
            }, 1500);
          }
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