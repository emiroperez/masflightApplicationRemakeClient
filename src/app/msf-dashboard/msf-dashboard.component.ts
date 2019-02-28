import { Component, OnInit } from '@angular/core';
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

  columnToUpdate: number;
  rowToUpdate: number;

  displayAddChartMenu: boolean = false;

  heightValues:any[] = [
    { value: 1, name: 'Small' },
    { value: 3, name: 'Medium' },
    { value: 6, name: 'Large' },
    { value: 12, name: 'Very Large' }
  ];

  widthValues:any[] = [
    { value: 2, name: 'Very Small' },
    { value: 4, name: 'Small' },
    { value: 6, name: 'Medium' },
    { value: 8, name: 'Large' },
    { value: 10, name: 'Very Large' },
    { value: 12, name: 'Full Size' }
  ];

  twoPanelsFilterArgs:any = { value: 12, name: 'Full Size' };
  threePanelsFilterArgs:any = { value: 10, name: 'Very Large' };

  constructor(public globals: Globals, private service: ApplicationService,
    private http: ApiClient) { }

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

  getPanelWidthOption(width): any
  {
    let result = this.widthValues[0]; // default result if no equivalent found

    for (let i = 0; i < this.widthValues.length; i++)
    {
      let widthValue = this.widthValues[i];

      if (widthValue.value == width)
      {
        result = widthValue;
        break;
      }
    }

    return result;
  }

  loadDashboardPanels (_this, data): void
  {
    let i, curColumn, defaultWidth, height;
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
    for (i = 0, curColumn = 0; i < dashboardPanels.length; i++)
    {
      let dashboardPanel = dashboardPanels[i];

      if (dashboardPanel.column != curColumn)
      {
        defaultWidth = _this.getPanelWidthOption (12 / dashboardRows.length);

        curColumn = dashboardPanel.column;
        height = _this.heightValues[dashboardPanels[i - 1].height];

        _this.dashboardColumns.push (dashboardRows);

        _this.dashboardColumnsSize.push (new MsfDashboardColumnValues (height, defaultWidth, defaultWidth, defaultWidth));
        dashboardRows = [];
      }

      dashboardRows.push (new MsfDashboardChartValues (_this.options, dashboardPanel.title,
        dashboardPanel.id, dashboardPanel.option, dashboardPanel.chartColumnOptions, dashboardPanel.analysis,
        dashboardPanel.xaxis, dashboardPanel.values, dashboardPanel.function, dashboardPanel.chartType,
        dashboardPanel.categoryOptions, dashboardPanel.lastestResponse));
    }

    // add the last dashboard column
    defaultWidth = _this.getPanelWidthOption (12 / dashboardRows.length);
    height = _this.heightValues[dashboardPanels[i - 1].height];

    _this.dashboardColumns.push (dashboardRows);
    _this.dashboardColumnsSize.push (new MsfDashboardColumnValues (height, defaultWidth, defaultWidth, defaultWidth));
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
    
        _this.columnToUpdate = column;
        _this.rowToUpdate = row;
        dashboardRow = dashboardRows[row];
    
        _this.globals.isLoading = true;
        _this.service.deleteDashboardPanel (_this, dashboardRow.id, _this.deleteRowPanel, _this.handlerError);
      });
  }

  toggleDisplayAddChartMenu(): void
  {
    this.displayAddChartMenu = !this.displayAddChartMenu;
  }

  insertPanels(_this, data): void
  {
    let dashboardPanels;
    let dashboardRows = [];
    let width, height;

    dashboardPanels = data;

    // insert the data options for each chart
    for (let i = 0; i < dashboardPanels.length; i++)
    {
      let dashboardPanel = dashboardPanels[i];
      dashboardRows.push (new MsfDashboardChartValues (_this.options, dashboardPanel.title, dashboardPanel.id));
    }

    height = _this.heightValues[dashboardPanels[0].height];
    width = _this.widthValues[dashboardPanels[0].width];
    _this.dashboardColumns.push (dashboardRows);
    _this.dashboardColumnsSize.push (new MsfDashboardColumnValues (height, width, width, width));
    _this.displayAddChartMenu = false;
    _this.globals.isLoading = false;
  }

  insertPanelsInColumn(_this, data): void
  {
    let dashboardPanels, column, defaultWidth;

    dashboardPanels = data;
    column = dashboardPanels[0].column;

    // insert the data options for each chart
    for (let i = 0; i < dashboardPanels.length; i++)
    {
      let dashboardPanel = dashboardPanels[i];
      _this.dashboardColumns[column].push (new MsfDashboardChartValues (_this.options, dashboardPanel.title, dashboardPanel.id));
    }

    // reset for now the panel width variables
    defaultWidth = _this.getPanelWidthOption (12 / (dashboardPanels.length + 1));
    _this.dashboardColumnsSize[column].width[0] = defaultWidth;
    _this.dashboardColumnsSize[column].width[1] = defaultWidth;
    _this.dashboardColumnsSize[column].width[2] = defaultWidth;
    _this.globals.isLoading = false;
  }

  deleteRowPanel(_this): void
  {
    let defaultWidth;
    let dashboardRows = [];

    dashboardRows = _this.dashboardColumns[_this.columnToUpdate];
    dashboardRows.splice (_this.rowToUpdate, 1);

    // reset panel width to avoid mess
    defaultWidth = _this.getPanelWidthOption (12 / dashboardRows.length);
    for (let i = 0; i < dashboardRows.length; i++)
      _this.dashboardColumnsSize[_this.columnToUpdate].width[i] = defaultWidth;

    // also remove the column if there are no panels left in the row
    if (!dashboardRows.length)
    {
      _this.service.deleteDashboardColumn (_this, _this.globals.currentApplication.id,
        _this.columnToUpdate, _this.deleteColumn, _this.handlerError);
    }
    else
      _this.globals.isLoading = false;
  }

  deleteColumn (_this): void
  {
    _this.dashboardColumns.splice (_this.columnToUpdate, 1);
    _this.dashboardColumnsSize.splice (_this.columnToUpdate, 1);
    _this.globals.isLoading = false;
  }

  // update the dashboard container and hide the menu after
  // adding a new chart column
  addChart(numCharts): void
  {
    let panelsToAdd, width, column;

    panelsToAdd = [];
    column = this.dashboardColumns.length;
    width = 12 / numCharts;

    for (let i = 0; i < numCharts; i++)
    {
      // set the properties for each panel before adding it into the database
      panelsToAdd.push (
      {
        'applicationId' : this.globals.currentApplication.id,
        'row' : i,
        'column' : column,
        'title' : "New Chart",
        'height' : 0,
        'width' : width
      });
    }

    this.globals.isLoading = true;
    this.service.createDashboardPanel (this, panelsToAdd, this.insertPanels, this.handlerError);
  }

  addChartInColumn(column, numCharts): void
  {
    let panelsToAdd, width;

    panelsToAdd = [];
    width = 12 / (this.dashboardColumns[column].length + numCharts);

    for (let i = 0; i < numCharts; i++)
    {
      // set the properties for each panel before adding it into the database
      panelsToAdd.push (
      {
        'applicationId' : this.globals.currentApplication.id,
        'row' : i,
        'column' : column,
        'title' : "New Chart",
        'height' : this.heightValues.indexOf (this.dashboardColumnsSize[column].height),
        'width' : width
      });
    }

    this.globals.isLoading = true;
    this.service.createDashboardPanel (this, panelsToAdd, this.insertPanelsInColumn, this.handlerError);
  }

  toggleColumnProperties(column): void
  {
    this.dashboardColumnsSize[column].displayProperties = !this.dashboardColumnsSize[column].displayProperties;
  }

  getPanelWidth(column, row): number
  {
    return (this.dashboardColumnsSize[column].width[row].value * 100) / 12;
  }

  getColumnHeight(column): number
  {
    const minHeight = 303;
    return minHeight + ((this.dashboardColumnsSize[column].height.value - 1) * 15);
  }

  changePanelHeight(column, index): void
  {
    let dashboardIds = [];

    for (let i = 0; i < this.dashboardColumns[column].length; i++)
      dashboardIds.push (this.dashboardColumns[column][i].id);

    this.service.updateDashboardPanelHeight (this, dashboardIds, index.value, this.handlerSucess, this.handlerError);
  }

  handlerSucess(_this): void
  {
    console.log ("Panel height adjustement was successful.");
  }

  adjustPanelSize(column): void
  {
    let currentColumn = this.dashboardColumnsSize[column];

    if (this.dashboardColumns[column].length == 2) // two panels
    {
      let widthLeft = 12 - (currentColumn.width[1].value + currentColumn.width[0].value);

      this.dashboardColumnsSize[column].width[0] =
        this.getPanelWidthOption (currentColumn.width[0].value + (widthLeft >> 1));
      this.dashboardColumnsSize[column].width[1] =
        this.getPanelWidthOption (currentColumn.width[1].value + (widthLeft >> 1));
    }
    else if (this.dashboardColumns[column].length == 1) // one panel
      this.dashboardColumnsSize[column].width[0] = this.getPanelWidthOption (12);
  }

  // this is not flexible...
  resizePanels(column, row): void
  {
    let currentColumn = this.dashboardColumnsSize[column];

    if (this.dashboardColumns[column].length == 3) // three panels
    {
      if (row == 1)
      {
        this.dashboardColumnsSize[column].width[0] =
          this.getPanelWidthOption (12 - (currentColumn.width[1].value + currentColumn.width[2].value));
        this.dashboardColumnsSize[column].width[2] =
          this.getPanelWidthOption (12 - (currentColumn.width[1].value + currentColumn.width[0].value));
      }
      else if (row == 2)
      {
        this.dashboardColumnsSize[column].width[1] =
          this.getPanelWidthOption (12 - (currentColumn.width[2].value + currentColumn.width[0].value));
        this.dashboardColumnsSize[column].width[0] =
          this.getPanelWidthOption (12 - (currentColumn.width[2].value + currentColumn.width[1].value));
      }
      else
      {
        this.dashboardColumnsSize[column].width[1] =
          this.getPanelWidthOption (12 - (currentColumn.width[0].value + currentColumn.width[2].value));
        this.dashboardColumnsSize[column].width[2] =
          this.getPanelWidthOption (12 - (currentColumn.width[0].value + currentColumn.width[1].value));
      }
    }
    else if (this.dashboardColumns[column].length == 2) // two panels
    {
      if (row == 1)
      {
        this.dashboardColumnsSize[column].width[0] =
          this.getPanelWidthOption (12 - currentColumn.width[1].value);
      }
      else
      {
        this.dashboardColumnsSize[column].width[1] =
          this.getPanelWidthOption (12 - currentColumn.width[0].value);
      }
    }
    else if (this.dashboardColumns[column].length == 1) // one panel
      this.dashboardColumnsSize[column].width[0] = this.getPanelWidthOption (12);
  }
}
