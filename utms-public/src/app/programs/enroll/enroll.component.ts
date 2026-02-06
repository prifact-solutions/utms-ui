import { Component } from '@angular/core';
import { Program } from '../models/program.model';
import { ComponentBase } from 'src/app/common/componentbase';
import { ProgramsService } from '../services/programs.service';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-enroll',
  templateUrl: './enroll.component.html',
  styleUrls: ['./enroll.component.scss']
})
export class EnrollComponent extends ComponentBase {
  public program: Program | null = null;

  constructor(private programService: ProgramsService, private route: ActivatedRoute) { super(); }
  ngOnInit() {
    this.route.params.pipe(
      switchMap(params => {
        return this.programService.getProgramById(params["id"]);
      })
    )
      .subscribe((res) => {
        this.program = res;
      })

  }
  enroll(id: number) {
    return this.programService.enroll(id)
      .subscribe();
  }

}
