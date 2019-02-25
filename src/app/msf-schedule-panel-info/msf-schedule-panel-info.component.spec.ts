import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MsfSchedulePanelInfoComponent } from './msf-schedule-panel-info.component';

describe('MsfSchedulePanelInfoComponent', () => {
  let component: MsfSchedulePanelInfoComponent;
  let fixture: ComponentFixture<MsfSchedulePanelInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MsfSchedulePanelInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MsfSchedulePanelInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
