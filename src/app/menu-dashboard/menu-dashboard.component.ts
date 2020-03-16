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

  @Output("cancelLoadingFromLastService")
  cancelLoadingFromLastService = new EventEmitter ();

  @ViewChild('childMenu', { static: true })
  public childMenu;

  constructor(public globals: Globals) { }

  ngOnInit() {
  }

  goToDashboard(dashboard, readOnly): void
  {
    this.cancelLoadingFromLastService.emit ();

    this.setDashboard.emit ({
      dashboard: dashboard,
      readOnly: readOnly
    });
  }

  checkPlan(option: string): boolean
  {
    if (this.globals.currentApplication.id == 5)
    {
      let index = this.globals.optionsDatalake.findIndex (od => od.action.name === option);

      // DataLake doesn't use the membership plan
      if (index != -1)
        return false;
      else
        return true;
    }

    return this.globals.readOnlyDashboardPlan ? false : true;
  }
}
