import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationScreen } from './confirmation-screen';

describe('ConfirmationScreen', () => {
  let component: ConfirmationScreen;
  let fixture: ComponentFixture<ConfirmationScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationScreen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmationScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
