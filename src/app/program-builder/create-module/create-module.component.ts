import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { ComponentBase } from 'src/app/common/componentbase';
import { Program } from 'src/app/programs/models/program.model';
import { ProgramsService } from 'src/app/programs/services/programs.service';

@Component({
  selector: 'app-create-module',
  templateUrl: './create-module.component.html',
  styleUrls: ['./create-module.component.scss']
})
export class CreateModuleComponent extends ComponentBase {


  moduleForm = this.fb.group({
    title: ['', Validators.required],
    order: [1, [Validators.required, Validators.min(1)]]
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private programService: ProgramsService
  ) { super(); }
  public program: Program | null = null;
  ngOnInit() {
    this.route.params.pipe(
      switchMap(params => {
        return this.programService.getProgramById(params["program_id"]);
      }))
      .subscribe((program) => {
        this.program = program;
      });
  }

  onSubmit() {
    if (this.moduleForm.invalid) return;
    if (!this.program) return;
    const moduleData = {
      title: this.moduleForm.value.title,
      order: this.moduleForm.value.order,

    };
    this.programService.createModule(this.program?.id, moduleData)
      .subscribe({
        next: () => {
          alert('Module created successfully');
          this.moduleForm.reset({ order: 1 });
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
