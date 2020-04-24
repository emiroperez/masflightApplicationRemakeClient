import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MsfActionListComponent } from './msf-action-list.component';

describe('MsfActionListComponent', () => {
  let component: MsfActionListComponent;
  let fixture: ComponentFixture<MsfActionListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MsfActionListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MsfActionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
