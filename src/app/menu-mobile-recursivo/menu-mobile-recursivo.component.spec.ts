import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuMobileRecursivoComponent } from './menu-mobile-recursivo.component';

describe('MenuMobileRecursivoComponent', () => {
  let component: MenuMobileRecursivoComponent;
  let fixture: ComponentFixture<MenuMobileRecursivoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuMobileRecursivoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuMobileRecursivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
