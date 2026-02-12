import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProgramListComponent } from './program-list/program-list.component';
import { CreateProgramComponent } from './create-program/create-program.component';
import { CreateModuleComponent } from './create-module/create-module.component';
import { CreateLessonComponent } from './create-lesson/create-lesson.component';
import { RouterModule } from '@angular/router';
import { ListModulesComponent } from './list-modules/list-modules.component';
import { ListModuleContentComponent } from './list-module-content/list-module-content.component';


@NgModule({
  declarations: [
    ProgramListComponent,
    CreateProgramComponent,
    CreateModuleComponent,
    CreateLessonComponent,
    ListModulesComponent,
    ListModuleContentComponent,
    
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class ProgramBuilderModule { }
