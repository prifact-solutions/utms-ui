import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, switchMap, tap } from 'rxjs';
import { ComponentBase } from 'src/app/common/componentbase';
import {
  Module,
  ModuleContent,
  Program,
} from 'src/app/programs/models/program.model';
import { ProgramsService } from 'src/app/programs/services/programs.service';

@Component({
  selector: 'app-list-module-content',
  templateUrl: './list-module-content.component.html',
  styleUrls: ['./list-module-content.component.scss'],
})
export class ListModuleContentComponent extends ComponentBase {
  module: Module | null | undefined = null;
  module_contents: Array<ModuleContent> = [];
  module_id: number = 0;
  program_id: number = 0;
  showDeleteConfirm = false;
  contentPendingDelete: ModuleContent | null = null;
  isDeletingContent = false;
  deleteErrorMessage = '';
  constructor(
    private programService: ProgramsService,
    private route: ActivatedRoute,
  ) {
    super();
  }

  public program: Program | null = null;

  ngOnInit() {
    this.route.params
      .pipe(
        tap((params) => {
          this.module_id = params['module_id'];
          this.program_id = params['program_id'];
        }),
        switchMap((_) => {
          return combineLatest([
            this.programService.getProgramById(this.program_id),
            this.programService.getModulesForProgram(this.program_id),
            this.programService.getModuleContentsForModule(
              this.program_id,
              this.module_id,
            ),
          ]);
        }),
      )
      .subscribe(([program, modules, contents]) => {
        this.program = program;
        this.module = modules.find((m) => m.id == this.module_id);
        this.module_contents = contents.sort(
          (a, b) => (a.order || 0) - (b.order || 0),
        );
      });
  }
  onDelete(content: ModuleContent): void {
    this.contentPendingDelete = content;
    this.deleteErrorMessage = '';
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    if (this.isDeletingContent) {
      return;
    }
    this.showDeleteConfirm = false;
    this.contentPendingDelete = null;
    this.deleteErrorMessage = '';
  }

  confirmDeleteContent(): void {
    if (!this.contentPendingDelete) {
      return;
    }
    this.isDeletingContent = true;
    this.deleteErrorMessage = '';
    this.programService
      .deleteModuleContent(
        this.program_id,
        this.module_id,
        this.contentPendingDelete.id,
      )
      .subscribe({
        next: () => {
          this.module_contents = this.module_contents
            .filter((mc) => mc.id !== this.contentPendingDelete?.id)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          this.isDeletingContent = false;
          this.closeDeleteConfirm();
        },
        error: () => {
          this.isDeletingContent = false;
          this.deleteErrorMessage =
            'Could not delete this content. Please try again.';
        },
      });
  }
}
