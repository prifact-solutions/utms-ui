import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreComponent } from './explore/explore.component';
import { EnrollComponent } from './enroll/enroll.component';
import { DetailsComponent } from './details/details.component';



@NgModule({
  declarations: [
    ExploreComponent,
    EnrollComponent,
    DetailsComponent
  ],
  imports: [
    CommonModule
  ],
  exports:[ExploreComponent]
})
export class ProgramsModule { }
