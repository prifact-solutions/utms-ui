import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericFileComponent } from './generic-file.component';

describe('GenericFileComponent', () => {
  let component: GenericFileComponent;
  let fixture: ComponentFixture<GenericFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericFileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
