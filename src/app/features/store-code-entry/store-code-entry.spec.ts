import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreCodeEntry } from './store-code-entry';

describe('StoreCodeEntry', () => {
  let component: StoreCodeEntry;
  let fixture: ComponentFixture<StoreCodeEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreCodeEntry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreCodeEntry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
