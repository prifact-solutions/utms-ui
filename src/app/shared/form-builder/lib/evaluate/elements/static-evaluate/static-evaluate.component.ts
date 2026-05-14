import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { StaticElement } from '../../../model/form-elements';


@Component({
  selector: 'app-static-evaluate',
  templateUrl: './static-evaluate.component.html',
  styleUrls: ['./static-evaluate.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StaticEvaluateComponent implements OnInit {

  constructor() { }
  @Input()
  item: StaticElement;

  ngOnInit(): void {
  }

}
