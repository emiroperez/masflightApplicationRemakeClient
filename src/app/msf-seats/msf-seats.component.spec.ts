import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MsfSeatsComponent } from './msf-seats.component';

describe('MsfSeatsComponent', () => {
  let component: MsfSeatsComponent;
  let fixture: ComponentFixture<MsfSeatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MsfSeatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MsfSeatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
