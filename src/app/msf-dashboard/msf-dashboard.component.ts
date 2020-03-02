import { Component, HostListener, OnInit, Input, SimpleChanges, ViewChild, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Globals } from '../globals/Globals';
import { MsfDashboardPanelValues } from '../msf-dashboard-panel/msf-dashboard-panelvalues';
import { ApplicationService } from '../services/application.service';
import { MsfDashboardChildPanelComponent } from '../msf-dashboard-child-panel/msf-dashboard-child-panel.component';
import { ChartFlags } from '../msf-dashboard-panel/msf-dashboard-chartflags';
import { MsfDashboardControlPanelComponent } from '../msf-dashboard-control-panel/msf-dashboard-control-panel.component';
import { CategoryArguments } from '../model/CategoryArguments';

// dashboard gridstack constants
const maxDashboardWidth = 12;
const defaultPanelHeight = 8;
const defaultPanelWidth = 4;
const minPanelWidth = 3;

@Component({
  selector: 'app-msf-dashboard',
  templateUrl: './msf-dashboard.component.html'
})
export class MsfDashboardComponent implements OnInit {
  options: any[] = [];

  columnToUpdate: number;
  rowToUpdate: number;
  screenHeight: string;

  displayContextMenu: boolean = false;
  contextMenuX: number = 0;
  contextMenuY: number = 0;
  contextMenuItems: any;
  contextParentPanel: MsfDashboardPanelValues;

  dashboardPanels: MsfDashboardPanelValues[] = [];
  newDashboardPanel: boolean = false;
  loadingDashboard: boolean = false;
  gridStackOptions: any = {
    animate: true,
    cellHeight: 30,
    draggable: {
      handle: ".msf-dashboard-button-move-icon"
    },
    resizable: {
      autoHide: true,
      handles: 'se'
    }
  };

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

  heightValues: any[] = [
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
  hiddenCategoriesValues: any[] = [];
  controlPanelCategories: any[] = [];
  currentHiddenCategories: any;

  // variables for panel resizing
  currentColumn: number;
  resizePanel: boolean;
  leftPanel: any;
  rightPanel: any;

  controlVariableDialogOpen: boolean = false;

  constructor(public globals: Globals, private service: ApplicationService,
    public dialog: MatDialog, private changeDetector: ChangeDetectorRef)
  {
    if (globals.isFullscreen)
      this.screenHeight = "100%";
    else
      this.screenHeight = "calc(100% - 90px)";

    this.globals.showPaginator = false; // hide paginator
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
      this.dashboardPanels.splice (0, this.dashboardPanels.length);

      if (this.currentDashboardMenu != null)
      {
        this.globals.isLoading = true;
        this.service.getDashboardPanels (this, this.currentDashboardMenu.id,
          this.loadDashboardPanels, this.handlerError);
      }

      this.dashboardControlPanel.removeControlVariables ();
      this.controlVariablesAvailable = [];
      this.controlPanelCategories = [];
      this.controlPanelOpen = false;
    }
  }

  updateAllPanels(): void
  {
    this.controlPanelVariables = JSON.parse (JSON.stringify (this.dashboardControlPanel.controlVariables));
  }

