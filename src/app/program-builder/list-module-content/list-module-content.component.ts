import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, switchMap, tap } from 'rxjs';
import { ComponentBase } from 'src/app/common/componentbase';
import { Module, ModuleContent, Program } from 'src/app/programs/models/program.model';
import { ProgramsService } from 'src/app/programs/services/programs.service';

@Component({
  selector: 'app-list-module-content',
  templateUrl: './list-module-content.component.html',
  styleUrls: ['./list-module-content.component.scss']
})
export class ListModuleContentComponent extends ComponentBase {
  module: Module | null | undefined = null;
  module_contents: Array<ModuleContent> = [];
  module_id: number = 0;
  program_id: number = 0;
  constructor(private programService: ProgramsService, private route: ActivatedRoute) {
    super();
  }

  public program: Program | null = null;

  ngOnInit() {
    this.route.params.pipe(
      tap((params) => {
        this.module_id = params["module_id"];
        this.program_id = params["program_id"];
      }),
      switchMap((_) => {
        return combineLatest([this.programService.getProgramById(this.program_id),
        this.programService.getModulesForProgram(this.program_id),
        this.programService.getModuleContentsForModule(this.program_id, this.module_id)])
      }))
      .subscribe(([program, modules, contents]) => {
        this.program = program;
        this.module = modules.find(m => m.id == this.module_id);
        this.module_contents = contents;
      });
  }
  onDelete(id: number) {
    this.programService.deleteModuleContent(this.program_id, this.module_id, id)
      .subscribe((res) => {
        this.module_contents = this.module_contents.filter(mc => mc.id !== id);
      });
  }
}