import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MsfSchedulePanelComponent } from './msf-schedule-panel.component';

describe('MsfSchedulePanelComponent', () => {
  let component: MsfSchedulePanelComponent;
  let fixture: ComponentFixture<MsfSchedulePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MsfSchedulePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MsfSchedulePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
