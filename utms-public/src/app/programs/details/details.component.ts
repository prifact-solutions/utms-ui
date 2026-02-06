import { Component } from '@angular/core';
import { ComponentBase } from 'src/app/common/componentbase';
import { ProgramsService } from '../services/programs.service';
import { Program } from '../models/program.model';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent extends ComponentBase {
  public program: Program | null = null;
  public catalog: any = null;

  constructor(private programService: ProgramsService, private route: ActivatedRoute, private router: Router) { super(); }

  public navigateToLesson(lessonId: number) {
    this.router.navigate(['/lesson', lessonId]);
  }

  public getStatus(index: number): 'completed' | 'in-progress' | 'pending' {
    if (index === 0) return 'in-progress';
    if (index > 0) return 'pending';
    return 'completed';
  }

  ngOnInit() {
    this.route.params.pipe(
      switchMap(params => {
        return this.programService.getProgramById(params["id"]);
      })
    )
      .subscribe((res) => {
        this.program = res;
      });
    this.route.params.pipe(
      switchMap(params => {
        return this.programService.getProgramCatalog(params["id"]);
      })
    )
      .subscribe((res) => {
        this.catalog = res;
      });
  }
}
