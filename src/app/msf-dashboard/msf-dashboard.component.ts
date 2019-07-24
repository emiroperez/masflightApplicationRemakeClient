import { Component, HostListener, OnInit, Input, SimpleChanges, ViewChild } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material';

import { Globals } from '../globals/Globals';
import { MsfDashboardPanelValues } from '../msf-dashboard-panel/msf-dashboard-panelvalues';
import { ApplicationService } from '../services/application.service';
import { MsfDashboardChildPanelComponent } from '../msf-dashboard-child-panel/msf-dashboard-child-panel.component';
import { ChartFlags } from '../msf-dashboard-panel/msf-dashboard-chartflags';
import { MsfDashboardControlPanelComponent } from '../msf-dashboard-control-panel/msf-dashboard-control-panel.component';
import { CategoryArguments } from '../model/CategoryArguments';

const minPanelWidth = 25;

@Component({
  selector: 'app-msf-dashboard',
  templateUrl: './msf-dashboard.component.html',
  styleUrls: ['./msf-dashboard.component.css']
})
export class MsfDashboardComponent implements OnInit {
  dashboardColumns: MsfDashboardPanelValues[][] = [];
  dashboardColumnsProperties: boolean[] = [];
  dashboardColumnsReAppendCharts: boolean[] = [];
  options: any[] = [];

  columnToUpdate: number;
  rowToUpdate: number;
  screenHeight: string;

  displayAddPanel: boolean = false;

  displayContextMenu: boolean = false;
  contextMenuX: number = 0;
  contextMenuY: number = 0;
  contextMenuItems: any;
  contextParentPanel: MsfDashboardPanelValues;

  isAmChartWithMultipleSeries: boolean[] = [
    true,     // Bars
    true,     // Horizontal Bars
    false,    // Simple Bars
    false,    // Simple Horizontal Bars
    true,     // Stacked Bars
    true,     // Horizontal Stacked Bars
    false,    // Funnel
    true,     // Lines
    true,     // Area
    true,     // Stacked Area
    false,    // Pie
    false,    // Donut
    false,    // Information
    false,    // Simple Form
    false,    // Table
    false,    // Map
    false,    // Heat Map
    false     // Map Tracker
  ];

  heightValues:any[] = [
    { value: 1, name: 'Small' },
    { value: 3, name: 'Medium' },
    { value: 6, name: 'Large' },
    { value: 12, name: 'Very Large' }
  ];

  @Input()
  currentDashboardMenu: any;

  @ViewChild("dashboardControlPanel")
  dashboardControlPanel: MsfDashboardControlPanelComponent;

  controlPanelOpen: boolean;
  controlVariablesAvailable: any[] = [];
  controlPanelVariables: CategoryArguments[];
  hiddenCategoriesTitle: any[] = [];
  categoryTitles: any[] = [];
  currentHiddenCategories: any;

  // variables for panel resizing
  currentColumn: number;
  resizePanel: boolean;
  leftPanel: any;
  rightPanel: any;

  constructor(public globals: Globals, private service: ApplicationService,
    public dialog: MatDialog)
  {
    if (globals.isFullscreen)
      this.screenHeight = "100%";
    else
      this.screenHeight = "calc(100% - 90px)";
  }

  ngOnInit()
  {
  }

  ngAfterViewInit()
  {
    this.globals.isLoading = true;

    this.service.getMenuForDashboardString (this, this.globals.currentApplication.id,
      this.addDataForms, this.handlerError);
  }

  ngOnChanges(changes: SimpleChanges)
  {
    if (changes['currentDashboardMenu'] && this.options.length != 0)
    {
      // replace dashboard panels if the menu has changed and we're still on the dashboard
      this.controlPanelVariables = null;
      this.dashboardColumns.splice (0, this.dashboardColumns.length);
      this.dashboardColumnsProperties.splice (0, this.dashboardColumnsProperties.length);
      this.dashboardColumnsReAppendCharts.splice (0, this.dashboardColumnsReAppendCharts.length);

      if (this.currentDashboardMenu != null)
      {
        this.globals.isLoading = true;
        this.service.getDashboardPanels (this, this.currentDashboardMenu.id,
          this.loadDashboardPanels, this.handlerError);
      }

      this.dashboardControlPanel.removeControlVariables ();
      this.controlVariablesAvailable = [];
      this.categoryTitles = [];
      this.controlPanelOpen = false;
    }
  }

  updateAllPanels(): void
  {
    this.controlPanelVariables = JSON.parse (JSON.stringify (this.dashboardControlPanel.controlVariables));
  }

