import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMenuRecursiveComponent } from './admin-menu-recursive.component';

describe('AdminMenuRecursiveComponent', () => {
  let component: AdminMenuRecursiveComponent;
  let fixture: ComponentFixture<AdminMenuRecursiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminMenuRecursiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminMenuRecursiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
