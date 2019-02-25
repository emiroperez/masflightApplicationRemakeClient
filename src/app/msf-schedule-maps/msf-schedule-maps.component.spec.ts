import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MsfScheduleMapsComponent } from './msf-schedule-maps.component';

describe('MsfScheduleMapsComponent', () => {
  let component: MsfScheduleMapsComponent;
  let fixture: ComponentFixture<MsfScheduleMapsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MsfScheduleMapsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MsfScheduleMapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