  hideCategoryFromCharts(categoryTitle): void
  {
    for (let hiddenCategoryTitle of this.hiddenCategoriesTitle)
    {
      if (categoryTitle.name === hiddenCategoryTitle)
      {
        this.hiddenCategoriesTitle.splice (this.hiddenCategoriesTitle.indexOf (hiddenCategoryTitle), 1);
        this.currentHiddenCategories = JSON.parse (JSON.stringify (this.hiddenCategoriesTitle));
        return;
      }
    }

    this.hiddenCategoriesTitle.push (categoryTitle.name);
    this.currentHiddenCategories = JSON.parse (JSON.stringify (this.hiddenCategoriesTitle));
  }

  // store any data form depending of the selected dashboard from menu
  addDataForms(_this, data): void
  {
    let optionIds = [];

    for (let columnConfig of data)
    {
      _this.options.push (
      {
        id: columnConfig.id,
        name: columnConfig.string,
        nameSearch: columnConfig.stringSearch,
        baseUrl: columnConfig.url,
        drillDownOptions: [],
        tabType: columnConfig.tabType,
        metaData: columnConfig.metaData,
        columnOptions: null
      });

      optionIds.push (columnConfig.id);
    }

    // set drill down for each option
    _this.service.getDrillDownOptions (_this, optionIds,
      _this.setDrillDownOptions, _this.handlerError);
  }

  addWebServicesMeta(_this, data): void
  {
    for (let option of _this.options)
    {
      for (let columnOptions of data)
      {
        if (columnOptions[0].optionId == option.id)
        {
          option.columnOptions = columnOptions;
          break;
        }
      }
    }

    // get dashboard panels after getting the data forms
    _this.service.getDashboardPanels (_this, _this.currentDashboardMenu.id,
      _this.loadDashboardPanels, _this.handlerError);
  }

  setDrillDownOptions(_this, data): void
  {
    let optionIds = [];

    for (let drillDown of data)
    {
      for (let i = 0; i < _this.options.length; i++)
      {
        if (drillDown.parentOptionId == _this.options[i].id)
        {
          _this.options[i].drillDownOptions.push (drillDown);
          break;
        }
      }
    }

    for (let option of _this.options)
      optionIds.push (option.id);

    _this.service.getWebServicesMeta (_this, optionIds,
      _this.addWebServicesMeta, _this.handlerError);
  }

  getOption(dashboardPanelOption)
  {
    if (dashboardPanelOption != null)
    {
      for (let option of this.options)
      {
        if (option.id == dashboardPanelOption.id)
          return option;
      }
    }

    return null;
  }

  isMatIcon(icon): boolean
  {
    return !icon.endsWith (".png");
  }

  getImageIcon(controlVariable, hover): string
  {
    let newurl, filename: string;
    let path: string[];
    let url;

    if (this.isMatIcon (controlVariable.icon))
      return controlVariable.icon;

    url = controlVariable.icon;
    path = url.split ('/');
    filename = path.pop ().split ('?')[0];
    newurl = "";

    // recreate the url with the theme selected
    for (let dir of path)
      newurl += dir + "/";

    if (hover)
      newurl += this.globals.theme + "-hover-" + filename;
    else
      newurl += this.globals.theme + "-" + filename;

    return newurl;
  }

  loadDashboardPanels(_this, data): void
  {
    let dashboardPanelIds: number[] = [];
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
        _this.dashboardColumnsReAppendCharts.push (false);
        dashboardRows = [];
      }

