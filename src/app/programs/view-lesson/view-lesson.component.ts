import { Component, OnInit } from '@angular/core';
import { ProgramsService } from '../services/programs.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentBase } from 'src/app/common/componentbase';
import { map, switchMap, tap } from 'rxjs';
import { ModuleContent, ModuleContentFile } from '../models/program.model';

@Component({
  selector: 'app-view-lesson',
  templateUrl: './view-lesson.component.html',
  styleUrls: ['./view-lesson.component.scss']
})
export class ViewLessonComponent extends ComponentBase {
  lesson: ModuleContent | null = null;
  files: Array<ModuleContentFile> = [];

  program_id: number = 0;
  module_id: number = 0;

  constructor(private programService: ProgramsService, private route: ActivatedRoute, private router: Router) { super(); }

  ngOnInit() {
    let sub = this.route.params.pipe(
      map((params) => {
        return {
          "program_id": params["program_id"],
          "module_id": params["module_id"],
          "module_content_id": params["module_content_id"]
        }
      }),
      tap((params) => {
        this.program_id = params.program_id;
        this.module_id = params.module_id;
      }),
      switchMap((params) => {
        return this.programService.getLesson(params.program_id, params.module_id, params.module_content_id);
      })
    )
      .subscribe((lesson) => {
        this.lesson = lesson.content;
        this.files = lesson.files;
      })
  }

  markAsComplete() {
    if (this.lesson) {
      this.programService.updateLessonStatus(this.program_id, this.module_id, this.lesson?.id, "COMPLETED").subscribe((res) => {

      });
    }
  }

  goBack() {
    console.log('Going back to lessons list');
  }
}
