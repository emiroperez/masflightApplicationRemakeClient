import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Globals } from '../globals/Globals';
import { ApiClient } from '../api/api-client';
import { MsfDashboardChartValues } from '../msf-dashboard-chartmenu/msf-dashboard-chartvalues';
import { MsfDashboardColumnValues } from './msf-dashboard-columnvalues';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-msf-dashboard',
  templateUrl: './msf-dashboard.component.html',
  styleUrls: ['./msf-dashboard.component.css']
})
export class MsfDashboardComponent implements OnInit {
  dashboardColumns: MsfDashboardChartValues[][] = [];
  dashboardColumnsSize: MsfDashboardColumnValues[] = [];
  options: any[] = [];

  columnToDelete: number;
  rowToDelete: number;

  displayAddChartMenu: boolean = false;

  constructor(public globals: Globals, private service: ApplicationService,
    private http: ApiClient, private cdref: ChangeDetectorRef) { }

  ngOnInit()
  {
  }

  ngAfterViewInit()
  {
    this.globals.isLoading = true;

    this.service.getMenuString (this, this.globals.currentApplication.id,
      this.addDataForms, this.handlerError);
  }

  // store any data form depending of the application id
  addDataForms(_this, data): void
  {
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
    let defaultWidth;

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
        defaultWidth = 12 / dashboardRows.length;

        curColumn = dashboardPanel.column;
        _this.dashboardColumns.push (dashboardRows);
        _this.dashboardColumnsSize.push (new MsfDashboardColumnValues (2, defaultWidth, defaultWidth, defaultWidth));
        dashboardRows = [];
      }

      dashboardRows.push (new MsfDashboardChartValues (_this.options, dashboardPanel.title,
        dashboardPanel.id, dashboardPanel.option, dashboardPanel.chartColumnOptions, dashboardPanel.analysis,
        dashboardPanel.xaxis, dashboardPanel.values, dashboardPanel.function, dashboardPanel.chartType,
        dashboardPanel.categoryOptions, dashboardPanel.lastestResponse));
    }

    // add the last dashboard column
    defaultWidth = 12 / dashboardRows.length;
    _this.dashboardColumns.push (dashboardRows);
    _this.dashboardColumnsSize.push (new MsfDashboardColumnValues (2, defaultWidth, defaultWidth, defaultWidth));
    _this.globals.isLoading = false;
  }

  handlerError(_this, result): void
  {
    console.log (result);

    _this.globals.isLoading = false;
  }

  RemoveChart(column, row): void
  {
    this.service.confirmationDialog (this, "Are you sure you want to delete this panel?",
      function (_this)
      {
        let dashboardRows: MsfDashboardChartValues[];
        let dashboardRow;
    
        dashboardRows = _this.dashboardColumns[column];
    
        _this.columnToDelete = column;
        _this.rowToDelete = row;
        dashboardRow = dashboardRows[row];
    
        _this.globals.isLoading = true;
        _this.service.deleteDashboardPanel (_this, dashboardRow.id, _this.deleteRowPanel, _this.handlerError);
      });
  }

  toggleDisplayAddChartMenu(): void
  {
    this.displayAddChartMenu = !this.displayAddChartMenu;
  }

  insertPanels (_this, data)
  {
    let dashboardPanels;
    let dashboardRows = [];
    let defaultWidth;

    dashboardPanels = data;

    // insert the data options for each chart
    for (let i = 0; i < dashboardPanels.length; i++)
    {
      let dashboardPanel = dashboardPanels[i];
      dashboardRows.push (new MsfDashboardChartValues (_this.options, dashboardPanel.title, dashboardPanel.id));
    }

    defaultWidth = 12 / dashboardRows.length;
    _this.dashboardColumns.push (dashboardRows);
    _this.dashboardColumnsSize.push (new MsfDashboardColumnValues (2, defaultWidth, defaultWidth, defaultWidth));
    _this.displayAddChartMenu = false;
    _this.globals.isLoading = false;
  }

  deleteRowPanel (_this): void
  {
    let dashboardRows = [];

    dashboardRows = _this.dashboardColumns[_this.columnToDelete];
    dashboardRows.splice (_this.rowToDelete, 1);

    // also remove the column if there are no panels left in the row
    if (!dashboardRows.length)
    {
      _this.service.deleteDashboardColumn (_this, _this.globals.currentApplication.id,
        _this.columnToDelete, _this.deleteColumn, _this.handlerError);
    }
    else
    {
      _this.globals.isLoading = false;
      _this.cdref.detectChanges ();
    }
  }

  deleteColumn (_this): void
  {
    _this.dashboardColumns.splice (_this.columnToDelete, 1);
    _this.dashboardColumnsSize.splice (_this.columnToDelete, 1);
    _this.globals.isLoading = false;
    _this.cdref.detectChanges ();
  }

  // update the dashboard container and hide the menu after
  // adding a new chart column
  addChart(numCharts): void
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

  toggleColumnProperties(column): void
  {
    this.dashboardColumnsSize[column].displayProperties = !this.dashboardColumnsSize[column].displayProperties;
  }

  getPanelWidth(column, row): number
  {
    return (this.dashboardColumnsSize[column].width[row] * 100) / 12;
  }

  getColumnHeight(column): number
  {
    return 100;
    //return (this.dashboardColumnsSize[column].height * 100) / 12;
  }
}