      // add required global control variables if available
      if (dashboardPanel.categoryOptions)
      {
        let categoryOptions: CategoryArguments[] = JSON.parse (dashboardPanel.categoryOptions);
        let lastCategoryOption;

        for (let categoryOption of categoryOptions)
        {
          let exists: boolean = false;

          for (let controlVariable of _this.controlVariablesAvailable)
          {
            if (categoryOption.id == controlVariable.id)
            {
              exists = true;

              for (let i = 0; i < controlVariable.arguments.length; i++)
              {
                // copy some values and visible attribute if the argument didn't have them
                if (!controlVariable.arguments[i].visibleAttribute)
                  controlVariable.arguments[i].visibleAttribute = categoryOption.arguments[i].visibleAttribute;

                if (!controlVariable.arguments[i].value1)
                  controlVariable.arguments[i].value1 = categoryOption.arguments[i].value1;

                if (!controlVariable.arguments[i].value2)
                  controlVariable.arguments[i].value2 = categoryOption.arguments[i].value2;

                if (!controlVariable.arguments[i].value3)
                  controlVariable.arguments[i].value3 = categoryOption.arguments[i].value3;
              }

              break;
            }
            else if (categoryOption.label === controlVariable.label)
            {
              // avoid repeating category arguments with the same label but different id,
              // instead copy the arguments that are not in the added one
              exists = true;

              for (let newArgs of categoryOption.arguments)
              {
                let argexists = false;

                for (let args of controlVariable.arguments)
                {
                  if (newArgs.id == args.id || newArgs.label1 === args.label1 || newArgs.title === args.title)
                  {
                    argexists = true;
                    break;
                  }
                }

                if (!argexists)
                  controlVariable.arguments.push (JSON.parse (JSON.stringify (newArgs)));
              }

              break;
            }
          }

          if (exists)
            continue;

          _this.controlVariablesAvailable.push (JSON.parse (JSON.stringify (categoryOption)));
          lastCategoryOption = _this.controlVariablesAvailable[_this.controlVariablesAvailable.length - 1];
          lastCategoryOption.isMatIcon = _this.isMatIcon (lastCategoryOption.icon);
          lastCategoryOption.iconHover = _this.getImageIcon (lastCategoryOption, true);
          lastCategoryOption.icon = _this.getImageIcon (lastCategoryOption, false);
          lastCategoryOption.optionId = dashboardPanel.option.id;
        }
      }

      // get the title results from the lastest response if the panel is a chart type with multiple series
      if (_this.isAmChartWithMultipleSeries[dashboardPanel.chartType] && dashboardPanel.lastestResponse)
      {
        let lastestResponse = JSON.parse (dashboardPanel.lastestResponse);

        for (let filter of lastestResponse.filter)
        {
          let exist: boolean = false;

          for (let categoryTitle of _this.categoryTitles)
          {
            if (categoryTitle.name === filter.valueAxis)
            {
              exist = true;
              break;
            }
          }

          if (exist)
            continue;

          _this.categoryTitles.push ({ name: filter.valueAxis });
        }
      }

