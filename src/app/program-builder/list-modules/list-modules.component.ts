import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, switchMap } from 'rxjs';
import { ComponentBase } from 'src/app/common/componentbase';
import { Module, Program } from 'src/app/programs/models/program.model';
import { ProgramsService } from 'src/app/programs/services/programs.service';

@Component({
  selector: 'app-list-modules',
  templateUrl: './list-modules.component.html',
  styleUrls: ['./list-modules.component.scss'],
})
export class ListModulesComponent extends ComponentBase {
  modules: Module[] = [];

  constructor(
    private programService: ProgramsService,
    private route: ActivatedRoute,
  ) {
    super();
  }

  public program!: Program;

  ngOnInit() {
    this.route.params
      .pipe(
        switchMap((params) => {
          const programId = params['program_id'];
          return this.programService.getProgramCatalog(programId);
        }),
      )
      .subscribe((program) => {
        this.program = program;
        this.modules = program.modules || [];
      });
  }

  onDelete(moduleId: number): void {
    const sub = this.programService
      .deleteModule(this.program.id, moduleId)
      .pipe(
        switchMap((_) => {
          return this.programService.getProgramCatalog(this.program.id);
        }),
      )
      .subscribe((program) => {
        this.program = program;
        this.modules = program.modules || [];
      });
    this.registerSubscription(sub);
  }
}
