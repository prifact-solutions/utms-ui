import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { TextElement } from '../../../model/form-elements';

@Component({
  selector: 'app-text-design',
  templateUrl: './text-design.component.html',
  styleUrls: ['./text-design.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TextDesignComponent implements OnInit {

  constructor() { }

  @Input()
  item: TextElement;

  ngOnInit(): void {
  }



}
