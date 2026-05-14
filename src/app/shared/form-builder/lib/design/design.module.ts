import { DragDropModule, DragDropRegistry } from '@angular/cdk/drag-drop';
import { Platform } from '@angular/cdk/platform';
import { ScrollDispatcher, ViewportRuler } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { MarkDisplayModule } from '../components/mark-display/mark-display.module';
import { RadioDesignComponent } from './elements/radio-design/radio-design.component';
import { SectionDesignComponent } from './elements/section-design/section-design.component';
import { SectionQuestionsDesignComponent } from './elements/section-questions-design/section-questions-design.component';
import { StaticDesignComponent } from './elements/static-design/static-design.component';
import { TextDesignComponent } from './elements/text-design/text-design.component';
import { FormDesignerComponent } from './form-designer/form-designer.component';
import { EditPropComponent } from './properties-components/edit-prop/edit-prop.component';
import { RadioPropertiesComponent } from './properties-components/radio-properties/radio-properties.component';
import { SectionPropertiesComponent } from './properties-components/section-properties/section-properties.component';
import { StaticPropertiesComponent } from './properties-components/static-properties/static-properties.component';
import { TextPropertiesComponent } from './properties-components/text-properties/text-properties.component';
import { TrackClicksDirective } from '../directives/track-clicks.directive';
import { LibConfirmModule } from 'lib-confirm';
import { UtmsCommonModule } from 'src/app/common/common.module';
import { FilePropertiesComponent } from './properties-components/file-properties/file-properties.component';
import { FileUploadDesignComponent } from './elements/file-upload-design/file-upload-design.component';

@NgModule({
  declarations: [RadioDesignComponent,
    SectionDesignComponent,
    SectionQuestionsDesignComponent,
    StaticDesignComponent,
    TextDesignComponent,
    FormDesignerComponent,
    FileUploadDesignComponent,

    EditPropComponent,
    RadioPropertiesComponent,
    SectionPropertiesComponent,
    StaticPropertiesComponent,
    TextPropertiesComponent,
    FilePropertiesComponent,

    TrackClicksDirective
  ],
  imports: [
    CommonModule,
    AngularEditorModule,
    FormsModule,
    MarkDisplayModule,
    DragDropModule,
    LibConfirmModule,
    UtmsCommonModule
  ],
  exports: [FormDesignerComponent, TrackClicksDirective],
  providers: [ViewportRuler, Platform, DragDropRegistry,ScrollDispatcher]
})
export class DesignModule { }
