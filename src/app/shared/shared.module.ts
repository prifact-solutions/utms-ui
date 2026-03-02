import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';
import { PublicNavigationComponent } from './public-navigation/public-navigation.component';
import { ProgramFeaturedMediaComponent } from './program-featured-media/program-featured-media.component';

@NgModule({
  declarations: [
    NavigationComponent,
    PublicNavigationComponent,
    ProgramFeaturedMediaComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [NavigationComponent, PublicNavigationComponent, ProgramFeaturedMediaComponent]
})
export class SharedModule { }
