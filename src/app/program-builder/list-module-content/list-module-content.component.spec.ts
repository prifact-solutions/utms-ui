import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListModuleContentComponent } from './list-module-content.component';

describe('ListModuleContentComponent', () => {
  let component: ListModuleContentComponent;
  let fixture: ComponentFixture<ListModuleContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListModuleContentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListModuleContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
