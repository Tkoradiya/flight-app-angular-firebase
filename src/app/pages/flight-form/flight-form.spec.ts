import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightForm } from './flight-form';

describe('FlightForm', () => {
  let component: FlightForm;
  let fixture: ComponentFixture<FlightForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
