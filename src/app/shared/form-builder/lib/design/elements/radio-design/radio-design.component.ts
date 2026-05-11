import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { MCQElement } from '../../../model/form-elements';


@Component({
  selector: 'app-radio-design',
  templateUrl: './radio-design.component.html',
  styleUrls: ['./radio-design.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RadioDesignComponent implements OnInit {

  constructor() { }

  @Input()
  item:MCQElement;

  ngOnInit(): void {
  }
}
