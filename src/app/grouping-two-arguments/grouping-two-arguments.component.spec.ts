import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupingTwoArgumentsComponent } from './grouping-two-arguments.component';

describe('GroupingTwoArgumentsComponent', () => {
  let component: GroupingTwoArgumentsComponent;
  let fixture: ComponentFixture<GroupingTwoArgumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupingTwoArgumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupingTwoArgumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
