import { Component, OnInit } from '@angular/core';
import { Globals } from '../globals/Globals';
import { ApiClient } from '../api/api-client';

@Component({
  selector: 'app-msf-dashboard',
  templateUrl: './msf-dashboard.component.html',
  styleUrls: ['./msf-dashboard.component.css']
})
export class MsfDashboardComponent implements OnInit {
  dashboardRows: number[] = [];
  columns:any[] = [];
  addChartMenu: boolean = false;

  constructor(public globals: Globals, private http: ApiClient) { }

  ngOnInit()
  {
    this.getChartFilterOptionsFromApplication(this.globals.currentApplication.id);
  }

  getChartFilterOptionsFromApplication(applicationId): void
  {
    this.globals.isLoading = true;

    //let url = "/getFilterOptions?applicationId=" + applicationId;
    let url = "http://localhost:8887/getFilterOptions?applicationId=" + applicationId;
    this.http.get (this, url, this.addFilterOptions, this.handlerError, null);
  }

  addFilterOptions(_this, data): void
  {
    _this.globals.isLoading = false;

    for (let columnConfig of data)
      _this.columns.push ( { id: columnConfig.option.id, name: columnConfig.option.label } );
  }

  handlerError(_this, result): void
  {
    console.log(result);
    _this.globals.isLoading = false;  
  }

  ToggleAddChartMenu(): void
  {
    this.addChartMenu = !this.addChartMenu;
  }

  AddChartRow(numCharts): void
  {
    let chartsFilterOptions;

    chartsFilterOptions = [];
  
    do
    {
      chartsFilterOptions.push (this.columns);
    } while (--numCharts);

    this.dashboardRows.push (chartsFilterOptions);

    // display the specified number of charts and hide the menu
    this.addChartMenu = false;
  }
}
