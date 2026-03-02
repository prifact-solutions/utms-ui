import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';
import { PublicNavigationComponent } from './public-navigation/public-navigation.component';

@NgModule({
  declarations: [
    NavigationComponent,
    PublicNavigationComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [ NavigationComponent, PublicNavigationComponent ]
})
export class SharedModule { }
