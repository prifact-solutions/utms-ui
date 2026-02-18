import { Component, Renderer2, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentBase } from 'src/app/common/componentbase';

@Component({
  selector: 'app-create-exam',
  templateUrl: './create-exam.component.html',
  styleUrls: ['./create-exam.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreateExamComponent extends ComponentBase {
  loading: boolean = true;
  programId!: number;
  moduleId!: number;
  constructor(
    private renderer: Renderer2,
    private route: ActivatedRoute,
    public router: Router,
  ) {
    super();
  }
  ngOnInit() {
    this.renderer.addClass(document.body, 'menu-clicked');
    this.programId = this.route.snapshot.params['program_id'];
    this.moduleId = this.route.snapshot.params['module_id'];
    this.loading = false;
  }

  onBack(event: boolean) {
    this.router.navigate([
      `/program-builder/modules/${this.programId}/${this.moduleId}`,
    ]);
  }

  onSave(event: any) {
    //this.alertService.newAlert("Question paper saved successfully");
  }
}
