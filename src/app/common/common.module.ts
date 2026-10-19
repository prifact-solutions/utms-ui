import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ConfirmComponent } from './popups/confirm/confirm.component';
import { DeleteConfirmComponent } from './popups/delete-confirm/delete-confirm.component';
import { DotMenuComponent } from './dot-menu/dot-menu.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { DurationHoursPipe } from './pipes/duration-hours.pipe';

@NgModule({
  declarations: [DotMenuComponent, ClickOutsideDirective, DeleteConfirmComponent, ConfirmComponent, DurationHoursPipe],
  imports: [CommonModule],
  exports: [DotMenuComponent, ClickOutsideDirective, DeleteConfirmComponent, ConfirmComponent, DurationHoursPipe],
})
export class UtmsCommonModule {}
