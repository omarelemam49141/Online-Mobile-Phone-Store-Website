import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSpinnerComponent } from './form-spinner.component';

describe('FormSpinnerComponent', () => {
  let component: FormSpinnerComponent;
  let fixture: ComponentFixture<FormSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormSpinnerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
