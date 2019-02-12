import { Component, OnInit } from '@angular/core';
import { Globals } from '../globals/Globals';
import { ApiClient } from '../api/api-client';
import { MsfDashboardChartValues } from '../msf-dashboard-chartmenu/msf-dashboard-chartvalues';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-msf-dashboard',
  templateUrl: './msf-dashboard.component.html',
  styleUrls: ['./msf-dashboard.component.css']
})
export class MsfDashboardComponent implements OnInit {
  dashboardColumns: MsfDashboardChartValues[] = [];
  options: any[] = [];

  displayAddChartMenu: boolean = false;

  constructor(public globals: Globals, private service: ApplicationService, private http: ApiClient) { }

  ngOnInit()
  {
    this.getDataOptions(this.globals.currentApplication.id);
  }

  getDataOptions(applicationId): void
  {
    this.globals.isLoading = true;
    this.service.getDataOptions(this, applicationId, this.addFilterOptions, this.handlerError);
  }

  // store any data option depending of the application id
  addFilterOptions(_this, data): void
  {
    _this.globals.isLoading = false;

    for (let columnConfig of data)
    {
      _this.options.push (
      {
        id: columnConfig.option.id,
        name: columnConfig.option.label,
        baseUrl: columnConfig.option.baseUrl
      });
    }
  }

  handlerError(_this, result): void
  {
    console.log(result);
    _this.globals.isLoading = false;  
  }

  RemoveChart(column, row): void
  {
    let dashboardRows;

    dashboardRows = this.dashboardColumns[column];
    dashboardRows.splice (row, 1);

    // also remove the column if there are no chart left
    if (!dashboardRows.length)
      this.dashboardColumns.splice (column, 1);
  }

  ToggleDisplayAddChartMenu(): void
  {
    this.displayAddChartMenu = !this.displayAddChartMenu;
  }

  // update the dashboard container and hide the menu after
  // adding a new chart column
  AddChart(numCharts): void
  {
    let dashboardRows;

    dashboardRows = [];
    do
    {
      // insert the data options for each chart
      dashboardRows.push (new MsfDashboardChartValues (this.options, "New Chart"));
    } while (--numCharts);

    this.dashboardColumns.push (dashboardRows);
    this.displayAddChartMenu = false;
  }
}
