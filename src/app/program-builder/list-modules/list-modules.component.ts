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
  showDeleteConfirm = false;
  modulePendingDelete: Module | null = null;
  isDeletingModule = false;
  deleteErrorMessage = '';

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

  onDelete(module: Module): void {
    this.modulePendingDelete = module;
    this.showDeleteConfirm = true;
    this.deleteErrorMessage = '';
  }

  closeDeleteConfirm(): void {
    if (this.isDeletingModule) {
      return;
    }
    this.showDeleteConfirm = false;
    this.modulePendingDelete = null;
    this.deleteErrorMessage = '';
  }

  confirmDeleteModule(): void {
    if (!this.modulePendingDelete) {
      return;
    }
    this.isDeletingModule = true;
    this.deleteErrorMessage = '';
    const sub = this.programService
      .deleteModule(this.program.id, this.modulePendingDelete.id)
      .pipe(
        switchMap((_) => {
          return this.programService.getProgramCatalog(this.program.id);
        }),
      )
      .subscribe({
        next: (program) => {
          this.program = program;
          this.modules = program.modules || [];
          this.isDeletingModule = false;
          this.closeDeleteConfirm();
        },
        error: () => {
          this.isDeletingModule = false;
          this.deleteErrorMessage =
            'Could not delete this module. Please try again.';
        },
      });
    this.registerSubscription(sub);
  }
}
