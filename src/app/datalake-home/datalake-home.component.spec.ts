import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatalakeHomeComponent } from './datalake-home.component';

describe('DatalakeHomeComponent', () => {
  let component: DatalakeHomeComponent;
  let fixture: ComponentFixture<DatalakeHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatalakeHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatalakeHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
