import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, switchMap } from 'rxjs';
import { ComponentBase } from 'src/app/common/componentbase';
import { Module, Program } from 'src/app/programs/models/program.model';
import { ProgramsService } from 'src/app/programs/services/programs.service';

@Component({
  selector: 'app-list-modules',
  templateUrl: './list-modules.component.html',
  styleUrls: ['./list-modules.component.scss']
})
export class ListModulesComponent extends ComponentBase {
  modules: Module[] = [];

  constructor(private programService: ProgramsService, private route: ActivatedRoute) {
    super();
  }

  public program: Program | null = null;

  ngOnInit() {
    this.route.params.pipe(
      switchMap(params => {
        return combineLatest([this.programService.getProgramById(params["program_id"]), this.programService.getModulesForProgram(params["program_id"])])
      }))
      .subscribe(([program, modules]) => {
        this.program = program;
        this.modules = modules;
      });
  }

}
