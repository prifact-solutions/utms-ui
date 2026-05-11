import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MarkDisplayComponent } from './mark-display.component';



@NgModule({
  declarations: [MarkDisplayComponent],
  imports: [
    CommonModule
  ],
  exports: [MarkDisplayComponent]
})
export class MarkDisplayModule { }
