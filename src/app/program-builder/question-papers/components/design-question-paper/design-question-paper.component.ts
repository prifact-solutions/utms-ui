import { Component, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormElementType } from 'form-builder';
import { ComponentBase } from 'src/app/common/componentbase';

@Component({
  selector: 'app-design-question-paper',
  templateUrl: './design-question-paper.component.html',
  styleUrls: ['./design-question-paper.component.scss'],
})
export class DesignQuestionPaperComponent extends ComponentBase {
  constructor(
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private router: Router,
  ) {
    super();
  }

  loading: boolean = true;
  programId!: number;
  qpId!: number;
  questionTypes: FormElementType[] = [
    FormElementType.multiple_choice,
    FormElementType.paragraph,
    FormElementType.section,
  ];

  ngOnInit() {
    this.renderer.addClass(document.body, 'menu-clicked');
    this.renderer.addClass(document.documentElement, 'qp-form-design-route');
    this.programId = this.route.snapshot.params['program_id'];
    this.qpId = this.route.snapshot.params['qp_id'];
    this.loading = false;
  }

  override ngOnDestroy(): void {
    this.renderer.removeClass(document.documentElement, 'qp-form-design-route');
    this.renderer.removeClass(document.body, 'menu-clicked');
    super.ngOnDestroy();
  }

  onBack(event: any) {
    this.router.navigate([
      `/programs-builder/${this.programId}/question-papers/`,
    ]);
  }

  onSave(event: any) {
    this.router.navigate([
      `/programs-builder/${this.programId}/question-papers/`,
    ]);
    //this.alertService.newAlert('Question paper saved successfully');
  }
}
