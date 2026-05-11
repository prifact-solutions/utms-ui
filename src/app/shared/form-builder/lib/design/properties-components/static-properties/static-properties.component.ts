import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { globalEditorConfig } from '../../../model/editor-configs';
import { StaticElement } from '../../../model/form-elements';
import { UtilsService } from '../../../services/utils.service';
import { AngularEditorConfig, AngularEditorComponent } from '@kolkov/angular-editor';

@Component({
  selector: 'app-static-properties',
  templateUrl: './static-properties.component.html',
  styleUrls: ['./static-properties.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StaticPropertiesComponent implements OnInit {

  constructor() { }
  @Input()
  item: StaticElement;
  globalEditorConfig = globalEditorConfig;
  toolBarConfig: AngularEditorConfig = UtilsService.jsonCopy(globalEditorConfig);
  noToolBarConfig: AngularEditorConfig = UtilsService.jsonCopy(globalEditorConfig);
  ngOnInit(): void {
    this.noToolBarConfig.showToolbar = false;
  }

  onEditorFocus(editor: AngularEditorComponent) {
    editor.config = this.toolBarConfig;
  }

  onEditorBlur(editor: AngularEditorComponent) {
    editor.config = this.noToolBarConfig;
  }
}
