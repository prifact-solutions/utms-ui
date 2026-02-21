import { Component } from '@angular/core';
import { Program } from '../models/program.model';
import { ComponentBase } from 'src/app/common/componentbase';
import { ProgramsService } from '../services/programs.service';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, switchMap } from 'rxjs';

@Component({
  selector: 'app-enroll',
  templateUrl: './enroll.component.html',
  styleUrls: ['./enroll.component.scss']
})
export class EnrollComponent extends ComponentBase {
  public program: Program | null = null;
  public isSubmitting = false;

  constructor(private programService: ProgramsService, private route: ActivatedRoute, private router: Router) { super(); }
  ngOnInit() {
    this.route.params.pipe(
      switchMap(params => {
        return combineLatest([this.programService.getProgramById(params["id"]), this.programService.getMyPrograms()])
      })
    )
      .subscribe(([program, my_programs]) => {
        this.program = program;
        if (my_programs.find(o => o.id == program.id)) {
          this.router.navigateByUrl(`/programs/${this.program?.id}/details`);
        }
      })

  }
  enroll(id: number) {
    this.isSubmitting = true;
    return this.programService.enroll(id)
      .subscribe({
        next: (res) => {
          this.router.navigateByUrl(`/programs/${this.program?.id}/details`)
        },
        error: (err) => {
          this.isSubmitting = false;
        }
      });
  }

}
