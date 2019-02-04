import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MsfFunctionsComponent } from './msf-functions.component';

describe('MsfFunctionsComponent', () => {
  let component: MsfFunctionsComponent;
  let fixture: ComponentFixture<MsfFunctionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MsfFunctionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MsfFunctionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