      dashboardPanelIds.push (dashboardPanel.id);
      dashboardRows.push (new MsfDashboardPanelValues (_this.options, dashboardPanel.title,
        dashboardPanel.id, dashboardPanel.width, _this.heightValues[dashboardPanel.height],
        _this.getOption (dashboardPanel.option), dashboardPanel.analysis, dashboardPanel.xaxis,
        dashboardPanel.values, dashboardPanel.function, dashboardPanel.chartType,
        dashboardPanel.categoryOptions, dashboardPanel.lastestResponse,
        dashboardPanel.paletteColors, dashboardPanel.updateTimeInterval,
        dashboardPanel.row, dashboardPanel.thresholds));
    }

    // add the last dashboard column
    dashboardRows.sort (function(e1, e2) {
      return e1.row - e2.row;
    });

    _this.dashboardColumns.push (dashboardRows);
    _this.dashboardColumnsProperties.push (false);
    _this.dashboardColumnsReAppendCharts.push (false);

    _this.service.getAllChildPanels (_this, dashboardPanelIds, _this.setChildPanels, _this.handlerError);
  }

  setChildPanels(_this, data): void
  {
    let drillDownInfo: any[] = [];
    let childPanelNames: any[] = [];

    drillDownInfo = data.drillDownInfo;
    childPanelNames = data.childPanelNames;
    if (!drillDownInfo.length)
    {
      // we're done if there are no child panels
      _this.globals.isLoading = false;
      return;
    }

    for (let i = 0; i < _this.dashboardColumns.length; i++)
    {
      let dashboardRows = _this.dashboardColumns[i];

      for (let j = 0; j < dashboardRows.length; j++)
      {
        let panel = dashboardRows[j];

        for (let k = 0; k < drillDownInfo.length; k++)
        {
          if (panel.id == drillDownInfo[k].dashboardPanelId)
          {
            panel.childPanels.push ({
              id: drillDownInfo[k].drillDownId,
              title: childPanelNames[k]
            });
          }
        }
      }
    }

    _this.globals.isLoading = false;
  }

  handlerError(_this, result): void
  {
    console.log (result);

    _this.globals.isLoading = false;
  }

  removePanel(column, row): void
  {
    this.service.confirmationDialog (this, "Are you sure you want to delete this panel?",
      function (_this)
      {
        let dashboardPanels: MsfDashboardPanelValues[];
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

  toggleDisplayAddPanel(): void
  {
    this.displayAddPanel = !this.displayAddPanel;
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
      dashboardRows.push (new MsfDashboardPanelValues (_this.options, dashboardPanel.title, dashboardPanel.id,
        dashboardPanels[0].width, _this.heightValues[dashboardPanels[0].height]));
    }

    _this.dashboardColumns.push (dashboardRows);
    _this.displayAddPanel = false;
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
      dashboardColumn.push (new MsfDashboardPanelValues (_this.options, dashboardPanel.title, dashboardPanel.id,
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
      _this.service.deleteDashboardColumn (_this, _this.currentDashboardMenu.id,
        _this.columnToUpdate, _this.deleteColumn, _this.handlerError);
    }
    else
      _this.globals.isLoading = false;
  }

  deleteColumn (_this): void
  {
    _this.dashboardColumns.splice (_this.columnToUpdate, 1);
    _this.dashboardColumnsProperties.splice (_this.columnToUpdate, 1);
    _this.dashboardColumnsReAppendCharts.splice (_this.columnToUpdate, 1);
    _this.globals.isLoading = false;
  }

  // update the dashboard container and hide the menu after
  // adding a new panel column
  addPanel(numPanels): void
  {
    let panelsToAdd, width, column;

    panelsToAdd = [];
    column = this.dashboardColumns.length;
    width = 100 / numPanels;

    for (let i = 0; i < numPanels; i++)
    {
      // set the properties for each panel before adding it into the database
      panelsToAdd.push (
      {
        'dashboardMenuId' : this.currentDashboardMenu.id,
        'row' : i,
        'column' : column,
        'title' : "New Panel",
        'height' : 0,
        'width' : width
      });
    }

    this.globals.isLoading = true;
    this.service.createDashboardPanel (this, panelsToAdd, this.insertPanels, this.handlerError);
  }

  addPanelInColumn(column, numPanels): void
  {
    let dashboardColumns = this.dashboardColumns[column];
    let panelsToAdd, width;

    panelsToAdd = [];
    width = 100 / (dashboardColumns.length + numPanels);

    for (let i = 0; i < numPanels; i++)
    {
      // set the properties for each panel before adding it into the database
      panelsToAdd.push (
      {
        'dashboardMenuId' : this.currentDashboardMenu.id,
        'row' : i,
        'column' : column,
        'title' : "New Panel",
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

  getHeight(column): number
  {
    return this.dashboardColumns[column][0].calculatedHeight;
  }

  changePanelHeight(column, index): void
  {
    let dashboardColumn = this.dashboardColumns[column];
    let i, calculatedHeight;
    let dashboardIds = [];
  
    calculatedHeight = 303 + ((this.dashboardColumns[column][0].height.value - 1) * 15);

    for (i = 0; i < dashboardColumn.length; i++)
    {
      dashboardIds.push (dashboardColumn[i].id);

      if (i >= 1)
        dashboardColumn[i].height = dashboardColumn[0].height;

      dashboardColumn[i].calculatedHeight = calculatedHeight;
    }

    // this.globals.isLoading = true;
    this.service.updateDashboardPanelHeight (this, dashboardIds, this.heightValues.indexOf (index), this.handlerSuccess, this.handlerError);
  }

  rowSwapSucess(_this): void
  {
    if (_this.currentColumn != null)
      _this.dashboardColumnsReAppendCharts[_this.currentColumn] = false;

    console.log ("The changes to the dashboard were successful.");
  }

  rowSwapError(_this): void
  {
    if (_this.currentColumn != null)
      _this.dashboardColumnsReAppendCharts[_this.currentColumn] = false;
  }

  handlerSuccess(_this): void
  {
    if (_this.currentColumn != null)
      _this.dashboardColumnsReAppendCharts[_this.currentColumn] = false;

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

    this.dashboardColumnsReAppendCharts[this.currentColumn] = true;
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

    this.disableContextMenu ();
  }

  swapPanelRowPositions(event: CdkDragDrop<MsfDashboardPanelValues[]>, dashboardColumn, columnIndex): void
  {
    let newPanelPos = [];

    // reappend the chart div element to the chart container of each panel in the specified
    // column as a workaround to a bug that causes the chart resizing sensor to stop working
    // after dragging the panels
    this.currentColumn = columnIndex;
    this.dashboardColumnsReAppendCharts[columnIndex] = true;

    // do not perform query if the panels are now swapped
    if (event.previousIndex == event.currentIndex)
    {
      setTimeout (() => {
        this.dashboardColumnsReAppendCharts[this.currentColumn] = false;
      }, 100);

      return;
    }

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
    this.service.setDashboardPanelRowPositions (this, newPanelPos, this.rowSwapSucess, this.rowSwapError);
  }

  onrightClick(event, dashboardColumn, rowindex): boolean
  {
    event.stopPropagation ();

    if (!dashboardColumn[rowindex].chartClicked)
    {
      this.displayContextMenu = false;
      return true;
    }

    this.contextMenuItems = dashboardColumn[rowindex].childPanels;
    if (!this.contextMenuItems.length)
    {
      // do not display drill down context menu if there are no child panels
      this.disableContextMenu ();
      return true;
    }

    this.contextMenuX = event.clientX;
    this.contextParentPanel = dashboardColumn[rowindex];

    if (this.globals.isFullscreen)
      this.contextMenuY = event.clientY;
    else
      this.contextMenuY = event.clientY - 90;

    // prevent context menu from appearing
    dashboardColumn[rowindex].chartClicked = false;
    this.displayContextMenu = true;
    return false;
  }

  disableContextMenu(): void
  {
    this.displayContextMenu = false;
    this.contextMenuItems = null;
  }

  // make sure that the context menu is fully visible
  getContextMenuPosX(): number
  {
    var clientWidth = document.getElementById ('msf-dashboard-panel-context-menu-container').clientWidth;

    if (this.contextMenuX + clientWidth > window.innerWidth)
      return window.innerWidth - clientWidth;

    return this.contextMenuX;
  }

  getContextMenuPosY(): number
  {
    var clientHeight = document.getElementById ('msf-dashboard-panel-context-menu-container').clientHeight;
    var heightOffset = 0;

    if (!this.globals.isFullscreen)
      heightOffset = 90;

    if (this.contextMenuY + clientHeight > window.innerHeight - heightOffset)
      return this.contextMenuY - clientHeight;

    return this.contextMenuY;
  }

  displayChildPanel(contextDrillDownId): void
  {
    this.dialog.open (MsfDashboardChildPanelComponent, {
      height: '600px',
      width: '800px',
      panelClass: 'msf-dashboard-child-panel-dialog',
      data: {
        options: this.options,
        parentPanelId: this.contextParentPanel.id,
        drillDownId: contextDrillDownId,
        currentOptionCategories: this.contextParentPanel.currentOptionCategories,
        currentOptionBaseUrl: this.contextParentPanel.currentOption.baseUrl,
        parentCategory: (this.contextParentPanel.currentChartType.flags & ChartFlags.XYCHART ? this.contextParentPanel.xaxis : this.contextParentPanel.variable),
        secondaryParentCategory: (this.contextParentPanel.currentChartType.flags & ChartFlags.XYCHART ? this.contextParentPanel.variable : null),
        categoryFilter: this.contextParentPanel.chartObjectSelected,
        secondaryCategoryFilter: this.contextParentPanel.chartSecondaryObjectSelected
      }
    });
  }

  columnSwapSucess(_this): void
  {
    for (let i = 0; i < _this.dashboardColumns.length; i++)
      _this.dashboardColumnsReAppendCharts[i] = false;

    console.log ("The changes to the dashboard were successful.");
  }

  columnSwapError(_this): void
  {
    for (let i = 0; i < _this.dashboardColumns.length; i++)
      _this.dashboardColumnsReAppendCharts[i] = false;
  }

  swapColumnPositions(event: CdkDragDrop<MsfDashboardPanelValues[]>): void
  {
    let newColumnPos = [];
    let i;

    // reappend the chart div elements of every panel
    for (i = 0; i < this.dashboardColumns.length; i++)
      this.dashboardColumnsReAppendCharts[i] = true;

    // do not perform query if the columns are now swapped
    if (event.previousIndex == event.currentIndex)
      return;

    // move items
    moveItemInArray (this.dashboardColumns, event.previousIndex, event.currentIndex);
    moveItemInArray (this.dashboardColumnsProperties, event.previousIndex, event.currentIndex);
    moveItemInArray (this.dashboardColumnsReAppendCharts, event.previousIndex, event.currentIndex);

    // update the database the new column positions
    for (i = 0; i < this.dashboardColumns.length; i++)
    {
      let dashboardColumn = this.dashboardColumns[i];

      // swap column position by swapping the dashboard ids
      for (let j = 0; j < dashboardColumn.length; j++)
      {
        newColumnPos.push ({
          id: dashboardColumn[j].id,
          column : i
        });
      }
    }

    // this.globals.isLoading = true;
    this.service.setDashboardColumnPositions (this, newColumnPos,
      this.columnSwapSucess, this.columnSwapError);
  }

  cancelLoading(dashboardPanel): void
  {
    dashboardPanel.isLoading = false;
  }

  toggleControlPanel(): void
  {
    this.controlPanelOpen = !this.controlPanelOpen;
  }
}
