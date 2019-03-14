import { Component, HostListener, OnInit } from '@angular/core';
import { Globals } from '../globals/Globals';
import { ApiClient } from '../api/api-client';
import { MsfDashboardChartValues } from '../msf-dashboard-chartmenu/msf-dashboard-chartvalues';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-msf-dashboard',
  templateUrl: './msf-dashboard.component.html'
})
export class MsfDashboardComponent implements OnInit {
  dashboardColumns: MsfDashboardChartValues[][] = [];
  dashboardColumnsProperties: boolean[] = [];
  options: any[] = [];

  columnToUpdate: number;
  rowToUpdate: number;
  screenHeight: string;

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

  // variables for panel resizing
  //px: number;
  currentColumn: number;
  /*currentRow: number;
  resizePanel: boolean;
  minWidth: any;
  maxWidth: any;
  resizer: any;*/

  constructor(public globals: Globals, private service: ApplicationService,
    private http: ApiClient)
  {
    this.screenHeight = "calc(100% - 90px)";
  }

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
        _this.dashboardColumnsProperties.push (false);
        dashboardRows = [];
      }

      dashboardRows.push (new MsfDashboardChartValues (_this.options, dashboardPanel.title,
        dashboardPanel.id, _this.widthValues[dashboardPanel.width], _this.heightValues[dashboardPanel.height],
        dashboardPanel.option, dashboardPanel.chartColumnOptions, dashboardPanel.analysis, dashboardPanel.xaxis,
        dashboardPanel.values, dashboardPanel.function, dashboardPanel.chartType, dashboardPanel.categoryOptions,
        dashboardPanel.lastestResponse, dashboardPanel.paletteColors));
    }

    // add the last dashboard column
    _this.dashboardColumns.push (dashboardRows);
    _this.dashboardColumnsProperties.push (false);
    _this.globals.isLoading = false;
  }

  handlerError(_this, result): void
  {
    console.log (result);

    _this.globals.isLoading = false;
  }

  removeChart(column, row): void
  {
    this.service.confirmationDialog (this, "Are you sure you want to delete this panel?",
      function (_this)
      {
        let dashboardPanels: MsfDashboardChartValues[];
        let dashboardPanel, defaultWidth;
    
        dashboardPanels = _this.dashboardColumns[column];
    
        _this.columnToUpdate = column;
        _this.rowToUpdate = row;
        dashboardPanel = dashboardPanels[row];

        // reset panel width to avoid mess after deleting one
        defaultWidth = _this.getPanelWidthOption (12 / (dashboardPanels.length - 1));

        _this.globals.isLoading = true;
        _this.service.deleteDashboardPanel (_this, dashboardPanel.id, _this.widthValues.indexOf (defaultWidth),
          _this.deleteRowPanel, _this.handlerError);
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

    dashboardPanels = data;

    // insert the data options for each chart
    for (let i = 0; i < dashboardPanels.length; i++)
    {
      let dashboardPanel = dashboardPanels[i];
      dashboardRows.push (new MsfDashboardChartValues (_this.options, dashboardPanel.title, dashboardPanel.id,
        _this.widthValues[dashboardPanels[0].width], _this.heightValues[dashboardPanels[0].height]));
    }

    _this.dashboardColumns.push (dashboardRows);
    _this.displayAddChartMenu = false;
    _this.globals.isLoading = false;
  }

  insertPanelsInColumn(_this, data): void
  {
    let i, dashboardColumn, dashboardPanels, dashboardPanel, column;

    dashboardPanels = data;
    column = dashboardPanels[0].column;
    dashboardColumn = _this.dashboardColumns[column];

    // change width values of existing panels in the same column
    for (i = 0; i < dashboardColumn.length; i++)
    {
      dashboardPanel = dashboardColumn[i];
      dashboardPanel.width = _this.widthValues[dashboardPanels[0].width];
    }

    // insert the data options for each chart
    for (i = 0; i < dashboardPanels.length; i++)
    {
      dashboardPanel = dashboardPanels[i];
      dashboardColumn.push (new MsfDashboardChartValues (_this.options, dashboardPanel.title, dashboardPanel.id,
        _this.widthValues[dashboardPanel.width], _this.heightValues[dashboardPanel.height]));
    }

    _this.globals.isLoading = false;
  }

  deleteRowPanel(_this, defaultWidth): void
  {
    let dashboardPanels = [];

    dashboardPanels = _this.dashboardColumns[_this.columnToUpdate];
    dashboardPanels.splice (_this.rowToUpdate, 1);

    // set panel width for synchronization with the database
    for (let i = 0; i < dashboardPanels.length; i++)
    dashboardPanels[i].width = _this.widthValues[defaultWidth];

    // also remove the column if there are no panels left in the row
    if (!dashboardPanels.length)
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
    _this.dashboardColumnsProperties.splice (_this.columnToUpdate, 1);
    _this.globals.isLoading = false;
  }

  // update the dashboard container and hide the menu after
  // adding a new chart column
  addChart(numCharts): void
  {
    let panelsToAdd, width, column;

    panelsToAdd = [];
    column = this.dashboardColumns.length;
    width = this.getPanelWidthOption (12 / numCharts);

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
        'width' : this.widthValues.indexOf (width)
      });
    }

    this.globals.isLoading = true;
    this.service.createDashboardPanel (this, panelsToAdd, this.insertPanels, this.handlerError);
  }

  addChartInColumn(column, numCharts): void
  {
    let dashboardColumns = this.dashboardColumns[column];
    let panelsToAdd, width;

    panelsToAdd = [];
    width = this.widthValues.indexOf (this.getPanelWidthOption (12 / (dashboardColumns.length + numCharts)));

    for (let i = 0; i < numCharts; i++)
    {
      // set the properties for each panel before adding it into the database
      panelsToAdd.push (
      {
        'applicationId' : this.globals.currentApplication.id,
        'row' : i,
        'column' : column,
        'title' : "New Chart",
        'height' : this.heightValues.indexOf (dashboardColumns[0].height),
        'width' : width
      });
    }

    this.globals.isLoading = true;
    this.service.createDashboardPanelInColumn (this, panelsToAdd, width, this.insertPanelsInColumn,
      this.handlerError);
  }

  toggleColumnProperties(column): void
  {
    this.dashboardColumnsProperties[column] = !this.dashboardColumnsProperties[column];
  }

  getPanelWidth(column, row): number
  {
    return (this.dashboardColumns[column][row].width.value * 100) / 12;
  }

  getColumnHeight(column): number
  {
    const minHeight = 303;
    return minHeight + ((this.dashboardColumns[column][0].height.value - 1) * 15);
  }

  changePanelHeight(column, index): void
  {
    let dashboardColumn = this.dashboardColumns[column];
    let dashboardIds = [];

    for (let i = 0; i < dashboardColumn.length; i++)
      dashboardIds.push (dashboardColumn[i].id);

    this.globals.isLoading = true;
    this.service.updateDashboardPanelHeight (this, dashboardIds, this.heightValues.indexOf (index), this.handlerSucess, this.handlerError);
  }

  handlerSucess(_this): void
  {
    _this.globals.isLoading = false;
    console.log ("Panel size adjustement was successful.");
  }

  // this is not flexible...
  resizePanels(column, row): void
  {
    let currentColumn = this.dashboardColumns[column];

    if (currentColumn.length == 3) // three panels
    {
      if (row == 1)
      {
        currentColumn[0].width =
          this.getPanelWidthOption (12 - (currentColumn[1].width.value + currentColumn[2].width.value));
        currentColumn[2].width =
          this.getPanelWidthOption (12 - (currentColumn[1].width.value + currentColumn[0].width.value));
      }
      else if (row == 2)
      {
        currentColumn[1].width =
          this.getPanelWidthOption (12 - (currentColumn[2].width.value + currentColumn[0].width.value));
        currentColumn[0].width =
          this.getPanelWidthOption (12 - (currentColumn[2].width.value + currentColumn[1].width.value));
      }
      else
      {
        currentColumn[1].width =
          this.getPanelWidthOption (12 - (currentColumn[0].width.value + currentColumn[2].width.value));
        currentColumn[2].width =
          this.getPanelWidthOption (12 - (currentColumn[0].width.value + currentColumn[1].width.value));
      }
    }
    else if (currentColumn.length == 2) // two panels
    {
      if (row == 1)
      {
        currentColumn[0].width =
          this.getPanelWidthOption (12 - currentColumn[1].width.value);
      }
      else
      {
        currentColumn[1].width =
          this.getPanelWidthOption (12 - currentColumn[0].width.value);
      }
    }
    else if (currentColumn.length == 1) // one panel
      currentColumn[0].width = this.getPanelWidthOption (12);

    this.currentColumn = column;
    this.saveResizedPanels ();
  }

  /*resizePanelsFromLeft(offsetX: number): void
  {
    let leftPanel = this.dashboardColumns[this.currentColumn][this.currentRow - 1];
    let rightPanel = this.dashboardColumns[this.currentColumn][this.currentRow];

    if (offsetX < 0)
    {
      this.resizePanel = false;

      if (rightPanel.width === this.maxWidth)
        return;

      rightPanel.width = this.widthValues[this.widthValues.indexOf (rightPanel.width) + 1];
      leftPanel.width = this.widthValues[this.widthValues.indexOf (leftPanel.width) - 1];

      this.saveResizedPanels ();
    }
    else if (offsetX > 0)
    {
      this.resizePanel = false;

      if (rightPanel.width === this.minWidth)
        return;

      rightPanel.width = this.widthValues[this.widthValues.indexOf (rightPanel.width) - 1];
      leftPanel.width = this.widthValues[this.widthValues.indexOf (leftPanel.width) + 1];

      this.saveResizedPanels ();
    }
  }

  resizePanelsFromRight(offsetX: number): void
  {
    let leftPanel = this.dashboardColumns[this.currentColumn][this.currentRow];
    let rightPanel = this.dashboardColumns[this.currentColumn][this.currentRow + 1];

    if (offsetX < 0)
    {
      this.resizePanel = false;

      if (leftPanel.width === this.minWidth)
        return;

      leftPanel.width = this.widthValues[this.widthValues.indexOf (leftPanel.width) - 1];
      rightPanel.width = this.widthValues[this.widthValues.indexOf (rightPanel.width) + 1];

      this.saveResizedPanels ();
    }
    else if (offsetX > 0)
    {
      this.resizePanel = false;

      if (leftPanel === this.maxWidth)
        return;

      leftPanel.width = this.widthValues[this.widthValues.indexOf (leftPanel.width) + 1];
      rightPanel.width = this.widthValues[this.widthValues.indexOf (rightPanel.width) - 1];

      this.saveResizedPanels ();
    }
  }

  onLineClick(event, column, row, func): void
  {
    if (this.dashboardColumns[column].length == 3)
    {
      let dashboardColumn = this.dashboardColumns[column];
      let offset = 0;

      this.minWidth = this.widthValues[0];

      if (row == 2)
        offset = this.widthValues.indexOf (dashboardColumn[0].width);
      else if (!row)
        offset = this.widthValues.indexOf (dashboardColumn[2].width);

      this.maxWidth = this.widthValues[3 - offset];
    }
    else
    {
      this.minWidth = this.widthValues[0];
      this.maxWidth = this.widthValues[4];
    }

    this.currentColumn = column;
    this.currentRow = row;
    this.resizer = func;
    this.resizePanel = true;
    this.px = event.x;

    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('document:mousemove', ['$event'])
  onLineMove(event: MouseEvent)
  {
    if (!this.resizePanel)
        return;

    this.resizer (event.clientX - this.px);
    this.px = event.clientX;
  }

  @HostListener('document:mouseup', ['$event'])
  onLineRelease(event: MouseEvent)
  {
    this.resizePanel = false;
  }*/

  saveResizedPanels(): void
  {
    let dashboardColumn = this.dashboardColumns[this.currentColumn];
    let dashboardIds = [];

    // update the database to save changes
    for (let i = 0; i < dashboardColumn.length; i++)
    {
      let dashboardPanel = dashboardColumn[i];

      dashboardIds.push (dashboardPanel.id);
      dashboardIds.push (this.widthValues.indexOf (dashboardPanel.width));
    }

    this.globals.isLoading = true;
    this.service.updateDashboardPanelWidth (this, dashboardIds, this.handlerSucess, this.handlerError);
  }

  @HostListener('window:resize', ['$event'])
  checkScreen(event)
  {
    if (event.target.innerHeight == window.screen.height && event.target.innerWidth == window.screen.width)
      this.screenHeight = "100%";
    else
      this.screenHeight = "calc(100% - 90px)";
  }
}
