import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationSpinnerComponent } from './notification-spinner.component';

describe('NotificationSpinnerComponent', () => {
  let component: NotificationSpinnerComponent;
  let fixture: ComponentFixture<NotificationSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotificationSpinnerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
