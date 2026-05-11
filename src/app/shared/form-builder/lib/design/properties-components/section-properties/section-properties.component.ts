import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { globalEditorConfig } from '../../../model/editor-configs';
import { SectionElement } from '../../../model/form-elements';

@Component({
  selector: 'app-section-properties',
  templateUrl: './section-properties.component.html',
  styleUrls: ['./section-properties.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SectionPropertiesComponent implements OnInit {

  constructor() { }

  @Input() item: SectionElement;
  globalEditorConfig = globalEditorConfig;

  ngOnInit(): void {
  }

}
