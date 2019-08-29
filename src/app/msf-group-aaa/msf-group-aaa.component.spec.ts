import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MsfGroupAaaComponent } from './msf-group-aaa.component';

describe('MsfGroupAaaComponent', () => {
  let component: MsfGroupAaaComponent;
  let fixture: ComponentFixture<MsfGroupAaaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MsfGroupAaaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MsfGroupAaaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
