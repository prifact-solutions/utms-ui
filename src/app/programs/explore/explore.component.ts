import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProgramsService } from '../services/programs.service';
import { Program } from '../models/program.model';
import { ComponentBase } from "../../common/componentbase";
import { AuthService } from 'src/app/utms-auth/services/auth.service';
import { filter, switchMap } from 'rxjs';
import { Utils } from "../../common/utils";
@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent extends ComponentBase {

  constructor(private programsService: ProgramsService,
    private authService: AuthService,
    private router: Router) { super(); }

  public programs: Array<Program> = [];
  public myPrograms: Array<Program> = [];
  public isStaff: boolean = false;

  ngOnInit() {
    let sub1 = this.programsService.getAllPrograms()
      .subscribe(programs => {
        this.programs = programs;
      });
    this.registerSubscription(sub1);
    let sub2 = this.authService.currentUser$
      .pipe(
        filter(user => {
          return user != null;
        }),
        switchMap(user => {
          return this.programsService.getMyPrograms();
        })
      )
      .subscribe(myPrograms => {
        this.myPrograms = myPrograms;
        this.programs.forEach((program) => {
          program.is_enrolled = !!myPrograms.find(o => o.id == program.id);
        });
      });
    this.registerSubscription(sub2);

    this.isStaff = Utils.decodeAuthToken().is_staff;
  }

  enrollProgram(programId: number) {
    this.router.navigate([`/programs/${programId}/enroll`]);
  }
  viewProgram(programId: number) {
    this.router.navigate([`/programs/${programId}/details`]);
  }
}
