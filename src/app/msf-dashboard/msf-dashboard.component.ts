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
  dashboardColumns: MsfDashboardChartValues[][] = [];
  options: any[] = [];

  columnToDelete: number;
  rowToDelete: number;

  displayAddChartMenu: boolean = false;

  constructor(public globals: Globals, private service: ApplicationService, private http: ApiClient) { }

  ngOnInit()
  {
    if (this.globals.isLoading)
      return; // do not query this component twice

    this.globals.isLoading = true;
    this.service.getMenuString (this, this.globals.currentApplication.id,
      this.addDataForms, this.handlerError);
  }

  // store any data form depending of the application id
  addDataForms(_this, data): void
  {
    _this.globals.isLoading = false;

    for (let columnConfig of data)
    {
      _this.options.push (
      {
        id: columnConfig.id,
        name: columnConfig.string,
        nameSearch: columnConfig.stringSearch,
        baseUrl: columnConfig.url
      });
    }

    // get dashboard panels after getting the data forms
    _this.service.getDashboardPanels (_this, _this.globals.currentApplication.id,
      _this.loadDashboardPanels, _this.handlerError);
  }

  loadDashboardPanels (_this, data)
  {
    let dashboardPanels: any[] = [];
    let dashboardRows = [];

    dashboardPanels = data;
    if (!dashboardPanels.length)
    {
      // we're done if there are no existing dashboard panels
      _this.globals.isLoading = false;
      return;
    }

    // insert dashboard panels for synchronization
    for (let i = 0, curColumn = 0; i < dashboardPanels.length; i++)
    {
      let dashboardPanel = dashboardPanels[i];

      if (dashboardPanel.column != curColumn)
      {
        curColumn = dashboardPanel.column;
        _this.dashboardColumns.push (dashboardRows);
        dashboardRows = [];
      }

      dashboardRows.push (new MsfDashboardChartValues (_this.options, dashboardPanel.title,
        dashboardPanel.id, dashboardPanel.option, dashboardPanel.chartColumnOptions, dashboardPanel.analysis,
        dashboardPanel.xaxis, dashboardPanel.function, dashboardPanel.values, dashboardPanel.chartType,
        dashboardPanel.lastestResponse));
    }

    // add the last dashboard column
    _this.dashboardColumns.push (dashboardRows);
    _this.globals.isLoading = false;
  }

  handlerError(_this, result): void
  {
    console.log (result);
    _this.globals.isLoading = false;  
  }

  RemoveChart(column, row): void
  {
    let dashboardRows: MsfDashboardChartValues[];

    dashboardRows = this.dashboardColumns[column];

    this.columnToDelete = column;
    this.rowToDelete = row;

    this.globals.isLoading = true;
    this.service.deleteDashboardPanel (this, dashboardRows[row], this.deleteRowPanel, this.handlerError);
  }

  ToggleDisplayAddChartMenu(): void
  {
    this.displayAddChartMenu = !this.displayAddChartMenu;
  }

  insertPanels (_this, data)
  {
    let dashboardPanels;
    let dashboardRows = [];

    dashboardPanels = data;

    // insert the data options for each chart
    for (let i = 0; i < dashboardPanels.length; i++)
    {
      let dashboardPanel = dashboardPanels[i];
      dashboardRows.push (new MsfDashboardChartValues (_this.options, dashboardPanel.title, dashboardPanel.id));
    }

    _this.dashboardColumns.push (dashboardRows);
    _this.displayAddChartMenu = false;
    _this.globals.isLoading = false;
  }

  deleteRowPanel (_this, data): void
  {
    let dashboardRows = [], pos;

    pos = data;

    dashboardRows = _this.dashboardColumns[_this.columnToDelete];
    dashboardRows.splice (_this.rowToDelete, 1);

    // also remove the column if there are no panels left in the row
    if (!dashboardRows.length)
      _this.service.deleteDashboardColumn (_this, pos, _this.deleteColumn, _this.handlerError);
    else
      _this.globals.isLoading = false;
  }

  deleteColumn (_this, data): void
  {
    _this.dashboardColumns.splice (data.column, 1);
    _this.globals.isLoading = false;
  }

  // update the dashboard container and hide the menu after
  // adding a new chart column
  AddChart(numCharts): void
  {
    let panelsToAdd, column;

    panelsToAdd = [];
    column = this.dashboardColumns.length;

    for (let i = 0; i < numCharts; i++)
    {
      // set the properties for each panel before adding it into the database
      panelsToAdd.push (
      {
        'applicationId' : this.globals.currentApplication.id,
        'row' : i,
        'column' : column,
        'title' : "New Chart"
      });
    }

    this.globals.isLoading = true;
    this.service.createDashboardPanel (this, panelsToAdd, this.insertPanels, this.handlerError);
  }
}
