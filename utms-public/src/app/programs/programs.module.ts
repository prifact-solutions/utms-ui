import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreComponent } from './explore/explore.component';
import { EnrollComponent } from './enroll/enroll.component';



@NgModule({
  declarations: [
    ExploreComponent,
    EnrollComponent
  ],
  imports: [
    CommonModule
  ],
  exports:[ExploreComponent]
})
export class ProgramsModule { }
