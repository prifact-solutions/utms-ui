import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { StaticElement } from '../../../model/form-elements';

@Component({
  selector: 'app-static-design',
  templateUrl: './static-design.component.html',
  styleUrls: ['./static-design.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StaticDesignComponent implements OnInit {

  constructor() { }
  @Input()
  item: StaticElement;

  ngOnInit(): void {
  }

}
