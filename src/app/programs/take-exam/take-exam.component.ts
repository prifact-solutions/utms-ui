import { Component, OnInit } from '@angular/core';
import { ProgramsService } from '../services/programs.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentBase } from 'src/app/common/componentbase';
import { combineLatest, map, switchMap, tap } from 'rxjs';
import { ModuleContent, ModuleContentFile } from '../models/program.model';

@Component({
  selector: 'app-take-exam',
  templateUrl: './take-exam.component.html',
  styleUrls: ['./take-exam.component.scss']
})
export class TakeExamComponent  extends ComponentBase {
lesson: ModuleContent | null = null;
  files: Array<ModuleContentFile> = [];

  next_module_content: ModuleContent | null = null;

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
        return this.programService.getExam(params.program_id, params.module_id, params.module_content_id)
      }))
      .subscribe(examContent => {
        console.log(examContent);
      });
    this.registerSubscription(sub);
  }

  markAsComplete() {
    if (this.lesson) {
      this.programService.updateLessonStatus(this.program_id, this.module_id, this.lesson?.id, "COMPLETED").subscribe((res) => {
        this.next_module_content = res;
        this.goToNextContent();
      });
    }
  }
  onNextContentAvailable(next_content: ModuleContent) {
    this.next_module_content = next_content;
  }
  goToCatalog() {
    this.router.navigateByUrl(`/programs/${this.program_id}/details`)
  }
  goToNextContent() {
    if (this.next_module_content) {
      if (this.next_module_content?.content_type == "LESSON") {
        this.router.navigateByUrl(`/programs/${this.program_id}/modules/${this.next_module_content.module_id}/contents/${this.next_module_content.id}/lesson`)
      }
      else {
        this.router.navigateByUrl(`/programs/${this.program_id}/modules/${this.next_module_content.module_id}/contents/${this.next_module_content.id}/exam`)
      }
    }
    else {
      this.router.navigateByUrl(`/programs/${this.program_id}/details`)
    }
  }
}
