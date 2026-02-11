import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgramListComponent } from './program-list/program-list.component';
import { CreateProgramComponent } from './create-program/create-program.component';
import { CreateModuleComponent } from './create-module/create-module.component';
import { CreateLessonComponent } from './create-lesson/create-lesson.component';



@NgModule({
  declarations: [
    ProgramListComponent,
    CreateProgramComponent,
    CreateModuleComponent,
    CreateLessonComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ProgramBuilderModule { }
