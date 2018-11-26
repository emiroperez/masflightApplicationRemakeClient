import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryArgumentsComponent } from './category-arguments.component';

describe('CategoryArgumentsComponent', () => {
  let component: CategoryArgumentsComponent;
  let fixture: ComponentFixture<CategoryArgumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoryArgumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryArgumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
