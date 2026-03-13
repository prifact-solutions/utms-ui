import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { ComponentBase } from 'src/app/common/componentbase';
import { Program } from 'src/app/programs/models/program.model';
import { ProgramsService } from 'src/app/programs/services/programs.service';

@Component({
  selector: 'app-create-module',
  templateUrl: './create-module.component.html',
  styleUrls: ['./create-module.component.scss']
})
export class CreateModuleComponent extends ComponentBase implements OnInit {
  @Input() inModal = false;
  @Input() set programIdInput(id: number) { if (id !== undefined && id !== null) this.programId = id; }
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
  public programId: number = 0;

  ngOnInit() {
    if (!this.inModal) {
      this.programId = +this.route.snapshot.params['program_id'];
    }
    
    this.programService.getProgramById(this.programId).subscribe((program) => {
      this.program = program;
      if (program.modules) {
          const maxOrder = Math.max(0, ...program.modules.map(m => m.order || 0));
          this.moduleForm.patchValue({ order: maxOrder + 1 });
      }
    });
  }

  onSubmit() {
    if (this.moduleForm.invalid) return;
    if (!this.program) {
      alert('Module data missing. Please try again.');
      return;
    }
    const moduleData = {
      title: this.moduleForm.value.title,
      order: this.moduleForm.value.order,

    };
    this.programService.createModule(this.program?.id, moduleData)
      .subscribe({
        next: () => {
          if (this.inModal) {
            this.saved.emit();
          } else {
            alert('Module created successfully');
            this.router.navigate(['/programs-builder', this.programId, 'modules']);
          }
        },
        error: err => {
          console.error(err);
          alert('Failed to create module');
        }
      });
  }

  get f() {
    return this.moduleForm.controls;
  }
}
