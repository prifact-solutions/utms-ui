import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramFeaturedMediaComponent } from './program-featured-media.component';

describe('ProgramFeaturedMediaComponent', () => {
  let component: ProgramFeaturedMediaComponent;
  let fixture: ComponentFixture<ProgramFeaturedMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgramFeaturedMediaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramFeaturedMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
