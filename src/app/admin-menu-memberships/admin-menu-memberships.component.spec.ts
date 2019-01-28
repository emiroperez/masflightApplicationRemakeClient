import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMenuMembershipsComponent } from './admin-menu-memberships.component';

describe('AdminMenveuMembershipsComponent', () => {
  let component: AdminMenuMembershipsComponent;
  let fixture: ComponentFixture<AdminMenuMembershipsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminMenuMembershipsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminMenuMembershipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
