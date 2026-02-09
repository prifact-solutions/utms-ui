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
  public catalog: any = null;
  public progress: { [id: string]: string; } = {}

  constructor(private programService: ProgramsService, private route: ActivatedRoute, private router: Router) { super(); }

  public navigateToLesson(lesson: any) {
    if (this.catalog) {
      if (lesson.content_type == "LESSON") {
        this.router.navigate(["programs", this.catalog.id, "modules", lesson.module_id, "contents", lesson.id, "lesson"]);
      } else {
        this.router.navigate(["programs", this.catalog.id, "modules", lesson.module_id, "contents", lesson.id, "exam"]);
      }
    }
  }

  public getStatus(lesson: any): string {
    if (this.progress[lesson.id]) {
      return this.progress[lesson.id];
    }
    return "NOT_STARTED";
  }

  ngOnInit() {
    let sub1 = this.route.params.pipe(
      switchMap(params => {
        return this.programService.getProgramCatalog(params["id"]);
      })
    )
      .subscribe((res) => {
        this.catalog = res;
      });
    this.registerSubscription(sub1);

    let sub2 = this.route.params.pipe(
      switchMap(params => {
        return this.programService.getProgramProgress(params["id"]);
      })
    )
      .subscribe((progresses) => {
        progresses.forEach((progress) => {
          this.progress[progress.content_id] = progress.status;
        });
        console.log(this.progress);
      });
    this.registerSubscription(sub2);
  }
}
