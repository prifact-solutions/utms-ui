import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DotMenuComponent } from './dot-menu/dot-menu.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';

@NgModule({
  declarations: [DotMenuComponent, ClickOutsideDirective],
  imports: [CommonModule],
  exports: [DotMenuComponent, ClickOutsideDirective],
})
export class UtmsCommonModule {}
