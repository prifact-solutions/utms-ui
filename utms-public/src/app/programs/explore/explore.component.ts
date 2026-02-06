import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProgramsService } from '../services/programs.service';
import { Program } from '../models/program.model';
import { ComponentBase } from "../../common/componentbase";
@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent extends ComponentBase {

  constructor(private programsService: ProgramsService, private router: Router) { super(); }

  public programs: Array<Program> = [];

  ngOnInit() {
    this.programsService.getAllCourses()
      .subscribe(programs => {
        this.programs = programs;
      });
  }

  enrollProgram(programId: number) {
    this.router.navigate([`/programs/${programId}/enroll`]);
  }
}
