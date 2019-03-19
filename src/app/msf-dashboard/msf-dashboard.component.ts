import { Component, HostListener, OnInit, Input, SimpleChanges } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Globals } from '../globals/Globals';
import { MsfDashboardChartValues } from '../msf-dashboard-chartmenu/msf-dashboard-chartvalues';
import { ApplicationService } from '../services/application.service';

const minPanelWidth = 25;

@Component({
  selector: 'app-msf-dashboard',
  templateUrl: './msf-dashboard.component.html',
  styleUrls: ['./msf-dashboard.component.css']
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

  @Input()
  currentDashboardMenu: number;

  // variables for panel resizing
  currentColumn: number;
  resizePanel: boolean;
  leftPanel: any;
  rightPanel: any;

  constructor(public globals: Globals, private service: ApplicationService)
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

  ngOnChanges(changes: SimpleChanges)
  {
    if (changes['currentDashboardMenu'] && this.options.length != 0)
    {
      // replace dashboard panels if the menu has changed and we're still on the dashboard
      this.dashboardColumns.splice (0, this.dashboardColumns.length);
      this.dashboardColumnsProperties.splice (0, this.dashboardColumnsProperties.length);

      this.globals.isLoading = true;
      this.service.getDashboardPanels (this, this.currentDashboardMenu,
        this.loadDashboardPanels, this.handlerError);
    }
  }

  // store any data form depending of the selected dashboard from menu
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
    _this.service.getDashboardPanels (_this, _this.currentDashboardMenu,
      _this.loadDashboardPanels, _this.handlerError);
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

        // sort rows before adding the column
        dashboardRows.sort (function(e1, e2) {
          return e1.row - e2.row;
        });

        _this.dashboardColumns.push (dashboardRows);
        _this.dashboardColumnsProperties.push (false);
        dashboardRows = [];
      }

      dashboardRows.push (new MsfDashboardChartValues (_this.options, dashboardPanel.title,
        dashboardPanel.id, dashboardPanel.width, _this.heightValues[dashboardPanel.height],
        dashboardPanel.option, dashboardPanel.chartColumnOptions, dashboardPanel.analysis, dashboardPanel.xaxis,
        dashboardPanel.values, dashboardPanel.function, dashboardPanel.chartType, dashboardPanel.categoryOptions,
        dashboardPanel.lastestResponse, dashboardPanel.paletteColors, dashboardPanel.row));
    }

    // add the last dashboard column
    dashboardRows.sort (function(e1, e2) {
      return e1.row - e2.row;
    });

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
        if (dashboardPanels.length == 1)
          defaultWidth = 0;
        else
          defaultWidth = 100 / (dashboardPanels.length - 1);

        _this.globals.isLoading = true;
        _this.service.deleteDashboardPanel (_this, dashboardPanel.id, defaultWidth,
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
        dashboardPanels[0].width, _this.heightValues[dashboardPanels[0].height]));
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
      dashboardPanel.width = dashboardPanels[0].width;
    }

    // insert the data options for each chart
    for (i = 0; i < dashboardPanels.length; i++)
    {
      dashboardPanel = dashboardPanels[i];
      dashboardColumn.push (new MsfDashboardChartValues (_this.options, dashboardPanel.title, dashboardPanel.id,
        dashboardPanel.width, _this.heightValues[dashboardPanel.height]));
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
      dashboardPanels[i].width = defaultWidth;

    // also remove the column if there are no panels left in the row
    if (!dashboardPanels.length)
    {
      _this.service.deleteDashboardColumn (_this, _this.currentDashboardMenu,
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
    width = 100 / numCharts;

    for (let i = 0; i < numCharts; i++)
    {
      // set the properties for each panel before adding it into the database
      panelsToAdd.push (
      {
        'dashboardMenuId' : this.currentDashboardMenu,
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
    let dashboardColumns = this.dashboardColumns[column];
    let panelsToAdd, width;

    panelsToAdd = [];
    width = 100 / (dashboardColumns.length + numCharts);

    for (let i = 0; i < numCharts; i++)
    {
      // set the properties for each panel before adding it into the database
      panelsToAdd.push (
      {
        'dashboardMenuId' : this.currentDashboardMenu,
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
    return this.dashboardColumns[column][row].width;
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

    // this.globals.isLoading = true;
    this.service.updateDashboardPanelHeight (this, dashboardIds, this.heightValues.indexOf (index), this.handlerSuccess, this.handlerError);
  }

  handlerSuccess(_this): void
  {
    console.log ("The changes to the dashboard were successful.");
    // _this.globals.isLoading = false;
  }

  onLineClick(event, column, leftrow, rightrow): void
  {
    this.currentColumn = column;
    this.leftPanel = this.dashboardColumns[column][leftrow];
    this.rightPanel = this.dashboardColumns[column][rightrow];
    this.resizePanel = true;

    event.preventDefault ();
    event.stopPropagation ();
  }

  @HostListener('document:mousemove', ['$event'])
  onLineMove(event: MouseEvent)
  {
    let offsetX, totalWidth;

    if (!this.resizePanel)
        return;

    // convert horizontal offset into percentage for proper resizing
    offsetX = event.movementX * 100 / window.innerWidth;
    totalWidth = this.leftPanel.width + this.rightPanel.width;

    // begin resizing the panels
    if (offsetX > 0 && this.rightPanel.width - offsetX < minPanelWidth)
    {    
      this.rightPanel.width = minPanelWidth;
      this.leftPanel.width = totalWidth - minPanelWidth;
      return;
    }
    else if (offsetX < 0 && this.leftPanel.width + offsetX < minPanelWidth)
    {    
      this.leftPanel.width = minPanelWidth;
      this.rightPanel.width = totalWidth - minPanelWidth;
      return;
    }

    this.leftPanel.width += offsetX;
    this.rightPanel.width -= offsetX;
  }

  @HostListener('document:mouseup', ['$event'])
  onLineRelease(event: MouseEvent)
  {
    if (!this.resizePanel)
      return;

    this.resizePanel = false;
    this.saveResizedPanels ();
  }

  saveResizedPanels(): void
  {
    let dashboardColumn = this.dashboardColumns[this.currentColumn];
    let dashboardIds = [];

    // update the database to save changes
    for (let i = 0; i < dashboardColumn.length; i++)
    {
      let dashboardPanel = dashboardColumn[i];

      dashboardIds.push ({
        id: dashboardPanel.id,
        width: dashboardPanel.width
      });
    }

    // this.globals.isLoading = true;
    this.service.updateDashboardPanelWidth (this, dashboardIds, this.handlerSuccess, this.handlerError);
  }

  @HostListener('window:resize', ['$event'])
  checkScreen(event): void
  {
    if (event.target.innerHeight == window.screen.height && event.target.innerWidth == window.screen.width)
      this.screenHeight = "100%";
    else
      this.screenHeight = "calc(100% - 90px)";
  }

  swapPanelRowPositions(event: CdkDragDrop<string[]>, dashboardColumn, columnIndex): void
  {
    let newPanelPos = [];

    // do not update if the position remains the same
    if (event.previousIndex == event.currentIndex)
      return;

    // move items
    moveItemInArray (dashboardColumn, event.previousIndex, event.currentIndex);

    // update the database to set the new row position for the panels
    for (let i = 0; i < dashboardColumn.length; i++)
    {
      // swap row position by swapping the dashboard ids
      newPanelPos.push ({
        id: dashboardColumn[i].id,
        column : columnIndex,
        row: i
      });
    }

    // this.globals.isLoading = true;
    this.service.setDashboardPanelRowPositions (this, newPanelPos, this.handlerSuccess,
      this.handlerError);
  }
}
