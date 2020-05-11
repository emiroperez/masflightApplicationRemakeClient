import { Component, OnInit, ViewChild, Input, NgZone, SimpleChanges, Output, EventEmitter, isDevMode, ChangeDetectorRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import am4geodata_northAmericaLow from "@amcharts/amcharts4-geodata/region/world/northAmericaLow";
import am4geodata_centralAmericaLow from "@amcharts/amcharts4-geodata/region/world/centralAmericaLow";
import am4geodata_southAmericaLow from "@amcharts/amcharts4-geodata/region/world/southAmericaLow";
import am4geodata_asiaLow from "@amcharts/amcharts4-geodata/region/world/asiaLow";
import am4geodata_africaLow from "@amcharts/amcharts4-geodata/region/world/africaLow";
import am4geodata_europeLow from "@amcharts/amcharts4-geodata/region/world/europeLow";
import am4geodata_oceaniaLow from "@amcharts/amcharts4-geodata/region/world/oceaniaLow";
import am4geodata_usaLow from "@amcharts/amcharts4-geodata/usaLow";
import am4geodata_colombiaLow from "@amcharts/amcharts4-geodata/colombiaLow";
import am4geodata_colombiaMuniLow from "@amcharts/amcharts4-geodata/colombiaMuniLow";
import { CategoryArguments } from '../model/CategoryArguments';
import { Globals } from '../globals/Globals';
import { Themes } from '../globals/Themes';
import { FormBuilder } from '@angular/forms';
import { MatDialog, PageEvent, MatPaginator } from '@angular/material';
import * as moment from 'moment';

import { ApiClient } from '../api/api-client';
import { Arguments } from '../model/Arguments';
import { Utils } from '../commons/utils';
import { ApplicationService } from '../services/application.service';
import { MsfDashboardInfoFunctionsComponent } from '../msf-dashboard-info-functions/msf-dashboard-info-functions.component';
import { MsfDashboardDrillDownComponent } from  '../msf-dashboard-drill-down/msf-dashboard-drill-down.component';
import { MsfShareDashboardComponent } from '../msf-share-dashboard/msf-share-dashboard.component';
import { MsfTableComponent } from '../msf-table/msf-table.component';
import { MsfDashboardPanelValues } from '../msf-dashboard-panel/msf-dashboard-panelvalues';
import { MessageComponent } from '../message/message.component';
import { ChartFlags } from '../msf-dashboard-panel/msf-dashboard-chartflags';
import { AuthService } from '../services/auth.service';
import { MsfMapComponent } from '../msf-map/msf-map.component';
import { MsfDashboardAssistantComponent } from '../msf-dashboard-assistant/msf-dashboard-assistant.component';

// AmCharts colors
const black = am4core.color ("#000000");
const comet = am4core.color ("#585869");

// SVG used for maps
const homeSVG = "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8";
const planeSVG = "m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47";
const targetSVG = "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z";

@Component({
  selector: 'app-msf-dashboard-panel',
  templateUrl: './msf-dashboard-panel.component.html'
})
export class MsfDashboardPanelComponent implements OnInit {
  utils: Utils;

  chart: any;
  chartInfo: any;

  paletteColors: any[];

  chartTypes: any[] = [
    { name: 'Bars', flags: ChartFlags.XYCHART, createSeries: this.createVertColumnSeries },
    { name: 'Horizontal Bars', flags: ChartFlags.XYCHART | ChartFlags.ROTATED, createSeries: this.createHorizColumnSeries },
    { name: 'Simple Bars', flags: ChartFlags.NONE, createSeries: this.createSimpleVertColumnSeries },
    { name: 'Simple Horizontal Bars', flags: ChartFlags.ROTATED, createSeries: this.createSimpleHorizColumnSeries },
    { name: 'Stacked Bars', flags: ChartFlags.XYCHART | ChartFlags.STACKED, createSeries: this.createVertColumnSeries },
    { name: 'Horizontal Stacked Bars', flags: ChartFlags.XYCHART | ChartFlags.ROTATED | ChartFlags.STACKED, createSeries: this.createHorizColumnSeries },
    { name: 'Funnel', flags: ChartFlags.FUNNELCHART, createSeries: this.createFunnelSeries },
    { name: 'Lines', flags: ChartFlags.XYCHART | ChartFlags.LINECHART, createSeries: this.createLineSeries },
    { name: 'Area', flags: ChartFlags.XYCHART | ChartFlags.AREACHART, createSeries: this.createLineSeries },
    { name: 'Stacked Area', flags: ChartFlags.XYCHART | ChartFlags.STACKED | ChartFlags.AREACHART, createSeries: this.createLineSeries },
    { name: 'Pie', flags: ChartFlags.PIECHART, createSeries: this.createPieSeries },
    { name: 'Donut', flags: ChartFlags.DONUTCHART, createSeries: this.createPieSeries },
    { name: 'Information', flags: ChartFlags.INFO },
    { name: 'Simple Form', flags: ChartFlags.INFO | ChartFlags.FORM },
    { name: 'Table', flags: ChartFlags.TABLE },
    { name: 'Map', flags: ChartFlags.MAP },
    { name: 'Heat Map', flags: ChartFlags.HEATMAP },
    { name: 'Map Tracker', flags: ChartFlags.MAP | ChartFlags.MAPBOX },
    { name: 'Dynamic Table', flags: ChartFlags.DYNTABLE },
    { name: 'Advanced Bars', flags: ChartFlags.XYCHART | ChartFlags.ADVANCED, createSeries: this.createVertColumnSeries },
    { name: 'Advanced Horizontal Bars', flags: ChartFlags.XYCHART | ChartFlags.ROTATED | ChartFlags.ADVANCED, createSeries: this.createHorizColumnSeries },
    { name: 'Advanced Simple Bars', flags: ChartFlags.ADVANCED, createSeries: this.createSimpleVertColumnSeries },
    { name: 'Advanced Simple Horizontal Bars', flags: ChartFlags.ROTATED | ChartFlags.ADVANCED, createSeries: this.createSimpleHorizColumnSeries },
    { name: 'Advanced Stacked Bars', flags: ChartFlags.XYCHART | ChartFlags.STACKED | ChartFlags.ADVANCED, createSeries: this.createVertColumnSeries },
    { name: 'Advanced Horizontal Stacked Bars', flags: ChartFlags.XYCHART | ChartFlags.ROTATED | ChartFlags.STACKED | ChartFlags.ADVANCED, createSeries: this.createHorizColumnSeries },
    { name: 'Advanced Lines', flags: ChartFlags.XYCHART | ChartFlags.LINECHART | ChartFlags.ADVANCED, createSeries: this.createLineSeries },
    { name: 'Simple Lines', flags: ChartFlags.LINECHART, createSeries: this.createSimpleLineSeries },
    { name: 'Advanced Simple Lines', flags: ChartFlags.LINECHART | ChartFlags.ADVANCED, createSeries: this.createSimpleLineSeries },
    { name: '(obsolete) Scatter', flags: ChartFlags.XYCHART | ChartFlags.LINECHART | ChartFlags.BULLET, createSeries: this.createLineSeries },
    { name: '(obsolete) Advanced Scatter', flags: ChartFlags.XYCHART | ChartFlags.LINECHART | ChartFlags.BULLET | ChartFlags.ADVANCED, createSeries: this.createLineSeries },
    { name: '(obsolete) Simple Scatter', flags: ChartFlags.LINECHART | ChartFlags.BULLET, createSeries: this.createSimpleLineSeries },
    { name: '(obsolete) Advanced Simple Scatter', flags: ChartFlags.LINECHART | ChartFlags.BULLET | ChartFlags.ADVANCED, createSeries: this.createSimpleLineSeries },
    { name: 'Link Image', flags: ChartFlags.INFO | ChartFlags.PICTURE },
    { name: 'Editable List', flags: ChartFlags.INFO | ChartFlags.EDITACTIONLIST },
    { name: 'Bubble Heat Map', flags: ChartFlags.HEATMAP | ChartFlags.BUBBLE },
    { name: 'Simple Vertical Lines', flags: ChartFlags.LINECHART | ChartFlags.ROTATED, createSeries: this.createSimpleVertLineSeries },
    { name: '(obsolete) Simple Vertical Scatter', flags: ChartFlags.LINECHART | ChartFlags.BULLET | ChartFlags.ROTATED, createSeries: this.createSimpleVertLineSeries },
    { name: 'Scatter', flags: ChartFlags.XYCHART | ChartFlags.BULLET, createSeries: this.createScatterSeries }
  ];

  functions: any[] = [
    { id: 'avg', name: 'Average' },
    { id: 'sum', name: 'Sum' },
    { id: 'max', name: 'Max' },
    { id: 'min', name: 'Min' },
    { id: 'count', name: 'Count' }
  ];

  nciles: number[] = [1, 2, 5, 10, 20, 25];

  fontSizes: any[] = [
    { name: 'Small', value: 12 },
    { name: 'Medium', value: 18 },
    { name: 'Large', value: 30 }
  ];

  orientations: any[] = [
    { name: 'Horizontal', value: false },
    { name: 'Vertical', value: true }
  ];

  geodatas: any[] = [
    { name: 'U.S. States', value: am4geodata_usaLow },
    { name: 'North America', value: am4geodata_northAmericaLow },
    { name: 'Central America', value: am4geodata_centralAmericaLow },
    { name: 'South America', value: am4geodata_southAmericaLow },
    { name: 'Asia', value: am4geodata_asiaLow },
    { name: 'Africa', value: am4geodata_africaLow },
    { name: 'Europe', value: am4geodata_europeLow },
    { name: 'Oceania', value: am4geodata_oceaniaLow },
    { name: 'World', value: am4geodata_worldLow },
    { name: 'Colombia Departments', value: am4geodata_colombiaLow },
    { name: 'Colombia Municipals', value: am4geodata_colombiaMuniLow }
  ];

  @Input("values")
  values: MsfDashboardPanelValues;

  @Input("panelWidth")
  panelWidth: number;

  @Input("panelHeight")
  panelHeight: number;
  displayLabel: boolean = true;

  @Input("controlPanelVariables")
  controlPanelVariables: CategoryArguments[];

  @Input("currentHiddenCategories")
  currentHiddenCategories: any;

  @Input("numPanelsInColumn")
  numPanelsInColumn: number;

  @Input("addingOrRemovingPanels")
  addingOrRemovingPanels: number;

  @Output("removeDeadVariablesAndCategories")
  removeDeadVariablesAndCategories = new EventEmitter ();

  @Output("addNewVariablesAndCategories")
  addNewVariablesAndCategories = new EventEmitter ();

  @Output("toggleControlVariableDialogOpen")
  toggleControlVariableDialogOpen  = new EventEmitter ();

  @Output("removePanel")
  removePanel = new EventEmitter ();

  @Output("enablePanelContextMenu")
  enablePanelContextMenu = new EventEmitter ();

  @Input("controlPanelInterval")
  controlPanelInterval: number;

  @Input("public")
  public: boolean = false;

  @Input("isMobile")
  isMobile: boolean = false;

  childPanelValues: any[] = [];
  childPanelsConfigured: boolean[] = [];

  oldChartType: any;
  oldVariableName: string = "";
  oldOptionCategories: any;

  updateTimeLeft: number = 60;
  updateInterval: any;

  // table variables
  @ViewChild('msfTableRef', { static: false })
  msfTableRef: MsfTableComponent;

  // map variables
  imageSeries: any;
  lineSeries: any;
  shadowLineSeries: any;
  checkedCities: any[] = [];
  checkedRoutes: any[] = [];

  // dynamic table variables
  dynTableData: any;
  dynTableOrder: number = 0;
  dynTableOrderValue: number = 0;

  actualPageNumber: number;
  dataSource: boolean = false;
  template: boolean = false;
  moreResults: boolean = false;
  moreResultsBtn: boolean = false;
  displayedColumns;
  selectedIndex = 0;
  totalRecord = 0;
  metadata;

  lastChartName: String;
  yAxisColSpan: number = 0;

  // mapbox variables
  @ViewChild('msfMapRef', { static: true })
  msfMapRef: MsfMapComponent;
  mapboxInterval: any;
  lastWidth: number;

  predefinedColumnFormats: any = {
    "short": "M/d/yy, h:mm a",
    "medium": "MMM d, yyyy, h:mm:ss a",
    "long": "MMMM d, yyyy, h:mm:ss a z",
    "full": "EEEE, MMMM d, yyyy, h:mm:ss a zzzz",
    "shortDate": "M/d/yy",
    "mediumDate": "MMM, d, yyyy",
    "longDate": "MMMM, d, yyyy",
    "fullDate": "EEEE, MMMM, d, y",
    "shortTime": "h:mm a",
    "mediumTime": "h:mm:ss a",
    "longTime": "h:mm:ss a z",
    "fullTime": "h:mm:ss a zzzz"
  };

  addUpValuesSet: boolean = false;
  sumValueAxis: any = null;
  sumSeriesList: any[] = [];
  advTableView: boolean = false;
  intervalTableRows: any[] = [];
  
  //paginator
  @ViewChild('paginator', { static: false })
  paginator: MatPaginator;

  pageIndex: any;

  pageEvent: PageEvent;

  lengthpag: any;
  pageI: any;
  pageSize: any;

  anchoredArguments: any[] = [];
  savedAnchoredArguments: any[] = [];
  displayAnchoredArguments: boolean = false;
  updateURLResults: boolean = false;

  // dashboard interface values
  controlVariablesSet: boolean = false;

  displayChart: boolean;
  displayInfo: boolean;
  displayForm: boolean;
  displayPic: boolean;
  displayTable: boolean;
  displayMapbox: boolean;
  displayDynTable: boolean;
  displayEditActionList: boolean;

  // map route values for "Network Map Route" services
  routepanelinfo: any[] = [];
  scheduleImageSeries: any = null;

  constructor(private zone: NgZone, public globals: Globals,
    private service: ApplicationService, private http: ApiClient, private authService: AuthService, public dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef, private formBuilder: FormBuilder)
  {
    this.utils = new Utils ();
  }

  ngOnInit()
  {
    // copy function list for use with the information panel
    this.values.infoFunc1 = JSON.parse (JSON.stringify (this.functions));
    this.values.infoFunc2 = JSON.parse (JSON.stringify (this.functions));
    this.values.infoFunc3 = JSON.parse (JSON.stringify (this.functions));

    this.values.style = this.msfMapRef.mapTypes[1];
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if (this.addingOrRemovingPanels)
      return;

    if (changes['controlPanelVariables'] && this.controlPanelVariables)
    {
      // validate the panel configuration before updating
      if (!this.checkPanelConfiguration ())
        return;

      // copy the dashboard control panel variables into the dashboard panel
      for (let categoryOption of this.values.currentOptionCategories)
      {
        for (let categoryOptionArgument of categoryOption.arguments)
        {
          for (let controlVariable of this.controlPanelVariables)
          {
            let found: boolean = false;

            for (let controlVariableArgument of controlVariable.arguments)
            {
              if (categoryOptionArgument.id == controlVariableArgument.id)
              {
                categoryOptionArgument.value1 = controlVariableArgument.value1;

                if (controlVariableArgument.value2)
                  categoryOptionArgument.value2 = controlVariableArgument.value2;

                if (controlVariableArgument.value3)
                  categoryOptionArgument.value3 = controlVariableArgument.value3;

                if (controlVariableArgument.value4)
                  categoryOptionArgument.value4 = controlVariableArgument.value4;

                if (controlVariableArgument.dateLoaded)
                  categoryOptionArgument.dateLoaded = controlVariableArgument.dateLoaded;

                if (controlVariableArgument.currentDateRangeValue)
                  controlVariableArgument.currentDateRangeValue = controlVariableArgument.currentDateRangeValue;

                found = true;
                break;
              }
            }

            if (found)
              break;
          }
        }
      }

      setTimeout (() =>
      {
        this.loadData ();
      }, 10);
    }
    else if (changes['controlPanelInterval'])
    {
      // validate the panel configuration before updating
      if (!this.checkPanelConfiguration ())
        return;

      // copy the update interval
      if (this.controlPanelInterval)
      {
        this.values.updateIntervalSwitch = true;
        this.values.updateTimeLeft = this.controlPanelInterval;
      }
      else
      {
        this.values.updateIntervalSwitch = false;
        this.values.updateTimeLeft = 0;
      }

      setTimeout (() =>
      {
        this.loadData ();
      }, 10);
    }
    else if (changes['panelWidth'])
    {
      if (this.values.currentChartType.flags & ChartFlags.MAPBOX && this.displayMapbox)
        this.msfMapRef.resizeMap();

    }
    else if (changes['panelHeight'])
    {
      if (this.values.currentChartType.flags & ChartFlags.MAPBOX && this.displayMapbox)
        this.msfMapRef.resizeMap ();
    }
    else if (changes['currentHiddenCategories'])
    {
      for (let series of this.values.chartSeries)
      {
        let hidden: boolean = false;

        if (this.values.variable)
        {
          for (let hiddenCategory of this.currentHiddenCategories)
          {
            if (hiddenCategory.name === series.name && hiddenCategory.variable.toLowerCase () === this.values.variable.name.toLowerCase ())
            {
              hidden = true;
              break;
            }
          }
        }

        if (hidden)
          series.hide ();
        else
          series.show ();
      }
    }
    else if (changes['isMobile'])
    {
      if (this.chart)
      {
        this.zone.runOutsideAngular (() => {
          if (this.isMobile)
          {
            this.chart.scrollbarX = null;
            this.chart.scrollbarY = null;
          }
          else
          {
            if (!(this.values.currentChartType.flags & ChartFlags.PIECHART || this.values.currentChartType.flags & ChartFlags.FUNNELCHART
              || this.values.currentChartType.flags & ChartFlags.MAP || this.values.currentChartType.flags & ChartFlags.HEATMAP))
            {
              // recreate scrollbar
              if (this.chart.data.length > 1)
              {
                let theme = this.globals.theme;

                if (this.values.currentChartType.flags & ChartFlags.BULLET)
                {
                  this.chart.scrollbarX = new am4core.Scrollbar ();
                  this.chart.scrollbarX.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
                  this.chart.scrollbarY = new am4core.Scrollbar ();
                  this.chart.scrollbarY.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
                }
                else
                {
                  if (this.values.currentChartType.flags & ChartFlags.ROTATED)
                  {
                    this.chart.scrollbarY = new am4core.Scrollbar ();
                    this.chart.scrollbarY.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
                  }
                  else
                  {
                    this.chart.scrollbarX = new am4core.Scrollbar ();
                    this.chart.scrollbarX.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
                  }
                }
              }
            }
          }
        });
      }
    }
  }

  // Function to create horizontal column chart series
  createHorizColumnSeries(values, stacked, chart, item, parseDate, theme, outputFormat, paletteColors): void
  {
    // Set up series
    let series = chart.series.push (new am4charts.ColumnSeries ());

    series.name = item.valueAxis;
    series.dataFields.valueX = item.valueField;

    // Parse date if available
    if (parseDate)
    {
      series.dataFields.dateY = values.xaxis.id;
      series.dateFormatter.dateFormat = outputFormat;

      if (values.valueColumn.item.columnType === "number")
        series.columns.template.tooltipText = "{dateY} ({name}): " + (values.valueColumn.item.prefix ? values.valueColumn.item.prefix : "") + "{valueX}" + (values.valueColumn.item.suffix ? values.valueColumn.item.suffix : "");
      else
        series.columns.template.tooltipText = "{dateY} ({name}): {valueX}";
    }
    else
    {
      if (values.currentChartType.flags & ChartFlags.ADVANCED)
      {
        series.dataFields.categoryY = "Interval";
        series.columns.template.tooltipText = item.valueAxis + ": {valueX}";
      }
      else
      {
        series.dataFields.categoryY = values.xaxis.id;

        if (values.valueColumn.item.columnType === "number")
          series.columns.template.tooltipText = "{categoryY} ({name}): " + (values.valueColumn.item.prefix ? values.valueColumn.item.prefix : "") + "{valueX}" + (values.valueColumn.item.suffix ? values.valueColumn.item.suffix : "");
        else
          series.columns.template.tooltipText = "{categoryY} ({name}): {valueX}";
      }
    }

    if (stacked)
      series.tooltip.pointerOrientation = "horizontal";

    // Configure columns
    series.stacked = stacked;
    series.columns.template.strokeWidth = 0;
    series.columns.template.width = am4core.percent (60);

    if (!(values.currentChartType.flags & ChartFlags.ADVANCED))
    {
      // Display a special context menu when a chart column is right clicked or touched
      series.columns.template.events.on ("down", function (event) {
        if (!values.currentOption.drillDownOptions.length)
          return;

        if (!event.touch)
          return;

        values.chartClicked = true;
        values.chartObjectSelected = event.target.dataItem.dataContext[values.xaxis.id];
        values.chartSecondaryObjectSelected = series.dataFields.valueX;
      });

      series.columns.template.events.on ("rightclick", function (event) {
        if (!values.currentOption.drillDownOptions.length)
          return;

        values.chartClicked = true;
        values.chartObjectSelected = event.target.dataItem.dataContext[values.xaxis.id];
        values.chartSecondaryObjectSelected = series.dataFields.valueX;
      });
    }

    series.showOnInit = false;

    return series;
  }

  // Function to create vertical column chart series
  createVertColumnSeries(values, stacked, chart, item, parseDate, theme, outputFormat, paletteColors): any
  {
    let series = chart.series.push (new am4charts.ColumnSeries ());

    series.name = item.valueAxis;
    series.dataFields.valueY = item.valueField;

    if (parseDate)
    {
      series.dataFields.dateX = values.xaxis.id;
      series.dateFormatter.dateFormat = outputFormat;

      if (values.valueColumn.item.columnType === "number")
        series.columns.template.tooltipText = "{dateX} ({name}): " + (values.valueColumn.item.prefix ? values.valueColumn.item.prefix : "") + "{valueY}" + (values.valueColumn.item.suffix ? values.valueColumn.item.suffix : "");
      else
        series.columns.template.tooltipText = "{dateX} ({name}): {valueY}";
    }
    else
    {
      if (values.currentChartType.flags & ChartFlags.ADVANCED)
      {
        series.dataFields.categoryX = "Interval";
        series.columns.template.tooltipText = item.valueAxis + ": {valueY}";
      }
      else
      {
        series.dataFields.categoryX = values.xaxis.id;

        if (values.valueColumn.item.columnType === "number")
          series.columns.template.tooltipText = "{categoryX} ({name}): " + (values.valueColumn.item.prefix ? values.valueColumn.item.prefix : "") + "{valueY}" + (values.valueColumn.item.suffix ? values.valueColumn.item.suffix : "");
        else
          series.columns.template.tooltipText = "{categoryX} ({name}): {valueY}";
      }
    }

    series.stacked = stacked;
    series.columns.template.strokeWidth = 0;
    series.columns.template.width = am4core.percent(60);

    if (values.currentChartType.flags & ChartFlags.ADVANCED)
    {
      series.columns.template.events.on ("down", function (event) {
        if (!values.currentOption.drillDownOptions.length)
          return;

        if (!event.touch)
          return;

        values.chartClicked = true;
        values.chartObjectSelected = event.target.dataItem.dataContext[values.xaxis.id];
        values.chartSecondaryObjectSelected = series.dataFields.valueY;
      });

      series.columns.template.events.on ("rightclick", function (event) {
        if (!values.currentOption.drillDownOptions.length)
          return;

        values.chartClicked = true;
        values.chartObjectSelected = event.target.dataItem.dataContext[values.xaxis.id];
        values.chartSecondaryObjectSelected = series.dataFields.valueY;
      });
    }

    series.showOnInit = false;

    return series;
  }

  createScatterSeries(values, stacked, chart, item, parseDate, theme, outputFormat, paletteColors): any
  {
    let series, bullet, circle;

    // Set up series
    series = chart.series.push (new am4charts.LineSeries ());

    series.dataFields.valueX = values.xaxis.id;
    series.dataFields.valueY = values.valueColumn.id;
    series.strokeWidth = 2;
    series.strokeOpacity = 0;
    series.minBulletDistance = 0;
    series.tooltip.pointerOrientation = "vertical";
    series.tooltip.background.cornerRadius = 20;
    series.tooltip.background.fillOpacity = 0.5;
    series.tooltip.label.padding (12, 12, 12, 12);

    // add circle bullet for scatter chart
    bullet = series.bullets.push (new am4charts.Bullet ());

    circle = bullet.createChild (am4core.Circle);
    circle.horizontalCenter = "middle";
    circle.verticalCenter = "middle";
    circle.strokeWidth = 0;
    circle.width = 6;
    circle.height = 6;

    circle.tooltipText = "[bold]{title}:[/]\n";

    if (values.xaxis.item.columnType === "number")
      circle.tooltipText += values.xaxis.item.columnLabel + ": " + (values.xaxis.item.prefix ? values.xaxis.item.prefix : "") + "{valueX}" + (values.xaxis.item.suffix ? values.xaxis.item.suffix : "") + "\n";
    else
      circle.tooltipText += values.xaxis.item.columnLabel + ": {valueX}\n";

    if (values.valueColumn.item.columnType === "number")
      circle.tooltipText += values.valueColumn.item.columnLabel + ": " + (values.valueColumn.item.prefix ? values.valueColumn.item.prefix : "") + "{valueY}" + (values.valueColumn.item.suffix ? values.valueColumn.item.suffix : "");
    else
      circle.tooltipText += values.valueColumn.item.columnLabel + ": {valueY}";

    series.showOnInit = false;
  }

  // Function to create line chart series
  createLineSeries(values, stacked, chart, item, parseDate, theme, outputFormat, paletteColors): any
  {
    // Set up series
    let series = chart.series.push (new am4charts.LineSeries ());

    series.name = item.valueAxis;
    series.dataFields.valueY = item.valueField;
    series.strokeWidth = 2;
    series.minBulletDistance = 10;
    series.tooltip.pointerOrientation = "horizontal";
    series.tooltip.background.cornerRadius = 20;
    series.tooltip.background.fillOpacity = 0.5;
    series.tooltip.label.padding (12, 12, 12, 12);
    series.tensionX = 0.8;

    if (parseDate)
    {
      series.dataFields.dateX = values.xaxis.id;
      series.dateFormatter.dateFormat = outputFormat;

      if (values.valueColumn.item.columnType === "number")
        series.tooltipText = "{dateX} ({name}): " + (values.valueColumn.item.prefix ? values.valueColumn.item.prefix : "") + "{valueY}" + (values.valueColumn.item.suffix ? values.valueColumn.item.suffix : "");
      else
        series.tooltipText = "{dateX} ({name}): {valueY}";
    }
    else
    {
      if (values.currentChartType.flags & ChartFlags.ADVANCED)
      {
        series.dataFields.categoryX = "Interval";
        series.tooltipText = item.valueAxis + ": {valueY}";
      }
      else
      {
        series.dataFields.categoryX = values.xaxis.id;

        if (values.valueColumn.item.columnType === "number")
          series.tooltipText = "{categoryX} ({name}): " + (values.valueColumn.item.prefix ? values.valueColumn.item.prefix : "") + "{valueY}" + (values.valueColumn.item.suffix ? values.valueColumn.item.suffix : "");
        else
          series.tooltipText = "{categoryX} ({name}): {valueY}";
      }
    }

    // Fill area below line for area chart types
    if (values.currentChartType.flags & ChartFlags.AREAFILL)
      series.fillOpacity = 0.3;

    series.stacked = stacked;

    // Set line color for legend
    series.adapter.add ("fill", (fill, target) => {
      return fill;
    });

    series.adapter.add ("stroke", (stroke, target) => {
      return stroke;
    });

    if (!(values.currentChartType.flags & ChartFlags.ADVANCED))
    {
      // Display a special context menu when a chart line segment is right clicked
      series.segments.template.interactionsEnabled = true;
      series.segments.template.events.on ("down", function (event) {
        if (!values.currentOption.drillDownOptions.length)
          return;

        if (!event.touch)
          return;

        values.chartClicked = true;
        values.chartObjectSelected = event.target.dataItem.component.tooltipDataItem.dataContext[values.xaxis.id];
        values.chartSecondaryObjectSelected = series.dataFields.valueY;
      });

      series.segments.template.events.on ("rightclick", function (event) {
        if (!values.currentOption.drillDownOptions.length)
          return;

        values.chartClicked = true;
        values.chartObjectSelected = event.target.dataItem.component.tooltipDataItem.dataContext[values.xaxis.id];
        values.chartSecondaryObjectSelected = series.dataFields.valueY;
      });
    }

    series.showOnInit = false;

    return series;
  }

  // Function to create simple line chart series
  createSimpleLineSeries(values, simpleValue, chart, item, parseDate, index, outputFormat, paletteColors): any
  {
    // Set up series
    let series = chart.series.push (new am4charts.LineSeries ());

    if (simpleValue)
    {
      series.name = simpleValue.name;
      series.dataFields.valueY = simpleValue.id;
    }
    else
    {
      series.name = item.valueField;
      series.dataFields.valueY = item.valueField;
    }

    series.strokeWidth = 2;
    series.minBulletDistance = 10;
    series.tooltip.pointerOrientation = "horizontal";
    series.tooltip.background.cornerRadius = 20;
    series.tooltip.background.fillOpacity = 0.5;
    series.tooltip.label.padding (12, 12, 12, 12);
    series.tensionX = 0.8;
    series.zIndex = 1;

    if (values.currentChartType.flags & ChartFlags.ADVANCED)
    {
      series.dataFields.categoryX = item.titleField;
      series.tooltipText = "{valueY}";
    }
    else
    {
      if (parseDate)
      {
        series.dataFields.dateX = item.titleField;
        series.dateFormatter.dateFormat = outputFormat;

        if (simpleValue && simpleValue.item.columnType === "number")
          series.tooltipText = "{dateX} ({name}): " + (simpleValue.item.prefix ? simpleValue.item.prefix : "") + "{valueY}" + (simpleValue.item.suffix ? simpleValue.item.suffix : "");
        else
          series.tooltipText = "{dateX} ({name}): {valueY}";
      }
      else
      {
        series.dataFields.categoryX = item.titleField;

        if (simpleValue && simpleValue.item.columnType === "number")
          series.tooltipText = "{categoryX} ({name}): " + (simpleValue.item.prefix ? simpleValue.item.prefix : "") + "{valueY}" + (simpleValue.item.suffix ? simpleValue.item.suffix : "");
        else
          series.tooltipText = "{categoryX} ({name}): {valueY}";
      }
    }

    // Set line color for legend
    series.segments.template.adapter.add ("fill", (fill, target) => {
      return am4core.color (paletteColors[index]);
    });

    series.adapter.add ("stroke", (stroke, target) => {
      return am4core.color (paletteColors[index]);
    });

    // Set thresholds
    if (simpleValue && simpleValue.item.columnType === "number")
    {
      series.propertyFields.stroke = "lineColor" + series.dataFields.valueY;
      series.propertyFields.fill = "lineColor" + series.dataFields.valueY;
    }

    if (!(values.currentChartType.flags & ChartFlags.ADVANCED))
    {
      // Display a special context menu when a chart line segment is right clicked
      series.segments.template.interactionsEnabled = true;
      series.segments.template.events.on ("down", function (event) {
        if (!values.currentOption.drillDownOptions.length)
          return;

        if (!event.touch)
          return;

        values.chartClicked = true;
        values.chartObjectSelected = event.target.dataItem.component.tooltipDataItem.dataContext[values.variable.id];
        values.chartSecondaryObjectSelected = series.dataFields.valueY;
      });

      series.segments.template.events.on ("rightclick", function (event) {
        if (!values.currentOption.drillDownOptions.length)
          return;

        values.chartClicked = true;
        values.chartObjectSelected = event.target.dataItem.component.tooltipDataItem.dataContext[values.variable.id];
        values.chartSecondaryObjectSelected = series.dataFields.valueY;
      });
    }

    series.showOnInit = false;

    return series;
  }

  // Function to create simple vertical line chart series
  createSimpleVertLineSeries(values, simpleValue, chart, item, parseDate, index, outputFormat, paletteColors): any
  {
    // Set up series
    let series = chart.series.push (new am4charts.LineSeries ());

    if (simpleValue)
    {
      series.name = simpleValue.name;
      series.dataFields.valueX = simpleValue.id;
    }
    else
    {
      series.name = item.valueField;
      series.dataFields.valueX = item.valueField;
    }

    series.strokeWidth = 2;
    series.minBulletDistance = 10;
    series.tooltip.pointerOrientation = "horizontal";
    series.tooltip.background.cornerRadius = 20;
    series.tooltip.background.fillOpacity = 0.5;
    series.tooltip.label.padding (12, 12, 12, 12);
    series.tensionY = 0.8;
    series.zIndex = 1;

    if (values.currentChartType.flags & ChartFlags.ADVANCED)
    {
      series.dataFields.categoryY = item.titleField;
      series.tooltipText = "{valueX}";
    }
    else
    {
      if (parseDate)
      {
        series.dataFields.dateY = item.titleField;
        series.dateFormatter.dateFormat = outputFormat;

        if (simpleValue && simpleValue.item.columnType === "number")
          series.tooltipText = "{dateY} ({name}): " + (simpleValue.item.prefix ? simpleValue.item.prefix : "") + "{valueX}" + (simpleValue.item.suffix ? simpleValue.item.suffix : "");
        else
          series.tooltipText = "{dateY} ({name}): {valueX}";
      }
      else
      {
        series.dataFields.categoryY = item.titleField;

        if (simpleValue && simpleValue.item.columnType === "number")
          series.tooltipText = "{categoryY} ({name}): " + (simpleValue.item.prefix ? simpleValue.item.prefix : "") + "{valueX}" + (simpleValue.item.suffix ? simpleValue.item.suffix : "");
        else
          series.tooltipText = "{categoryY} ({name}): {valueX}";
      }
    }

    series.tooltip.pointerOrientation = "horizontal";

    // Set line color for legend
    series.segments.template.adapter.add ("fill", (fill, target) => {
      return am4core.color (paletteColors[index]);
    });

    series.adapter.add ("stroke", (stroke, target) => {
      return am4core.color (paletteColors[index]);
    });

    // Set thresholds
    if (simpleValue && simpleValue.item.columnType === "number")
    {
      series.propertyFields.stroke = "lineColor" + series.dataFields.valueX;
      series.propertyFields.fill = "lineColor" + series.dataFields.valueX;
    }

    if (!(values.currentChartType.flags & ChartFlags.ADVANCED))
    {
      // Display a special context menu when a chart line segment is right clicked
      series.segments.template.interactionsEnabled = true;
      series.segments.template.events.on ("down", function (event) {
        if (!values.currentOption.drillDownOptions.length)
          return;

        if (!event.touch)
          return;

        values.chartClicked = true;
        values.chartObjectSelected = event.target.dataItem.component.tooltipDataItem.dataContext[values.variable.id];
        values.chartSecondaryObjectSelected = series.dataFields.valueX;
      });

      series.segments.template.events.on ("rightclick", function (event) {
        if (!values.currentOption.drillDownOptions.length)
          return;

        values.chartClicked = true;
        values.chartObjectSelected = event.target.dataItem.component.tooltipDataItem.dataContext[values.variable.id];
        values.chartSecondaryObjectSelected = series.dataFields.valueX;
      });
    }

    series.showOnInit = false;

    return series;
  }
  // Function to create simple vertical column chart series
  createSimpleVertColumnSeries(values, simpleValue, chart, item, parseDate, index, outputFormat, paletteColors): any
  {
    let series = chart.series.push (new am4charts.ColumnSeries ());

    if (simpleValue)
    {
      series.name = simpleValue.name;
      series.dataFields.valueY = simpleValue.id;
    }
    else
    {
      series.name = item.valueField;
      series.dataFields.valueY = item.valueField;
    }

    if (values.currentChartType.flags & ChartFlags.ADVANCED)
    {
      series.dataFields.categoryX = item.titleField;
      series.columns.template.tooltipText = "{valueY}";
    }
    else
    {
      if (parseDate)
      {
        series.dataFields.dateX = item.titleField;
        series.dateFormatter.dateFormat = outputFormat;

        if (simpleValue && simpleValue.item.columnType === "number")
          series.columns.template.tooltipText = "{dateX} ({name}): " + (simpleValue.item.prefix ? simpleValue.item.prefix : "") + "{valueY}" + (simpleValue.item.suffix ? simpleValue.item.suffix : "");
        else
          series.columns.template.tooltipText = "{dateX} ({name}): {valueY}";
      }
      else
      {
        series.dataFields.categoryX = item.titleField;

        if (simpleValue && simpleValue.item.columnType === "number")
          series.columns.template.tooltipText = "{categoryX} ({name}): " + (simpleValue.item.prefix ? simpleValue.item.prefix : "") + "{valueY}" + (simpleValue.item.suffix ? simpleValue.item.suffix : "");
        else
          series.columns.template.tooltipText = "{categoryX} ({name}): {valueY}";
      }
    }

    series.columns.template.strokeWidth = 0;
    series.sequencedInterpolation = true;

    // Set colors
    if (simpleValue && simpleValue.item.columnType === "number")
    {
      series.columns.template.adapter.add ("fill", (fill, target) => {
        if (target.dataItem)
        {
          for (let threshold of values.thresholds)
          {
            if (simpleValue.item.id == threshold.column && target.dataItem.valueY >= threshold.min && target.dataItem.valueY <= threshold.max)
              return am4core.color (threshold.color);
          }
        }

        return am4core.color (paletteColors[index]);
      });
    }

    // Display a special context menu when a chart column is right clicked
    series.columns.template.events.on ("down", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      if (!event.touch)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
      values.chartSecondaryObjectSelected = null;
    });

    series.columns.template.events.on ("rightclick", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
      values.chartSecondaryObjectSelected = null;
    });

    series.showOnInit = false;

    return series;
  }

  // Function to create simple horizontal column chart series
  createSimpleHorizColumnSeries(values, simpleValue, chart, item, parseDate, index, outputFormat, paletteColors): any
  {
    let series = chart.series.push (new am4charts.ColumnSeries ());

    if (simpleValue)
    {
      series.name = simpleValue.name;
      series.dataFields.valueX = simpleValue.id;
    }
    else
    {
      series.name = item.valueField;
      series.dataFields.valueX = item.valueField;
    }

    if (values.currentChartType.flags & ChartFlags.ADVANCED)
    {
      series.dataFields.categoryY = item.titleField;
      series.columns.template.tooltipText = "{valueX}";
    }
    else
    {
      if (parseDate)
      {
        series.dataFields.dateY = item.titleField;
        series.dateFormatter.dateFormat = outputFormat;

        if (simpleValue && simpleValue.item.columnType === "number")
          series.columns.template.tooltipText = "{dateY} ({name}): " + (simpleValue.item.prefix ? simpleValue.item.prefix : "") + "{valueX}" + (simpleValue.item.suffix ? simpleValue.item.suffix : "");
        else
          series.columns.template.tooltipText = "{dateY} ({name}): {valueX}";
      }
      else
      {
        series.dataFields.categoryY = item.titleField;

        if (simpleValue && simpleValue.item.columnType === "number")
          series.columns.template.tooltipText = "{categoryY} ({name}): " + (simpleValue.item.prefix ? simpleValue.item.prefix : "") + "{valueX}" + (simpleValue.item.suffix ? simpleValue.item.suffix : "");
        else
          series.columns.template.tooltipText = "{categoryY} ({name}): {valueX}";
      }
    }

    series.tooltip.pointerOrientation = "down";

    series.columns.template.strokeWidth = 0;
    series.sequencedInterpolation = true;

    if (simpleValue && simpleValue.item.columnType === "number")
    {
      series.columns.template.adapter.add ("fill", (fill, target) => {
        if (target.dataItem)
        {
          for (let threshold of values.thresholds)
          {
            if (simpleValue.item.id == threshold.column && target.dataItem.valueX >= threshold.min && target.dataItem.valueX <= threshold.max)
              return am4core.color (threshold.color);
          }
        }

        return am4core.color (paletteColors[index]);
      });
    }

    series.columns.template.events.on("down", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      if (!event.touch)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
      values.chartSecondaryObjectSelected = null;
    });

    series.columns.template.events.on ("rightclick", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
      values.chartSecondaryObjectSelected = null;
    });

    series.showOnInit = false;

    return series;
  }

  // Function to create pie chart series
  createPieSeries(values, stacked, chart, item, parseDate, theme, outputFormat, paletteColors): any
  {
    let series, colorSet;

    // Set inner radius for donut chart
    if (values.currentChartType.flags & ChartFlags.PIEHOLE)
      chart.innerRadius = am4core.percent (60);

    // Configure Pie Chart
    series = chart.series.push (new am4charts.PieSeries ());

    series.dataFields.value = item.valueField;
    series.dataFields.category = item.titleField;

    if (values.valueColumn.item.columnType === "number")
      series.slices.template.tooltipText = "{category}: " + (values.valueColumn.item.prefix ? values.valueColumn.item.prefix : "") + "{value.value}" + (values.valueColumn.item.suffix ? values.valueColumn.item.suffix : "");
    else
      series.slices.template.tooltipText = "{category}: {value.value}";

    // This creates initial animation
    series.hiddenState.properties.opacity = 1;
    series.hiddenState.properties.endAngle = -90;
    series.hiddenState.properties.startAngle = -90;

    // Set ticks color
    series.labels.template.fill = Themes.AmCharts[theme].fontColor;
    series.ticks.template.strokeOpacity = 1;
    series.ticks.template.stroke = Themes.AmCharts[theme].ticks;
    series.ticks.template.strokeWidth = 1;

    // Set the color for the chart to display
    colorSet = new am4core.ColorSet ();
    colorSet.list = paletteColors.map (function (color) {
      return am4core.color (color);
    });
    series.colors = colorSet;

    // Display a special context menu when a pie slice is right clicked
    series.slices.template.events.on ("down", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      if (!event.touch)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
      values.chartSecondaryObjectSelected = null;
    });

    series.slices.template.events.on ("rightclick", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
      values.chartSecondaryObjectSelected = null;
    });

    series.showOnInit = false;

    return series;
  }

  // Function to create funnel chart series
  createFunnelSeries(values, stacked, chart, item, parseDate, theme, outputFormat, paletteColors): any
  {
    let series, colorSet;

    series = chart.series.push (new am4charts.FunnelSeries ());

    series.dataFields.value = item.valueField;
    series.dataFields.category = item.titleField;

    if (values.valueColumn.item.columnType === "number")
      series.slices.template.tooltipText = "{category}: " + (values.valueColumn.item.prefix ? values.valueColumn.item.prefix : "") + "{value.value}" + (values.valueColumn.item.suffix ? values.valueColumn.item.suffix : "");
    else
      series.slices.template.tooltipText = "{category}: {value.value}";

    // Set chart apparence
    series.sliceLinks.template.fillOpacity = 0;
    series.labels.template.fill = Themes.AmCharts[theme].fontColor;
    series.ticks.template.strokeOpacity = 1;
    series.ticks.template.stroke = Themes.AmCharts[theme].ticks;
    series.ticks.template.strokeWidth = 1;
    series.alignLabels = true;

    // Set the color for the chart to display
    colorSet = new am4core.ColorSet ();
    colorSet.list = paletteColors.map (function (color) {
      return am4core.color (color);
    });
    series.colors = colorSet;

    // Display a special context menu when a funnel slice is right clicked
    series.slices.template.events.on ("down", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      if (!event.touch)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
      values.chartSecondaryObjectSelected = null;
    });

    series.slices.template.events.on ("rightclick", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
      values.chartSecondaryObjectSelected = null;
    });

    series.showOnInit = false;

    return series;
  }

  parseDate(date: any, format: string): Date
  {
    let momentDate: moment.Moment;
    let momentFormat: string;

    if (date == null || date == "")
      return null;

    if (format == null || format == "")
      momentFormat = "YYYYMMDD"; // fallback for date values with no column or pre-defined format set
    else if (this.predefinedColumnFormats[format])
      momentFormat = "DD/MM/YYYY";
    else
    {
      // replace lower case letters with uppercase ones for the moment date format
      momentFormat = format.replace (/m/g, "M");
      momentFormat = momentFormat.replace (/y/g, "Y");
      momentFormat = momentFormat.replace (/d/g, "D");
    }

    momentDate = moment (date, momentFormat);
    if (!momentDate.isValid ())
      return null; // invalid date value will be null

    return momentDate.toDate ();
  }

  getHeatMapColor(value): am4core.Color
  {
    let selectedColor = this.values.thresholds[0].color;

    if (this.values.thresholds.length > 1)
    {
      for (let threshold of this.values.thresholds)
      {
        if (value >= threshold.min)
          selectedColor = threshold.color;
      }
    }

    return am4core.color (selectedColor);
  }

  getChartType(valueChartName: string): any
  {
    let chartName;

    if (!valueChartName)
      chartName = this.values.currentChartType.name;
    else
    {
      if (this.values.currentChartType.flags & ChartFlags.ROTATED)
      {
        valueChartName = valueChartName.split (" ")[1];

        if (valueChartName === "Lines")
          chartName = "Simple Vertical " + valueChartName;
        else
          chartName = "Simple Horizontal " + valueChartName;
      }
      else
        chartName = valueChartName;
    }

    for (let chartType of this.chartTypes)
    {
      if (chartName === chartType.name)
        return chartType;
    }

    if (this.values.currentChartType.flags & ChartFlags.ROTATED)
      return this.chartTypes[3];

    return this.chartTypes[2];
  }

  makeChart(chartInfo): void
  {
    let theme = this.globals.theme;

    this.removeDeadVariablesAndCategories.emit ({
      type: this.chartTypes.indexOf (this.oldChartType),
      analysisName: this.oldVariableName,
      chartSeries: this.values.chartSeries,
      controlVariables: this.oldOptionCategories
    });

    this.values.chartSeries = [];

    // Convert the old "Scatter" chart into line charts
    if (this.values.currentChartType.flags & ChartFlags.LINECHART && this.values.currentChartType.flags & ChartFlags.BULLET)
      this.values.currentChartType.flags &= ~ChartFlags.BULLET;

    if (this.values.paletteColors && this.values.paletteColors.length)
      this.paletteColors = this.values.paletteColors;
    else
    {
      if (this.values.currentChartType.flags & ChartFlags.HEATMAP)
        this.paletteColors = Themes.AmCharts[theme].heatMapColors;
      else
        this.paletteColors = Themes.AmCharts[theme].resultColors;
    }

    // reset advanced chart values
    this.addUpValuesSet = false;
    this.sumValueAxis = null;
    this.sumSeriesList = [];
    this.advTableView = false;
    this.intervalTableRows = [];
    this.chartInfo = chartInfo;

    this.zone.runOutsideAngular (() => {
      let chart, options;

      //if (this.values.animated)
      //  am4core.options.autoSetClassName = true;

      // Check chart type before generating it
      if (this.values.currentChartType.flags & ChartFlags.HEATMAP)
      {
        let polygonSeries, polygonTemplate, imageSeries;
        let home, zoomControl;

        chart = am4core.create ("msf-dashboard-chart-display-" + this.values.id, am4maps.MapChart);

        if (this.values.valueColumn.item.columnType === "number")
        {
          if (this.values.valueColumn.item.outputFormat)
            chart.numberFormatter.numberFormat = this.utils.convertNumberFormat (this.values.valueColumn.item.outputFormat);
          else
            chart.numberFormatter.numberFormat = this.utils.convertNumberFormat (this.values.valueColumn.item.columnFormat);
        }
        else
          chart.numberFormatter.numberFormat = "#,###.#";

        // Create map instance displaying the chosen geography data
        chart.geodata = this.values.geodata.value;
        if (this.values.geodata.value == am4geodata_usaLow)
          chart.projection = new am4maps.projections.AlbersUsa ();
        else
          chart.projection = new am4maps.projections.Miller ();

        // Add map polygons
        polygonSeries = chart.series.push (new am4maps.MapPolygonSeries ());
        polygonSeries.useGeodata = true;
        polygonSeries.mapPolygons.template.strokeOpacity = 0.25;
        polygonSeries.mapPolygons.template.strokeWidth = 0.5;
        polygonTemplate = polygonSeries.mapPolygons.template;

        if (this.values.currentChartType.flags & ChartFlags.BUBBLE)
        {
          let imageTemplate, circle;

          // Use normal map polygon colors
          polygonSeries.mapPolygons.template.fill = Themes.AmCharts[theme].mapPolygonColor;
          polygonSeries.mapPolygons.template.stroke = Themes.AmCharts[theme].mapPolygonStroke;
          polygonSeries.calculateVisualCenter = true;

          imageSeries = chart.series.push (new am4maps.MapImageSeries ());
          imageSeries.dataFields.value = "value";

          imageTemplate = imageSeries.mapImages.template;
          imageTemplate.nonScaling = true;

          circle = imageTemplate.createChild (am4core.Circle);
          circle.tooltipText = "{name}: {value}";
          circle.fillOpacity = 0.7;
          circle.propertyFields.fill = "color";

          imageSeries.heatRules.push ({
            property: "radius",
            target: circle,
            min: 4,
            max: 30,
            dataField: "value"
          });

          if (!this.values.thresholds.length)
          {
            imageSeries.heatRules.push ({
              property: "fill",
              target: circle,
              min: am4core.color (this.paletteColors[0]),
              max: am4core.color (this.paletteColors[1]),
              logarithmic: true
            });
          }

          // Set the values for each bubble
          imageSeries.data = [];

          for (let result of chartInfo)
          {
            for (let item of chart.geodata.features)
            {
              let resultInfo = result[this.values.valueColumn.id];

              if (resultInfo == null)
                continue;

              if (item.id.includes (resultInfo))
              {
                item.value = result[this.values.variable.id];

                if (!item.value)
                  break;

                imageSeries.data.push ({
                  id: item.id,
                  name: item.properties.name,
                  value: item.value,
                  color: (this.values.thresholds.length ? this.getHeatMapColor (item.value) : null)
                });

                break;
              }
            }
          }

          imageTemplate.adapter.add ("latitude", function (latitude, target) {
            let polygon = polygonSeries.getPolygonById (target.dataItem.dataContext.id);

            if (polygon)
              return polygon.visualLatitude;

            return latitude;
          });

          imageTemplate.adapter.add ("longitude", function (longitude, target) {
            let polygon = polygonSeries.getPolygonById (target.dataItem.dataContext.id);

            if (polygon)
              return polygon.visualLongitude;

            return longitude;
          });
        }
        else
        {
          polygonSeries.mapPolygons.template.fill = am4core.color (this.paletteColors[0]);
          polygonSeries.mapPolygons.template.stroke = black;

          if (this.values.thresholds.length >= 1)
            polygonTemplate.propertyFields.fill = "fill";
          else
          {
            polygonSeries.heatRules.push ({
              property: "fill",
              target: polygonSeries.mapPolygons.template,
              min: am4core.color (this.paletteColors[0]),
              max: am4core.color (this.paletteColors[1]),
              logarithmic: true
            });
          }

          // Set the values for each polygon
          polygonSeries.data = [];

          for (let result of chartInfo)
          {
            for (let item of chart.geodata.features)
            {
              let resultInfo = result[this.values.valueColumn.id];

              if (resultInfo == null)
                continue;

              if (item.id.includes (resultInfo))
              {
                item.value = result[this.values.variable.id];

                if (!item.value)
                  break;

                polygonSeries.data.push ({
                  id: item.id,
                  value: item.value
                });

                break;
              }
            }
          }

          // Configure series tooltip
          polygonTemplate.tooltipText = "{name}: {value}";
          polygonTemplate.nonScalingStroke = true;
          polygonTemplate.strokeWidth = 0.5;

          polygonSeries.tooltip.label.adapter.add ("text", function (text, target) {
            if (target.dataItem && target.dataItem.value == null)
              return "{name}: 0";
            else
              return text;
          });
        }

        // Exclude Antartica if the geography data is the world
        if (chart.geodata === am4geodata_worldLow)
        {
          polygonSeries.exclude = ["AQ"];

          chart.homeGeoPoint = {
            latitude: 24.8567,
            longitude: 2.3510
          };
        }

        // Move the delta longitude a bit to the left if the geography
        // data is Asia
        if (chart.geodata === am4geodata_asiaLow)
          chart.deltaLongitude = -90;
        else
          chart.deltaLongitude = 0;

        chart.homeZoomLevel = 1;

        // Display legend
        if (this.values.thresholds.length)
        {
          let legend, legendTitle;

          legend = new am4maps.Legend ();

          legendTitle = legend.createChild (am4core.Label);

          if (this.values.horizAxisName && this.values.horizAxisName != "")
            legendTitle.text = this.values.horizAxisName;
          else
            legendTitle.text = this.values.variable.name;

          legendTitle.fontSize = 13;

          legend.parent = chart.chartContainer;
          legend.background.fill = black;
          legend.background.fillOpacity = 0.25;
          legend.position = "right";
          legend.maxWidth = undefined;
          legend.marginRight = am4core.percent (1);
          legend.padding (10, 15, 10, 15);
          legend.itemContainers.template.clickable = false;
          legend.itemContainers.template.focusable = false;
          legend.align = "right";
          legend.valign = "bottom";
          legend.data = [];

          for (let i = this.values.thresholds.length - 1; i >= 0; i--)
          {
            let name;

            if (i != this.values.thresholds.length - 1)
              name = this.values.thresholds[i].min + " - " + (this.values.thresholds[i + 1].min - 1);
            else
              name = this.values.thresholds[i].min + "+";

            legend.data.push ({
              name: name,
              fill: am4core.color (this.values.thresholds[i].color)
            });
          }
        }
        else
        {
          let minRange, maxRange, heatLegend, pow, legendTitle, legendSeries;

          if (this.values.currentChartType.flags & ChartFlags.BUBBLE)
            legendSeries = imageSeries;
          else
            legendSeries = polygonSeries;

          heatLegend = chart.chartContainer.createChild (am4maps.HeatLegend);

          legendTitle = heatLegend.createChild (am4core.Label);

          if (this.values.horizAxisName && this.values.horizAxisName != "")
            legendTitle.text = this.values.horizAxisName;
          else
            legendTitle.text = this.values.variable.name;

          legendTitle.align = "center";
          legendTitle.fontSize = 13;

          heatLegend.valueAxis.renderer.labels.template.fill = Themes.AmCharts[theme].fontColor;
          heatLegend.series = legendSeries;
          heatLegend.background.fill = black;
          heatLegend.background.fillOpacity = 0.25;
          heatLegend.minColor = am4core.color (this.paletteColors[0]);
          heatLegend.maxColor = am4core.color (this.paletteColors[1]);
          heatLegend.align = "right";
          heatLegend.valign = "bottom";
          heatLegend.width = am4core.percent (20);
          heatLegend.marginRight = am4core.percent (1);
          heatLegend.dx -= 10;
          heatLegend.padding (10, 20, 10, 15);

          // Set minimum and maximum value for the heat legend
          heatLegend.minValue = 0;
          heatLegend.maxValue = 10;

          // For the maximum value, get the highest value of the result and calculate
          // it by doing an division with the power of 10
          for (let item of legendSeries.data)
          {
            if (heatLegend.maxValue < item.value)
              heatLegend.maxValue = item.value;
          }

          // Find the power of 10 from the maximum result
          pow = 1;
          while (pow <= heatLegend.maxValue)
            pow = (pow << 3) + (pow << 1);

          pow /= 10; // notch down one power
          heatLegend.maxValue = Math.ceil (heatLegend.maxValue / pow) * pow;

          // Set minimum and maximum values for the heat legend
          minRange = heatLegend.valueAxis.axisRanges.create ();
          minRange.value = heatLegend.minValue;
          minRange.label.text = "0";
          maxRange = heatLegend.valueAxis.axisRanges.create ();
          maxRange.value = heatLegend.maxValue;
          maxRange.label.text = "" + maxRange.value;

          // Hide internal heat legend value labels
          heatLegend.valueAxis.renderer.labels.template.adapter.add ("text",
            function (labelText) {
              return "";
            }
          );
        }

        // Add zoom control buttons
        zoomControl = new am4maps.ZoomControl ();
        chart.zoomControl = zoomControl;
        zoomControl.slider.height = 100;
        zoomControl.valign = "top";
        zoomControl.align = "left";
        zoomControl.marginTop = 40;
        zoomControl.marginLeft = 10;
        zoomControl.plusButton.height = 26;
        zoomControl.minusButton.height = 26;

        // Add home buttom to zoom out
        home = chart.chartContainer.createChild (am4core.Button);
        home.icon = new am4core.Sprite ();
        home.icon.dx -= 9;
        home.icon.dy -= 9;
        home.width = 30;
        home.height = 30;
        home.icon.path = homeSVG;
        home.align = "left";
        home.marginLeft = 15;
        home.dy += 10;
        home.events.on ("hit", function (ev) {
          chart.goHome ();
        });

        this.oldChartType = null;
        this.oldVariableName = "";
        this.oldOptionCategories = JSON.parse (JSON.stringify (this.values.currentOptionCategories));

        // Add export menu
        chart.exporting.menu = new am4core.ExportMenu ();
        chart.exporting.menu.align = "left";
        chart.exporting.menu.verticalAlign = "bottom";
        chart.exporting.title = this.values.chartName;
        chart.exporting.description = this.values.chartDescription;
        chart.exporting.filePrefix = this.values.chartName;
        chart.exporting.useWebFonts = false;

        // Remove "Saved from..." message on PDF files
        options = chart.exporting.getFormatOptions ("pdf");
        options.addURL = false;
        chart.exporting.setFormatOptions ("pdf", options);
      }
      else if (this.values.currentChartType.flags & ChartFlags.MAP)
      {
        let polygonSeries, zoomControl, home;

        chart = am4core.create ("msf-dashboard-chart-display-" + this.values.id, am4maps.MapChart);

        // Create map instance
        chart.geodata = am4geodata_worldLow;
        chart.projection = new am4maps.projections.Miller ();

        // Add map polygons and exclude Antartica
        polygonSeries = chart.series.push (new am4maps.MapPolygonSeries ());
        polygonSeries.useGeodata = true;
        polygonSeries.exclude = ["AQ"];
        polygonSeries.mapPolygons.template.fill = Themes.AmCharts[theme].mapPolygonColor;
        polygonSeries.mapPolygons.template.stroke = Themes.AmCharts[theme].mapPolygonStroke;
        polygonSeries.mapPolygons.template.strokeOpacity = 0.25;
        polygonSeries.mapPolygons.template.strokeWidth = 0.5;

        // Set default location and zoom level
        chart.homeGeoPoint = {
          latitude: 24.8567,
          longitude: 2.3510
        };

        chart.homeZoomLevel = 1;
        chart.deltaLongitude = 0;

        // Reset checked cities and routes
        this.checkedRoutes = [];
        this.checkedCities = [];

        // Add zoom control buttons
        zoomControl = new am4maps.ZoomControl ();
        chart.zoomControl = zoomControl;
        zoomControl.slider.height = 100;
        zoomControl.valign = "top";
        zoomControl.align = "left";
        zoomControl.marginTop = 40;
        zoomControl.marginLeft = 10;
        zoomControl.plusButton.height = 26;
        zoomControl.minusButton.height = 26;

        // Add home buttom to zoom out
        home = chart.chartContainer.createChild (am4core.Button);
        home.icon = new am4core.Sprite ();
        home.icon.dx -= 9;
        home.icon.dy -= 9;
        home.width = 30;
        home.height = 30;
        home.icon.path = homeSVG;
        home.align = "left";
        home.marginLeft = 15;
        home.dy += 10;
        home.events.on ("hit", function (ev) {
          chart.goHome ();
        });

        this.oldChartType = null;
        this.oldVariableName = "";
        this.oldOptionCategories = JSON.parse (JSON.stringify (this.values.currentOptionCategories));

        // If the option meta data is 4 (Route Networks), add origin cities and its destinations
        if (this.values.currentOption.metaData == 4 || this.values.currentOption.metaData == 5)
          this.setRouteNetworks (chart, theme, false);
      }
      else if (this.values.currentChartType.flags & ChartFlags.FUNNELCHART
        || this.values.currentChartType.flags & ChartFlags.PIECHART)
      {
        if (this.values.currentChartType.flags & ChartFlags.FUNNELCHART)
          chart = am4core.create ("msf-dashboard-chart-display-" + this.values.id, am4charts.SlicedChart);
        else
          chart = am4core.create ("msf-dashboard-chart-display-" + this.values.id, am4charts.PieChart);

        chart.data = chartInfo.dataProvider;

        if (this.values.valueColumn.item.columnType === "number")
        {
          if (this.values.valueColumn.item.outputFormat)
            chart.numberFormatter.numberFormat = this.utils.convertNumberFormat (this.values.valueColumn.item.outputFormat);
          else
            chart.numberFormatter.numberFormat = this.utils.convertNumberFormat (this.values.valueColumn.item.columnFormat);
        }
        else
          chart.numberFormatter.numberFormat = "#,###.#";

        // Set label font size
        chart.fontSize = 10;

        // Create the series
        this.values.chartSeries.push (this.values.currentChartType.createSeries (this.values, false, chart, chartInfo, null, theme, null, this.paletteColors));

        if (this.values.currentChartType.flags & ChartFlags.FUNNELCHART)
        {
          // Sort values from greatest to least on funnel chart types
          chart.events.on ("beforedatavalidated", function (event) {
            chart.data.sort (function (e1, e2) {
              return e2[chartInfo.valueField] - e1[chartInfo.valueField];
            });
          });
        }

        this.oldChartType = null;
        this.oldVariableName = "";
        this.oldOptionCategories = JSON.parse (JSON.stringify (this.values.currentOptionCategories));

        // Add export menu
        chart.exporting.menu = new am4core.ExportMenu ();
        chart.exporting.menu.align = "left";
        chart.exporting.menu.verticalAlign = "bottom";
        chart.exporting.title = this.values.chartName;
        chart.exporting.description = this.values.chartDescription;
        chart.exporting.filePrefix = this.values.chartName;
        chart.exporting.useWebFonts = false;

        // Remove "Saved from..." message on PDF files
        options = chart.exporting.getFormatOptions ("pdf");
        options.addURL = false;
        chart.exporting.setFormatOptions ("pdf", options);
      }
      else
      {
        let categoryAxis, valueAxis, valueAxes, parseDate, outputFormat, stacked, goalAxis, barChartHoverSet;

        chart = am4core.create ("msf-dashboard-chart-display-" + this.values.id, am4charts.XYChart);
        barChartHoverSet = false;

        if (this.values.valueColumn && !this.values.valueList)
        {
          if (this.values.valueColumn.item.columnType === "number")
          {
            if (this.values.valueColumn.item.outputFormat)
              chart.numberFormatter.numberFormat = this.utils.convertNumberFormat (this.values.valueColumn.item.outputFormat);
            else
              chart.numberFormatter.numberFormat = this.utils.convertNumberFormat (this.values.valueColumn.item.columnFormat);
          }
          else
            chart.numberFormatter.numberFormat = "#,###.#";
        }
        else
          chart.numberFormatter.numberFormat = "#,###.#"; // universal number format if there are multiple values or no values set

        // Don't parse dates if the chart is a simple version
        if (this.values.currentChartType.flags & ChartFlags.XYCHART)
        {
          chart.data = JSON.parse (JSON.stringify (chartInfo.data));
          if (this.values.currentChartType.flags & ChartFlags.ADVANCED || this.values.currentChartType.flags & ChartFlags.BULLET)
            parseDate = false;
          else
            parseDate = (this.values.xaxis.item.columnType === "date") ? true : false;
        }
        else if (!(this.values.currentChartType.flags & ChartFlags.PIECHART) && !(this.values.currentChartType.flags & ChartFlags.FUNNELCHART))
        {
          chart.data = JSON.parse (JSON.stringify (chartInfo.dataProvider));
          if (this.values.currentChartType.flags & ChartFlags.ADVANCED || this.values.currentChartType.flags & ChartFlags.BULLET)
            parseDate = false;
          else
            parseDate = (this.values.variable.item.columnType === "date") ? true : false;
        }

        if (parseDate)
        {
          if (this.values.currentChartType.flags & ChartFlags.XYCHART)
          {
            if (this.values.xaxis.item.columnFormat)
            {
              for (let data of chart.data)
                data[this.values.xaxis.id] = this.parseDate (data[this.values.xaxis.id], this.values.xaxis.item.columnFormat);

              if (this.values.xaxis.item.outputFormat)
                outputFormat = this.values.xaxis.item.outputFormat;
              else
                outputFormat = this.values.xaxis.item.columnFormat;

              // Set predefined format if used
              if (this.predefinedColumnFormats[outputFormat])
                outputFormat = this.predefinedColumnFormats[outputFormat];
            }
            else
              parseDate = false;
          }
          else if (!(this.values.currentChartType.flags & ChartFlags.PIECHART) && !(this.values.currentChartType.flags & ChartFlags.FUNNELCHART))
          {
            if (this.values.variable.item.columnFormat)
            {
              for (let data of chart.data)
                data[this.values.variable.id] = this.parseDate (data[this.values.variable.id], this.values.variable.item.columnFormat);

              if (this.values.variable.item.outputFormat)
                outputFormat = this.values.variable.item.outputFormat;
              else
                outputFormat = this.values.variable.item.columnFormat;

              // Set predefined format if used
              if (this.predefinedColumnFormats[outputFormat])
                outputFormat = this.predefinedColumnFormats[outputFormat];
            }
            else
              parseDate = false;
          }
          else
            parseDate = false;
        }

        valueAxes = [];

        if (this.isSimpleChart () && this.values.valueListInfo.length > 1 && !(this.values.currentChartType.flags & ChartFlags.ADVANCED))
        {
          for (let i = 0; i < this.values.valueListInfo.length; i++)
          {
            let valueAxis;

            if (!this.values.valueListInfo[i].axis)
              continue;

            if (this.values.currentChartType.flags & ChartFlags.ROTATED)
            {
              valueAxis = chart.xAxes.push (new am4charts.ValueAxis ());

              if (chart.xAxes.indexOf (valueAxis) != 0)
              {
                valueAxis.syncWithAxis = chart.xAxes.getIndex (0);
                valueAxis.renderer.opposite = true;
              }
            }
            else
            {
              valueAxis = chart.yAxes.push (new am4charts.ValueAxis ());

              if (chart.yAxes.indexOf (valueAxis) != 0)
              {
                valueAxis.syncWithAxis = chart.yAxes.getIndex (0);
                valueAxis.renderer.opposite = true;
              }
            }

            if (!this.values.valueListInfo[i].axisName && !(this.values.valueListInfo[i].axisName && this.values.valueListInfo[i] != ""))
              valueAxis.title.text = this.values.valueList[i].name;
            else
              valueAxis.title.text = this.values.valueListInfo[i].axisName;

            valueAxis.title.fill = am4core.color (this.paletteColors[i]);

            if (this.values.startAtZero)
              valueAxis.min = 0;

            valueAxis.renderer.labels.template.fontSize = 10;
            valueAxis.renderer.labels.template.fill = Themes.AmCharts[theme].fontColor;
            valueAxis.renderer.grid.template.strokeOpacity = 1;
            valueAxis.renderer.grid.template.stroke = Themes.AmCharts[theme].stroke;
            valueAxis.renderer.grid.template.strokeWidth = 1;

            valueAxis.renderer.line.strokeOpacity = 1;
            valueAxis.renderer.line.strokeWidth = 2;
            valueAxis.renderer.line.stroke = am4core.color (this.paletteColors[i]);
            valueAxis.renderer.labels.template.fill = am4core.color (this.paletteColors[i]);

            valueAxis.tooltip.label.fill = Themes.AmCharts[theme].axisTooltipFontColor;
            valueAxis.tooltip.background.fill = Themes.AmCharts[theme].tooltipFill;

            valueAxes.push ({
              item: valueAxis,
              name: this.values.valueList[i].id
            });
          }

          if (valueAxes.length == 1)
          {
            if (this.values.currentChartType.flags & ChartFlags.ROTATED)
              chart.xAxes.removeIndex (0);
            else
              chart.yAxes.removeIndex (0);

            valueAxes = [];
          }
        }

        // Set chart axes depeding on the rotation
        if (this.values.currentChartType.flags & ChartFlags.ROTATED)
        {
          if (parseDate)
          {
            categoryAxis = chart.yAxes.push (new am4charts.DateAxis ());
            categoryAxis.dateFormats.setKey ("day", outputFormat);
            categoryAxis.dateFormats.setKey ("week", outputFormat);
            categoryAxis.dateFormats.setKey ("month", outputFormat);
            categoryAxis.dateFormats.setKey ("year", outputFormat);

            if (!outputFormat.includes ("d") && !outputFormat.includes ("D"))
            {
              if (!outputFormat.includes ("m") && !outputFormat.includes ("M"))
              {
                categoryAxis.baseInterval.timeunit = "year";
                categoryAxis.baseInterval.count = 1;
              }
              else
              {
                categoryAxis.baseInterval.timeunit = "month";
                categoryAxis.baseInterval.count = 1;
              }
            }
            else
            {
              categoryAxis.baseInterval.timeunit = "day";
              categoryAxis.baseInterval.count = 1;
            }

            categoryAxis.periodChangeDateFormats.setKey ("month", outputFormat);
            categoryAxis.periodChangeDateFormats.setKey ("day", outputFormat);
            categoryAxis.periodChangeDateFormats.setKey ("week", outputFormat);
            categoryAxis.periodChangeDateFormats.setKey ("year", outputFormat);
          }
          else
          {
            if (this.values.currentChartType.flags & ChartFlags.BULLET)
            {
              categoryAxis = chart.yAxes.push (new am4charts.ValueAxis ());

              if (this.values.startAtZero)
                categoryAxis.min = 0;
            }
            else
            {
              categoryAxis = chart.yAxes.push (new am4charts.CategoryAxis ());
              categoryAxis.renderer.minGridDistance = 15;
              categoryAxis.renderer.labels.template.maxWidth = 160;
            }
          }

          if (!(this.isSimpleChart () && valueAxes.length > 1))
          {
            valueAxis = chart.xAxes.push (new am4charts.ValueAxis ());

            if (this.values.startAtZero)
              valueAxis.min = 0;
          }

          // Add scrollbar into the chart for zooming if there are multiple series
          if (chart.data.length > 1 && !this.isMobile)
          {
            if (this.values.currentChartType.flags & ChartFlags.BULLET)
            {
              chart.scrollbarX = new am4core.Scrollbar ();
              chart.scrollbarX.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
              chart.scrollbarY = new am4core.Scrollbar ();
              chart.scrollbarY.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
            }
            else
            {
              chart.scrollbarY = new am4core.Scrollbar ();
              chart.scrollbarY.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
            }
          }
        }
        else
        {
          if (parseDate)
          {
            categoryAxis = chart.xAxes.push (new am4charts.DateAxis ());
            categoryAxis.dateFormats.setKey ("day", outputFormat);
            categoryAxis.dateFormats.setKey ("week", outputFormat);
            categoryAxis.dateFormats.setKey ("month", outputFormat);
            categoryAxis.dateFormats.setKey ("year", outputFormat);

            if (!outputFormat.includes ("d") && !outputFormat.includes ("D"))
            {
              if (!outputFormat.includes ("m") && !outputFormat.includes ("M"))
              {
                categoryAxis.baseInterval.timeunit = "year";
                categoryAxis.baseInterval.count = 1;
              }
              else
              {
                categoryAxis.baseInterval.timeunit = "month";
                categoryAxis.baseInterval.count = 1;
              }
            }
            else
            {
              categoryAxis.baseInterval.timeunit = "day";
              categoryAxis.baseInterval.count = 1;
            }

            categoryAxis.periodChangeDateFormats.setKey ("month", outputFormat);
            categoryAxis.periodChangeDateFormats.setKey ("day", outputFormat);
            categoryAxis.periodChangeDateFormats.setKey ("week", outputFormat);
            categoryAxis.periodChangeDateFormats.setKey ("year", outputFormat);
          }
          else
          {
            if (this.values.currentChartType.flags & ChartFlags.BULLET)
            {
              categoryAxis = chart.xAxes.push (new am4charts.ValueAxis ());

              if (this.values.startAtZero)
                categoryAxis.min = 0;
            }
            else
            {
              categoryAxis = chart.xAxes.push (new am4charts.CategoryAxis ());
              categoryAxis.renderer.minGridDistance = 30;
            }
          }


          if (!(this.values.currentChartType.flags & ChartFlags.LINECHART && parseDate) && !(this.values.currentChartType.flags & ChartFlags.BULLET))
          {
            // Rotate labels if the chart is displayed vertically
            categoryAxis.renderer.labels.template.rotation = 330;
            categoryAxis.renderer.labels.template.maxWidth = 240;
          }

          if (!(this.isSimpleChart () && valueAxes.length > 1))
          {
            valueAxis = chart.yAxes.push (new am4charts.ValueAxis ());

            if (this.values.startAtZero)
              valueAxis.min = 0;
          }

          if (chart.data.length > 1 && !this.isMobile)
          {
            if (this.values.currentChartType.flags & ChartFlags.BULLET)
            {
              chart.scrollbarX = new am4core.Scrollbar ();
              chart.scrollbarX.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
              chart.scrollbarY = new am4core.Scrollbar ();
              chart.scrollbarY.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
            }
            else
            {
              chart.scrollbarX = new am4core.Scrollbar ();
              chart.scrollbarX.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
            }
          }
        }

        // Set category axis properties
        if (this.values.currentChartType.flags & ChartFlags.BULLET)
        {
          categoryAxis.renderer.labels.template.fontSize = 10;
          categoryAxis.renderer.labels.template.fill = Themes.AmCharts[theme].fontColor;
          categoryAxis.renderer.grid.template.strokeOpacity = 1;
          categoryAxis.renderer.grid.template.stroke = Themes.AmCharts[theme].stroke;
          categoryAxis.renderer.grid.template.strokeWidth = 1;
        }
        else
        {
          categoryAxis.renderer.labels.template.fontSize = 10;
          categoryAxis.renderer.labels.template.wrap = true;
          categoryAxis.renderer.labels.template.horizontalCenter  = "right";
          categoryAxis.renderer.labels.template.textAlign  = "end";
          categoryAxis.renderer.labels.template.fill = Themes.AmCharts[theme].fontColor;
          categoryAxis.renderer.grid.template.location = 0;
          categoryAxis.renderer.grid.template.strokeOpacity = 1;
          categoryAxis.renderer.line.strokeOpacity = 1;
          categoryAxis.renderer.grid.template.stroke = Themes.AmCharts[theme].stroke;
          categoryAxis.renderer.line.stroke = Themes.AmCharts[theme].stroke;
          categoryAxis.renderer.grid.template.strokeWidth = 1;
          categoryAxis.renderer.line.strokeWidth = 1;
        }

        // Set axis tooltip background color depending of the theme
        categoryAxis.tooltip.label.fill = Themes.AmCharts[theme].axisTooltipFontColor;
        categoryAxis.tooltip.background.fill = Themes.AmCharts[theme].tooltipFill;

        if (!(this.isSimpleChart () && valueAxes.length > 1))
        {
          // Set value axis properties
          valueAxis.renderer.labels.template.fontSize = 10;
          valueAxis.renderer.labels.template.fill = Themes.AmCharts[theme].fontColor;
          valueAxis.renderer.grid.template.strokeOpacity = 1;
          valueAxis.renderer.grid.template.stroke = Themes.AmCharts[theme].stroke;
          valueAxis.renderer.grid.template.strokeWidth = 1;

          valueAxis.tooltip.label.fill = Themes.AmCharts[theme].axisTooltipFontColor;
          valueAxis.tooltip.background.fill = Themes.AmCharts[theme].tooltipFill;
        }

        if (this.values.currentChartType.flags & ChartFlags.XYCHART)
        {
          if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
          {
            if (!(this.values.currentChartType.flags & ChartFlags.ROTATED))
            {
              if (this.values.horizAxisName && this.values.horizAxisName != "")
                categoryAxis.title.text = this.values.horizAxisName;
              else
                categoryAxis.title.text = "Intervals";

              if (!(this.isSimpleChart () && valueAxes.length > 1))
              {
                if (this.values.vertAxisName && this.values.vertAxisName != "")
                  valueAxis.title.text = this.values.vertAxisName;
                else
                {
                  if (this.values.valueColumn)
                    valueAxis.title.text = this.values.valueColumn.name;
                  else
                    valueAxis.title.text = "Count";
                }
              }
            }
            else
            {
              if (this.values.vertAxisName && this.values.vertAxisName != "")
                categoryAxis.title.text = this.values.vertAxisName;
              else
                categoryAxis.title.text = "Intervals";

              if (!(this.isSimpleChart () && valueAxes.length > 1))
              {
                if (this.values.horizAxisName && this.values.horizAxisName != "")
                  valueAxis.title.text = this.values.horizAxisName;
                else
                {
                  if (this.values.valueColumn)
                    valueAxis.title.text = this.values.valueColumn.name;
                  else
                    valueAxis.title.text = "Count";
                }
              }
            }

            categoryAxis.dataFields.category = "Interval";
          }
          else
          {
            // Set axis name into the chart
            if (!(this.values.currentChartType.flags & ChartFlags.ROTATED))
            {
              if (this.values.horizAxisName && this.values.horizAxisName != "")
                categoryAxis.title.text = this.values.horizAxisName;
              else
                categoryAxis.title.text = this.values.xaxis.name;

              if (!(this.isSimpleChart () && valueAxes.length > 1))
              {
                if (this.values.vertAxisName && this.values.vertAxisName != "")
                  valueAxis.title.text = this.values.vertAxisName;
                else
                {
                  if (this.values.valueColumn)
                    valueAxis.title.text = this.values.valueColumn.name;
                  else
                    valueAxis.title.text = "Count";
                }
              }
            }
            else
            {
              if (this.values.vertAxisName && this.values.vertAxisName != "")
                categoryAxis.title.text = this.values.vertAxisName;
              else
                categoryAxis.title.text = this.values.xaxis.name;

              if (!(this.isSimpleChart () && valueAxes.length > 1))
              {
                if (this.values.horizAxisName && this.values.horizAxisName != "")
                  valueAxis.title.text = this.values.horizAxisName;
                else
                {
                  if (this.values.valueColumn)
                    valueAxis.title.text = this.values.valueColumn.name;
                  else
                    valueAxis.title.text = "Count";
                }
              }
            }

            // The category will be the x axis if the chart type has it
            categoryAxis.dataFields.category = this.values.xaxis.id;
          }

          stacked = (this.values.currentChartType.flags & ChartFlags.STACKED) ? true : false;
          if (this.values.currentChartType.flags & ChartFlags.LINECHART && stacked)
          {
            // Avoid negative values on the stacked area chart
            for (let object of chartInfo.filter)
            {
              for (let data of chartInfo.data)
              {
                if (data[object.valueField] == null)
                  continue;

                if (data[object.valueField] < 0)
                  data[object.valueField] = 0;
              }
            }
          }

          if (this.values.ordered && !(this.values.currentChartType.flags & ChartFlags.ADVANCED) && !(this.values.currentChartType.flags & ChartFlags.BULLET))
          {
            // Sort chart series from least to greatest by calculating the
            // total value of each key item to compensate for the lack of proper
            // sorting by values
            if (parseDate && this.values.currentChartType.flags & ChartFlags.LINECHART)
            {
              // Sort by date the to get the correct order on the line chart
              // if the category axis is a date type
              let axisField = this.values.xaxis.id;
  
              chart.events.on ("beforedatavalidated", function (event) {
                chart.data.sort (function (e1, e2) {
                  return +(new Date(e1[axisField])) - +(new Date(e2[axisField]));
                });
              });
            }
            else
            {
              for (let item of chart.data)
              {
                let total = 0;

                for (let object of chartInfo.filter)
                {
                  let value = item[object.valueField];

                  if (value != null)
                    total += value;
                }

                item["sum"] = total;
              }

              chart.events.on ("beforedatavalidated", function (event) {
                chart.data.sort (function (e1, e2) {
                  return e1.sum - e2.sum;
                });
              });
            }
          }

          // Create the series and set colors
          chart.colors.list = [];

          for (let color of this.paletteColors)
            chart.colors.list.push (am4core.color (color));

          for (let object of chartInfo.filter)
          {
            if (this.values.variable.item.columnType === "date")
            {
              let date = this.parseDate (object.valueAxis, this.values.variable.item.columnFormat);
              let legendOutputFormat;

              if (date == null)
                continue;

              if (this.values.variable.item.outputFormat)
                legendOutputFormat = this.values.variable.item.outputFormat;
              else
                legendOutputFormat = this.values.variable.item.columnFormat;

              // Set predefined format if used
              if (this.predefinedColumnFormats[legendOutputFormat])
                legendOutputFormat = this.predefinedColumnFormats[legendOutputFormat];

              object.valueAxis = new DatePipe ('en-US').transform (date.toString (), legendOutputFormat);
            }

            this.values.chartSeries.push (this.values.currentChartType.createSeries (this.values, stacked, chart, object, parseDate, theme, outputFormat, this.paletteColors));
          }
        }
        else
        {
          if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
          {
            if (!(this.values.currentChartType.flags & ChartFlags.ROTATED))
            {
              if (this.values.horizAxisName && this.values.horizAxisName != "")
                categoryAxis.title.text = this.values.horizAxisName;
              else
                categoryAxis.title.text = "Intervals";

              if (!(this.isSimpleChart () && valueAxes.length > 1))
              {
                if (this.values.vertAxisName && this.values.vertAxisName != "")
                  valueAxis.title.text = this.values.vertAxisName;
                else
                {
                  if (this.values.valueColumn)
                    valueAxis.title.text = this.values.valueColumn.name;
                  else
                    valueAxis.title.text = "Count";
                }
              }
            }
            else
            {
              if (this.values.vertAxisName && this.values.vertAxisName != "")
                categoryAxis.title.text = this.values.vertAxisName;
              else
                categoryAxis.title.text = "Intervals";

              if (!(this.isSimpleChart () && valueAxes.length > 1))
              {
                if (this.values.horizAxisName && this.values.horizAxisName != "")
                  valueAxis.title.text = this.values.horizAxisName;
                else
                {
                  if (this.values.valueColumn)
                    valueAxis.title.text = this.values.valueColumn.name;
                  else
                    valueAxis.title.text = "Count";
                }
              }
            }
          }
          else
          {
            if (!(this.values.currentChartType.flags & ChartFlags.ROTATED))
            {
              if (this.values.horizAxisName && this.values.horizAxisName != "")
                categoryAxis.title.text = this.values.horizAxisName;
              else
                categoryAxis.title.text = this.values.variable.name;

              if (!(this.isSimpleChart () && valueAxes.length > 1))
              {
                if (this.values.vertAxisName && this.values.vertAxisName != "")
                  valueAxis.title.text = this.values.vertAxisName;
                else
                {
                  if (this.values.valueList && this.values.valueList.length == 1)
                    valueAxis.title.text = this.values.valueList[0].name;
                  else if (this.values.valueColumn && !this.values.valueList)
                    valueAxis.title.text = this.values.valueColumn.name;
                  else
                    valueAxis.title.text = this.values.function.name;
                }
              }
            }
            else
            {
              if (this.values.vertAxisName && this.values.vertAxisName != "")
                categoryAxis.title.text = this.values.vertAxisName;
              else
                categoryAxis.title.text = this.values.variable.name;

              if (!(this.isSimpleChart () && valueAxes.length > 1))
              {
                if (this.values.horizAxisName && this.values.horizAxisName != "")
                  valueAxis.title.text = this.values.horizAxisName;
                else
                {
                  if (this.values.valueList && this.values.valueList.length == 1)
                    valueAxis.title.text = this.values.valueList[0].name;
                  else if (this.values.valueColumn && !this.values.valueList)
                    valueAxis.title.text = this.values.valueColumn.name;
                  else
                    valueAxis.title.text = this.values.function.name;
                }
              }
            }

            if (this.values.ordered && !(this.values.currentChartType.flags & ChartFlags.ADVANCED) && !(this.values.currentChartType.flags & ChartFlags.BULLET))
            {
              if (this.values.valueList && this.values.valueList.length > 1)
              {
                for (let data of chart.data)
                {
                  let average = 0;

                  for (let object of chartInfo.valueFields)
                  {
                    let value = data[object];
  
                    if (value != null)
                      average += value;
                  }

                  data["avg"] = average / chartInfo.valueFields.length;
                }
  
                if (parseDate)
                {
                  let axisField = this.values.variable.id;

                  // reverse order for rotated charts
                  if (this.values.currentChartType.flags & ChartFlags.ROTATED)
                    categoryAxis.renderer.inversed = true;

                  chart.events.on ("beforedatavalidated", function (event) {
                    chart.data.sort (function (e1, e2) {
                      return +(new Date(e1[axisField])) - +(new Date(e2[axisField]));
                    });
                  });
                }
                else
                {
                  chart.events.on ("beforedatavalidated", function(event) {
                    chart.data.sort (function(e1, e2) {
                      return e1["avg"] - e2["avg"];
                    });
                  });
                }
              }
              else
              {
                if (parseDate)
                {
                  let axisField = this.values.variable.id;

                  // reverse order for rotated charts
                  if (this.values.currentChartType.flags & ChartFlags.ROTATED)
                    categoryAxis.renderer.inversed = true;

                  chart.events.on ("beforedatavalidated", function (event) {
                    chart.data.sort (function (e1, e2) {
                      return +(new Date(e1[axisField])) - +(new Date(e2[axisField]));
                    });
                  });
                }
                else
                {
                  // Sort values from least to greatest
                  chart.events.on ("beforedatavalidated", function(event) {
                    chart.data.sort (function(e1, e2) {
                      return e1[chartInfo.valueField] - e2[chartInfo.valueField];
                    });
                  });
                }
              }
            }
          }

          // The category will the values if the chart type lacks an x axis
          categoryAxis.dataFields.category = chartInfo.titleField;

          // Create the series
          if (this.values.valueList && this.values.valueList.length > 1)
          {
            for (let i = 0; i < chartInfo.valueFields.length; i++)
            {
              let prevChartType = this.values.currentChartType;
              let curValue = chartInfo.valueFields[i];
              let series;

              if (i != 0 && this.values.valueListInfo && this.values.valueListInfo.length)
                this.values.currentChartType = this.getChartType (this.values.valueListInfo[i].chartType);

              // Get value name for the legend
              for (let item of this.values.chartColumnOptions)
              {
                if (item.id === chartInfo.valueFields[i])
                {
                  curValue = item;
                  break;
                }
              }

              if (this.isSimpleChart () && this.values.currentChartType.flags & ChartFlags.LINECHART)
              {
                // set line color depending of the threshold
                for (let data of chart.data)
                {
                  let lineColor = am4core.color (this.paletteColors[i]);
                  let value = data[chartInfo.valueFields[i]];

                  for (let threshold of this.values.thresholds)
                  {
                    if (curValue.item.id == threshold.column && value >= threshold.min && value <= threshold.max)
                    {
                      lineColor = am4core.color (threshold.color);
                      break;
                    }
                  }

                  data["lineColor" + chartInfo.valueFields[i]] = lineColor;
                }
              }

              series = this.values.currentChartType.createSeries (this.values, curValue, chart, chartInfo, parseDate, i, outputFormat, this.paletteColors);

              if (!(this.values.currentChartType.flags & ChartFlags.ADVANCED))
              {
                if (this.values.valueListInfo.length > 1 && this.values.valueListInfo[i].axis)
                {
                  let found = false;

                  for (let valueAxis of valueAxes)
                  {
                    if (valueAxis.name === this.values.valueList[i].id)
                    {
                      if (this.values.currentChartType.flags & ChartFlags.ROTATED)
                        series.xAxis = valueAxis.item;
                      else
                        series.yAxis = valueAxis.item;

                      found = true;
                      break;
                    }
                  }

                  if (!found)
                  {
                    if (this.values.currentChartType.flags & ChartFlags.ROTATED)
                    {
                      if (!series.xAxis)
                        series.xAxis = valueAxis[0].item;
                    }
                    else
                    {
                      if (!series.yAxis)
                        series.yAxis = valueAxis[0].item;
                    }
                  }
                }
              }

              this.values.chartSeries.push (series);

              if (!chart.cursor)
              {
                chart.cursor = new am4charts.XYCursor ();

                if (this.values.currentChartType.flags & ChartFlags.ROTATED)
                  chart.cursor.lineX.zIndex = 2;
                else
                  chart.cursor.lineY.zIndex = 2;
              }

              if (!(this.values.currentChartType.flags & ChartFlags.LINECHART) && !barChartHoverSet)
              {
                if (this.values.currentChartType.flags & ChartFlags.ROTATED)
                {
                  chart.cursor.fullWidthLineY = true;
                  chart.cursor.yAxis = categoryAxis;
                  chart.cursor.lineX.disabled = true;
                  chart.cursor.lineX.zIndex = 1;
                  chart.cursor.lineY.strokeOpacity = 0;
                  chart.cursor.lineY.fill = black;
                  chart.cursor.lineY.fillOpacity = Themes.AmCharts[theme].barHoverOpacity;
                }
                else
                {
                  chart.cursor.fullWidthLineX = true;
                  chart.cursor.xAxis = categoryAxis;
                  chart.cursor.lineY.disabled = true;
                  chart.cursor.lineY.zIndex = 1;
                  chart.cursor.lineX.strokeOpacity = 0;
                  chart.cursor.lineX.fill = black;
                  chart.cursor.lineX.fillOpacity = Themes.AmCharts[theme].barHoverOpacity;
                }

                barChartHoverSet = true;
              }

              if (this.values.currentChartType.flags & ChartFlags.LINECHART && barChartHoverSet)
              {
                if (this.values.currentChartType.flags & ChartFlags.ROTATED)
                  chart.cursor.lineX.disabled = false;
                else
                  chart.cursor.lineY.disabled = false;
              }

              this.values.currentChartType = prevChartType;
            }
          }
          else
          {
            let curValue = null;

            for (let item of this.values.chartColumnOptions)
            {
              if (item.id === chartInfo.valueField)
              {
                curValue = item;
                break;
              }
            }

            if (this.isSimpleChart () && this.values.currentChartType.flags & ChartFlags.LINECHART)
            {
              // set line color depending of the threshold
              for (let data of chart.data)
              {
                let lineColor = am4core.color (this.paletteColors[0]);
                let value = data[chartInfo.valueField];

                for (let threshold of this.values.thresholds)
                {
                  if (curValue && curValue.item.id == threshold.column && value >= threshold.min && value <= threshold.max)
                  {
                    lineColor = am4core.color (threshold.color);
                    break;
                  }
                }

                data["lineColor" + chartInfo.valueField] = lineColor;
              }
            }

            this.values.chartSeries.push (this.values.currentChartType.createSeries (this.values, curValue, chart, chartInfo, parseDate, 0, outputFormat, this.paletteColors));
          }
        }

        if ((this.values.currentChartType.flags & ChartFlags.LINECHART || this.values.currentChartType.flags & ChartFlags.BULLET) && !chart.cursor)
        {
          chart.cursor = new am4charts.XYCursor ();

          if (this.values.currentChartType.flags & ChartFlags.BULLET)
          {
            chart.cursor.lineX.zIndex = 2;
            chart.cursor.lineY.zIndex = 2;
            chart.cursor.behavior = "zoomXY";
          }
          else
          {
            if (this.values.currentChartType.flags & ChartFlags.ROTATED)
              chart.cursor.lineX.zIndex = 2;
            else
              chart.cursor.lineY.zIndex = 2;
          }
        }

        if (chart.cursor)
        {
          if (!(this.values.currentChartType.flags & ChartFlags.LINECHART) && !(this.values.currentChartType.flags & ChartFlags.BULLET) && !barChartHoverSet)
          {
            if (this.values.currentChartType.flags & ChartFlags.ROTATED)
            {
              chart.cursor.fullWidthLineY = true;
              chart.cursor.yAxis = categoryAxis;
              chart.cursor.lineX.disabled = true;
              chart.cursor.lineY.strokeOpacity = 0;
              chart.cursor.lineY.fill = black;
              chart.cursor.lineY.fillOpacity = Themes.AmCharts[theme].barHoverOpacity;
            }
            else
            {
              chart.cursor.fullWidthLineX = true;
              chart.cursor.xAxis = categoryAxis;
              chart.cursor.lineY.disabled = true;
              chart.cursor.lineX.strokeOpacity = 0;
              chart.cursor.lineX.fill = black;
              chart.cursor.lineX.fillOpacity = Themes.AmCharts[theme].barHoverOpacity;
            }

            barChartHoverSet = true;
          }

          if (this.values.currentChartType.flags & ChartFlags.LINECHART && barChartHoverSet)
          {
             if (this.values.currentChartType.flags & ChartFlags.ROTATED)
              chart.cursor.lineX.disabled = false;
            else
              chart.cursor.lineY.disabled = false;
          }
        }

        // Create axis ranges if available
        if (!(this.isSimpleChart () && valueAxes.length > 1))
          goalAxis = valueAxis;
        else
          goalAxis = valueAxes[0].item;

        if (this.values.goals && this.values.goals.length)
        {
          for (let goal of this.values.goals)
          {
            let range = goalAxis.axisRanges.create ();

            range.value = goal.value;
            range.grid.stroke = am4core.color (goal.color);
            range.grid.strokeWidth = 2;
            range.grid.strokeOpacity = 1;
            range.grid.above = true;
            range.label.inside = true;
            range.label.text = goal.name;
            range.label.fill = range.grid.stroke;
            range.label.verticalCenter = "bottom";
          }
        }

        this.oldChartType = this.values.currentChartType;
        this.oldVariableName = !this.values.variable ? "" : this.values.variable.name;
        this.oldOptionCategories = JSON.parse (JSON.stringify (this.values.currentOptionCategories));

        // Add export menu
        chart.exporting.menu = new am4core.ExportMenu ();
        chart.exporting.menu.align = "left";
        chart.exporting.menu.verticalAlign = "bottom";
        chart.exporting.title = this.values.chartName;
        chart.exporting.description = this.values.chartDescription;
        chart.exporting.filePrefix = this.values.chartName;
        chart.exporting.useWebFonts = false;

        // Remove "Saved from..." message on PDF files
        options = chart.exporting.getFormatOptions ("pdf");
        options.addURL = false;
        chart.exporting.setFormatOptions ("pdf", options);
      }

      if (this.values.currentChartType.flags & ChartFlags.XYCHART && !(this.values.currentChartType.flags & ChartFlags.BULLET)
        || (this.isSimpleChart () && this.values.valueList && this.values.valueList.length > 1))
      {
        // Display Legend
        chart.legend = new am4charts.Legend ();
        chart.legend.markers.template.width = 15;
        chart.legend.markers.template.height = 15;
        chart.legend.labels.template.fontSize = 10;
        chart.legend.labels.template.fill = Themes.AmCharts[theme].fontColor;
      }

      // Add variable and categories into the dashboard control panel if they are not added
      this.addNewVariablesAndCategories.emit ({
        type: this.chartTypes.indexOf (this.values.currentChartType),
        analysisName: !this.values.variable ? null : this.values.variable.name,
        controlVariables: this.values.currentOptionCategories,
        chartSeries: this.values.chartSeries,
        optionId: this.values.currentOption.id
      });

      chart.tapToActivate = true;

      this.chart = chart;

      // build interval table for advanced charts
      if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
      {
        let sum = 0;

        if (this.values.currentChartType.flags & ChartFlags.XYCHART)
        {
          let self = this;
          let keys = [];

          // add keys first
          for (let item of this.chart.data)
          {
            Object.keys (item).forEach (function(key)
            {
              if (key === "Interval")
                return;

              if (keys.indexOf (key) == -1)
                keys.push (key);
            });
          }

          for (let key of keys)
          {
            let firstItem: boolean = true;

            for (let item of self.chart.data)
            {
              let value;

              if (item[key])
                value = item[key];
              else
                value = 0;

              sum += value;

              self.intervalTableRows.push ({
                key: firstItem ? key : " ",
                Interval: item["Interval"],
                value: value,
                sum: sum
              });

              firstItem = false;
            }
          };
        }
        else
        {
          for (let item of this.chart.data)
          {
            let label = item["Interval"];

            sum += item[this.values.valueColumn.id];

            this.intervalTableRows.push ({
              key: null,
              Interval: label,
              value: item[this.values.valueColumn.id],
              sum: sum
            });
          }
        }
      }

      //if (this.values.animated)
      //  am4core.options.autoSetClassName = false;
    });
  }

  destroyChart(): void
  {
    this.zone.runOutsideAngular (() => {
      if (this.chart)
      {
        this.imageSeries = null;
        this.lineSeries = null;
        this.shadowLineSeries = null;
        this.chart.dispose ();
      }
    });
  }

  ngAfterViewInit(): void
  {
    this.msfTableRef.tableOptions = this;

    if ((this.values.currentChartType.flags & ChartFlags.TABLE)
      || (this.values.currentChartType.flags & ChartFlags.MAPBOX)
      || (this.values.currentChartType.flags & ChartFlags.DYNTABLE))
    {
      if (this.values.function != null && this.values.function != -1)
        this.values.function = -1;
    }
    else if (!this.utils.isJSONEmpty (this.values.lastestResponse))
    {
      if (!this.isResponseValid ())
        return;

      if (this.values.currentChartType.flags & ChartFlags.INFO)
      {
        if (this.values.function != null && this.values.function != -1)
        {
          if (this.values.function == 1)
          {
            if (this.values.currentChartType.flags & ChartFlags.PICTURE)
              this.values.picGenerated = true;
            else if (this.values.currentChartType.flags & ChartFlags.EDITACTIONLIST)
              this.values.EditactionListGenerated = true;
            else if (this.values.currentChartType.flags & ChartFlags.FORM)
              this.values.formGenerated = true;
            else
              this.values.infoGenerated = true;
          }

          this.values.function = -1;
        }
      }
      else
      {
        this.values.chartGenerated = true;
        this.makeChart (this.values.lastestResponse);
      }
    }

    // set anchored control variables
    this.configureAnchoredControlVariables ();
  }

  ngAfterContentInit(): void
  {
    // these parts must be here because it generate an error if inserted on ngAfterViewInit
    this.initPanelSettings ();

    if ((this.values.currentChartType.flags & ChartFlags.TABLE)
      || (this.values.currentChartType.flags & ChartFlags.MAPBOX)
      || (this.values.currentChartType.flags & ChartFlags.DYNTABLE))
    {
      if (this.values.function == 1)
      {
        setTimeout (() =>
        {
          this.controlVariablesSet = true;
          this.loadData ();
        }, 100);
      }
    }
    else if (!this.utils.isJSONEmpty (this.values.lastestResponse))
    {
      if (!this.isResponseValid ())
        return;

      if (this.values.currentChartType.flags & ChartFlags.INFO)
      {
        if (this.values.function == 1)
        {
          setTimeout (() =>
          {
            this.values.chartSeries = [];

            // add the control variables into the control panel
            this.addNewVariablesAndCategories.emit ({
              type: this.chartTypes.indexOf (this.values.currentChartType),
              analysisName: null,
              controlVariables: this.values.currentOptionCategories,
              chartSeries: this.values.chartSeries,
              optionId: this.values.currentOption ? this.values.currentOption.id : null
            });

            this.oldChartType = null;
            this.oldVariableName = "";
            this.oldOptionCategories = JSON.parse (JSON.stringify (this.values.currentOptionCategories));
          }, 100);

          this.controlVariablesSet = true;

          if (this.values.currentChartType.flags & ChartFlags.PICTURE)
            this.displayPic = true;
          else if (this.values.currentChartType.flags & ChartFlags.EDITACTIONLIST)
            this.displayEditActionList = true;
          else if (this.values.currentChartType.flags & ChartFlags.FORM)
            this.displayForm = true;
          else
            this.displayInfo = true;
        }
      }
      else
      {
        this.controlVariablesSet = true;
        this.displayChart = true;
      }

      this.startUpdateInterval ();
    }
  }

  checkGroupingValue(categoryColumnName, values): boolean
  {
    if (values == null)
      return false;

    for (let value of values)
    {
      if (value.columnName === categoryColumnName)
        return true;          // already in the grouping list
    }

    return false;
  }

  checkGroupingCategory(argument): boolean
  {
    if (argument.name1 != null && argument.name1.toLowerCase ().includes ("grouping"))
    {
      if (this.values.currentChartType.flags & ChartFlags.TABLE || this.values.currentChartType.flags & ChartFlags.DYNTABLE)
        return true; // tables must not check this!
      else if (this.values.currentChartType.flags & ChartFlags.INFO)
      {
        if (this.values.currentChartType.flags & ChartFlags.FORM)
        {
          for (let formVariable of this.values.formVariables)
          {
            if (formVariable.column.item.grouping && !this.checkGroupingValue (formVariable.column.item.columnName, argument.value1))
              return false;
          }
        }
        else if (!(this.values.currentChartType.flags & (ChartFlags.PICTURE || ChartFlags.EDITACTIONLIST)))
        {
          if (this.values.infoVar1 != null && this.values.infoVar1.grouping)
            return false;

          if (this.values.infoVar2 != null && this.values.infoVar2.grouping)
            return false;

          if (this.values.infoVar3 != null && this.values.infoVar3.grouping)
            return false;
        }
      }
      else if (!(this.values.currentChartType.flags & ChartFlags.MAP))
      {
        if (this.values.variable.item.grouping && !this.checkGroupingValue (this.values.variable.item.columnName, argument.value1))
          return false;

        if (this.values.currentChartType.flags & ChartFlags.XYCHART)
        {
          if (this.values.xaxis.item.grouping && !this.checkGroupingValue (this.values.xaxis.item.columnName, argument.value1))
            return false;
        }

        if (this.isSimpleChart ())
        {
          let valuesWithNoGroup = 0;

          for (let value of this.values.valueList)
          {
            if (value.item.grouping && !this.checkGroupingValue (value.item.columnName, argument.value1))
              valuesWithNoGroup++;
          }

          if (valuesWithNoGroup == this.values.valueList.length)
            return false;
        }
        else
        {
          if (this.values.valueColumn.item.grouping && !this.checkGroupingValue (this.values.valueColumn.item.columnName, argument.value1))
            return false;
        }
      }
    }

    return true;
  }

  checkPanelVariables(): boolean
  {
    let currentOptionCategories = this.values.currentOptionCategories;

    if (currentOptionCategories)
    {
      for (let i = 0; i < currentOptionCategories.length; i++)
      {
        let category: CategoryArguments = currentOptionCategories[i];

        if (category && category.arguments)
        {
          for (let j = 0; j < category.arguments.length; j++)
          {
            let argument: Arguments = category.arguments[j];

            if (!this.checkGroupingCategory (argument))
              return false;
          }
        }
      }
    }

    return true;
  }

  getParameters()
  {
    let currentOptionCategories;
    let paramsGroup = [];
    let params;

    currentOptionCategories = this.values.currentOptionCategories;

    if (currentOptionCategories)
    {
      for (let i = 0; i < currentOptionCategories.length; i++)
      {
        let category: CategoryArguments = currentOptionCategories[i];

        if (category && category.arguments)
        {
          for (let j = 0; j < category.arguments.length; j++)
          {
            let argument: Arguments = category.arguments[j];

            if (argument.type != "AAA_Group")
            {
              if (params)
              {
                if (argument.type != "singleCheckbox" && argument.type != "serviceClasses" && argument.type != "fareLower" && argument.type != "airportsRoutes" && argument.name1 != "intermediateCitiesList")
                  params += "&" + this.utils.getArguments (argument);
                else if (argument.value1 != false && argument.value1 != "" && argument.value1 != undefined && argument.value1 != null)
                  params += "&" + this.utils.getArguments (argument);
              }
              else
                params = this.utils.getArguments(argument);
            }
            else
              paramsGroup.push ({ target: argument.targetGroup, val: this.utils.getValueFormat (argument.type, argument.value1, argument) });
          }
        }        
      }
    }

    return this.utils.setTarget (paramsGroup, params);
  }

  // return current panel information into a JSON for a http message body
  //
  // panels that only displays information will reuse some values from the database
  // for simplicity reasons: analysis, xaxis and values will store the data type used
  // for variables #1, #2 and #3 respectively; function will be used to check if the
  // results are generated or not and lastestResponse will store all the functions
  // values and results (if it was generated)
  getPanelInfo(): any
  {
    if (this.values.currentChartType.flags & ChartFlags.HEATMAP)
    {
      return {
        id: this.values.id,
        option: this.values.currentOption,
        title: this.values.chartName,
        description: this.values.chartDescription,
        chartType: this.chartTypes.indexOf (this.values.currentChartType),
        categoryOptions: this.values.currentOptionCategories ? JSON.stringify (this.values.currentOptionCategories) : null,
        function: this.geodatas.indexOf (this.values.geodata),
        updateTimeInterval: (this.values.updateIntervalSwitch ? this.values.updateTimeLeft : 0),
        analysis: this.values.chartColumnOptions ? (this.values.variable ? this.values.variable.item.id : null) : null,
        values: this.values.chartColumnOptions ? (this.values.valueColumn ? this.values.valueColumn.item.id : null) : null,
        paletteColors: JSON.stringify (this.values.paletteColors),
        lastestResponse: JSON.stringify (this.values.lastestResponse),
        thresholds: JSON.stringify (this.values.thresholds),
        goals: null,
        startAtZero: null,
        limitMode: this.values.limitMode,
        limitAmount: null,
        ordered: null,
        valueList: null,
        minValueRange: null,
        maxValueRange: null,
        horizAxisName: this.values.horizAxisName
      };
    }
    else if (this.values.currentChartType.flags & ChartFlags.MAPBOX)
    {
      return {
        id: this.values.id,
        option: this.values.currentOption,
        title: this.values.chartName,
        description: this.values.chartDescription,
        chartType: this.chartTypes.indexOf (this.values.currentChartType),
        categoryOptions: this.values.currentOptionCategories ? JSON.stringify (this.values.currentOptionCategories) : null,
        updateTimeInterval: (this.values.updateIntervalSwitch ? this.values.updateTimeLeft : 0),
        function: 1,
        lastestResponse: JSON.stringify (this.values.lastestResponse),
        analysis: this.msfMapRef.mapTypes.indexOf (this.values.style),
        startAtZero: null,
        limitMode: this.values.limitMode,
        limitAmount: null,
        ordered: null,
        valueList: null,
        minValueRange: null,
        maxValueRange: null
      };
    }
    else if (this.values.currentChartType.flags & ChartFlags.FORM
      || this.values.currentChartType.flags & ChartFlags.PICTURE
      || this.values.currentChartType.flags & ChartFlags.TABLE
      || this.values.currentChartType.flags & ChartFlags.DYNTABLE
      || this.values.currentChartType.flags & ChartFlags.MAP
      || this.values.currentChartType.flags & ChartFlags.EDITACTIONLIST)
    {
      return {
        id: this.values.id,
        option: this.values.currentOption,
        title: this.values.chartName,
        description: this.values.chartDescription,
        chartType: this.chartTypes.indexOf (this.values.currentChartType),
        categoryOptions: this.values.currentOptionCategories ? JSON.stringify (this.values.currentOptionCategories) : null,
        updateTimeInterval: (this.values.updateIntervalSwitch ? this.values.updateTimeLeft : 0),
        thresholds: (this.values.currentChartType.flags & ChartFlags.FORM || this.values.currentChartType.flags & ChartFlags.TABLE) ? JSON.stringify (this.values.thresholds) : null,
        goals: null,
        function: 1,
        lastestResponse: JSON.stringify (this.values.lastestResponse),
        startAtZero: null,
        limitMode: null,
        limitAmount: null,
        ordered: null,
        valueList: null,
        minValueRange: null,
        maxValueRange: null
      };
    }
    else if (this.values.currentChartType.flags & ChartFlags.INFO)
    {
      return {
        id: this.values.id,
        option: this.values.currentOption,
        title: this.values.chartName,
        description: this.values.chartDescription,
        analysis: this.values.chartColumnOptions ? (this.values.infoVar1 ? this.values.infoVar1.item.id : null) : null,
        xaxis: this.values.chartColumnOptions ? (this.values.infoVar2 ? this.values.infoVar2.item.id : null) : null,
        values: this.values.chartColumnOptions ? (this.values.infoVar3 ? this.values.infoVar3.item.id : null) : null,
        function: 1,
        chartType: this.chartTypes.indexOf (this.values.currentChartType),
        categoryOptions: this.values.currentOptionCategories ? JSON.stringify (this.values.currentOptionCategories) : null,
        updateTimeInterval: (this.values.updateIntervalSwitch ? this.values.updateTimeLeft : 0),
        startAtZero: null,
        limitMode: null,
        limitAmount: null,
        ordered: null,
        valueList: null,
        minValueRange: null,
        maxValueRange: null
      };
    }
    else if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
    {
      return {
        id: this.values.id,
        option: this.values.currentOption,
        title: this.values.chartName,
        description: this.values.chartDescription,
        analysis: this.values.chartColumnOptions ? (this.values.variable ? this.values.variable.item.id : null) : null,
        values: this.values.chartColumnOptions ? (this.values.valueColumn ? this.values.valueColumn.item.id : null) : null,
        function: this.values.intervalType === 'ncile' ? 0 : 1,
        chartType: this.chartTypes.indexOf (this.values.currentChartType),
        categoryOptions: this.values.currentOptionCategories ? JSON.stringify (this.values.currentOptionCategories) : null,
        paletteColors: JSON.stringify (this.values.paletteColors),
        updateTimeInterval: (this.values.updateIntervalSwitch ? this.values.updateTimeLeft : 0),
        vertAxisName: this.values.vertAxisName,
        horizAxisName: this.values.horizAxisName,
        advIntervalValue: this.values.intValue,
        startAtZero: null,
        limitMode: null,
        limitAmount: null,
        ordered: null,
        valueList: null,
        minValueRange: this.values.minValueRange,
        maxValueRange: this.values.maxValueRange,
        variableName: this.values.chartColumnOptions ? (this.values.variable ? this.values.variable.id : null) : null,
        valueName: this.values.chartColumnOptions ? (this.values.valueColumn ? this.values.valueColumn.id : null) : null,
        functionName: "advby" + this.values.intervalType
      };
    }
    else
    {
      return {
        id: this.values.id,
        option: this.values.currentOption,
        title: this.values.chartName,
        description: this.values.chartDescription,
        analysis: this.values.chartColumnOptions ? (this.values.variable ? this.values.variable.item.id : null) : null,
        xaxis: this.values.chartColumnOptions ? (this.values.xaxis ? this.values.xaxis.item.id : null) : null,
        values: this.values.chartColumnOptions ? (this.values.valueColumn && !(this.values.valueList && this.values.valueList.length) ? this.values.valueColumn.item.id : null) : null,
        function: this.functions.indexOf (this.values.function),
        chartType: this.chartTypes.indexOf (this.values.currentChartType),
        categoryOptions: this.values.currentOptionCategories ? JSON.stringify (this.values.currentOptionCategories) : null,
        paletteColors: JSON.stringify (this.values.paletteColors),
        updateTimeInterval: (this.values.updateIntervalSwitch ? this.values.updateTimeLeft : 0),
        thresholds: (this.isSimpleChart () ? JSON.stringify (this.values.thresholds) : null),
        goals: JSON.stringify (this.values.goals),
        vertAxisName: this.values.vertAxisName,
        horizAxisName: this.values.horizAxisName,
        startAtZero: this.values.startAtZero,
        limitMode: this.values.limitMode,
        limitAmount: this.values.limitAmount,
        ordered: this.values.ordered,
        valueList: this.generateValueList (),
        minValueRange: null,
        maxValueRange: null,
        variableName: this.values.chartColumnOptions ? (this.values.variable ? this.values.variable.id : null) : null,
        xaxisName: this.values.chartColumnOptions ? (this.values.xaxis ? this.values.xaxis.id : null) : null,
        valueName: this.values.chartColumnOptions ? ((this.values.valueColumn && !this.isSimpleChart ()) ? this.values.valueColumn.id : null) : null,
        functionName: this.values.function.id,
        valueNameList: this.generateValueNameList (),
        valueListInfo: this.generateValueListInfo ()
      };
    }
  }

  loadTextSummary(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg, panel, variables;

    this.values.isLoading = true;
    if (this.globals.currentApplication.name === "DataLake")
    {
      if (this.getParameters ())
        urlBase = this.values.currentOption.baseUrl + "?uName=" + this.globals.userName + "&" + this.getParameters ();
      else
        urlBase = this.values.currentOption.baseUrl + "?uName=" + this.globals.userName;
    }
    else
      urlBase = this.values.currentOption.baseUrl + "?" + this.getParameters ();

    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999&page_number=0";
    urlArg = encodeURIComponent (urlBase);

    // Prepare list of variables
    variables = [];

    for (let i = 0; i < this.values.infoNumVariables; i++)
    {
      let infoVar, infoFunc;

      switch (i)
      {
        case 2:
          infoVar = this.values.infoVar3;
          infoFunc = this.values.infoFunc3;
          break;

        case 1:
          infoVar = this.values.infoVar2;
          infoFunc = this.values.infoFunc2;
          break;

        default:
          infoVar = this.values.infoVar1;
          infoFunc = this.values.infoFunc1;
          break;
      }

      for (let j = 0; j < 5; j++)
      {
        let funcShortName = ['Avg ', 'Sum ', 'Min ', 'Max ', 'Count '];

        if (!infoFunc[j].checked)
          continue;

        variables.push ({
          id : i,
          function : infoFunc[j].id,
          title : (infoFunc[j].title && infoFunc[j].title != "") ? infoFunc[j].title : (funcShortName[j] + infoVar.name),
          measure : infoFunc[j].measure,
          column : infoVar.id
        });
      }
    }

    // set panel info for the HTTP message body
    panel = this.getPanelInfo ();
    panel.paletteColors = JSON.stringify (variables); // store the variables into the paletteColors for temporary use

    if (isDevMode ())
      console.log (urlArg);

    if (this.public)
      url = this.service.host + "/getTextSummaryResponse?url=" + urlArg;
    else
      url = this.service.host + "/secure/getTextSummaryResponse?url=" + urlArg;

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;
  
    this.authService.post (this, url, panel, handlerSuccess, handlerError);
  }

  loadChartData(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg, panel;

    // set panel info for the HTTP message body
    panel = this.getPanelInfo ();
    this.values.isLoading = true;

    if (this.globals.currentApplication.name === "DataLake")
    {
      if (this.getParameters ())
        urlBase = this.values.currentOption.baseUrl + "?uName=" + this.globals.userName + "&" + this.getParameters ();
      else
        urlBase = this.values.currentOption.baseUrl + "?uName=" + this.globals.userName;
    }
    else
      urlBase = this.values.currentOption.baseUrl + "?" + this.getParameters ();

    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999&page_number=0";
    urlArg = encodeURIComponent (urlBase);

    if (isDevMode ())
      console.log (urlBase);


    if (this.public)
      url = this.service.host + "/getChartData?url=" + urlArg + "&optionId=" + this.values.currentOption.id;
    else
      url = this.service.host + "/secure/getChartData?url=" + urlArg + "&optionId=" + this.values.currentOption.id;

    if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
    {
      if (this.values.currentChartType.flags & ChartFlags.XYCHART)
        url += "&chartType=advancedbar";
      else
        url += "&chartType=simpleadvancedbar";
    }
    else
    {
      // don't use the xaxis parameter if the chart type is pie, donut or radar
      if (this.values.currentChartType.flags & ChartFlags.PIECHART || this.values.currentChartType.flags & ChartFlags.FUNNELCHART)
        url += "&chartType=pie";
      else if (this.values.currentChartType.flags & ChartFlags.BULLET)
        url += "&chartType=scatter";
      else if (!(this.values.currentChartType.flags & ChartFlags.XYCHART))
        url += "&chartType=simplebar";
    }

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    url += "&saveResults=1";

    this.authService.post (this, url, panel, handlerSuccess, handlerError);
  }

  loadMapData(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg;

    this.values.isLoading = true;
    if (this.globals.currentApplication.name === "DataLake")
    {
      if (this.getParameters ())
        urlBase = this.values.currentOption.baseUrl + "?uName=" + this.globals.userName + "&" + this.getParameters ();
      else
        urlBase = this.values.currentOption.baseUrl + "?uName=" + this.globals.userName;
    }
    else
      urlBase = this.values.currentOption.baseUrl + "?" + this.getParameters ();

    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999&page_number=0";
    urlArg = encodeURIComponent (urlBase);

    if (isDevMode ())
      console.log (urlBase);

    if (this.public)
      url = this.service.host + "/consumeWebServices?url=" + urlArg + "&optionId=" + this.values.currentOption.id;
    else
      url = this.service.host + "/secure/consumeWebServices?url=" + urlArg + "&optionId=" + this.values.currentOption.id;

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    this.authService.get (this, url, handlerSuccess, handlerError);
  }

  loadMapboxData(handlerSuccess, handlerError): void
  {
    let params, url, urlArg;

    this.values.isLoading = true;
    this.displayMapbox = true;
    this.msfMapRef.data = [];
    this.msfMapRef.coordinates = [];
 
    params = this.getParameters ();
    url = this.globals.baseUrl2 + "/getMapBoxTracking?" + params;
    urlArg = encodeURIComponent (url);

    if (isDevMode ())
      console.log (url);

    if (this.public)
      url = this.service.host + "/consumeWebServices?url=" + urlArg + "&optionId=" + this.values.currentOption.id + "&noXml=true";
    else
      url = this.service.host + "/secure/consumeWebServices?url=" + urlArg + "&optionId=" + this.values.currentOption.id + "&noXml=true";

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    this.authService.get (this.msfMapRef, url, handlerSuccess, handlerError);
  }

  loadFormData(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg, formConfig;

    this.values.isLoading = true;
    if (this.globals.currentApplication.name === "DataLake")
    {
      if (this.getParameters ())
        urlBase = this.values.currentOption.baseUrl + "?uName=" + this.globals.userName + "&" + this.getParameters ();
      else
        urlBase = this.values.currentOption.baseUrl + "?uName=" + this.globals.userName;
    }
    else
      urlBase = this.values.currentOption.baseUrl + "?" + this.getParameters ();

    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999&page_number=0";
    urlArg = encodeURIComponent (urlBase);

    if (isDevMode ())
      console.log (urlBase);

    if (this.public)
      url = this.service.host + "/getFormResponse?url=" + urlArg + "&optionId=" + this.values.currentOption.id;
    else
      url = this.service.host + "/secure/getFormResponse?url=" + urlArg + "&optionId=" + this.values.currentOption.id;

    // Prepare the form configuration
    formConfig = [];

    for (let formVariable of this.values.formVariables)
    {
      formConfig.push ({
        function : formVariable.function.id,
        column : formVariable.column.id
      });
    }

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    this.authService.post (this, url, formConfig, handlerSuccess, handlerError);
  }

  loadTableData(moreResults, handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg;

    this.msfTableRef.displayedColumns = [];
  
    if (moreResults)
    {      
      if(this.pageIndex){
        this.actualPageNumber = this.pageIndex.pageIndex;
        this.moreResults = true;
      }else{
        this.actualPageNumber++;
      }
    }
    else{
      this.actualPageNumber = 0;
      // this.authService.removeTokenResultTable();
      this.values.tokenResultTable = "";
    }

    if (!this.actualPageNumber)
      this.msfTableRef.dataSource = null;

    this.values.isLoading = true;

    this.msfTableRef.actualPageNumber = this.actualPageNumber;
    // this.authService.removeTokenResultTable(); // para que cada vez que ejecute un dashboard trabaje con un token nuevo
    let tokenResultTable = this.values.tokenResultTable;
    
    if (this.globals.currentApplication.name === "DataLake")
    {
      if (this.getParameters ())
        urlBase = this.values.currentOption.baseUrl + "?uName=" + this.globals.userName + "&" + this.getParameters ();
      else
        urlBase = this.values.currentOption.baseUrl + "?uName=" + this.globals.userName;
    }
    else
      urlBase = this.values.currentOption.baseUrl + "?" + this.getParameters ();

    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=" + Globals.TABLE_PAGESIZE + "&page_number=" + this.actualPageNumber+"&token="+tokenResultTable+"&sortingColumns=" + this.values.ListSortingColumns;
    urlArg = encodeURIComponent (urlBase);

    if (isDevMode ())
      console.log (urlBase);

    if (this.public)
      url = this.service.host + "/consumeWebServices?url=" + urlArg + "&optionId=" + this.values.currentOption.id;
    else
      url = this.service.host + "/secure/consumeWebServices?url=" + urlArg + "&optionId=" + this.values.currentOption.id;

    for (let tableVariable of this.values.tableVariables)
    {
      if (tableVariable.checked)
        url += "&metaDataIds=" + tableVariable.itemId;
    }

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    this.authService.get (this.msfTableRef, url, handlerSuccess, handlerError);
  }

  loadDynamicTableData(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg, data;

    this.values.isLoading = true;
    if (this.globals.currentApplication.name === "DataLake")
    {
      if (this.getParameters ())
        urlBase = this.values.currentOption.baseUrl + "?uName=" + this.globals.userName + "&" + this.getParameters ();
      else
        urlBase = this.values.currentOption.baseUrl + "?uName=" + this.globals.userName;
    }
    else
      urlBase = this.values.currentOption.baseUrl + "?" + this.getParameters ();

    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999&page_number=0";
    urlArg = encodeURIComponent (urlBase);

    if (isDevMode ())
      console.log (urlBase);

    data = { variables: this.values.dynTableVariables, values: this.values.dynTableValues };

    if (this.public)
      url = this.service.host + "/getHorizontalMatrix?url=" + urlArg + "&optionId=" + this.values.currentOption.id;
    else
      url = this.service.host + "/secure/getHorizontalMatrix?url=" + urlArg + "&optionId=" + this.values.currentOption.id;

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    this.authService.post (this, url, data, handlerSuccess, handlerError);
  }

  loadData(): void
  {
    if (!this.values.chartName)
      this.values.chartName = "Untitled";

    this.routepanelinfo = [];
    this.globals.startTimestamp = new Date ();

    // check if any variable that requires grouping are in configure properly
    /*if (!this.checkPanelVariables ())
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "Some variables used to get the results must be added in the grouping inside the control variables." }
      });

      return;
    }*/

    if (this.values.currentChartType.flags & ChartFlags.MAPBOX)
      this.loadMapboxData (this.msfMapRef.successHandler, this.msfMapRef.errorHandler);
    else if (this.values.currentChartType.flags & ChartFlags.HEATMAP)
      this.loadMapData (this.handlerHeatMapSuccess, this.handlerHeatMapError);
    else if (this.values.currentChartType.flags & ChartFlags.MAP)
      this.loadMapData (this.handlerMapSuccess, this.handlerMapError);
    else if (this.values.currentChartType.flags & ChartFlags.DYNTABLE)
      this.loadDynamicTableData (this.handlerDynTableSuccess, this.handlerDynTableError);
    else if (this.values.currentChartType.flags & ChartFlags.TABLE)
      this.loadTableData (false, this.msfTableRef.handlerSuccess, this.msfTableRef.handlerError);
    else if (this.values.currentChartType.flags & ChartFlags.PICTURE)
      this.loadPicData ();
    else if (this.values.currentChartType.flags & ChartFlags.EDITACTIONLIST)
      this.loadActionListData ();
    else if (this.values.currentChartType.flags & ChartFlags.FORM)
      this.loadFormData (this.handlerFormSuccess, this.handlerFormError);
    else if (this.values.currentChartType.flags & ChartFlags.INFO)
      this.loadTextSummary (this.handlerTextSuccess, this.handlerTextError);
    else
      this.loadChartData (this.handlerChartSuccess, this.handlerChartError);
  }

  ngOnDestroy()
  {
    if (this.updateInterval)
      clearInterval (this.updateInterval);

    this.destroyChart ();
  }

  isResponseValid(): boolean
  {
    if (this.values.currentChartType.flags & ChartFlags.MAP
      || this.values.currentChartType.flags & ChartFlags.HEATMAP)
    {
      if (this.utils.isJSONEmpty (this.values.lastestResponse))
        return false;
    }
    else if (this.values.currentChartType.flags & ChartFlags.INFO)
    {
      if (this.values.currentChartType.flags & ChartFlags.FORM)
      {
        if (!this.values.lastestResponse.length)
          return false;
      }
      else if (this.values.currentChartType.flags & ChartFlags.PICTURE)
      {
        if (!this.values.urlImg || (this.values.urlImg && !this.values.urlImg.length))
          return false;
      }
      else if (this.values.currentChartType.flags & ChartFlags.EDITACTIONLIST)
      {
        if (!this.values.EditActionList || (this.values.EditActionList && !this.values.EditActionList.length))
          return false;
      }
      else
      {
        if (!this.haveDataInfo (this.values.lastestResponse))
          return false;
      }
    }
    else
    {
      if (this.values.currentChartType.flags & ChartFlags.XYCHART && this.utils.isJSONEmpty (this.values.lastestResponse.data))
        return false;

      if ((!(this.values.currentChartType.flags & ChartFlags.XYCHART) && this.values.lastestResponse.dataProvider == null) ||
        (this.values.currentChartType.flags & ChartFlags.XYCHART && !this.values.lastestResponse.filter))
        return false;
    }

    return true;
  }

  noDataFound(): void
  {
    this.values.lastestResponse = null;
    this.values.chartGenerated = false;
    this.values.infoGenerated = false;
    this.values.formGenerated = false;
    this.values.picGenerated = false;
    this.values.tableGenerated = false;
    this.values.mapboxGenerated = false;
    this.values.dynTableGenerated = false;
    this.values.isLoading = false;

    if (this.values.currentChartType.flags & ChartFlags.MAP)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "No data available for the map." }
      });
    }
    else if (this.values.currentChartType.flags & ChartFlags.DYNTABLE)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "No data available for the dynamic table." }
      });      
    }
    else if (this.values.currentChartType.flags & ChartFlags.TABLE)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "No data available for the table." }
      });
    }
    else if (this.values.currentChartType.flags & ChartFlags.PICTURE)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "No image available." }
      });
    }
    else if (this.values.currentChartType.flags & ChartFlags.EDITACTIONLIST)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "No image available." }
      });
    }
    else if (this.values.currentChartType.flags & ChartFlags.FORM)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "No data available for the form." }
      });
    }
    else if (this.values.currentChartType.flags & ChartFlags.INFO)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "No data available for information." }
      });
    }
    else
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "No data available for chart generation." }
      });
    }
  }

  haveDataInfo(data): boolean
  {
    let numEmpty = 0;

    for (let i = 0; i < data.length; i++)
    {
      if (data[i].value == null)
        numEmpty++;
    }

    if (numEmpty == data.length)
      return false;
    else
      return true;
  }

  getMainKey(keys, response)
  {
    for (let i of keys)
    {
      let obj = response[i];

      if (obj instanceof Object)
        return obj;
    }

    return null;
  }

  finishMapboxLoading(error)
  {
    if (error)
    {
      this.displayMapbox = false;
      this.handlerMapboxError (this, "Failed to generate the results for the map tracker.");
    }
    else
    {
      if (!this.values.isLoading)
        return;

      this.values.lastestResponse = 1;
      this.service.saveLastestResponse (this, this.getPanelInfo (), this.handlerMapboxLastestResponse, this.handlerMapboxError);
    }
  }

  handlerHeatMapSuccess(_this, data): void
  {
    let response, result;

    if (!_this.values.isLoading)
      return;

    if (_this.utils.isJSONEmpty (data) || _this.utils.isJSONEmpty (data.Response))
    {
      _this.noDataFound ();
      return;
    }

    // only use the first result and filter out the values
    response = data.Response;
    for (let key in response)
    {
      let array = response[key];
      if (array != null)
      {
        if (Array.isArray (array))
        {
          result = array;
          break;
        }
      }
    }

    _this.values.lastestResponse = result;
    _this.service.saveLastestResponse (_this, _this.getPanelInfo (), _this.handlerHeatMapLastestResponse, _this.handlerHeatMapError);
  }

  handlerMapSuccess(_this, data): void
  {
    let response, result;

    if (!_this.values.isLoading)
      return;

    if (_this.utils.isJSONEmpty (data) || _this.utils.isJSONEmpty (data.Response))
    {
      _this.noDataFound ();
      return;
    }

    // only use the first result and filter out the values
    response = data.Response;
    for (let key in response)
    {
      let array = response[key];
      if (array != null)
      {
        if (Array.isArray (array))
        {
          result = array;
          break;
        }
      }
    }

    _this.values.lastestResponse = result;

    if (_this.values.currentOption.metaData == 4 || _this.values.currentOption.metaData == 5)
      _this.values.flightRoutes = [];
    else
      _this.values.flightRoutes = JSON.parse (JSON.stringify (_this.values.lastestResponse));

    _this.service.saveLastestResponse (_this, _this.getPanelInfo (), _this.handlerMapLastestResponse, _this.handlerMapError);
  }

  handlerDynTableSuccess(_this, data): void
  {
    let topOffsetValue = 0;

    if (!_this.values.isLoading)
      return;

    if (data == null)
    {
      _this.noDataFound ();
      return;
    }

    _this.dynTableData = data;
    _this.yAxisColSpan = 1;

    for (let i = 0; i < _this.dynTableData.headers.length; i++)
    {
      let header = _this.dynTableData.headers[i];
      header.topOffset = topOffsetValue;

      if (!i)
      {
        for (let j = 0; j < header.values.length - 1; j++)
        {
          let value = header.values[j];

          _this.yAxisColSpan += value.colSpan;
        }
      }

      topOffsetValue += 35;
    }

    _this.values.lastestResponse = {
      variables: _this.values.dynTableVariables,
      values: _this.values.dynTableValues
    };

    _this.service.saveLastestResponse (_this, _this.getPanelInfo (), _this.handlerDynTableLastestResponse, _this.handlerDynTableError);
  }

  
  loadActionListData() {
    this.values.lastestResponse = this.values.EditActionList;
    this.values.isLoading = true;
    this.service.saveLastestResponse (this, this.getPanelInfo (), this.handlerEditACtionSuccess, this.handlerEditActionError);
  }

  loadPicData(): void
  {


    // if (data == null)
    // {      
    //   _this.noDataFound ();
    //   return;
    // }

    // destroy current chart if it's already generated to avoid a blank chart later
    this.values.lastestResponse = this.values.urlImg;
    this.values.isLoading = true;
    this.service.saveLastestResponse (this, this.getPanelInfo (), this.handlerPicSuccess, this.handlerPicError);
  }

  handlerEditACtionSuccess(_this): void
  {
    if (!_this.values.isLoading)
      return;

    _this.values.isLoading = false;
    _this.destroyChart ();

    _this.displayChart = false;
    _this.displayInfo = false;
    _this.displayForm = false;
    _this.displayMapbox = false;
    _this.displayPic = false;
    _this.displayTable = false;
    _this.displayDynTable = false;
    _this.displayEditActionList = true;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.EditactionListGenerated = true;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.dynTableGenerated = false;

    _this.removeDeadVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.oldChartType),
      analysisName: _this.oldVariableName,
      chartSeries: _this.values.chartSeries,
      controlVariables: _this.oldOptionCategories
    });

    _this.values.chartSeries = [];

    _this.addNewVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.values.currentChartType),
      analysisName: null,
      controlVariables: _this.values.currentOptionCategories,
      chartSeries: _this.values.chartSeries,
      optionId: null
    });

    _this.oldChartType = null;
    _this.oldVariableName = "";
    _this.oldOptionCategories = JSON.parse (JSON.stringify (_this.values.currentOptionCategories));

    _this.anchoredArguments = []; // images has no control variables

    _this.stopUpdateInterval ();
    _this.startUpdateInterval ();
  }

  handlerPicSuccess(_this): void
  {
    if (!_this.values.isLoading)
      return;

    _this.values.isLoading = false;
    _this.destroyChart ();

    _this.displayChart = false;
    _this.displayInfo = false;
    _this.displayForm = false;
    _this.displayMapbox = false;
    _this.displayTable = false;
    _this.displayDynTable = false;
    _this.displayEditActionList = false;
    _this.displayPic = true;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = true;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.dynTableGenerated = false;

    _this.removeDeadVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.oldChartType),
      analysisName: _this.oldVariableName,
      chartSeries: _this.values.chartSeries,
      controlVariables: _this.oldOptionCategories
    });

    _this.values.chartSeries = [];

    _this.addNewVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.values.currentChartType),
      analysisName: null,
      controlVariables: _this.values.currentOptionCategories,
      chartSeries: _this.values.chartSeries,
      optionId: null
    });

    _this.oldChartType = null;
    _this.oldVariableName = "";
    _this.oldOptionCategories = JSON.parse (JSON.stringify (_this.values.currentOptionCategories));

    _this.anchoredArguments = []; // images has no control variables

    _this.stopUpdateInterval ();
    _this.startUpdateInterval ();
  }

  handlerFormSuccess(_this, data): void
  {
    let formResults, result;

    if (!_this.values.isLoading)
      return;

    formResults = [];

    if (!_this.haveDataInfo (data))
    {
      _this.noDataFound ();
      return;
    }

    for (let i = 0; i < data.length; i++)
    {
      let formVariable = _this.values.formVariables[i];
      let value = data[i].value;

      formResults.push ({
        value: (isNaN (value) ? value : _this.getResultValue (value)),
        column: formVariable.column.item.id,
        fontSize: _this.fontSizes.indexOf (formVariable.fontSize),
        valueFontSize: _this.fontSizes.indexOf (formVariable.valueFontSize),
        valueOrientation: _this.orientations.indexOf (formVariable.valueOrientation),
        function: _this.functions.indexOf (formVariable.function)
      });
    }

    _this.values.lastestResponse = formResults;

    // save the panel into the database
    _this.service.saveLastestResponse (_this, _this.getPanelInfo (), _this.handlerFormLastestResponse, _this.handlerFormError);
  }

  handlerFormLastestResponse(_this): void
  {
    let data = JSON.parse (JSON.stringify (_this.values.lastestResponse));

    if (!_this.values.isLoading)
      return;

    _this.values.lastestResponse = [];

    for (let formVariable of data)
    {
      let columnIndex = 0;

      for (let i = 0; i < _this.values.chartColumnOptions.length; i++)
      {
        if (_this.values.chartColumnOptions[i].item.id === formVariable.column)
        {
          columnIndex = i;
          break;
        }
      }

      _this.values.lastestResponse.push ({
        value: formVariable.value,
        column: _this.values.chartColumnOptions[columnIndex].item,
        fontSize: _this.fontSizes[formVariable.fontSize],
        valueFontSize: _this.fontSizes[formVariable.valueFontSize],
        valueOrientation: _this.orientations[formVariable.valueOrientation],
        function: _this.functions[formVariable.function]
      });
    }

    // destroy current chart if it's already generated to avoid a blank chart later
    _this.destroyChart ();

    _this.values.isLoading = false;
    _this.displayChart = false;
    _this.displayInfo = false;
    _this.displayMapbox = false;
    _this.displayPic = false;
    _this.displayTable = false;
    _this.displayDynTable = false;
    _this.displayEditActionList = false;
    _this.displayForm = true;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = true;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.dynTableGenerated = false;

    _this.removeDeadVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.oldChartType),
      analysisName: _this.oldVariableName,
      chartSeries: _this.values.chartSeries,
      controlVariables: _this.oldOptionCategories
    });

    _this.values.chartSeries = [];

    _this.addNewVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.values.currentChartType),
      analysisName: null,
      controlVariables: _this.values.currentOptionCategories,
      chartSeries: _this.values.chartSeries,
      optionId: _this.values.currentOption.id
    });

    _this.oldChartType = null;
    _this.oldVariableName = "";
    _this.oldOptionCategories = JSON.parse (JSON.stringify (_this.values.currentOptionCategories));

    _this.configureAnchoredControlVariables ();

    _this.stopUpdateInterval ();
    _this.startUpdateInterval ();
  }

  handlerTableLastestResponse(_this): void
  {
    if (!_this.values.isLoading)
      return;

    _this.values.isLoading = false;

    // destroy current chart if it's already generated to avoid a blank chart later
    _this.destroyChart ();

    _this.displayChart = false;
    _this.displayInfo = false;
    _this.displayForm = false;
    _this.displayMapbox = false;
    _this.displayPic = false;
    _this.displayDynTable = false;
    _this.displayEditActionList = false;
    _this.displayTable = true;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = true;
    _this.values.mapboxGenerated = false;
    _this.values.dynTableGenerated = false;

    _this.removeDeadVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.oldChartType),
      analysisName: _this.oldVariableName,
      chartSeries: _this.values.chartSeries,
      controlVariables: _this.oldOptionCategories
    });

    _this.values.chartSeries = [];

    _this.addNewVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.values.currentChartType),
      analysisName: null,
      controlVariables: _this.values.currentOptionCategories,
      chartSeries: _this.values.chartSeries,
      optionId: _this.values.currentOption.id
    });

    _this.oldChartType = null;
    _this.oldVariableName = "";
    _this.oldOptionCategories = JSON.parse (JSON.stringify (_this.values.currentOptionCategories));

    _this.configureAnchoredControlVariables ();

    _this.stopUpdateInterval ();
    _this.startUpdateInterval ();
  }

  handlerDynTableLastestResponse(_this): void
  {
    if (!_this.values.isLoading)
      return;

    _this.values.isLoading = false;

    // destroy current chart if it's already generated to avoid a blank chart later
    _this.destroyChart ();

    _this.displayChart = false;
    _this.displayInfo = false;
    _this.displayForm = false;
    _this.displayMapbox = false;
    _this.displayPic = false;
    _this.displayTable = false;
    _this.displayEditActionList = false;
    _this.displayDynTable = true;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.dynTableGenerated = true;

    _this.removeDeadVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.oldChartType),
      analysisName: _this.oldVariableName,
      chartSeries: _this.values.chartSeries,
      controlVariables: _this.oldOptionCategories
    });

    _this.values.chartSeries = [];

    _this.addNewVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.values.currentChartType),
      analysisName: null,
      controlVariables: _this.values.currentOptionCategories,
      chartSeries: _this.values.chartSeries,
      optionId: _this.values.currentOption.id
    });

    _this.oldChartType = null;
    _this.oldVariableName = "";
    _this.oldOptionCategories = JSON.parse (JSON.stringify (_this.values.currentOptionCategories));

    _this.configureAnchoredControlVariables ();

    _this.stopUpdateInterval ();
    _this.startUpdateInterval ();
  }

  handlerMapboxLastestResponse(_this): void
  {
    if (!_this.values.isLoading)
      return;

    _this.values.isLoading = false;

    _this.destroyChart ();

    _this.displayChart = false;
    _this.displayInfo = false;
    _this.displayForm = false;
    _this.displayPic = false;
    _this.displayTable = false;
    _this.displayDynTable = false;
    _this.displayEditActionList = false;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = true;
    _this.values.dynTableGenerated = false;

    _this.removeDeadVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.oldChartType),
      analysisName: _this.oldVariableName,
      chartSeries: _this.values.chartSeries,
      controlVariables: _this.oldOptionCategories
    });

    _this.values.chartSeries = [];

    _this.addNewVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.values.currentChartType),
      analysisName: null,
      controlVariables: _this.values.currentOptionCategories,
      chartSeries: _this.values.chartSeries,
      optionId: _this.values.currentOption.id
    });

    _this.oldChartType = null;
    _this.oldVariableName = "";
    _this.oldOptionCategories = JSON.parse (JSON.stringify (_this.values.currentOptionCategories));

    _this.configureAnchoredControlVariables ();

    setTimeout (() => {
      _this.values.isLoading = false;
      _this.msfMapRef.resizeMap ();
    }, 50);

    _this.mapboxInterval = setInterval (() =>
    {
      if (_this.lastWidth != _this.values.width)
      {
        _this.msfMapRef.resizeMap ();
        _this.lastWidth = _this.values.width;
      }
    }, 500);

    _this.stopUpdateInterval ();
    _this.startUpdateInterval ();
  }

  handlerHeatMapLastestResponse(_this): void
  {
    if (!_this.values.isLoading)
      return;

    _this.destroyChart ();

    _this.displayInfo = false;
    _this.displayForm = false;
    _this.displayMapbox = false;
    _this.displayPic = false;
    _this.displayTable = false;
    _this.displayDynTable = false;
    _this.displayEditActionList = false;
    _this.displayChart = true;
    _this.values.chartGenerated = true;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.dynTableGenerated = false;

    setTimeout (() =>
    {
      _this.values.isLoading = false;

      _this.makeChart (_this.values.lastestResponse);
      _this.configureAnchoredControlVariables ();
  
      _this.stopUpdateInterval ();
      _this.startUpdateInterval ();
    }, 50);
  }

  handlerMapLastestResponse(_this): void
  {
    if (!_this.values.isLoading)
      return;

    // destroy current chart if it's already generated to avoid a blank chart
    _this.destroyChart ();

    _this.displayInfo = false;
    _this.displayForm = false;
    _this.displayMapbox = false;
    _this.displayPic = false;
    _this.displayTable = false;
    _this.displayDynTable = false;
    _this.displayEditActionList = false;
    _this.displayChart = true;
    _this.values.chartGenerated = true;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.dynTableGenerated = false;

    setTimeout (() =>
    {
      _this.values.isLoading = false;

      _this.makeChart (_this.values.lastestResponse);
      _this.configureAnchoredControlVariables ();
  
      _this.stopUpdateInterval ();
      _this.startUpdateInterval ();
    }, 50);
  }

  handlerTextSuccess(_this, data): void
  {
    if (!_this.values.isLoading)
      return;

    if (!_this.haveDataInfo (data))
    {
      _this.noDataFound ();
      return;
    }

    _this.values.lastestResponse = data;

    // destroy current chart if it's already generated to avoid a blank chart later
    _this.destroyChart ();

    _this.displayChart = false;
    _this.displayForm = false;
    _this.displayMapbox = false;
    _this.displayPic = false;
    _this.displayTable = false;
    _this.displayDynTable = false;
    _this.displayEditActionList = false;
    _this.displayInfo = true;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = true;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.dynTableGenerated = false;
    _this.values.isLoading = false;

    _this.removeDeadVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.oldChartType),
      analysisName: _this.oldVariableName,
      chartSeries: _this.values.chartSeries,
      controlVariables: _this.oldOptionCategories
    });

    _this.values.chartSeries = [];

    _this.addNewVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.values.currentChartType),
      analysisName: null,
      controlVariables: _this.values.currentOptionCategories,
      chartSeries: _this.values.chartSeries,
      optionId: _this.values.currentOption.id
    });

    _this.oldChartType = null;
    _this.oldVariableName = "";
    _this.oldOptionCategories = JSON.parse (JSON.stringify (_this.values.currentOptionCategories));

    _this.configureAnchoredControlVariables ();

    _this.stopUpdateInterval ();
    _this.startUpdateInterval ();
  }

  handlerChartSuccess(_this, data): void
  {
    if (!_this.values.isLoading)
      return;

    if (_this.values.currentChartType.flags & ChartFlags.XYCHART && _this.utils.isJSONEmpty (data.data))
    {
      _this.noDataFound ();
      return;
    }

    if ((!(_this.values.currentChartType.flags & ChartFlags.XYCHART) && data.dataProvider == null) ||
      (_this.values.currentChartType.flags & ChartFlags.XYCHART && !data.filter))
    {
      _this.noDataFound ();
      return;
    }

    // destroy current chart if it's already generated to avoid a blank chart
    _this.destroyChart ();

    _this.displayInfo = false;
    _this.displayForm = false;
    _this.displayMapbox = false;
    _this.displayPic = false;
    _this.displayTable = false;
    _this.displayDynTable = false;
    _this.displayEditActionList = false;
    _this.displayChart = true;
    _this.values.chartGenerated = true;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.dynTableGenerated = false;

    setTimeout (() =>
    {
      _this.values.isLoading = false;

      _this.makeChart (data);
      _this.configureAnchoredControlVariables ();
  
      _this.stopUpdateInterval ();
      _this.startUpdateInterval ();
    }, 50);
  }

  loadChartFilterValues(component): void
  {
    let i;

    this.values.chartColumnOptions = [];
    this.values.tableVariables = [];
    this.values.dynTableValues = null;
    this.values.dynTableVariables = [];
    this.values.thresholds = [];
    this.values.goals = [];

    for (let columnConfig of component.columnOptions)
    {
      this.values.chartColumnOptions.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel, item: columnConfig } );
      this.values.tableVariables.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel, itemId: columnConfig.id, grouping: columnConfig.grouping, checked: true } );
    }

    this.values.formVariables = [];

    this.values.xaxis = null;
    this.values.variable = null;
    this.values.valueColumn = null;
    this.values.infoVar1 = null;
    this.values.infoVar2 = null;
    this.values.infoVar3 = null;
    this.values.geodata = null;
    this.values.currentOptionCategories = null;

    for (i = 0; i < this.values.infoFunc1.length; i++)
      this.values.infoFunc1[i].checked = false;

    for (i = 0; i < this.values.infoFunc2.length; i++)
      this.values.infoFunc2[i].checked = false;

    for (i = 0; i < this.values.infoFunc3.length; i++)
      this.values.infoFunc3[i].checked = false;

    this.checkPanelConfiguration ();
  }

  generateError(): void
  {
    this.values.lastestResponse = null;
    this.values.chartGenerated = false;
    this.values.infoGenerated = false;
    this.values.formGenerated = false;
    this.values.picGenerated = false;
    this.values.tableGenerated = false;
    this.values.mapboxGenerated = false;
    this.values.dynTableGenerated = false;

    this.removeDeadVariablesAndCategories.emit ({
      type: this.chartTypes.indexOf (this.oldChartType),
      analysisName: this.oldVariableName,
      chartSeries: this.values.chartSeries,
      controlVariables: this.oldOptionCategories
    });

    this.values.chartSeries = [];

    this.oldChartType = null;
    this.oldVariableName = "";
    this.oldOptionCategories = JSON.parse (JSON.stringify (this.values.currentOptionCategories));
  }

  handlerChartError(_this, result): void
  {
    _this.generateError ();
  }

  handlerTextError(_this, result): void
  {
    _this.generateError ();
  }

  handlerFormError(_this, result): void
  {
    _this.generateError ();
  }

  handlerPicError(_this, result): void
  {
    _this.generateError ();
  }

  handlerEditActionError(_this, result): void
  {
    _this.generateError ();
  }

  handlerTableError(_this, result): void
  {
    _this.generateError ();
  }

  handlerMapboxError(_this, result): void
  {
    _this.displayMapbox = false;
    _this.generateError ();
  }

  handlerHeatMapError(_this, result): void
  {
    _this.generateError ();
  }

  handlerMapError(_this, result): void
  {
    _this.generateError ();
  }

  handlerDynTableError(_this, result): void
  {
    _this.generateError ();
  }

  handlerError(_this, result): void
  {
    _this.values.isLoading = false;  
  }

  getChartFilterValues(id, handlerSuccess): void
  {
    this.service.getChartFilterValues (this, id, handlerSuccess, this.handlerError);
  }

  addChartFilterValues(_this, data): void
  {
    _this.values.chartColumnOptions = [];
    _this.values.tableVariables = [];

    for (let columnConfig of data)
    {
      _this.values.chartColumnOptions.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel, item: columnConfig } );
      _this.values.tableVariables.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel, itemId: columnConfig.id, grouping: columnConfig.grouping, checked: true } );
    }

    _this.checkPanelConfiguration ();

    _this.values.formVariables = [];

    _this.values.isLoading = false;
    _this.values.currentOptionCategories = null;
  }

  goToPanelConfiguration(): void
  {
    this.stopUpdateInterval ();

    if (this.mapboxInterval)
    {
      clearInterval (this.mapboxInterval);
      this.mapboxInterval = null;
    }

    this.configurePanel ();
  }

  setPanelValues(values): void
  {
    let i, item;

    // discard any changes
    this.values.urlImg = values.urlImg;
    if(values.EditActionList)
      this.values.EditActionList = JSON.parse (JSON.stringify (values.EditActionList));
    else
      this.values.EditActionList = null;
    this.values.currentOption = JSON.parse (JSON.stringify (values.currentOption));
    this.values.chartName = values.chartName;
    this.values.chartDescription = values.chartDescription;

    if (values.variable)
      this.values.variable = values.variable;
    else
      this.values.variable = null;

    if (values.xaxis)
      this.values.xaxis = values.xaxis;
    else
      this.values.xaxis = null;

    if (values.valueColumn)
      this.values.valueColumn = values.valueColumn;
    else
      this.values.valueColumn = null;

    this.values.function = values.function;
    this.values.geodata = values.geodata;
    this.values.chartColumnOptions = JSON.parse (JSON.stringify (values.chartColumnOptions));
    this.values.currentOptionCategories = JSON.parse (JSON.stringify (values.currentOptionCategories));
    this.values.thresholds = JSON.parse (JSON.stringify (values.thresholds));
    this.values.goals = JSON.parse (JSON.stringify (values.goals));
    this.values.style = JSON.parse (JSON.stringify (values.style));
    this.values.vertAxisName = values.vertAxisName;
    this.values.horizAxisName = values.horizAxisName;
    this.values.dynTableValues = values.dynTableValues ? JSON.parse (JSON.stringify (values.dynTableValues)) : null;
    this.values.dynTableVariables = JSON.parse (JSON.stringify (values.dynTableVariables));
    this.values.intervalType = values.intervalType;
    this.values.intValue = values.intValue;
    this.values.valueList = values.valueList;

    for (i = 0; i < this.chartTypes.length; i++)
    {
      item = this.chartTypes[i];

      if (item.name === values.currentChartType.name)
      {
        this.values.currentChartType = item;
        break;
      }
    }

    if (this.values.currentChartType.flags & ChartFlags.INFO
      && !(this.values.currentChartType.flags & ChartFlags.FORM)
      && !(this.values.currentChartType.flags & ChartFlags.PICTURE)
      && !(this.values.currentChartType.flags & ChartFlags.EDITACTIONLIST)
      && this.values.chartColumnOptions != null)
    {
      if (values.infoVar1 != null)
      {
        for (i = 0; i < this.values.chartColumnOptions.length; i++)
        {
          item = this.values.chartColumnOptions[i];

          if (values.infoVar1.id === item.id)
          {
            this.values.variable = item;
            break;
          }
        }
      }

      if (values.infoVar2 != null)
      {
        for (i = 0; i < this.values.chartColumnOptions.length; i++)
        {
          item = this.values.chartColumnOptions[i];

          if (values.infoVar2.id === item.id)
          {
            this.values.xaxis = item;
            break;
          }
        }
      }

      if (values.infoVar3 != null)
      {
        for (i = 0; i < this.values.chartColumnOptions.length; i++)
        {
          item = this.values.chartColumnOptions[i];

          if (values.infoVar3.id === item.id)
          {
            this.values.valueColumn = item;
            break;
          }
        }
      }
    }

    this.values.formVariables = [];

    for (let i = 0; i < values.formVariables.length; i++)
    {
      let formVariable = values.formVariables[i];

      this.values.formVariables.push ({
        value: this.values.lastestResponse[i].value,
        column: formVariable.column,
        fontSize: this.fontSizes[formVariable.fontSize],
        valueFontSize: this.fontSizes[formVariable.valueFontSize],
        valueOrientation: this.orientations[formVariable.valueOrientation],
        function: this.functions[formVariable.function]
      });
    }

    this.values.tableVariables = JSON.parse (JSON.stringify (values.tableVariables));

    this.values.updateIntervalSwitch = values.updateIntervalSwitch;
    this.values.startAtZero = values.startAtZero;
    this.values.updateTimeLeft = values.updateTimeLeft;
    this.values.limitMode = values.limitMode;
    this.values.limitAmount = values.limitAmount;
    this.values.ordered = values.ordered;

    this.values.paletteColors = JSON.parse (JSON.stringify (values.paletteColors));

    this.values.valueListInfo = JSON.parse (JSON.stringify (values.valueListInfo));
    if (!this.values.valueListInfo.length && this.values.valueList)
    {
      for (let i = 0; i < this.values.valueList.length; i++)
      {
        this.values.valueListInfo.push ({
          function: this.functions.indexOf (this.values.function),
          axis: !i ? true : false
        });
      }
    }

    this.values.style = values.style;
  }

  goToResults(): void
  {
    // re-initialize panel settings
    this.initPanelSettings ();

    this.startUpdateInterval ();

    if (this.values.currentChartType.flags & ChartFlags.MAPBOX)
    {
      setTimeout (() => {
        this.msfMapRef.resizeMap ();
      }, 10);

      this.mapboxInterval = setInterval (() =>
      {
        if (this.lastWidth != this.values.width)
        {
          this.msfMapRef.resizeMap ();
          this.lastWidth = this.values.width;
        }
      }, 500);
    }

    this.changeDetectorRef.detectChanges ();
  }

  // check if the x axis should be enabled or not depending of the chart type
  checkChartType(): void
  {
    if (this.values.currentChartType.flags & (ChartFlags.PICTURE || ChartFlags.EDITACTIONLIST ))
      return;
    else
    {
      if (this.values.currentOption == null)
        return;
    }

    if (this.values.currentChartType.flags & ChartFlags.INFO)
    {
      // disable and reset unused variables
      this.values.variable = null;

      this.values.xaxis = null;

      this.values.valueColumn = null;
      this.values.valueList = [];

      if (!(this.values.currentChartType.flags & ChartFlags.FORM))
        this.values.formVariables = [];

      this.values.vertAxisName = null;
      this.values.horizAxisName = null;

      this.values.dynTableValues = null;
      this.values.dynTableVariables = [];
    }
    else
    {
      let i;

      this.values.infoNumVariables = 0;

      if (this.values.currentChartType.flags & ChartFlags.TABLE
        || this.values.currentChartType.flags & ChartFlags.MAP
        || this.values.currentChartType.flags & ChartFlags.HEATMAP
        || this.values.currentChartType.flags & ChartFlags.DYNTABLE)
      {
        if (this.values.currentChartType.flags & ChartFlags.MAP)
        {
          if (this.values.currentOption == null || ((this.values.currentOption.metaData != 2 && this.values.currentOption.metaData != 4 && this.values.currentOption.metaData != 5)
            && !(this.values.currentChartType.flags & ChartFlags.MAPBOX)) || (this.values.currentOption.tabType !== 'map' && this.values.currentChartType.flags & ChartFlags.MAPBOX))
            this.values.currentOption = null;
        }

        this.values.xaxis = null;

        if (!(this.values.currentChartType.flags & ChartFlags.HEATMAP))
        {
          this.values.variable = null;
          this.values.valueColumn = null;
          this.values.horizAxisName = null;
        }

        this.values.vertAxisName = null;

        if (!(this.values.currentChartType.flags & ChartFlags.DYNTABLE))
        {
          this.values.dynTableValues = null;
          this.values.dynTableVariables = [];
        }
      }
      else if (!(this.values.currentChartType.flags & ChartFlags.XYCHART))
      {
        this.values.xaxis = null;

        if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
          this.values.variable = null;

        if (this.values.currentChartType.flags & ChartFlags.FUNNELCHART
          || this.values.currentChartType.flags & ChartFlags.PIECHART)
        {
          this.values.vertAxisName = null;
          this.values.horizAxisName = null;

          this.values.dynTableValues = null;
          this.values.dynTableVariables = [];
        }
      }
      else
      {
        this.values.dynTableValues = null;
        this.values.dynTableVariables = [];
      }

      this.values.infoVar1 = null;

      for (i = 0; i < this.values.infoFunc1.length; i++)
        this.values.infoFunc1[i].checked = false;

      this.values.infoVar2 = null;

      for (i = 0; i < this.values.infoFunc2.length; i++)
        this.values.infoFunc2[i].checked = false;

      this.values.infoVar3 = null;

      for (i = 0; i < this.values.infoFunc3.length; i++)
        this.values.infoFunc3[i].checked = false;

      if (!(this.values.currentChartType.flags & ChartFlags.INFO || this.values.currentChartType.flags & ChartFlags.MAP
        || this.values.currentChartType.flags & ChartFlags.HEATMAP || this.values.currentChartType.flags & ChartFlags.TABLE
        || this.values.currentChartType.flags & ChartFlags.DYNTABLE || this.values.currentChartType.flags & ChartFlags.PICTURE
        || this.values.currentChartType.flags & ChartFlags.EDITACTIONLIST) && this.functions.indexOf (this.values.function) == -1)
        this.values.function = this.functions[0];

      this.values.formVariables = [];
    }

    // check the chart filters to see if the chart generation is to be enabled or not
    this.checkPanelConfiguration ();
  }

  checkPanelConfiguration(): boolean
  {
    if (!this.values.currentChartType)
      return false;

    if (this.values.currentChartType.flags & ChartFlags.HEATMAP)
    {
      if (this.values.variable != null && this.values.geodata != null)
        return true;
    }
    else if (this.values.currentChartType.flags & ChartFlags.DYNTABLE)
    {
      if (this.values.currentOption != null && this.isDynamicTableSet ())
        return true;
    }
    else if (this.values.currentChartType.flags & ChartFlags.TABLE
      || this.values.currentChartType.flags & ChartFlags.MAP)
    {
      if (this.values.currentOption != null)
        return true;
    }
    else if (this.values.currentChartType.flags & ChartFlags.PICTURE)
    {
      if (this.values.urlImg && this.values.urlImg != "")
        return true;
    }
    else if (this.values.currentChartType.flags & ChartFlags.EDITACTIONLIST)
    {
      if (this.values.EditActionList && this.values.EditActionList.length != 0)
        return true;
    }
    else if (this.values.currentChartType.flags & ChartFlags.FORM)
    {
      if (this.values.formVariables.length)
        return true;
    }
    else if (this.values.currentChartType.flags & ChartFlags.INFO)
    {
      // Make sure that al least one function is checked when using the information "chart" type
      let i, infoFunc1Ready, infoFunc2Ready, infoFunc3Ready;

      infoFunc1Ready = false;
      infoFunc2Ready = false;
      infoFunc3Ready = false;

      if (this.values.infoNumVariables >= 1)
      {
        for (i = 0; i < this.values.infoFunc1.length; i++)
        {
          if (this.values.infoFunc1[i].checked)
          {
            infoFunc1Ready = true;
            break;
          }
        }
      }

      if (this.values.infoNumVariables >= 2)
      {
        for (i = 0; i < this.values.infoFunc2.length; i++)
        {
          if (this.values.infoFunc2[i].checked)
          {
            infoFunc2Ready = true;
            break;
          }
        }
      }
      else
        infoFunc2Ready = true; // This is to simplify the final condition

      if (this.values.infoNumVariables == 3)
      {
        for (i = 0; i < this.values.infoFunc3.length; i++)
        {
          if (this.values.infoFunc3[i].checked)
          {
            infoFunc3Ready = true;
            break;
          }
        }
      }
      else
        infoFunc3Ready = true;

      if (infoFunc1Ready && infoFunc2Ready && infoFunc3Ready)
        return true;
    }
    else
    {
      if (!(this.values.currentChartType.flags & ChartFlags.XYCHART))
      {
        if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
        {
          if (this.values.valueColumn != null)
            return true;
        }
        else
        {
          if (this.values.function != null && this.values.function.id === "count")
          {
            if (this.values.variable != null)
              return true;
          }
          else
          {
            if ((this.isSimpleChart () && this.values.valueList != null && this.values.valueList.length)
             || (!this.isSimpleChart () && this.values.variable != null)
              && this.values.valueColumn != null)
              return true;
          }
        }
      }
      else
      {
        if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
        {
          if (this.values.variable != null && this.values.valueColumn != null)
            return true;
        }
        else
        {
          if (this.values.function.id === "count")
          {
            if (this.values.variable != null && this.values.xaxis != null)
              return true;
          }
          else
          {
            if (this.values.variable != null && this.values.xaxis != null && this.values.valueColumn != null)
              return true;
          }
        }
      }
    }

    return false;
  }

  initPanelSettings(): void
  {
    let i, options, option;

    if (this.values.currentOption)
    {
      this.values.chartColumnOptions = [];
      this.values.tableVariables = [];

      for (let columnConfig of this.values.currentOption.columnOptions)
      {
        this.values.chartColumnOptions.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel, item: columnConfig } );
        this.values.tableVariables.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel, itemId: columnConfig.id, grouping: columnConfig.grouping, checked: true } );
      }
    }

    // refresh the following two values to avoid a blank form
    if (this.values.currentChartType != null && this.values.currentChartType != -1)
    {
      for (i = 0; i < this.chartTypes.length; i++)
      {
        if (i == this.values.currentChartType)
        {
          this.values.currentChartType = this.chartTypes[i];
          break;
        }
      }
    }
    else
      this.values.currentChartType = this.chartTypes[0];

    // set the form values
    if (this.values.currentOption)
    {
      options = this.values.options;

      for (i = 0; i < options.length; i++)
      {
        option = options[i];

        if (option.id == this.values.currentOption.id)
        {
          this.values.currentOption = option;
          break;
        }
      }
    }

    if (this.values.currentChartType.flags & ChartFlags.HEATMAP)
    {
      if (this.values.chartColumnOptions.length)
      {
        if (this.values.variable != null && this.values.variable != -1)
        {
          for (i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (this.values.variable == this.values.chartColumnOptions[i].item.id)
            {
              this.values.variable = this.values.chartColumnOptions[i];
              break;
            }
          }
        }

        if (this.values.valueColumn != null && this.values.valueColumn != -1)
        {
          for (i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (this.values.valueColumn == this.values.chartColumnOptions[i].item.id)
            {
              this.values.valueColumn = this.values.chartColumnOptions[i];
              break;
            }
          }
        }
      }

      if (this.values.function != null && this.values.function != -1)
      {
        for (i = 0; i < this.geodatas.length; i++)
        {
          if (i == this.values.function)
          {
            this.values.geodata = this.geodatas[i];
            break;
          }
        }
      }
      else
        this.values.geodata = this.geodatas[0];

      this.values.function = this.functions[0];
      this.checkChartType ();
      return;
    }
    else
      this.values.geodata = this.geodatas[0];

    // picture and map panels doesn't need any data
    if (!(this.values.currentChartType.flags & (ChartFlags.PICTURE || ChartFlags.EDITACTIONLIST)))
    {
      if (this.values.currentChartType.flags & ChartFlags.MAP)
      {
        if (this.values.currentChartType.flags & ChartFlags.MAPBOX)
        {
          if (this.values.function == 1)
          {
            if (this.values.variable != null && this.values.variable != -1)
            {
              for (i = 0; i < this.msfMapRef.mapTypes.length; i++)
              {
                if (i == this.values.variable)
                {
                  this.values.style = this.msfMapRef.mapTypes[i];
                  this.values.variable = -1;
                  break;
                }
              }
            }
            else
              this.values.style = this.msfMapRef.mapTypes[1];
          }
          else
          {
            for (i = 0; i < this.msfMapRef.mapTypes.length; i++)
            {
              if (this.msfMapRef.mapTypes[i].id == this.values.style.id)
              {
                this.values.style = this.msfMapRef.mapTypes[i];
                break;
              }
            }
          }
        }

        this.checkChartType ();
        return;
      }
      if (this.values.currentChartType.flags & ChartFlags.EDITACTIONLIST)
      {
        this.values.EditActionList = JSON.parse (this.values.lastestResponse);
      }
    }

    if (this.values.currentChartType.flags & ChartFlags.DYNTABLE)
    {
      if (this.values.lastestResponse)
      {
        this.values.dynTableVariables = [];

        for (let variable of this.values.lastestResponse.variables)
        {
          for (let columnOption of this.values.chartColumnOptions)
          {
            if (columnOption.id === variable.id)
            {
              let tableVariable;

              this.values.dynTableVariables.push (columnOption);

              tableVariable = this.values.dynTableVariables[this.values.dynTableVariables.length - 1];
              tableVariable.direction = variable.direction;
              tableVariable.order = variable.order;
              break;
            }
          }
        }

        this.values.dynTableValues = [];

        for (let value of this.values.lastestResponse.values)
        {
          for (let columnOption of this.values.chartColumnOptions)
          {
            if (columnOption.id === value.id)
            {
              let tableValue;

              this.values.dynTableValues.push (columnOption);

              tableValue = this.values.dynTableValues[this.values.dynTableValues.length - 1];
              tableValue.order = value.order;

              if (value.summary)
              {
                tableValue.summary = value.summary;

                if (value.sumAlias)
                  tableValue.sumAlias = value.sumAlias;
              }

              if (value.average)
              {
                tableValue.average = value.average;

                if (value.avgAlias)
                  tableValue.avgAlias = value.avgAlias;
              }

              if (value.mean)
              {
                tableValue.mean = value.mean;

                if (value.meanAlias)
                  tableValue.meanAlias = value.meanAlias;
              }

              if (value.max)
              {
                tableValue.max = value.max;

                if (value.maxAlias)
                  tableValue.maxAlias = value.maxAlias;
              }

              if (value.min)
              {
                tableValue.min = value.min;

                if (value.minAlias)
                  tableValue.minAlias = value.minAlias;
              }

              if (value.stddeviation)
              {
                tableValue.stddeviation = value.stddeviation;

                if (value.stdDevAlias)
                  tableValue.stdDevAlias = value.stdDevAlias;
              }

              if (value.count)
              {
                tableValue.count = value.count;

                if (value.cntAlias)
                  tableValue.cntAlias = value.cntAlias;
              }

              break;
            }
          }
        }
      }

      this.checkChartType ();
      return;
    }

    if (this.values.currentChartType.flags & ChartFlags.TABLE)
    {
      // set table column filters settings if loaded from database
      this.values.tableVariables = [];

      for (let columnConfig of this.values.chartColumnOptions)
        this.values.tableVariables.push ( { id: columnConfig.id, name: columnConfig.name, itemId: columnConfig.item.id, grouping: columnConfig.item.grouping, checked: true } );

      for (i = 0; i < this.values.lastestResponse.length; i++)
      {
        let tableColumn = this.values.lastestResponse[i];

        if (tableColumn.id == null)
          continue;
  
        for (let j = 0; j < this.values.tableVariables.length; j++)
        {
          let curVariable = this.values.tableVariables[j];
  
          if (curVariable.itemId == tableColumn.id)
          {
            curVariable.checked = tableColumn.checked;
            break;
          }
        }
      }

      this.checkChartType ();
      return;
    }

    if (this.values.currentChartType.flags & ChartFlags.FORM)
    {
      // set form variable settings if loaded from database
      if (this.values.function != null && this.values.function != -1)
      {
        this.values.formVariables = [];

        for (let formVariable of this.values.lastestResponse)
        {
          let columnIndex = 0;

          for (let i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (this.values.chartColumnOptions[i].item.id == formVariable.column)
            {
              columnIndex = i;
              break;
            }
          }

          this.values.formVariables.push ({
            value: formVariable.value,
            column: this.values.chartColumnOptions[columnIndex],
            fontSize: this.fontSizes[formVariable.fontSize],
            valueFontSize: this.fontSizes[formVariable.valueFontSize],
            valueOrientation: this.orientations[formVariable.valueOrientation],
            function: this.functions[formVariable.function]
          });
        }
      }
      else
      {
        // set the column for each value
        if (this.values.formVariables.length)
        {
          for (let formVariable of this.values.formVariables)
          {
            let columnIndex = 0;

            for (let i = 0; i < this.values.chartColumnOptions.length; i++)
            {
              if (this.values.chartColumnOptions[i].item.id == formVariable.column)
              {
                columnIndex = i;
                break;
              }
            }

            formVariable.column = this.values.chartColumnOptions[columnIndex];
          }
        }
      }

      this.values.lastestResponse = [];

      for (let formVariable of this.values.formVariables)
      {
        this.values.lastestResponse.push ({
          value: formVariable.value,
          column: formVariable.column.item,
          fontSize: formVariable.fontSize,
          valueFontSize: formVariable.valueFontSize,
          valueOrientation: formVariable.valueOrientation,
          function: formVariable.function
        });
      }
    }
    else if (this.values.currentChartType.flags & ChartFlags.INFO)
    {
      this.values.infoNumVariables = 0;

      if (this.values.chartColumnOptions.length)
      {
        if (this.values.variable != null && this.values.variable != -1)
        {
          for (i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (this.values.variable == this.values.chartColumnOptions[i].item.id)
            {
              this.values.infoVar1 = this.values.chartColumnOptions[i];
              this.values.variable = null;
              this.values.infoNumVariables++;
              break;
            }
          }
        }
  
        if (this.values.xaxis != null && this.values.xaxis != -1)
        {
          for (i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (this.values.xaxis == this.values.chartColumnOptions[i].item.id)
            {
              this.values.infoVar2 = this.values.chartColumnOptions[i];
              this.values.xaxis = null;
              this.values.infoNumVariables++;
              break;
            }
          }
        }
  
        if (this.values.valueColumn != null && this.values.valueColumn != -1)
        {
          for (i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (this.values.valueColumn == this.values.chartColumnOptions[i].item.id)
            {
              this.values.infoVar3 = this.values.chartColumnOptions[i];
              this.values.valueColumn = null;
              this.values.infoNumVariables++;
              break;
            }
          }
        }
      }

      // set function values
      for (i = 0; i < this.values.lastestResponse.length; i++)
      {
        let item = this.values.lastestResponse[i];
        let infoFunc, j;

        switch (item.id)
        {
          case 2:
            infoFunc = this.values.infoFunc3;
            break;
  
          case 1:
            infoFunc = this.values.infoFunc2;
            break;
  
          default:
            infoFunc = this.values.infoFunc1;
            break;
        }

        switch (item.function)
        {
          case 'avg':
            j = 0;
            break;

          case 'sum':
            j = 1;
            break;

          case 'max':
            j = 2;
            break;

          case 'min':
            j = 3;
            break;

          case 'count':
            j = 4;
            break;

          default:
            j = -1;
        }

        if (j != -1)
        {
          infoFunc[j].checked = true;
          infoFunc[j].title = item.title;
          infoFunc[j].measure = item.measure;
        }
      }
    }
    else
    {
      if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
      {
        if (this.values.function != null && this.values.function != -1)
        {
          if (this.values.function == 1)
            this.values.intervalType = "value";
          else
            this.values.intervalType = "ncile";
        }

        this.values.function = null;
      }
      else
      {
        if (this.values.function != null && this.values.function != -1)
        {
          for (i = 0; i < this.functions.length; i++)
          {
            if (i == this.values.function)
            {
              this.values.function = this.functions[i];
              break;
            }
          }
        }
        else
          this.values.function = this.functions[0];
      }

      if (this.values.chartColumnOptions.length)
      {
        if (this.values.variable != null && this.values.variable != -1)
        {
          for (i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (this.values.variable == this.values.chartColumnOptions[i].item.id)
            {
              this.values.variable = this.values.chartColumnOptions[i];
              break;
            }
          }
        }

        if (this.values.xaxis != null && this.values.xaxis != -1)
        {
          for (i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (this.values.xaxis == this.values.chartColumnOptions[i].item.id)
            {
              this.values.xaxis = this.values.chartColumnOptions[i];
              break;
            }
          }
        }

        if (this.isSimpleChart ())
        {
          if (this.values.valueColumn != null && this.values.valueColumn != -1)
          {
            this.values.valueList = [];

            // Convert older simple charts
            for (i = 0; i < this.values.chartColumnOptions.length; i++)
            {
              if (this.values.valueColumn == this.values.chartColumnOptions[i].item.id)
              {
                this.values.valueList.push (this.values.chartColumnOptions[i]);
                break;
              }
            }

            this.values.valueColumn = null;
          }
          else if (this.values.valueList != null)
          {
            if (typeof this.values.valueList === "string")
              this.values.valueList = this.values.valueList.split (",");

            for (i = 0; i < this.values.valueList.length; i++)
            {
              for (let j = 0; j < this.values.chartColumnOptions.length; j++)
              {
                if (this.values.valueList[i] == this.values.chartColumnOptions[j].item.id)
                {
                  this.values.valueList[i] = this.values.chartColumnOptions[j];
                  break;
                }
              }
            }
          }
        }
        else if (this.values.valueColumn != null && this.values.valueColumn != -1)
        {
          for (i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (this.values.valueColumn == this.values.chartColumnOptions[i].item.id)
            {
              this.values.valueColumn = this.values.chartColumnOptions[i];
              break;
            }
          }
        }
      }
    }

    this.checkChartType ();
  }

  handlerUpdateSuccess(_this): void
  {
    if (!_this.values.isLoading)
      return;

    // set lastestResponse to null and remove temporary values since the panel has been updated
    _this.values.lastestResponse = null;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.dynTableGenerated = false;
    _this.temp = null;
    _this.values.isLoading = false;
  }

  prepareToSavePanel(): void
  {
    let panel;

    if (this.values.currentChartType.flags & ChartFlags.TABLE)
    {
      let tableVariableIds = [];

      panel = this.getPanelInfo ();
      panel.function = -1;

      for (let tableVariable of this.values.tableVariables)
      {
        tableVariableIds.push ({
          id: tableVariable.itemId,
          checked: tableVariable.checked
        });
      }

      panel.lastestResponse = JSON.stringify (tableVariableIds);
    }
    else if (this.values.currentChartType.flags & ChartFlags.FORM)
    {
      let formVariables = [];

      panel = this.getPanelInfo ();
      panel.function = 2;

      for (let formVariable of this.values.formVariables)
      {
        formVariables.push ({
          value: null,
          column: formVariable.column.item.id,
          fontSize: this.fontSizes.indexOf (formVariable.fontSize),
          valueFontSize: this.fontSizes.indexOf (formVariable.valueFontSize),
          valueOrientation: this.orientations.indexOf (formVariable.valueOrientation),
          function: this.functions.indexOf (formVariable.function)
        });
      }

      panel.lastestResponse = JSON.stringify (formVariables);
    }
    else if (this.values.currentChartType.flags & ChartFlags.INFO
      && !(this.values.currentChartType.flags & ChartFlags.PICTURE)
      && !(this.values.currentChartType.flags & ChartFlags.EDITACTIONLIST)
      && !(this.values.currentChartType.flags & ChartFlags.MAP)
      && !(this.values.currentChartType.flags & ChartFlags.HEATMAP)
      && !(this.values.currentChartType.flags & ChartFlags.DYNTABLE))
    {
      let variables;

      panel = this.getPanelInfo ();
      panel.function = -1;

      // Prepare list of variables
      variables = [];

      for (let i = 0; i < this.values.infoNumVariables; i++)
      {
        let infoVar, infoFunc;

        switch (i)
        {
          case 2:
            infoVar = this.values.infoVar3;
            infoFunc = this.values.infoFunc3;
            break;

          case 1:
            infoVar = this.values.infoVar2;
            infoFunc = this.values.infoFunc2;
            break;

          default:
            infoVar = this.values.infoVar1;
            infoFunc = this.values.infoFunc1;
            break;
        }

        for (let j = 0; j < 5; j++)
        {
          if (!infoFunc[j].checked)
            continue;

          variables.push ({
            id : i,
            function : infoFunc[j].id,
            title : infoFunc[j].title,
            measure : infoFunc[j].measure,
            column : infoVar.id
          });
        }
      }

      panel.lastestResponse = JSON.stringify (variables);
    }
    else if (this.values.currentChartType.flags & ChartFlags.PICTURE)
    {
      panel = this.getPanelInfo ();
      panel.lastestResponse = this.values.urlImg;
    }
    else if (this.values.currentChartType.flags & ChartFlags.EDITACTIONLIST)
    {
      panel = this.getPanelInfo ();
      panel.lastestResponse = this.values.EditActionList;
    }
    else
    {
      panel = this.getPanelInfo ();
      panel.lastestResponse = null;
    }

    this.values.isLoading = true;
    this.service.updateDashboardPanel (this, panel, this.handlerUpdateSuccess, this.handlerError);
  }

  isInformationPanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.INFO
      && !(this.values.currentChartType.flags & ChartFlags.FORM)
      && !(this.values.currentChartType.flags & ChartFlags.PICTURE)
      && !(this.values.currentChartType.flags & ChartFlags.EDITACTIONLIST)) ? true : false;
  }

  isSimpleChart(): boolean
  {
    return !(this.values.currentChartType.flags & ChartFlags.XYCHART)
      && !(this.values.currentChartType.flags & ChartFlags.ADVANCED)
      && !(this.values.currentChartType.flags & ChartFlags.PIECHART)
      && !(this.values.currentChartType.flags & ChartFlags.FUNNELCHART);
  }

  isSimpleFormPanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.FORM) ? true : false;
  }

  isPicturePanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.PICTURE) ? true : false;
  }

  
  isEditActionListPanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.EDITACTIONLIST) ? true : false;
  }

  isTablePanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.TABLE) ? true : false;
  }

  isDynTablePanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.DYNTABLE) ? true : false;
  }

  isAdvChartPanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.ADVANCED) ? true : false;
  }

  isMapPanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.MAP
      && !(this.values.currentChartType.flags & ChartFlags.HEATMAP)
      && !(this.values.currentChartType.flags & ChartFlags.MAPBOX)) ? true : false;
  }

  isHeatMapPanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.HEATMAP) ? true : false;
  }

  isMapboxPanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.MAPBOX) ? true : false;
  }

  checkNumVariables(): void
  {
    let i;

    if (this.values.infoNumVariables < 2)
    {
      this.values.infoVar2 = null;

      for (i = 0; i < this.values.infoFunc2.length; i++)
        this.values.infoFunc2[i].checked = false;
    }

    if (this.values.infoNumVariables != 3)
    {
      this.values.infoVar3 = null;

      for (i = 0; i < this.values.infoFunc3.length; i++)
        this.values.infoFunc3[i].checked = false;
    }

    this.checkPanelConfiguration ();
  }

  goToFunctions(infoVarNum): void
  {
    let infoVar, infoFunc;

    switch (infoVarNum)
    {
      case 2:
        infoVar = this.values.infoVar3;
        infoFunc = this.values.infoFunc3;
        break;

      case 1:
        infoVar = this.values.infoVar2;
        infoFunc = this.values.infoFunc2;
        break;

      default:
        infoVar = this.values.infoVar1;
        infoFunc = this.values.infoFunc1;
        break;
    }

    const dialogRef = this.dialog.open (MsfDashboardInfoFunctionsComponent, {
      height: '382px',
      width: '600px',
      panelClass: 'msf-dashboard-control-variables-dialog',
      autoFocus: false,
      data: {
        title: this.values.chartName,
        subTitle: "Variable #" + (infoVarNum + 1) + ": " + infoVar.name,
        functions: infoFunc
      }
    });

    dialogRef.afterClosed ().subscribe (
      () => this.checkPanelConfiguration ()
    );
  }

  getResultValue(result): string
  {
    return new Intl.NumberFormat ('en-us', { maximumFractionDigits: 1 }).format (result);
  }

  goToDrillDownSettings(): void
  {
    let childChart = {
      types: null
    };

    // clear child panel list befre opening drill down dialog
    this.childPanelValues = [];
    this.childPanelsConfigured = [];

    let dialogRef = this.dialog.open (MsfDashboardDrillDownComponent, {
      height: (this.values.chartName && this.values.chartName.length >= 45) ? '590px ': '560px',
      // height: (this.values.chartName && this.values.chartName.length >= 45) ? '620px ': '590px',
      width: '450px',
      panelClass: 'msf-dashboard-child-panel-dialog',
      data: {
        title: this.values.chartName,
        description: this.values.chartDescription,
        optionId: this.values.currentOption.id,
        parentPanelId: this.values.id,
        childPanelValues: this.childPanelValues,
        drillDownOptions: this.values.currentOption.drillDownOptions,
        childPanelsConfigured: this.childPanelsConfigured,
        categoryOptions: JSON.stringify (this.values.currentOptionCategories),
        functions: this.functions,
        childChart: childChart,
        updateTimeInterval: 0,
        options: this.values.options
      }
    });

    dialogRef.afterClosed ().subscribe (
      (panelToDelete) => {
        if (panelToDelete)
        {
          this.values.isLoading = true;
          this.service.deleteChildPanel (this, panelToDelete, this.drillDownPanelDeleted, this.drillDownSettingsError);
        }
        else
          this.saveChildPanels (childChart.types);
      }
    );
  }

  getChildPanelsInfo(childChartTypes, drillDownIds): any[]
  {
    let childPanels = [];

    for (let i = 0; i < this.childPanelValues.length; i++)
    {
      let value: MsfDashboardPanelValues = this.childPanelValues[i];

      if (!this.childPanelsConfigured[i])
         continue;

      if (value.currentChartType.flags & ChartFlags.TABLE)
      {
        let tableVariableIds = [];

        for (let tableVariable of value.tableVariables)
        {
          tableVariableIds.push ({
            id: tableVariable.itemId,
            checked: tableVariable.checked
          });
        }

        childPanels.push ({
          id: value.id,
          option: value.currentOption,
          title: value.chartName,
          description: value.chartDescription,
          chartColumnOptions: JSON.stringify (value.chartColumnOptions),
          chartType: childChartTypes.indexOf (value.currentChartType),
          lastestResponse: JSON.stringify (tableVariableIds),
          ordered: null,
          startAtZero: null
        });
      }
      else
      {
        childPanels.push ({
          id: value.id,
          option: value.currentOption,
          title: value.chartName,          
          description: value.chartDescription,
          chartColumnOptions: JSON.stringify (value.chartColumnOptions),
          analysis: value.chartColumnOptions ? (value.variable ? value.variable.item.id : null) : null,
          xaxis: value.chartColumnOptions ? (value.xaxis ? value.xaxis.item.id : null) : null,
          values: value.chartColumnOptions ? (value.valueColumn ? value.valueColumn.item.id : null) : null,
          function: this.functions.indexOf (value.function),
          chartType: childChartTypes.indexOf (value.currentChartType),
          paletteColors: JSON.stringify (value.paletteColors),
          vertAxisName: value.vertAxisName,
          horizAxisName: value.horizAxisName,
          startAtZero: value.startAtZero,
          ordered: value.ordered
        });
      }

      drillDownIds.push (this.values.currentOption.drillDownOptions[i].id);
      this.childPanelsConfigured[i] = false;
    }

    return childPanels;
  }

  saveChildPanels(childChartTypes): void
  {
    let drillDownIds = [];
    let childPanels = this.getChildPanelsInfo (childChartTypes, drillDownIds);

    if (!childPanels.length)
      return;

    this.values.isLoading = true;
    this.service.saveChildPanels (this, childPanels, this.values.id, drillDownIds, this.drillDownSettingsClear, this.drillDownSettingsError);
  }

  drillDownPanelDeleted(_this, data): void
  {
    for (let childPanel of _this.values.childPanels)
    {
      if (childPanel.childPanelId == data)
      {
        _this.values.childPanels.splice (_this.values.childPanels.indexOf (childPanel), 1);
        break;
      }
    }

    if (_this.values.childPanels.length > 1)
    {
      _this.values.childPanels.sort (function (e1, e2) {
        return e1.id - e2.id;
      });
    }

    _this.values.isLoading = false;
  }

  // update child panel list after success or failure
  drillDownSettingsClear(_this, data): void
  {
    let drillDownInfo: any[] = [];
    let childPanelNames: any[] = [];

    _this.values.childPanels = [];

    drillDownInfo = data.drillDownInfo;
    childPanelNames = data.childPanelNames;

    if (!drillDownInfo.length)
    {
      // we're done if there are no child panels
      _this.values.isLoading = false;
      return;
    }

    for (let i = 0; i < drillDownInfo.length; i++)
    {
      _this.values.childPanels.push ({
        id: drillDownInfo[i].drillDownId,
        title: childPanelNames[i],
        childPanelId: drillDownInfo[i].childPanelId
      });
    }

    _this.values.isLoading = false;
  }

  drillDownSettingsError(_this, results): void
  {
    _this.values.isLoading = false;
  }

  deleteColumnFromForm(index): void
  {
    this.values.formVariables.splice (index, 1);
    this.checkPanelConfiguration ();
  }

  getFormFontSize(column): number
  {
    return this.values.formVariables[column].fontSize.value;
  }

  getValueFormFontSize(column): number
  {
    return this.values.formVariables[column].valueFontSize.value;
  }

  startUpdateInterval(): void
  {
    if (!this.values.updateIntervalSwitch)
      return; // don't start the interval if no update time is set

    // set update time first before starting the interval
    this.updateTimeLeft = this.values.updateTimeLeft;

    this.updateInterval = setInterval (() =>
    {
      if (this.updateTimeLeft)
        this.updateTimeLeft--;

      if (!this.updateTimeLeft)
      {
        this.updateTimeLeft = this.values.updateTimeLeft;
        this.loadData ();
      }
    }, 60000); // update interval each minute
  }

  stopUpdateInterval(): void
  {
    if (!this.values.updateIntervalSwitch)
      return;

    clearInterval (this.updateInterval);
  }

  sharePanel(): void
  {
    this.dialog.open (MsfShareDashboardComponent, {
      height: '430px',
      width: '400px',
      panelClass: 'msf-dashboard-child-panel-dialog',
      data: {
        isPanel: true,
        dashboardContentId: this.values.id,
        dashboardContentTitle: this.values.chartName,
        dashboardContentDescription: this.values.chartDescription
      }
    });
  }

  swapFormVariablePositions(event: CdkDragDrop<MsfDashboardPanelValues[]>): void
  {
    // move items
    moveItemInArray (this.values.formVariables, event.previousIndex, event.currentIndex);
  }

  deleteColumnFromTable(index): void
  {
    this.values.tableVariables.splice (index, 1);
  }

  finishLoadingTable(error)
  {
    if (error)
    {
      this.handlerTableError (this, null);
      return;
    }

    if(this.values.currentOption.tabType != "legacy"){
      if(this.values.showMoreResult){
        this.values.showPaginator = false;
      }else{
        this.values.showPaginator = true;
      }
    }else{
      this.values.showPaginator = false;
    }

    // hide paginator if there are no results
    if (this.msfTableRef.tableOptions)
    {
      if (!this.msfTableRef.tableOptions.dataSource && !this.msfTableRef.tableOptions.template)
        this.values.showPaginator = false;
    }

    // only save the lastest response if the page number of the table is the first one
    if (!this.actualPageNumber)
    {
      this.values.lastestResponse = [];

      for (let tableVariable of this.values.tableVariables)
        this.values.lastestResponse.push ({ id: tableVariable.itemId, checked: tableVariable.checked });

      this.service.saveLastestResponse (this, this.getPanelInfo (), this.handlerTableLastestResponse, this.handlerTableError);
    }
    else
    {
      this.values.isLoading = false;

      this.displayTable = true;
      this.values.chartGenerated = false;
      this.values.infoGenerated = false;
      this.values.formGenerated = false;
      this.values.picGenerated = false;
      this.values.tableGenerated = true;
      this.values.mapboxGenerated = false;
      this.values.dynTableGenerated = false;

      // resume the update interval if activated
      if (this.values.updateIntervalSwitch)
      {
        this.updateInterval = setInterval (() =>
        {
          if (this.updateTimeLeft)
            this.updateTimeLeft--;
  
          if (!this.updateTimeLeft)
          {
            this.updateTimeLeft = this.values.updateTimeLeft;
            this.loadData ();
          }
        }, 60000); // update interval each minute
      }
    }
  }

  moreTableResults()
  {
    if (this.moreResultsBtn)
    {
      this.moreResults = false;
      this.values.isLoading = true;
      this.stopUpdateInterval ();

      setTimeout (() => {
        this.loadTableData (true, this.msfTableRef.handlerSuccess, this.msfTableRef.handlerError);
      }, 3000);
    }
  }

  haveTableDataSource(): boolean
  {
    if (!this.msfTableRef)
      return false;

    return this.msfTableRef.dataSource ? true : false;
  }

  toggleMapRoute(route): void
  {
    let theme, tempLat, tempLng, sumX, sumY, sumZ, avgX, avgY, avgZ;
    let circle, label, imageSeriesTemplate, hoverState;
    let newCities, curcity;
    let zoomLevel, self;

    theme = this.globals.theme;
    self = this;
    newCities = [];

    function goForward(plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute)
    {
      let animation;

      if (curRoute == -1 && plane.rotation)
      {
        shadowPlane.rotation = 0;
        shadowPlane.opacity = 0;

        plane.animate ({
          to: 0,
          property: "rotation"
        }, 1000).events.on ("animationended",
          function() {
            curRoute = 0;

            planeContainer.mapLine = routes[curRoute].normal;
            planeContainer.parent = self.lineSeries;
            shadowPlaneContainer.mapLine = routes[curRoute].shadow;
            shadowPlaneContainer.parent = self.shadowLineSeries;

            goForward (plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute);
          }
        );

        return;
      }
      else
        shadowPlane.opacity = 0.75;

      animation = planeContainer.animate ({
        property: "position",
        from: 0,
        to: 1
      }, 6000).delay (300);

      shadowPlaneContainer.animate ({
        property: "position",
        from: 0,
        to: 1
      }, 6000).delay (300);

      animation.events.on ("animationended",
        function() {
          curRoute++;
          if (curRoute == routes.length)
            goBack (plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute);
          else
          {
            planeContainer.mapLine = routes[curRoute].normal;
            planeContainer.parent = self.lineSeries;
            shadowPlaneContainer.mapLine = routes[curRoute].shadow;
            shadowPlaneContainer.parent = self.shadowLineSeries;

            goForward (plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute);
          }
        }
      );
    }

    function goBack(plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute)
    {
      let animation;

      if (curRoute == routes.length && plane.rotation != 180)
      {
        shadowPlane.rotation = 180;
        shadowPlane.opacity = 0;

        plane.animate ({
          to: 180,
          property: "rotation"
        }, 1000).events.on ("animationended",
          function() {
            curRoute = routes.length - 1;

            planeContainer.mapLine = routes[curRoute].normal;
            planeContainer.parent = self.lineSeries;
            shadowPlaneContainer.mapLine = routes[curRoute].shadow;
            shadowPlaneContainer.parent = self.shadowLineSeries;

            goBack (plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute);
          }
        );

        return;
      }
      else
        shadowPlane.opacity = 0.75;

      animation = planeContainer.animate ({
        property: "position",
        from: 1,
        to: 0
      }, 6000).delay (300);
  
      shadowPlaneContainer.animate ({
        property: "position",
        from: 1,
        to: 0
      }, 6000).delay (300);

      animation.events.on ("animationended",
        function() {
          curRoute--;
          if (curRoute == -1)
            goForward (plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute);
          else
          {
            planeContainer.mapLine = routes[curRoute].normal;
            planeContainer.parent = self.lineSeries;
            shadowPlaneContainer.mapLine = routes[curRoute].shadow;
            shadowPlaneContainer.parent = self.shadowLineSeries;

            goBack (plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute);
          }
        }
      );
    }

    if (!route.checked)
    {
      for (let airport of route.airports)
      {
        curcity = null;

        // Check if the cities city before removing it
        for (let city of this.checkedCities)
        {
          if (city.title === airport.title)
            curcity = city;
        }

        if (curcity)
        {
          curcity.numRoutes--;
          if (!curcity.numRoutes)
            this.checkedCities.splice (this.checkedCities.indexOf (curcity), 1);
        }
      }

      for (let checkedRoute of this.checkedRoutes)
      {
        if (route === checkedRoute)
        {
          this.checkedRoutes.splice (this.checkedRoutes.indexOf (checkedRoute), 1);
          break;
        }
      }
    }
    else
    {
      for (let airport of route.airports)
      {
        curcity = null;

        // Check if the city exists before adding it
        for (let city of this.checkedCities)
        {
          if (city.title === airport.title)
            curcity = city;
        }

        if (curcity)
          curcity.numRoutes++;
        else
        {
          this.checkedCities.push (airport);
          this.checkedCities[this.checkedCities.length - 1].numRoutes = 1;
        }
      }

      this.checkedRoutes.push (route);
    }

    this.zone.runOutsideAngular (() => {
      if (this.imageSeries != null)
        this.chart.series.removeIndex (this.chart.series.indexOf (this.imageSeries));

      // Create image container for the circles and city labels
      this.imageSeries = this.chart.series.push (new am4maps.MapImageSeries ());
      imageSeriesTemplate = this.imageSeries.mapImages.template;

      // Set property fields for the cities
      imageSeriesTemplate.propertyFields.latitude = "latitude";
      imageSeriesTemplate.propertyFields.longitude = "longitude";
      imageSeriesTemplate.horizontalCenter = "middle";
      imageSeriesTemplate.verticalCenter = "middle";
      imageSeriesTemplate.width = 8;
      imageSeriesTemplate.height = 8;
      imageSeriesTemplate.scale = 1;
      imageSeriesTemplate.fill = Themes.AmCharts[theme].tooltipFill;
      imageSeriesTemplate.background.fillOpacity = 0;
      imageSeriesTemplate.background.fill = Themes.AmCharts[theme].mapCityColor;
      imageSeriesTemplate.setStateOnChildren = true;

      // Configure circle and city labels
      circle = imageSeriesTemplate.createChild (am4core.Sprite);
      circle.defaultState.properties.fillOpacity = 1;
      circle.path = targetSVG;
      circle.scale = 0.75;
      circle.fill = Themes.AmCharts[theme].mapCityColor;
      circle.dx -= 2.5;
      circle.dy -= 2.5;
      hoverState = circle.states.create ("hover");
      hoverState.properties.fill = comet;

      label = imageSeriesTemplate.createChild (am4core.Label);
      label.text = "{tooltipText}";
      label.scale = 1;
      label.horizontalCenter = "left";
      label.verticalCenter = "middle";
      label.dx += 17.5;
      label.dy += 5.5;
      label.fill = Themes.AmCharts[theme].mapCityColor;
      hoverState = label.states.create ("hover");
      hoverState.properties.fill = Themes.AmCharts[theme].mapCityLabelHoverColor;
      hoverState.properties.fillOpacity = 1;

      imageSeriesTemplate.events.on ("over", function (event) {
        event.target.setState ("hover");
      });

      imageSeriesTemplate.events.on ("out", function (event) {
        event.target.setState ("default");
      });

      if (!this.checkedCities.length)
      {
        // Dispose any route lines
        if (this.lineSeries != null)
        {
          this.chart.series.removeIndex (this.chart.series.indexOf (this.lineSeries));
          this.lineSeries = null;
        }

        if (this.shadowLineSeries != null)
        {
          this.chart.series.removeIndex (this.chart.series.indexOf (this.shadowLineSeries));
          this.shadowLineSeries = null;
        }

        // Set default location and zoom level if there are no cities
        this.chart.homeGeoPoint = {
          latitude: 24.8567,
          longitude: 2.3510
        };

        zoomLevel = 1;
        this.chart.deltaLongitude = 0;
      }
      else
      {
        sumX = 0;
        sumY = 0;
        sumZ = 0;

        for (let city of this.checkedCities)
        {
          let newCity, newCityInfo, tempLatCos;

          newCity = this.imageSeries.mapImages.create ();
          newCityInfo = city;
          newCity.latitude = newCityInfo.latitude;
          newCity.longitude = newCityInfo.longitude;
          newCity.nonScaling = true;
          newCity.tooltipText = newCityInfo.title;

          newCities.push (newCity);

          tempLat = this.utils.degr2rad (newCity.latitude);
          tempLng = this.utils.degr2rad (newCity.longitude);
          tempLatCos = Math.cos (tempLat);
          sumX += tempLatCos * Math.cos (tempLng);
          sumY += tempLatCos * Math.sin (tempLng);
          sumZ += Math.sin (tempLat);
        }

        avgX = sumX / this.checkedCities.length;
        avgY = sumY / this.checkedCities.length;
        avgZ = sumZ / this.checkedCities.length;

        // Convert average x, y, z coordinate to latitude and longitude
        tempLng = Math.atan2 (avgY, avgX);
        tempLat = Math.atan2 (avgZ, Math.sqrt (avgX * avgX + avgY * avgY));

        // Set home location and zoom level
        this.chart.homeGeoPoint = {
          latitude: this.utils.rad2degr (tempLat),
          longitude: this.utils.rad2degr (tempLng)
        };

        zoomLevel = 4;
        this.chart.deltaLongitude = Math.trunc (360 - this.chart.homeGeoPoint.longitude); // truncate value to avoid invisible maps

        // Create map line series and connect to the cities
        if (this.lineSeries != null)
          this.chart.series.removeIndex (this.chart.series.indexOf (this.lineSeries));

        this.lineSeries = this.chart.series.push (new am4maps.MapLineSeries ());
        this.lineSeries.zIndex = 10;

        if (this.shadowLineSeries != null)
          this.chart.series.removeIndex (this.chart.series.indexOf (this.shadowLineSeries));

        this.shadowLineSeries = this.chart.series.push (new am4maps.MapLineSeries ());
        this.shadowLineSeries.mapLines.template.line.strokeOpacity = 0;
        this.shadowLineSeries.mapLines.template.line.nonScalingStroke = true;
        this.shadowLineSeries.mapLines.template.shortestDistance = false;
        this.shadowLineSeries.zIndex = 5;

        // Add the selected routes into the map
        for (let checkedRoute of this.checkedRoutes)
        {
          let planeContainer, shadowPlaneContainer, plane, shadowPlane;
          let curRoute, numRoutes, routes, mapLine, shadowMapLine;
          let city1, city2;

          routes = [];
          curRoute = 0;
          numRoutes = 1;
          if (checkedRoute.airports.length > 2)
            numRoutes += checkedRoute.airports.length - 2;

          for (let i = 0; i < numRoutes; i++)
          {
            // Get the cities connected to the route
            for (let city of newCities)
            {
              if (city.tooltipText === checkedRoute.airports[i].title)
                city1 = city;
    
              if (city.tooltipText === checkedRoute.airports[i + 1].title)
                city2 = city;
            }

            mapLine = this.lineSeries.mapLines.create ();
            mapLine.imagesToConnect = [city1, city2];
            mapLine.line.strokeOpacity = 0.6;
            mapLine.line.stroke = Themes.AmCharts[theme].mapLineColor[0];
            mapLine.line.horizontalCenter = "middle";
            mapLine.line.verticalCenter = "middle";
  
            shadowMapLine = this.shadowLineSeries.mapLines.create ();
            shadowMapLine.imagesToConnect = [city1, city2];
            shadowMapLine.line.horizontalCenter = "middle";
            shadowMapLine.line.verticalCenter = "middle";

            routes.push ({
              normal: mapLine,
              shadow: shadowMapLine
            });
          }

          // Add plane sprite
          planeContainer = mapLine.lineObjects.create ();
          planeContainer.position = 0;
          shadowPlaneContainer = shadowMapLine.lineObjects.create ();
          shadowPlaneContainer.position = 0;

          plane = planeContainer.createChild (am4core.Sprite);
          plane.path = planeSVG;
          plane.fill = Themes.AmCharts[theme].mapPlaneColor;
          plane.scale = 0.75;
          plane.horizontalCenter = "middle";
          plane.verticalCenter = "middle";

          shadowPlane = shadowPlaneContainer.createChild (am4core.Sprite);
          shadowPlane.path = planeSVG;
          shadowPlane.scale = 0.0275;
          shadowPlane.opacity = 0;
          shadowPlane.horizontalCenter = "middle";
          shadowPlane.verticalCenter = "middle";

          // Set first route for the plane
          planeContainer.mapLine = routes[0].normal;
          planeContainer.parent = this.lineSeries;
          shadowPlaneContainer.mapLine = routes[0].shadow;
          shadowPlaneContainer.parent = this.shadowLineSeries;

          // Make the plane bigger in the middle of the line
          planeContainer.adapter.add ("scale", function (scale, target) {
            return 0.02 * (1 - (Math.abs (0.5 - target.position)));
          });

          // Make the shadow of the plane smaller and more visible in the middle of the line
          shadowPlaneContainer.adapter.add ("scale", function (scale, target) {
            target.opacity = (0.6 - (Math.abs (0.5 - target.position)));
            return 0.5 - 0.3 * (1 - (Math.abs (0.5 - target.position)));
          });

          // Start flying the plane
          goForward (plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute);
        }
      }

      this.chart.homeZoomLevel = zoomLevel;
      this.chart.zoomToGeoPoint ({ latitude: this.chart.homeGeoPoint.latitude, longitude: this.chart.homeGeoPoint.longitude }, zoomLevel);
    });
  }

  copyControlVariables(): void
  {
    this.globals.copiedPanelInfo = JSON.stringify (this.values.currentOptionCategories);

    this.dialog.open (MessageComponent, {
      data: { title: "Information", message: "Control variables copied sucessfully." }
    });
  }

  isArray(item): boolean
  {
    return Array.isArray(item);
  }

  isDynamicTableSet(): boolean
  {
    if (!this.isDynamicTableVariablesSet () || !this.dynamicTableHasFunctions ())
      return false;

    return true;
  }

  // check if there are any horizontal and vertical variables
  isDynamicTableVariablesSet(): boolean
  {
    let hasVerticalVariables: boolean;

    if (!this.values.dynTableVariables || this.values.dynTableVariables.length < 1)
      return false;

    hasVerticalVariables = false;

    for (let value of this.values.dynTableVariables)
    {
      if (value.direction === "vertical")
      {
        hasVerticalVariables = true;
        break;
      }
    }

    if (!hasVerticalVariables)
      return false;

    return true;
  }

  dynamicTableHasFunctions(): boolean
  {
    if (!this.values.dynTableValues || this.values.dynTableValues.length < 1)
      return false;

    for (let value of this.values.dynTableValues)
    {
      if (!value.average && !value.summary && !value.min && !value.max 
        && !value.count && !value.mean && !value.stddeviation)
        return false;
    }

    return true;
  }

  addUpIntervals(): void
  {
    let theme = this.globals.theme;
    let maxValue: number;
    let self = this;

    if (this.sumSeriesList.length)
    {
      this.removeSumOfIntervals ();
      return;
    }

    this.zone.runOutsideAngular (() => {
      // prepare sum of the intervals for a line chart, if not set
      if (this.values.currentChartType.flags & ChartFlags.XYCHART)
      {
        let keys = [];

        maxValue = null;

        // add keys first
        for (let item of this.chart.data)
        {
          Object.keys (item).forEach (function(key)
          {
            if (key === "Interval" || key.startsWith ("sum"))
              return;

            if (keys.indexOf (key) == -1)
              keys.push (key);
          });
        }

        for (let key of keys)
        {
          let sum = 0;

          for (let item of this.chart.data)
          {
            let value = 0;

            if (item[key])
              value = item[key];

            sum += value;
            item["sum" + key] = sum;
          }

          if (maxValue == null || sum > maxValue)
            maxValue = sum;
        };
      }
      else
      {
        let sum: number = 0;

        for (let item of this.chart.data)
        {
          Object.keys (item).forEach (function(key)
          {
            if (key === "Interval" || key === "sum")
              return;

            sum += item[key];
          });

          if (!this.addUpValuesSet)
            item["sum"] = sum;
        }

        maxValue = sum;
      }

      this.addUpValuesSet = true;

      // add a line chart on top of the existing chart that displays the sum
      if (this.values.currentChartType.flags & ChartFlags.ROTATED)
        this.sumValueAxis = this.chart.xAxes.push (new am4charts.ValueAxis ());
      else
        this.sumValueAxis = this.chart.yAxes.push (new am4charts.ValueAxis ());

      this.sumValueAxis.min = 0;
      this.sumValueAxis.max = maxValue + 1;
      this.sumValueAxis.strictMinMax = true;
      this.sumValueAxis.cursorTooltipEnabled = true;
      this.sumValueAxis.title.text = "Sum";

      // Set value axis properties
      this.sumValueAxis.renderer.labels.template.fontSize = 10;
      this.sumValueAxis.renderer.labels.template.fill = Themes.AmCharts[theme].fontColor;
      this.sumValueAxis.renderer.grid.template.strokeOpacity = 1;
      this.sumValueAxis.renderer.grid.template.stroke = Themes.AmCharts[theme].stroke;
      this.sumValueAxis.renderer.grid.template.strokeWidth = 1;

      // Set axis tooltip background color depending of the theme
      this.sumValueAxis.tooltip.label.fill = Themes.AmCharts[theme].axisTooltipFontColor;
      this.sumValueAxis.tooltip.background.fill = Themes.AmCharts[theme].tooltipFill;

      if (this.values.currentChartType.flags & ChartFlags.XYCHART)
      {
        let index = 0;

        for (let object of this.chartInfo.filter)
        {
          let sumSeries = this.chart.series.push (new am4charts.LineSeries ());

          if (this.values.currentChartType.flags & ChartFlags.ROTATED)
          {
            sumSeries.dataFields.valueX = "sum" + object.valueField;
            sumSeries.dataFields.categoryY = "Interval";
            sumSeries.xAxis = this.sumValueAxis;
          }
          else
          {
            sumSeries.dataFields.valueY = "sum" + object.valueField;
            sumSeries.dataFields.categoryX = "Interval";
            sumSeries.yAxis = this.sumValueAxis;
          }
  
          sumSeries.bullets.push (new am4charts.CircleBullet ());
  
          sumSeries.strokeWidth = 2;
          sumSeries.fill = am4core.color (this.paletteColors[index]);
          sumSeries.stroke = Themes.AmCharts[theme].sumStroke;
          sumSeries.strokeOpacity = 0.5;
          sumSeries.name = object.valueAxis;

          if (this.values.currentChartType.flags & ChartFlags.ROTATED)
            sumSeries.tooltipText = object.valueAxis + ": {valueX}";
          else
            sumSeries.tooltipText = object.valueAxis + ": {valueY}";
  
          sumSeries.tooltip.pointerOrientation = "horizontal";
          sumSeries.tooltip.background.cornerRadius = 20;
          sumSeries.tooltip.background.fillOpacity = 0.5;
          sumSeries.tooltip.label.padding (12, 12, 12, 12);

          this.sumSeriesList.push (sumSeries);
          index++;
        }
      }
      else
      {
        let sumSeries = this.chart.series.push (new am4charts.LineSeries ());

        if (this.values.currentChartType.flags & ChartFlags.ROTATED)
        {
          sumSeries.dataFields.valueX = "sum";
          sumSeries.dataFields.categoryY = "Interval";
          sumSeries.xAxis = this.sumValueAxis;
        }
        else
        {
          sumSeries.dataFields.valueY = "sum";
          sumSeries.dataFields.categoryX = "Interval";
          sumSeries.yAxis = this.sumValueAxis;
        }

        sumSeries.bullets.push (new am4charts.CircleBullet ());

        sumSeries.strokeWidth = 2;
        sumSeries.fill = am4core.color (this.paletteColors[0]);
        sumSeries.stroke = Themes.AmCharts[theme].sumStroke;
        sumSeries.strokeOpacity = 0.5;
        sumSeries.name = "Sum";

        if (this.values.currentChartType.flags & ChartFlags.ROTATED)
          sumSeries.tooltipText = "{valueX}";
        else
          sumSeries.tooltipText = "{valueY}";

        sumSeries.tooltip.pointerOrientation = "horizontal";
        sumSeries.tooltip.background.cornerRadius = 20;
        sumSeries.tooltip.background.fillOpacity = 0.5;
        sumSeries.tooltip.label.padding (12, 12, 12, 12);

        this.sumSeriesList.push (sumSeries);
      }

      this.chart.cursor = new am4charts.XYCursor ();

      // also hide the normal category axis value labels
      if (this.values.currentChartType.flags & ChartFlags.ROTATED)
      {
        for (let i = 0; i < this.chart.xAxes.length; i++)
        {
          let xaxis = this.chart.xAxes.getIndex (i);

          if (xaxis == this.sumValueAxis)
            continue;

          xaxis.renderer.grid.template.disabled = true;
          xaxis.renderer.labels.template.disabled = true;
          xaxis.renderer.tooltip.disabled = true;
          xaxis.hide ();
        }
      }
      else
      {
        for (let i = 0; i < this.chart.yAxes.length; i++)
        {
          let yaxis = this.chart.yAxes.getIndex (i);

          if (yaxis == this.sumValueAxis)
            continue;

          yaxis.renderer.grid.template.disabled = true;
          yaxis.renderer.labels.template.disabled = true;
          yaxis.renderer.tooltip.disabled = true;
          yaxis.hide ();
        }
      }

      // hide every chart series except the sum ones
      this.chart.events.once ("dataitemsvalidated", function (event) {
        for (let i = 0; i < self.chart.series.length; i++)
        {
          let series = self.chart.series.getIndex (i);
          let skipSeries: boolean = false;

          for (let sumSeries of self.sumSeriesList)
          {
            if (series == sumSeries)
            {
              skipSeries = true;
              break;
            }
          }

          if (skipSeries)
            continue;

          series.hide ();
          series.hiddenInLegend = true;
        }
      });

      // invalidate data in order to display the line chart
      this.chart.invalidateData ();
    });
  }

  removeSumOfIntervals(): void
  {
    this.zone.runOutsideAngular (() => {
      let self = this;

      for (let sumSeries of this.sumSeriesList)
        this.chart.series.removeIndex (this.chart.series.indexOf (sumSeries));

      this.sumSeriesList = [];

      if (this.values.currentChartType.flags & ChartFlags.ROTATED)
        this.chart.xAxes.removeIndex (this.chart.xAxes.indexOf (this.sumValueAxis));
      else
        this.chart.yAxes.removeIndex (this.chart.yAxes.indexOf (this.sumValueAxis));

      this.sumValueAxis = null;

      // display the normal category axis value labels
      if (this.values.currentChartType.flags & ChartFlags.ROTATED)
      {
        for (let i = 0; i < this.chart.xAxes.length; i++)
        {
          let xaxis = this.chart.xAxes.getIndex (i);

          xaxis.show ();
          xaxis.renderer.grid.template.disabled = false;
          xaxis.renderer.labels.template.disabled = false;
          xaxis.renderer.tooltip.disabled = false;
        }
      }
      else
      {
        for (let i = 0; i < this.chart.yAxes.length; i++)
        {
          let yaxis = this.chart.yAxes.getIndex (i);

          yaxis.show ();
          yaxis.renderer.grid.template.disabled = false;
          yaxis.renderer.labels.template.disabled = false;
          yaxis.renderer.tooltip.disabled = false;
        }
      }

      // display every chart series except the sum ones
      this.chart.events.once ("dataitemsvalidated", function (event) {
        for (let i = 0; i < self.chart.series.values.length; i++)
        {
          let series = self.chart.series.getIndex (i);

          series.show ();
          series.hiddenInLegend = false;
        }
      });

      if (this.values.currentChartType.flags & ChartFlags.LINECHART)
        this.chart.cursor = new am4charts.XYCursor ();
      else
        this.chart.cursor = null;

      // invalidate data in order to remove the line chart
      this.chart.invalidateData ();
    });
  }

  toggleIntervalTable(): void
  {
    let chartElement;

    this.advTableView = !this.advTableView;

    // redraw chart
    chartElement = document.getElementById ("msf-dashboard-chart-display-" + this.values.id);
    document.getElementById ("msf-dashboard-chart-display-container-" + this.values.id).appendChild (chartElement);
  }

  isLineOrBarChart(): boolean
  {
    if (!(this.values.currentChartType.flags & ChartFlags.PIECHART) && !(this.values.currentChartType.flags & ChartFlags.FUNNELCHART))
      return true;

    return false;
  }

  generateValueList(): string
  {
    let list = "";

    if (!this.isSimpleChart () || !this.values.valueList || (this.values.valueList && !this.values.valueList.length))
      return null;

    for (let i = 0; i < this.values.valueList.length; i++)
    {
      list += this.values.valueList[i].item.id;

      if (i != this.values.valueList.length - 1)
        list += ",";
    }

    return list;
  }

  generateValueListInfo(): string
  {
    if (!this.isSimpleChart () || !this.values.valueListInfo || (this.values.valueListInfo && !this.values.valueListInfo.length) || this.isAdvChartPanel ())
      return null;

    for (let valueInfo of this.values.valueListInfo)
      valueInfo.name = undefined;

    return JSON.stringify (this.values.valueListInfo);
  }

  generateValueNameList(): string
  {
    let list = "";

    if (!this.isSimpleChart () || !this.values.valueList || (this.values.valueList && !this.values.valueList.length))
      return null;

    for (let i = 0; i < this.values.valueList.length; i++)
    {
      list += this.values.valueList[i].id;

      if (i != this.values.valueList.length - 1)
        list += ",";
    }

    return list;
  }

  getValueFormFontColor(formResult): string
  {
    for (let threshold of this.values.thresholds)
    {
      let value = parseFloat (formResult.value);

      if (threshold.column == formResult.column.id && value >= threshold.min && value <= threshold.max)
        return threshold.color;
    }

    return "inherit";
  }

  getServerData(event?: PageEvent): any
  {
    if (this.values.isLoading)
      return null;

    this.pageIndex = event;
    this.pageI = event.pageIndex;
    this.moreResultsBtn = true;
    // this.pageIndex = event.pageIndex;
    this.moreTableResults();
    return event;
  }

  paginatorlength(event: any): void
  {
    this.lengthpag = event.length;
    this.pageI = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  shmoreResult(event: any){
    this.values.tokenResultTable = event.tokenResultTable;
    this.values.showMoreResult = event.showMoreResult;
  }

  configureAnchoredControlVariables(): void
  {
    this.anchoredArguments = [];

    if (!this.values.currentOptionCategories)
      return;

    for (let categoryArgument of this.values.currentOptionCategories)
    {
      for (let argument of categoryArgument.arguments)
      {
        if (argument.anchored)
        {
          this.anchoredArguments.push ({
            isLoading: false,
            argument: JSON.parse (JSON.stringify (argument))
          });
        }
      }
    }

    this.savedAnchoredArguments = JSON.parse (JSON.stringify (this.anchoredArguments));
    this.changeDetectorRef.detectChanges ();
  }

  setArgumentLoading(argument, value): void
  {
    argument.isLoading = value;
  }

  removedAnchoredArgument(anchoredArgument): void
  {
    anchoredArgument.anchored = false;
    this.anchoredArguments.splice (this.anchoredArguments.indexOf (anchoredArgument), 1);
  }

  toggleAnchoredArguments(): void
  {
    this.displayAnchoredArguments = !this.displayAnchoredArguments;
  }

  saveAnchoredChanges(): void
  {
    // don't display results when loading new changes
    this.displayChart = false;
    this.displayInfo = false;
    this.displayForm = false;
    this.displayMapbox = false;
    this.displayPic = false;
    this.displayTable = false;
    this.displayDynTable = false;
    this.displayEditActionList = false;

    // set new argument values
    for (let categoryArgument of this.values.currentOptionCategories)
    {
      for (let argument of categoryArgument.arguments)
      {
        let argumentSet = false;

        for (let anchoredArgument of this.anchoredArguments)
        {
          if (argument.name1 === anchoredArgument.argument.name1)
          {
            argument.value1 = anchoredArgument.argument.value1;
            argument.value2 = anchoredArgument.argument.value2;
            argument.value3 = anchoredArgument.argument.value3;
            argument.value4 = anchoredArgument.argument.value4;
            argument.dateLoaded = anchoredArgument.argument.dateLoaded;
            argument.currentDateRangeValue = anchoredArgument.argument.currentDateRangeValue;

            argumentSet = true;
            break;
          }
        }

        if (argumentSet)
          break;
      }
    }

    // run service to set changes
    this.loadData ();
  }

  revertAnchoredChanges(): void
  {
    this.anchoredArguments = JSON.parse (JSON.stringify (this.savedAnchoredArguments));
  }

  setRouteNetworks(chart, theme, rebuild): void
  {
    let mapLinesTemplate, imageSeriesTemplate, circle, hoverState, label, zoomLevel, keyValue, lastKeyValue, numKeyValues, numOrigRoutes, routeEnabled;
    let cities = [];
    let routes = [];

    if (!this.values.lastestResponse.length)
      return;

    if (!rebuild)
      this.routepanelinfo = [];

    if (rebuild)
    {
      for (let i = this.routepanelinfo.length - 1; i >= 0; i--)
      {
        let route = this.routepanelinfo[i];

        if (route.serie != null)
        {
          chart.series.removeIndex (chart.series.indexOf (route.serie));
          route.serie = null;
        }
      }

      chart.series.removeIndex (chart.series.indexOf (this.scheduleImageSeries));
    }

    // Create image container for the circles and city labels
    this.scheduleImageSeries = chart.series.push (new am4maps.MapImageSeries ());
    imageSeriesTemplate = this.scheduleImageSeries.mapImages.template;

    // Set property fields for the cities
    imageSeriesTemplate.propertyFields.latitude = "latitude";
    imageSeriesTemplate.propertyFields.longitude = "longitude";
    imageSeriesTemplate.horizontalCenter = "middle";
    imageSeriesTemplate.verticalCenter = "middle";
    imageSeriesTemplate.width = 8;
    imageSeriesTemplate.height = 8;
    imageSeriesTemplate.scale = 1;
    imageSeriesTemplate.fill = Themes.AmCharts[theme].tooltipFill;
    imageSeriesTemplate.background.fillOpacity = 0;
    imageSeriesTemplate.background.fill = Themes.AmCharts[theme].mapCityColor;
    imageSeriesTemplate.setStateOnChildren = true;

    // Configure circle and city labels
    circle = imageSeriesTemplate.createChild (am4core.Sprite);
    circle.defaultState.properties.fillOpacity = 1;
    circle.path = targetSVG;
    circle.scale = 0.75;
    circle.fill = Themes.AmCharts[theme].mapCityColor;
    circle.dx -= 2.5;
    circle.dy -= 2.5;
    hoverState = circle.states.create ("hover");
    hoverState.properties.fill = comet;

    label = imageSeriesTemplate.createChild (am4core.Label);
    label.text = "{tooltipText}";
    label.scale = 1;
    label.horizontalCenter = "left";
    label.verticalCenter = "middle";
    label.dx += 17.5;
    label.dy += 5.5;
    label.fill = Themes.AmCharts[theme].mapCityColor;
    hoverState = label.states.create ("hover");
    hoverState.properties.fill = Themes.AmCharts[theme].mapCityLabelHoverColor;
    hoverState.properties.fillOpacity = 1;

    imageSeriesTemplate.events.on ("over", function (event) {
      event.target.setState ("hover");
    });

    imageSeriesTemplate.events.on ("out", function (event) {
      event.target.setState ("default");
    });

    let tempLatCos, tempLat, tempLng;
    var sumX = 0;
    var sumY = 0;
    var sumZ = 0;

    if (!rebuild)
    {
      // Sort the results by origin
      if (this.values.currentOption.metaData == 5)
      {
        this.values.lastestResponse.sort (function (e1, e2) {
          if (e1.yyyymmdd === e2.yyyymmdd)
            return 0;

          return e2.yyyymmdd < e1.yyyymmdd ? 1 : -1;
        });
      }
      else
      {
        this.values.lastestResponse.sort (function (e1, e2) {
          if (e1.origin === e2.origin)
            return 0;

          return e2.origin < e1.origin ? -1 : 1;
        });
      }
    }

    lastKeyValue = null;
    numKeyValues = 0;
    numOrigRoutes = 0;

    // Add cities and routes
    for (let record of this.values.lastestResponse)
    {
      let city, latOrigin, lonOrigin, latDest, lonDest;

      if (this.values.currentOption.metaData == 5)
        keyValue = record.yyyymmdd;
      else
        keyValue = record.origin;

      if (!rebuild || (rebuild && this.routepanelinfo[numOrigRoutes].enabled))
        routeEnabled = true;
      else
        routeEnabled = false;

      if (routeEnabled)
      {
        latOrigin = parseFloat (record.latOrigin);
        lonOrigin = parseFloat (record.lonOrigin);
        latDest = parseFloat (record.latDest);
        lonDest = parseFloat (record.lonDest);

        if (latOrigin === "NULL" || lonOrigin === "NULL")
        {
          console.warn (record.origin + " have invalid coordinates! (lat: " + latOrigin + ", lon: " + lonOrigin + ")");
          continue;
        }

        if (latDest === "NULL" || lonDest === "NULL")
        {
          console.warn (record.origin + " have invalid coordinates! (lat: " + latDest + ", lon: " + lonDest + ")");
          continue;
        }

        if (cities.indexOf (record.origin) == -1)
        {
          // Add origin city
          city = this.scheduleImageSeries.mapImages.create ();
    
          if (latOrigin < -90 || latOrigin > 90 || lonOrigin < -180 || lonOrigin > 180)
          {
            console.warn (record.origin + " have invalid coordinates! (lat: " + latOrigin + ", lon: " + lonOrigin + ")");

            if (latOrigin < -90 || latOrigin > 90)
              latOrigin /= 1000000;

            if (lonOrigin < -180 || lonOrigin > 180)
              lonOrigin /= 1000000;
          }
    
          city.latitude = latOrigin;
          city.longitude = lonOrigin;
          city.nonScaling = true;
          city.tooltipText = record.origin;

          cities.push (record.origin);

          tempLat = this.utils.degr2rad (city.latitude);
          tempLng = this.utils.degr2rad (city.longitude);
          tempLatCos = Math.cos (tempLat);
          sumX += tempLatCos * Math.cos (tempLng);
          sumY += tempLatCos * Math.sin (tempLng);
          sumZ += Math.sin (tempLat);
        }
        else
        {
          if (latOrigin < -90 || latOrigin > 90)
            latOrigin /= 1000000;

          if (lonOrigin < -180 || lonOrigin > 180)
            lonOrigin /= 1000000;
        }

        // Add destination city
        if (cities.indexOf (record.dest) == -1)
        {
          city = this.scheduleImageSeries.mapImages.create ();
  
          if (latDest < -90 || latDest > 90 || lonDest < -180 || lonDest > 180)
          {
            console.warn (record.dest + " have invalid coordinates! (lat: " + latDest + ", lon: " + lonDest + ")");

            if (latDest < -90 || latDest > 90)
              latDest /= 1000000;

            if (lonDest < -180 || lonDest > 180)
              lonDest /= 1000000;
          }
    
          city.latitude = latDest;
          city.longitude = lonDest;
          city.nonScaling = true;
          city.tooltipText = record.dest;

          cities.push (record.dest);

          tempLat = this.utils.degr2rad (city.latitude);
          tempLng = this.utils.degr2rad (city.longitude);
          tempLatCos = Math.cos (tempLat);
          sumX += tempLatCos * Math.cos (tempLng);
          sumY += tempLatCos * Math.sin (tempLng);
          sumZ += Math.sin (tempLat);
        }
        else
        {
          if (latDest < -90 || latDest > 90)
            latDest /= 1000000;

          if (lonDest < -180 || lonDest > 180)
            lonDest /= 1000000;
        }
      }

      if (keyValue == lastKeyValue)
      {
        if (routeEnabled)
        {
          // Add route
          routes.push ([
            { "latitude": latOrigin, "longitude": lonOrigin },
            { "latitude": latDest, "longitude": lonDest }
          ]);
        }
      }
      else
      {
        if (lastKeyValue != null)
        {
          if (routeEnabled)
          {
            // Create map line series and connect the origin city to the desination cities
            let lineSeries = chart.series.push (new am4maps.MapLineSeries ());
            lineSeries.zIndex = 10;
            lineSeries.data = [{
              "multiGeoLine": routes
            }];

            // Set map line template
            mapLinesTemplate = lineSeries.mapLines.template;
            mapLinesTemplate.opacity = 0.6;
            mapLinesTemplate.stroke = Themes.AmCharts[theme].mapLineColor[numKeyValues];
            mapLinesTemplate.horizontalCenter = "middle";
            mapLinesTemplate.verticalCenter = "middle";

            if (!rebuild)
            {
              // Add key value into the list
              this.routepanelinfo.push ({
                name: lastKeyValue,
                enabled: true,
                colorIndex: numKeyValues,
                serie: lineSeries
              });
            }
            else
              this.routepanelinfo[numOrigRoutes].serie = lineSeries;
          }

          routes = [];
          numKeyValues++;
          numOrigRoutes++;
          if (numKeyValues > 11)
            numKeyValues = 11;
        }
        else if (routeEnabled)
        {
          routes.push ([
            { "latitude": latOrigin, "longitude": lonOrigin },
            { "latitude": latDest, "longitude": lonDest }
          ]);
        }

        lastKeyValue = keyValue;
      }
    }

    if (!rebuild || (rebuild && this.routepanelinfo[numOrigRoutes].enabled))
      routeEnabled = true;
    else
      routeEnabled = false;

    if (routeEnabled)
    {
      // Add last set of routes
      let lineSeries = chart.series.push (new am4maps.MapLineSeries ());
      lineSeries.zIndex = 10;
      lineSeries.data = [{
        "multiGeoLine": routes
      }];

      mapLinesTemplate = lineSeries.mapLines.template;
      mapLinesTemplate.opacity = 0.6;
      mapLinesTemplate.stroke = Themes.AmCharts[theme].mapLineColor[numKeyValues];
      mapLinesTemplate.horizontalCenter = "middle";
      mapLinesTemplate.verticalCenter = "middle";

      if (!rebuild)
      {
        this.routepanelinfo.push ({
          name: lastKeyValue,
          enabled: true,
          colorIndex: numKeyValues,
          serie: lineSeries
        });
      }
      else
        this.routepanelinfo[numOrigRoutes].serie = lineSeries;
    }

    var avgX = sumX / cities.length;
    var avgY = sumY / cities.length;
    var avgZ = sumZ / cities.length;

    // Convert average x, y, z coordinate to latitude and longtitude
    var lng = Math.atan2 (avgY, avgX);
    var hyp = Math.sqrt (avgX * avgX + avgY * avgY);
    var lat = Math.atan2 (avgZ, hyp);
    var zoomlat =  this.utils.rad2degr (lat);
    var zoomlong = this.utils.rad2degr (lng);

    if (!cities.length)
    {
      zoomLevel = 1;
      zoomlat = 24.8567;
      zoomlong = 2.3510;
    }
    else
      zoomLevel = 4;

    chart.deltaLongitude = Math.trunc (360 - Number (zoomlong)); // truncate value to avoid invisible maps
    chart.homeGeoPoint.longitude = Number (zoomlong);
    chart.homeGeoPoint.latitude = Number (zoomlat);
    chart.homeZoomLevel = zoomLevel;

    if (!rebuild)
      chart.zoomToGeoPoint ({ latitude: zoomlat, longitude: zoomlong }, zoomLevel);
    else
    {
      // avoid thick lines
      chart.zoomToGeoPoint ({ latitude: zoomlat, longitude: zoomlong }, zoomLevel - 0.00001);

      setTimeout (() => {
        chart.goHome ();
      }, 50);
    }
  }

  rebuildMapRoutes(): void
  {
    this.zone.runOutsideAngular (() => {
      this.setRouteNetworks (this.chart, this.globals.theme, true);
    });
  }

  getMapLineColor(index: number): string
  {
    return Themes.AmCharts[this.globals.theme].mapLineColor[index].rgba;
  }

  getMapRouteFormat(name: string): string
  {
    if (this.values.currentOption.metaData == 5)
    {
      let momentValue = moment (name, "YYYYMMDD");

      if (!momentValue.isValid())
        return name;

      return new DatePipe ('en-US').transform (momentValue.toDate (), "MM/dd/yyyy");
    }

    return name;
  }

  startURLUpdate(): void
  {
    this.updateURLResults = true;

    setTimeout (() => {
      this.updateURLResults = false;
    }, 100);
  }

  configurePanel(): void
  {
    let dialogRef;

    this.toggleControlVariableDialogOpen.emit (true);

    dialogRef = this.dialog.open (MsfDashboardAssistantComponent, {
      width: '930px',
      height: '595px',
      panelClass: 'msf-dashboard-panel-dialog',
      data: {
        values: this.values,
        functions: this.functions,
        chartTypes: this.chartTypes,
        nciles: this.nciles,
        fontSizes: this.fontSizes,
        orientations: this.orientations,
        geodatas: this.geodatas,
        childPanelValues: this.childPanelValues,
        childPanelsConfigured: this.childPanelsConfigured,
        toggleControlVariableDialogOpen: this.toggleControlVariableDialogOpen,
        msfMapRef: this.msfMapRef
      }
    });

    dialogRef.afterClosed ().subscribe ((result) => {
      this.toggleControlVariableDialogOpen.emit (false);

      this.checkChartType ();

      if (result)
      {
        if (result.generateChart)
        {
          this.setPanelValues (result.values);
          this.loadData ();
        }
        else if (result.goToResults)
          this.goToResults ();
      }
    });
  }

  enableContextMenu(event): void
  {
    let contextMenuFlags: any = {
      advChartTableView: false,
      advChartView: false,
      sumSeriesList: false,
      anchoredArguments: false,
      anchoredArgumentsSettings: false
    };

    if (this.isAdvChartPanel ())
    {
      if (this.advTableView)
        contextMenuFlags.advChartTableView = true;
      else
      {
        contextMenuFlags.advChartView = true;

        if (this.sumSeriesList && this.sumSeriesList.length)
          contextMenuFlags.sumSeriesList = true;
      }
    }

    if (this.anchoredArguments && this.anchoredArguments.length)
    {
      contextMenuFlags.anchoredArguments = true;

      if (this.displayAnchoredArguments)
        contextMenuFlags.anchoredArgumentsSettings = true;
    }

    this.enablePanelContextMenu.emit ({
      event: event,
      flags: contextMenuFlags,
      panel: this
    });
  }

  sortingDataTable(event: any): void
  {
    if (event.columnName != "") {
      this.values.ListSortingColumns = event.columnName + " " + event.order;
    }

    if (event.order === "") {
      this.values.ListSortingColumns = "";
    }
    if (event && this.values.currentOption.serverSorting === 1
      && ((!this.moreResultsBtn && this.actualPageNumber!=0) || this.moreResultsBtn)) {
      let sorting = true;
      let currentOptionCategories = this.values.currentOptionCategories;  
      if (currentOptionCategories)
      {
        for (let i = 0; i < currentOptionCategories.length; i++)
        {
          let category: CategoryArguments = currentOptionCategories[i];
  
          if (category && category.arguments)
          {
            for (let j = 0; j < category.arguments.length; j++)
            {
              let argument = category.arguments[j];
              if (argument.type === "sortingCheckboxes") {
                if (argument.value1 && argument.value1.length != 0) {
                  sorting = false;
                }
              }
            }
          }
        }
      }

      if (sorting)
        this.loadData ();
    }
  }

  clearSort(): void
  {
    if (this.values.ListSortingColumns != "")
    {
      this.values.ListSortingColumns = "";
      this.actualPageNumber = 0;
      this.moreResults = false;
      this.msfTableRef.sort.sort({ id: '', start: 'asc', disableClear: false });
    }
  }

  getMasFlightMobileLogoImage(): string
  {
    return "../../assets/images/dark-theme-masFlight-mobile-logo.png";
  }

  getMasFlightLogoImage(): string
  {
    return "../../assets/images/dark-theme-masFlight-logo.png";
  }
}