  hideCategoryFromCharts(category): void
  {
    for (let hiddenCategoryValue of this.hiddenCategoriesValues)
    {
      if (category.name === hiddenCategoryValue.name && category.variable.toLowerCase () === hiddenCategoryValue.variable.toLowerCase ()) 
      {
        this.hiddenCategoriesValues.splice (this.hiddenCategoriesValues.indexOf (hiddenCategoryValue), 1);
        this.currentHiddenCategories = JSON.parse (JSON.stringify (this.hiddenCategoriesValues));
        return;
      }
    }

    this.hiddenCategoriesValues.push ({
      name: category.name,
      variable: category.variable
    });

    this.currentHiddenCategories = JSON.parse (JSON.stringify (this.hiddenCategoriesValues));
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
          option.columnOptions.sort (function (a1, a2) {
            return a1.columnOrder - a2.columnOrder;
          });
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

    dashboardPanels = data;
    if (!dashboardPanels.length)
    {
      // we're done if there are no existing dashboard panels
      _this.globals.isLoading = false;
      return;
    }

    _this.loadingDashboard = true;

    for (let dashboardPanel of dashboardPanels)
    {
      // TODO: Convert old dashboard panels to the flexible format
      dashboardPanelIds.push (dashboardPanel.id);
      _this.dashboardPanels.push (new MsfDashboardPanelValues (_this.options, dashboardPanel.title,
        dashboardPanel.id, _this.dashboardPanels.length, dashboardPanel.x, dashboardPanel.y, dashboardPanel.width,
        dashboardPanel.height, _this.getOption (dashboardPanel.option), dashboardPanel.analysis, dashboardPanel.xaxis,
        dashboardPanel.values, dashboardPanel.function, dashboardPanel.chartType,
        dashboardPanel.categoryOptions, dashboardPanel.lastestResponse,
        dashboardPanel.paletteColors, dashboardPanel.updateTimeInterval,
        dashboardPanel.row, dashboardPanel.thresholds, dashboardPanel.vertAxisName,
        dashboardPanel.horizAxisName, dashboardPanel.advIntervalValue,
        dashboardPanel.startAtZero, dashboardPanel.limitMode,
        dashboardPanel.limitAmount, dashboardPanel.ordered,
        dashboardPanel.valueList, dashboardPanel.minValueRange,
        dashboardPanel.maxValueRange, dashboardPanel.goals));
    }

    _this.changeDetector.detectChanges ();
    _this.loadingDashboard = false;
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

    for (let panel of _this.dashboardPanels)
    {
      for (let i = 0; i < drillDownInfo.length; i++)
      {
        if (panel.id == drillDownInfo[i].dashboardPanelId)
        {
          panel.childPanels.push ({
            id: drillDownInfo[i].drillDownId,
            title: childPanelNames[i],
            childPanelId: drillDownInfo[i].childPanelId
          });
        }
      }
    }

    _this.globals.isLoading = false;
  }

  handlerError(_this, result): void
  {
    _this.globals.isLoading = false;
  }

  removePanel(gridId: number): void
  {
    this.service.confirmationDialog (this, "Are you sure you want to delete this panel?",
      function (_this)
      {
        let dashboardPanels: MsfDashboardPanelValues[];
        let dashboardPanel, defaultWidth;
    
        // dashboardPanels = _this.dashboardColumns[column];
    
        // _this.columnToUpdate = column;
        // _this.rowToUpdate = row;
        // dashboardPanel = dashboardPanels[row];

        // reset panel width to avoid mess after deleting one
        if (dashboardPanels.length == 1)
          defaultWidth = 0;
        else
          defaultWidth = 100 / (dashboardPanels.length - 1);

        _this.globals.isLoading = true;
        _this.service.deleteDashboardPanel (_this, dashboardPanel.id,
          _this.deleteRowPanel, _this.handlerError);
      });
  }

  addPanelSuccess(_this, data): void
  {
    _this.dashboardPanels[_this.dashboardPanels.length - 1].id = data.id; // set id for new panel
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
    _this.changeDetector.detectChanges ();
  }

  addPanel(): void
  {
    let newx, newy, lasth;

    this.globals.isLoading = true;
    this.newDashboardPanel = true;
    newx = 0;
    newy = 0;
    lasth = 0;

    // get coordinates to add new dashboard panel
    for (let i = 0; i < this.dashboardPanels.length; i++)
    {
      let panel = this.dashboardPanels[i];

      newx += panel.width;

      if (panel.height > lasth)
        lasth = panel.height;

      if (newx + defaultPanelWidth > maxDashboardWidth)
      {
        newx = 0;
        newy += lasth;
      }

      panel.gridId = i;  // reset panel id
    }

    this.dashboardPanels.push (new MsfDashboardPanelValues (this.options, "New Panel", null, this.dashboardPanels.length,
      newx, newy, defaultPanelWidth, defaultPanelHeight));

    this.changeDetector.detectChanges ();
    this.newDashboardPanel = false;
  }

