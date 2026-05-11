import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { SectionElement } from '../../../model/form-elements';
import { FormAttemptService } from '../../services/form-attempt.service';


@Component({
  selector: 'app-section-attempt',
  templateUrl: './section-attempt.component.html',
  styleUrls: ['./section-attempt.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SectionAttemptComponent implements OnInit {

  @Input()
  item: SectionElement
  selected_item_id_in_attempt_mode: string;

  constructor(private formSvc: FormAttemptService) { }

  ngOnInit(): void {

  }



}
