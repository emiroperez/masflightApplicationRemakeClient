import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { DashboardCategory } from '../model/DashboardCategory';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-menu-dashboard',
  templateUrl: './menu-dashboard.component.html'
})
export class MenuDashboardComponent implements OnInit {

  @Input("dashboardCategory")
  dashboardCategory: DashboardCategory;

  @Output("setDashboard")
  setDashboard = new EventEmitter ();

  @ViewChild('childMenu', { static: true })
  public childMenu;

  constructor(public globals: Globals) { }

  ngOnInit() {
  }

  goToDashboard(dashboard, readOnly): void
  {
    this.setDashboard.emit ({
      dashboard: dashboard,
      readOnly: readOnly
    });
  }

  checkDashboardCategory(dashboardCategory: DashboardCategory): boolean
  {
    if ((dashboardCategory.children && dashboardCategory.children.length > 0)
      || (dashboardCategory.dashboards && dashboardCategory.dashboards.length > 0)
      || (dashboardCategory.sharedDashboards && dashboardCategory.sharedDashboards.length > 0))
      return true;

    return false;
  }
}