  changePanelHeight(column, index): void
  {
    let dashboardColumn = this.dashboardPanels[column];
    let i, calculatedHeight;
    let dashboardIds = [];
  
    calculatedHeight = 323 + ((this.dashboardPanels[0].height.value - 1) * 15);

    // this.globals.isLoading = true;
  }

  positionUpdated(_this): void
  {
    // if (_this.currentColumn != null)
      // _this.dashboardColumnsReAppendCharts[_this.currentColumn] = false;
  }

  positionError(_this): void
  {
    // if (_this.currentColumn != null)
      // _this.dashboardColumnsReAppendCharts[_this.currentColumn] = false;
  }

  handlerSuccess(_this): void
  {
    if (_this.currentColumn != null)
      _this.dashboardColumnsReAppendCharts[_this.currentColumn] = false;

    // _this.globals.isLoading = false;
  }

  saveResizedPanels(): void
  {
    let dashboardIds = [];

    // update the database to save changes
    for (let i = 0; i < this.dashboardPanels.length; i++)
    {
      let dashboardPanel = this.dashboardPanels[i];

      dashboardIds.push ({
        id: dashboardPanel.id,
        width: dashboardPanel.width
      });
    }

    // this.globals.isLoading = true;
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

  getHoverCursor(): string
  {
    // Use column resize while dragging the panels
    if (this.resizePanel)
      return "col-resize";

    return "inherit";
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
  }

  columnSwapError(_this): void
  {
    for (let i = 0; i < _this.dashboardColumns.length; i++)
      _this.dashboardColumnsReAppendCharts[i] = false;
  }

  cancelLoading(dashboardPanel): void
  {
    dashboardPanel.isLoading = false;
  }

  toggleControlPanel(): void
  {
    this.controlPanelOpen = !this.controlPanelOpen;
  }

  removeDeadVariablesAndCategories(panel): void
  {
    // first remove the dead categories
    if (this.isAmChartWithMultipleSeries[panel.type])
    {
      // check if category exists
      for (let curCategory of this.controlPanelCategories)
      {
        if (curCategory.name.toLowerCase () === panel.analysisName.toLowerCase ())
        {
          for (let series of panel.chartSeries)
          {
            for (let curCategoryValue of curCategory.values)
            {
              if (curCategoryValue.name === series.name)
              {
                curCategoryValue.count--;
                if (!curCategoryValue.count)
                  curCategory.values.splice (curCategory.values.indexOf (curCategoryValue, 1));

                break;
              }
            }
          }

          curCategory.count--;
          if (!curCategory.count)
            this.controlPanelCategories.splice (this.controlPanelCategories.indexOf (curCategory), 1);
        }
      }

      // refresh dashboard control panel categories
      this.controlPanelCategories = JSON.parse (JSON.stringify (this.controlPanelCategories));
    }

    // then the control variables
    this.changeDetector.detectChanges ();
  }

  addNewVariablesAndCategories(panel): void
  {
    // get the title results if the panel is a chart type with multiple series
    if (this.isAmChartWithMultipleSeries[panel.type])
    {
      let category;

      // check if category exists
      for (let curCategory of this.controlPanelCategories)
      {
        if (curCategory.name.toLowerCase () === panel.analysisName.toLowerCase ())
        {
          category = curCategory;
          break;
        }
      }

      if (!category)
      {
        this.controlPanelCategories.push ({
          name: panel.analysisName,
          values: [],
          count: 1
        });

        category = this.controlPanelCategories[this.controlPanelCategories.length - 1];
      }
      else
        category.count++;

      for (let series of panel.chartSeries)
      {
        let exist: boolean = false;

        for (let curCategory of category.values)
        {
          if (curCategory.name === series.name)
          {
            curCategory.count++;
            exist = true;
            break;
          }
        }

        if (exist)
          continue;

        category.values.push ({
          name: series.name,
          checked: true,
          count: 1
        });
      }

      // refresh dashboard control panel categories
      this.controlPanelCategories = JSON.parse (JSON.stringify (this.controlPanelCategories));
    }

    // add new control variables into the control panel
    if (panel.controlVariables)
    {
      let categoryOptions: CategoryArguments[] = panel.controlVariables;
      let lastCategoryOption;

      for (let categoryOption of categoryOptions)
      {
        let exists: boolean = false;

        for (let controlVariable of this.controlVariablesAvailable)
        {
          if (categoryOption.id == controlVariable.id)
          {
            exists = true;

            for (let i = 0; i < controlVariable.arguments.length; i++)
            {
              // copy some values and visible attribute if the argument didn't have them
              if (!controlVariable.arguments[i].visibleAttribute)
              {
                if (categoryOption.arguments[i].visibleAttribute)
                  controlVariable.arguments[i].visibleAttribute = categoryOption.arguments[i].visibleAttribute;
              }

              if (!controlVariable.arguments[i].value1)
                controlVariable.arguments[i].value1 = categoryOption.arguments[i].value1;

              if (!controlVariable.arguments[i].value2)
                controlVariable.arguments[i].value2 = categoryOption.arguments[i].value2;

              if (!controlVariable.arguments[i].value3)
                controlVariable.arguments[i].value3 = categoryOption.arguments[i].value3;

              if (!controlVariable.arguments[i].value4)
                controlVariable.arguments[i].value4 = categoryOption.arguments[i].value4;

              if (!controlVariable.arguments[i].dateLoaded)
                controlVariable.arguments[i].dateLoaded = categoryOption.arguments[i].dateLoaded;

              if (!controlVariable.arguments[i].currentDateRangeValue)
                controlVariable.arguments[i].currentDateRangeValue = categoryOption.arguments[i].currentDateRangeValue;
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

        this.controlVariablesAvailable.push (JSON.parse (JSON.stringify (categoryOption)));
        lastCategoryOption = this.controlVariablesAvailable[this.controlVariablesAvailable.length - 1];
        lastCategoryOption.isMatIcon = this.isMatIcon (lastCategoryOption.icon);
        lastCategoryOption.iconHover = this.getImageIcon (lastCategoryOption, true);
        lastCategoryOption.icon = this.getImageIcon (lastCategoryOption, false);
        lastCategoryOption.optionId = panel.optionId;
      }
    }

    this.changeDetector.detectChanges ();
  }

  toggleControlVariableDialogOpen(enable: boolean): void
  {
    this.controlVariableDialogOpen = enable;
  }

  dashboardChanged(panels): void
  {
    if (!panels || this.loadingDashboard)
      return;

    // update panel size and positioning
    for (let item of this.dashboardPanels)
    {
      for (let panel of panels)
      {
        if (item.gridId == panel.id)
        {
          item.x = panel.x;
          item.y = panel.y;
          item.width = panel.width;
          item.height = panel.height;
          break;
        }
      }
    }

    if (this.newDashboardPanel)
    {
      let newPanel, newPanelInfo;

      newPanelInfo = this.dashboardPanels[this.dashboardPanels.length - 1];
      newPanel = {
        'dashboardMenuId' : this.currentDashboardMenu.id,
        'title' : newPanelInfo.chartName,
        'x': newPanelInfo.x,
        'y': newPanelInfo.y,
        'height' : newPanelInfo.height,
        'width' : newPanelInfo.width
      };

      this.service.createDashboardPanel (this, newPanel, this.addPanelSuccess, this.handlerError);
    }
    else
    {
      let panelsToUpdate = [];

      for (let dashboardPanel of this.dashboardPanels)
      {
        panelsToUpdate.push ({
          id: dashboardPanel.id,
          x: dashboardPanel.x,
          y: dashboardPanel.y,
          width: dashboardPanel.width,
          height: dashboardPanel.height
        });
      }

      this.service.updateDashboardPanelPositions (this, panelsToUpdate, this.positionUpdated, this.positionError);
    }
  }
}
