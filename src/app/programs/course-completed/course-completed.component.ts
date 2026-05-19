import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentBase } from 'src/app/common/componentbase';
import { ModuleContent, Program } from '../models/program.model';
import { ProgramsService } from '../services/programs.service';

@Component({
  selector: 'app-course-completed',
  templateUrl: './course-completed.component.html',
  styleUrls: ['./course-completed.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CourseCompletedComponent extends ComponentBase {
  catalog: Program | null = null;
  programId: number = 0;
  isLoading: boolean = true;

  constructor(
    private programService: ProgramsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    super();
  }

  ngOnInit(): void {
    this.programId = +this.route.snapshot.params['program_id'];
    const sub = this.programService.getProgramCatalog(this.programId).subscribe((catalog) => {
      this.catalog = catalog;
      this.isLoading = false;
    });
    this.registerSubscription(sub);
  }

  goToCatalog(): void {
    this.router.navigateByUrl(`/programs/${this.programId}/details`);
  }
}
