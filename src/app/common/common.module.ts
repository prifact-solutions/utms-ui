import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ConfirmComponent } from './popups/confirm/confirm.component';
import { DeleteConfirmComponent } from './popups/delete-confirm/delete-confirm.component';
import { DotMenuComponent } from './dot-menu/dot-menu.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { DurationMinutesPipe } from './pipes/duration-minutes.pipe';

@NgModule({
  declarations: [DotMenuComponent, ClickOutsideDirective, DeleteConfirmComponent, ConfirmComponent, DurationMinutesPipe],
  imports: [CommonModule],
  exports: [DotMenuComponent, ClickOutsideDirective, DeleteConfirmComponent, ConfirmComponent, DurationMinutesPipe],
})
export class UtmsCommonModule {}
