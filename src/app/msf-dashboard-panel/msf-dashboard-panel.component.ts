import { Component, OnInit, ViewChild, Input, NgZone, SimpleChanges } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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
import am4geodata_usaAlbersLow from "@amcharts/amcharts4-geodata/usaAlbersLow";
import am4geodata_colombiaLow from "@amcharts/amcharts4-geodata/colombiaLow";
import am4geodata_colombiaMuniLow from "@amcharts/amcharts4-geodata/colombiaMuniLow";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import { CategoryArguments } from '../model/CategoryArguments';
import { Globals } from '../globals/Globals';
import { Themes } from '../globals/Themes';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { MatSelect, MatDialog } from '@angular/material';
import { takeUntil } from 'rxjs/operators';

import { ApiClient } from '../api/api-client';
import { Arguments } from '../model/Arguments';
import { Utils } from '../commons/utils';
import { ApplicationService } from '../services/application.service';
import { MsfDashboardControlVariablesComponent } from '../msf-dashboard-control-variables/msf-dashboard-control-variables.component';
import { MsfDashboardInfoFunctionsComponent } from '../msf-dashboard-info-functions/msf-dashboard-info-functions.component';
import { MsfDashboardColorPickerComponent } from  '../msf-dashboard-color-picker/msf-dashboard-color-picker.component';
import { MsfDashboardDrillDownComponent } from  '../msf-dashboard-drill-down/msf-dashboard-drill-down.component';
import { MsfShareDashboardComponent } from '../msf-share-dashboard/msf-share-dashboard.component';
import { MsfTableComponent } from '../msf-table/msf-table.component';
import { MsfDashboardPanelValues } from '../msf-dashboard-panel/msf-dashboard-panelvalues';
import { ComponentType } from '../commons/ComponentType';
import { MessageComponent } from '../message/message.component';
import { ChartFlags } from '../msf-dashboard-panel/msf-dashboard-chartflags';
import { AuthService } from '../services/auth.service';
import { MsfMapComponent } from '../msf-map/msf-map.component';

am4core.useTheme(am4themes_animated);

// AmCharts colors
const black = am4core.color ("#000000");
const comet = am4core.color ("#585869");

// SVG used for maps
const homeSVG = "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8";
const planeSVG = "m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47";
const targetSVG = "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z";

@Component({
  selector: 'app-msf-dashboard-panel',
  templateUrl: './msf-dashboard-panel.component.html',
  styleUrls: ['./msf-dashboard-panel.component.css']
})
export class MsfDashboardPanelComponent implements OnInit {
  utils: Utils;

  variableCtrlBtnEnabled: boolean = false;
  generateBtnEnabled: boolean = false;

  chartForm: FormGroup;
  chart: any;

  chartTypes:any[] = [
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
    { name: 'Map Tracker', flags: ChartFlags.MAP | ChartFlags.MAPBOX }/*,
    { name: 'Simple Picture', flags: ChartFlags.INFO | ChartFlags.PICTURE }*/
  ];

  functions:any[] = [
    { id: 'avg', name: 'Average' },
    { id: 'sum', name: 'Sum' },
    { id: 'max', name: 'Max' },
    { id: 'min', name: 'Min' },
    { id: 'count', name: 'Count' }
  ];

  fontSizes:any[] = [
    { name: 'Small', value: 12 },
    { name: 'Medium', value: 18 },
    { name: 'Large', value: 30 }
  ];

  orientations:any[] = [
    { name: 'Horizontal', value: false },
    { name: 'Vertical', value: true }
  ];

  // NOTE: am4maps.projections.AlbersUsa is not available
  // on AmCharts v4 4.2.0 and using anything higher than 4.2.0
  // causes heap issues when compiling the app :(
  geodatas:any[] = [
    { name: 'U.S. States', value: am4geodata_usaAlbersLow },
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

  @Input()
  values: MsfDashboardPanelValues;
  temp: MsfDashboardPanelValues;

  @Input()
  panelHeight: number;

  @Input()
  reAppendChart: boolean;

  childPanelValues: any[] = [];
  childPanelsConfigured: boolean[] = [];

  updateTimeLeft: number = 60;
  updateInterval: any;

  // table variables
  @ViewChild('msfTableRef')
  msfTableRef: MsfTableComponent;

  // map variables
  imageSeries: any;
  lineSeries: any;
  shadowLineSeries: any;
  checkedCities: any[] = [];
  checkedRoutes: any[] = [];

  actualPageNumber: number;
  dataSource: boolean = false;
  template: boolean = false;
  moreResults: boolean = false;
  moreResultsBtn: boolean = false;
  displayedColumns;
  selectedIndex = 0;
  totalRecord = 0;
  metadata;

  public dataFormFilterCtrl: FormControl = new FormControl ();
  public variableFilterCtrl: FormControl = new FormControl ();
  public xaxisFilterCtrl: FormControl = new FormControl ();
  public valueFilterCtrl: FormControl = new FormControl ();

  public infoVar1FilterCtrl: FormControl = new FormControl ();
  public infoVar2FilterCtrl: FormControl = new FormControl ();
  public infoVar3FilterCtrl: FormControl = new FormControl ();

  public columnFilterCtrl: FormControl = new FormControl ();

  public filteredVariables: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filteredOptions: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('variableSelect') variableSelect: MatSelect;
  @ViewChild('xaxisSelect') xaxisSelect: MatSelect;
  @ViewChild('valueSelect') valueSelect: MatSelect;

  private _onDestroy = new Subject<void> ();

  // mapbox variables
  @ViewChild('msfMapRef')
  msfMapRef: MsfMapComponent;
  mapboxInterval: any;
  lastWidth: number;

  constructor(private zone: NgZone, public globals: Globals,
    private service: ApplicationService, private http: ApiClient, private authService: AuthService, public dialog: MatDialog,
    private formBuilder: FormBuilder)
  {
    this.utils = new Utils ();

    this.chartForm = this.formBuilder.group ({
      dataFormCtrl: new FormControl (),
      variableCtrl: new FormControl ({ value: '', disabled: true }),
      xaxisCtrl: new FormControl ({ value: '', disabled: true }),
      valueCtrl: new FormControl ({ value: '', disabled: true }),
      infoNumVarCtrl: new FormControl ({ value: '', disabled: true }),
      infoVar1Ctrl: new FormControl ({ value: '', disabled: true }),
      infoVar2Ctrl: new FormControl ({ value: '', disabled: true }),
      infoVar3Ctrl: new FormControl ({ value: '', disabled: true }),
      columnCtrl: new FormControl ({ value: '', disabled: true }),
      fontSizeCtrl: new FormControl ({ value: this.fontSizes[1], disabled: true }),
      valueFontSizeCtrl: new FormControl ({ value: this.fontSizes[1], disabled: true }),
      valueOrientationCtrl: new FormControl ({ value: this.orientations[0], disabled: true }),
      intervalCtrl: new FormControl ({ value: 5, disabled: true }),
      geodataValueCtrl: new FormControl ({ value: '', disabled: true }),
      geodataKeyCtrl: new FormControl ({ value: '', disabled: true })
    });
  }

  ngOnInit()
  {
    // prepare the data form combo box
    this.optionSearchChange (this.dataFormFilterCtrl);

    // copy function list for use with the information panel
    this.values.infoFunc1 = JSON.parse (JSON.stringify (this.functions));
    this.values.infoFunc2 = JSON.parse (JSON.stringify (this.functions));
    this.values.infoFunc3 = JSON.parse (JSON.stringify (this.functions));

    this.values.style = this.msfMapRef.mapTypes[1];
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if (changes['reAppendChart'] && this.reAppendChart)
    {
      if (this.values.chartGenerated)
      {
        let chartElement = document.getElementById ("msf-dashboard-chart-display-" + this.values.id);
        document.getElementById ("msf-dashboard.chart-display-container-" + this.values.id).appendChild (chartElement);
      }
    }
  }

  // Function to create horizontal column chart series
  createHorizColumnSeries(values, stacked, chart, item, parseDate, theme): void
  {
    // Set up series
    let series = chart.series.push (new am4charts.ColumnSeries ());
    series.name = item.valueAxis;
    series.dataFields.valueX = item.valueField;
    series.sequencedInterpolation = true;

    // Parse date if available
    if (parseDate)
    {
      series.dataFields.dateY = values.xaxis.id;
      series.dateFormatter.dateFormat = "MMM d, yyyy";
      series.columns.template.tooltipText = "{dateY}: {valueX}";
    }
    else
    {
      series.dataFields.categoryY = values.xaxis.id;
      series.columns.template.tooltipText = "{categoryY}: {valueX}";
    }

    // Configure columns
    series.stacked = stacked;
    series.columns.template.strokeWidth = 0;
    series.columns.template.width = am4core.percent (60);

    // Set thresholds
    series.columns.template.adapter.add ("fill", (fill, target) => {
      if (target.dataItem)
      {
        for (let threshold of values.thresholds)
        {
          if (target.dataItem.valueX >= threshold.min && target.dataItem.valueX <= threshold.max)
            return am4core.color (threshold.color);
        }
      }

      return fill;
    });

    // Display a special context menu when a chart column is right clicked
    series.columns.template.events.on ("rightclick", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[values.xaxis.id];
      values.chartSecondaryObjectSelected = series.dataFields.valueX;
    });
  }

  // Function to create vertical column chart series
  createVertColumnSeries(values, stacked, chart, item, parseDate, theme): void
  {
    let series = chart.series.push (new am4charts.ColumnSeries ());
    series.name = item.valueAxis;
    series.dataFields.valueY = item.valueField;
    series.sequencedInterpolation = true;

    if (parseDate)
    {
      series.dataFields.dateX = values.xaxis.id;
      series.dateFormatter.dateFormat = "MMM d, yyyy";
      series.columns.template.tooltipText = "{dateX}: {valueY}";
    }
    else
    {
      series.dataFields.categoryX = values.xaxis.id;
      series.columns.template.tooltipText = "{categoryX}: {valueY}";
    }

    series.stacked = stacked;
    series.columns.template.strokeWidth = 0;
    series.columns.template.width = am4core.percent (60);

    series.columns.template.adapter.add ("fill", (fill, target) => {
      if (target.dataItem)
      {
        for (let threshold of values.thresholds)
        {
          if (target.dataItem.valueY >= threshold.min && target.dataItem.valueY <= threshold.max)
            return am4core.color (threshold.color);
        }
      }

      return fill;
    });

    series.columns.template.events.on ("rightclick", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[values.xaxis.id];
      values.chartSecondaryObjectSelected = series.dataFields.valueY;
    });
  }

  // Function to create line chart series
  createLineSeries(values, stacked, chart, item, parseDate, theme): void
  {
    // Set up series
    let series = chart.series.push (new am4charts.LineSeries ());
    series.name = item.valueAxis;
    series.dataFields.valueY = item.valueField;
    series.sequencedInterpolation = true;
    series.strokeWidth = 2;
    series.minBulletDistance = 10;
    series.tooltip.pointerOrientation = "horizontal";
    series.tooltip.background.cornerRadius = 20;
    series.tooltip.background.fillOpacity = 0.5;
    series.tooltip.label.padding (12, 12, 12, 12);
    series.tooltip.background.fill = Themes.AmCharts[theme].tooltipFill;
    series.tensionX = 0.8;

    if (parseDate)
    {
      series.dataFields.dateX = values.xaxis.id;
      series.dateFormatter.dateFormat = "MMM d, yyyy";
      series.tooltipText = "{dateX}: {valueY}";
    }
    else
    {
      series.dataFields.categoryX = values.xaxis.id;
      series.tooltipText = "{categoryX}: {valueY}";
    }

    // Fill area below line for area chart types
    if (values.currentChartType.flags & ChartFlags.AREAFILL)
      series.fillOpacity = 0.3;

    series.stacked = stacked;

    // Set thresholds
    series.segments.template.adapter.add ("fill", (fill, target) => {
      if (target.dataItem)
      {
        for (let threshold of values.thresholds)
        {
          if (target.dataItem.values.valueY.average >= threshold.min && target.dataItem.values.valueY.average <= threshold.max)
            return am4core.color (threshold.color);
        }
      }

      return fill;
    });

    series.adapter.add ("stroke", (stroke, target) => {
      if (target.dataItem)
      {
        for (let threshold of values.thresholds)
        {
          if (target.dataItem.values.valueY.average >= threshold.min && target.dataItem.values.valueY.average <= threshold.max)
            return am4core.color (threshold.color);
        }
      }

      return stroke;
    });

    // Display a special context menu when a chart line segment is right clicked
    series.segments.template.interactionsEnabled = true;
    series.segments.template.events.on ("rightclick", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.component.tooltipDataItem.dataContext[values.xaxis.id];
      values.chartSecondaryObjectSelected = series.dataFields.valueY;
    });
  }

  // Function to create simple vertical column chart series
  createSimpleVertColumnSeries(values, stacked, chart, item, parseDate, theme): void
  {
    let series = chart.series.push (new am4charts.ColumnSeries ());
    series.dataFields.valueY = item.valueField;
    series.dataFields.categoryX = item.titleField;
    series.name = item.valueField;
    series.columns.template.tooltipText = "{categoryX}: {valueY}";
    series.columns.template.strokeWidth = 0;

    series.stacked = stacked;

    // Set colors
    series.columns.template.adapter.add ("fill", (fill, target) => {
      if (target.dataItem)
      {
        for (let threshold of values.thresholds)
        {
          if (target.dataItem.valueY >= threshold.min && target.dataItem.valueY <= threshold.max)
            return am4core.color (threshold.color);
        }
      }

      return am4core.color (values.paletteColors[0]);
    });

    // Display a special context menu when a chart column is right clicked
    series.columns.template.events.on ("rightclick", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
      values.chartSecondaryObjectSelected = null;
    });
  }

  // Function to create simple horizontal column chart series
  createSimpleHorizColumnSeries(values, stacked, chart, item, parseDate, theme): void
  {
    let series = chart.series.push (new am4charts.ColumnSeries ());
    series.dataFields.valueX = item.valueField;
    series.dataFields.categoryY = item.titleField;
    series.name = item.valueField;
    series.columns.template.tooltipText = "{categoryY}: {valueX}";
    series.columns.template.strokeWidth = 0;

    series.stacked = stacked;

    series.columns.template.adapter.add ("fill", (fill, target) => {
      if (target.dataItem)
      {
        for (let threshold of values.thresholds)
        {
          if (target.dataItem.valueX >= threshold.min && target.dataItem.valueX <= threshold.max)
            return am4core.color (threshold.color);
        }
      }

      return am4core.color (values.paletteColors[0]);
    });

    series.columns.template.events.on ("rightclick", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
      values.chartSecondaryObjectSelected = null;
    });
  }

  // Function to create pie chart series
  createPieSeries(values, stacked, chart, item, parseDate, theme): void
  {
    let series, colorSet;

    // Set inner radius for donut chart
    if (values.currentChartType.flags & ChartFlags.PIEHOLE)
      chart.innerRadius = am4core.percent (60);

    // Configure Pie Chart
    series = chart.series.push (new am4charts.PieSeries ());
    series.dataFields.value = item.valueField;
    series.dataFields.category = item.titleField;

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
    colorSet.list = values.paletteColors.map (function (color) {
      return am4core.color (color);
    });
    series.colors = colorSet;

    // Set thresholds
    series.slices.template.adapter.add ("fill", (fill, target) => {
      if (target.dataItem)
      {
        for (let threshold of values.thresholds)
        {
          if (target.dataItem.value >= threshold.min && target.dataItem.value <= threshold.max)
            return am4core.color (threshold.color);
        }
      }

      return fill;
    });

    series.slices.template.adapter.add ("stroke", (stroke, target) => {
      if (target.dataItem)
      {
        for (let threshold of values.thresholds)
        {
          if (target.dataItem.value >= threshold.min && target.dataItem.value <= threshold.max)
            return am4core.color (threshold.color);
        }
      }

      return stroke;
    });

    // Display a special context menu when a pie slice is right clicked
    series.slices.template.events.on ("rightclick", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
      values.chartSecondaryObjectSelected = null;
    });
  }

  // Function to create funnel chart series
  createFunnelSeries(values, stacked, chart, item, parseDate, theme): void
  {
    let series, colorSet;

    series = chart.series.push (new am4charts.FunnelSeries ());
    series.dataFields.value = item.valueField;
    series.dataFields.category = item.titleField;

    // Set chart apparence
    series.sliceLinks.template.fillOpacity = 0;
    series.labels.template.fill = Themes.AmCharts[theme].fontColor;
    series.ticks.template.strokeOpacity = 1;
    series.ticks.template.stroke = Themes.AmCharts[theme].ticks;
    series.ticks.template.strokeWidth = 1;
    series.alignLabels = true;

    // Set the color for the chart to display
    colorSet = new am4core.ColorSet ();
    colorSet.list = values.paletteColors.map (function (color) {
      return am4core.color (color);
    });
    series.colors = colorSet;

    // Set thresholds
    series.slices.template.adapter.add ("fill", (fill, target) => {
      if (target.dataItem)
      {
        for (let threshold of values.thresholds)
        {
          if (target.dataItem.value >= threshold.min && target.dataItem.value <= threshold.max)
            return am4core.color (threshold.color);
        }
      }

      return fill;
    });

    series.slices.template.adapter.add ("stroke", (stroke, target) => {
      if (target.dataItem)
      {
        for (let threshold of values.thresholds)
        {
          if (target.dataItem.value >= threshold.min && target.dataItem.value <= threshold.max)
            return am4core.color (threshold.color);
        }
      }

      return stroke;
    });

    // Display a special context menu when a funnel slice is right clicked
    series.slices.template.events.on ("rightclick", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
      values.chartSecondaryObjectSelected = null;
    });
  }

  makeChart(chartInfo): void
  {
    let theme = this.globals.theme;

    am4core.useTheme (Themes.AmCharts[theme].mainTheme);

    this.zone.runOutsideAngular (() => {
      let chart;

      // Check chart type before generating it
      if (this.values.currentChartType.flags & ChartFlags.HEATMAP)
      {
        let chartColor, polygonSeries, polygonTemplate, hoverState;
        let minRange, maxRange, heatLegend, pow, home, zoomControl;

        chart = am4core.create ("msf-dashboard-chart-display-" + this.values.id, am4maps.MapChart);
        chartColor = am4core.color (this.values.paletteColors[0]);
        chart.numberFormatter.numberFormat = "#,###.#";

        // Create map instance displaying the chosen geography data
        chart.geodata = this.values.geodata.value;
        chart.projection = new am4maps.projections.Miller ();

        // Add map polygons
        polygonSeries = chart.series.push (new am4maps.MapPolygonSeries ());
        polygonSeries.useGeodata = true;
        polygonSeries.mapPolygons.template.fill = chartColor;
        polygonSeries.mapPolygons.template.stroke = black;
        polygonSeries.mapPolygons.template.strokeOpacity = 0.25;
        polygonSeries.mapPolygons.template.strokeWidth = 0.5;
        polygonSeries.heatRules.push ({
          property: "fill",
          target: polygonSeries.mapPolygons.template,
          min: chartColor.brighten (0.5),
          max: chartColor.brighten (-0.5)
        });

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

        // Configure series tooltip
        polygonTemplate = polygonSeries.mapPolygons.template;
        polygonTemplate.tooltipText = "{name}: {value}";
        polygonTemplate.nonScalingStroke = true;
        polygonTemplate.strokeWidth = 0.5;
        hoverState = polygonTemplate.states.create ("hover");
        hoverState.properties.fill = chartColor;

        // Set the values for each polygon
        polygonSeries.data = [];

        for (let item of chart.geodata.features)
        {
          polygonSeries.data.push ({
            id: item.id,
            value: 0
          });
        }

        for (let result of chartInfo)
        {
          for (let item of polygonSeries.data)
          {
            let resultInfo = result[this.values.valueColumn.id];

            if (resultInfo == null)
              continue;

            if (item.id.includes (resultInfo))
            {
              item.value = result[this.values.variable.id];
              break;
            }
          }
        }

        // Display heat legend
        heatLegend = chart.chartContainer.createChild (am4maps.HeatLegend);
        heatLegend.valueAxis.renderer.labels.template.fill = Themes.AmCharts[theme].fontColor;
        heatLegend.series = polygonSeries;
        heatLegend.align = "right";
        heatLegend.valign = "bottom";
        heatLegend.width = am4core.percent (20);
        heatLegend.marginRight = am4core.percent (4);
        heatLegend.dx -= 10;

        // Set minimum and maximum value for the heat legend
        heatLegend.minValue = 0;
        heatLegend.maxValue = 10;

        // For the maximum value, get the highest value of the result and calculate
        // it by doing an division with the power of 10
        for (let item of polygonSeries.data)
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
      }
      else if (this.values.currentChartType.flags & ChartFlags.FUNNELCHART
        || this.values.currentChartType.flags & ChartFlags.PIECHART)
      {
        if (this.values.currentChartType.flags & ChartFlags.FUNNELCHART)
          chart = am4core.create ("msf-dashboard-chart-display-" + this.values.id, am4charts.SlicedChart);
        else
          chart = am4core.create ("msf-dashboard-chart-display-" + this.values.id, am4charts.PieChart);

        chart.data = chartInfo.dataProvider;
        chart.numberFormatter.numberFormat = "#,###.#";

        // Set label font size
        chart.fontSize = 10;

        // Create the series
        this.values.currentChartType.createSeries (this.values, false, chart, chartInfo, null, theme);

        if (this.values.currentChartType.flags & ChartFlags.FUNNELCHART)
        {
          // Sort values from greatest to least on funnel chart types
          chart.events.on ("beforedatavalidated", function (event) {
            chart.data.sort (function (e1, e2) {
              return e2[chartInfo.valueField] - e1[chartInfo.valueField];
            });
          });
        }
      }
      else
      {
        let categoryAxis, valueAxis, parseDate, stacked;

        chart = am4core.create ("msf-dashboard-chart-display-" + this.values.id, am4charts.XYChart);
        chart.numberFormatter.numberFormat = "#,###.#";

        // Don't parse dates if the chart is a simple version
        if (this.values.currentChartType.flags & ChartFlags.XYCHART)
        {
          chart.data = chartInfo.data;
          parseDate = this.values.xaxis.id.includes ('date');
        }
        else
        {
          chart.data = chartInfo.dataProvider;
          parseDate = false;
        }

        // Set chart axes depeding on the rotation
        if (this.values.currentChartType.flags & ChartFlags.ROTATED)
        {
          if (parseDate)
          {
            categoryAxis = chart.yAxes.push (new am4charts.DateAxis ());
            categoryAxis.dateFormats.setKey ("day", "MMM d");
            categoryAxis.periodChangeDateFormats.setKey ("day", "yyyy");
          }
          else
          {
            categoryAxis = chart.yAxes.push (new am4charts.CategoryAxis ());
            categoryAxis.renderer.minGridDistance = 15;
            categoryAxis.renderer.labels.template.maxWidth = 160;
          }

          valueAxis = chart.xAxes.push (new am4charts.ValueAxis ());

          // Add scrollbar into the chart for zooming if there are multiple series
          if (chart.data.length > 1)
          {
            chart.scrollbarY = new am4core.Scrollbar ();
            chart.scrollbarY.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
          }
        }
        else
        {
          if (parseDate)
          {
            categoryAxis = chart.xAxes.push (new am4charts.DateAxis ());
            categoryAxis.dateFormats.setKey ("day", "MMM d");
            categoryAxis.periodChangeDateFormats.setKey ("day", "yyyy");
          }
          else
          {
            categoryAxis = chart.xAxes.push (new am4charts.CategoryAxis ());
            categoryAxis.renderer.minGridDistance = 30;

            // Rotate labels if the chart is displayed vertically
            categoryAxis.renderer.labels.template.rotation = 330;
            categoryAxis.renderer.labels.template.maxWidth = 160;
          }

          valueAxis = chart.yAxes.push (new am4charts.ValueAxis ());

          if (chart.data.length > 1)
          {
            chart.scrollbarX = new am4core.Scrollbar ();
            chart.scrollbarX.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
          }
        }

        // Set category axis properties
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

        // Set value axis properties
        valueAxis.renderer.labels.template.fontSize = 10;
        valueAxis.renderer.labels.template.fill = Themes.AmCharts[theme].fontColor;
        valueAxis.renderer.grid.template.strokeOpacity = 1;
        valueAxis.renderer.grid.template.stroke = Themes.AmCharts[theme].stroke;
        valueAxis.renderer.grid.template.strokeWidth = 1;

        if (this.values.currentChartType.flags & ChartFlags.XYCHART)
        {
          // The category will be the x axis if the chart type has it
          categoryAxis.dataFields.category = this.values.xaxis.id;

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

          // Sort chart series from least to greatest by calculating the
          // average (normal) or total (stacked) value of each key item to
          // compensate for the lack of proper sorting by values
          if (stacked && !(this.values.currentChartType.flags & ChartFlags.LINECHART))
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
          else
          {
            for (let object of chartInfo.filter)
            {
              let average = 0;

              for (let data of chartInfo.data)
              {
                let value = data[object.valueField];

                if (value != null)
                  average += value;
              }

              object["avg"] = average / chartInfo.data.length;
            }

            // Also sort the data by date the to get the correct order on the line chart
            // if the category axis is a date type
            if (parseDate && this.values.currentChartType.flags & ChartFlags.LINECHART)
            {
              let axisField = this.values.xaxis.id;
  
              chart.events.on ("beforedatavalidated", function (event) {
                chart.data.sort (function (e1, e2) {
                  return +(new Date(e1[axisField])) - +(new Date(e2[axisField]));
                });
              });
            }

            chartInfo.filter.sort (function (e1, e2) {
              return e1.avg - e2.avg;
            });
          }

          // Create the series and set colors
          chart.colors.list = [];

          for (let color of this.values.paletteColors)
            chart.colors.list.push (am4core.color (color));

          for (let object of chartInfo.filter)
            this.values.currentChartType.createSeries (this.values, stacked, chart, object, parseDate, theme);

          // Add cursor if the chart type is line, area or stacked area
          if (this.values.currentChartType.flags & ChartFlags.LINECHART)
          {
            chart.cursor = new am4charts.XYCursor ();
            chart.cursor.xAxis = valueAxis;
            chart.cursor.snapToSeries = chart.series;
          }
        }
        else
        {
          // The category will the values if the chart type lacks an x axis
          categoryAxis.dataFields.category = chartInfo.titleField;

          // Sort values from least to greatest
          chart.events.on ("beforedatavalidated", function (event) {
            chart.data.sort (function (e1, e2) {
              return e1[chartInfo.valueField] - e2[chartInfo.valueField];
            });
          });

          // Create the series
          this.values.currentChartType.createSeries (this.values, false, chart, chartInfo, parseDate, theme);
        }
      }

      if (this.values.currentChartType.flags & ChartFlags.XYCHART)
      {
        // Display Legend
        chart.legend = new am4charts.Legend ();
        chart.legend.markers.template.width = 15;
        chart.legend.markers.template.height = 15;
        chart.legend.labels.template.fontSize = 10;
        chart.legend.labels.template.fill = Themes.AmCharts[theme].fontColor;
      }

      // Add export button
      chart.exporting.menu = new am4core.ExportMenu ();
      chart.exporting.menu.verticalAlign = "top";
      if (this.values.currentChartType.flags & ChartFlags.HEATMAP
        || this.values.currentChartType.flags & ChartFlags.MAP)
        chart.exporting.menu.align = "right";
      else
        chart.exporting.menu.align = "left";

      this.chart = chart;
    });
  }

  destroyChart(): void
  {
    if (this.chart)
    {
      this.zone.runOutsideAngular (() => {
        this.imageSeries = null;
        this.lineSeries = null;
        this.shadowLineSeries = null;
        this.chart.dispose ();
      });
    }
  }

  ngAfterViewInit(): void
  {
    this.msfTableRef.tableOptions = this;

    if ((this.values.currentChartType.flags & ChartFlags.TABLE)
      || (this.values.currentChartType.flags & ChartFlags.MAPBOX))
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
  }

  ngAfterContentInit(): void
  {
    // these parts must be here because it generate an error if inserted on ngAfterViewInit
    this.initPanelSettings ();

    if ((this.values.currentChartType.flags & ChartFlags.TABLE)
      || (this.values.currentChartType.flags & ChartFlags.MAPBOX))
    {
      if (this.values.function == 1)
      {
        setTimeout (() =>
        {
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
          if (this.values.currentChartType.flags & ChartFlags.PICTURE)
            this.values.displayPic = true;
          else if (this.values.currentChartType.flags & ChartFlags.FORM)
            this.values.displayForm = true;
          else
            this.values.displayInfo = true;
        }
      }
      else
        this.values.displayChart = true;

      this.startUpdateInterval ();
    }
  }

  private filterVariables(filterCtrl): void
  {
    if (!this.values.chartColumnOptions)
      return;

    // get the search keyword
    let search = filterCtrl.value;
    if (!search)
    {
      this.filteredVariables.next (this.values.chartColumnOptions.slice ());
      return;
    }

    search = search.toLowerCase ();
    this.filteredVariables.next (
      this.values.chartColumnOptions.filter (a => a.name.toLowerCase ().indexOf (search) > -1)
    );
  }

  private filterOptions(filterCtrl): void
  {
    if (!this.values.options)
      return;

    // get the search keyword
    let search = filterCtrl.value;
    if (!search)
    {
      this.filteredOptions.next (this.values.options.slice ());
      return;
    }

    search = search.toLowerCase ();
    this.filteredOptions.next (
      this.values.options.filter (a => a.nameSearch.toLowerCase ().indexOf (search) > -1)
    );
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
      if (this.values.currentChartType.flags & ChartFlags.TABLE)
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
        else if (!(this.values.currentChartType.flags & ChartFlags.PICTURE))
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

        if (this.values.valueColumn.item.grouping && !this.checkGroupingValue (this.values.valueColumn.item.columnName, argument.value1))
          return false;
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
    let currentOptionCategories = this.values.currentOptionCategories;
    let params;

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

            if (params)
            {
              if (argument.type != "singleCheckbox" && argument.type != "serviceClasses" && argument.type != "fareLower" && argument.type != "airportsRoutes" && argument.name1 != "intermediateCitiesList")
                params += "&" + this.utils.getArguments (argument);
              else if (argument.value1 != false && argument.value1 != "" && argument.value1 != undefined && argument.value1 != null)
                params += "&" + this.utils.getArguments (argument);
            }
            else
              params = this.utils.getArguments (argument);
          }
        }        
      }
    }

    return params;
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
        chartType: this.chartTypes.indexOf (this.values.currentChartType),
        categoryOptions: this.values.currentOptionCategories ? JSON.stringify (this.values.currentOptionCategories) : null,
        function: this.geodatas.indexOf (this.values.geodata),
        updateTimeInterval: (this.values.updateIntervalSwitch ? this.values.updateTimeLeft : 0),
        analysis: this.values.chartColumnOptions ? this.values.chartColumnOptions.indexOf (this.values.variable) : null,
        values: this.values.chartColumnOptions ? this.values.chartColumnOptions.indexOf (this.values.valueColumn) : null,
        paletteColors: JSON.stringify (this.values.paletteColors),
        lastestResponse: JSON.stringify (this.values.lastestResponse),
        thresholds: JSON.stringify (this.values.thresholds)
      };
    }
    else if (this.values.currentChartType.flags & ChartFlags.MAPBOX)
    {
      return {
        id: this.values.id,
        option: this.values.currentOption,
        title: this.values.chartName,
        chartType: this.chartTypes.indexOf (this.values.currentChartType),
        categoryOptions: this.values.currentOptionCategories ? JSON.stringify (this.values.currentOptionCategories) : null,
        updateTimeInterval: (this.values.updateIntervalSwitch ? this.values.updateTimeLeft : 0),
        function: 1,
        lastestResponse: JSON.stringify (this.values.lastestResponse),
        analysis: this.msfMapRef.mapTypes.indexOf (this.values.style)
      };
    }
    else if (this.values.currentChartType.flags & ChartFlags.FORM
      || this.values.currentChartType.flags & ChartFlags.PICTURE
      || this.values.currentChartType.flags & ChartFlags.TABLE
      || this.values.currentChartType.flags & ChartFlags.MAP)
    {
      return {
        id: this.values.id,
        option: this.values.currentOption,
        title: this.values.chartName,
        chartType: this.chartTypes.indexOf (this.values.currentChartType),
        categoryOptions: this.values.currentOptionCategories ? JSON.stringify (this.values.currentOptionCategories) : null,
        updateTimeInterval: (this.values.updateIntervalSwitch ? this.values.updateTimeLeft : 0),
        function: 1,
        lastestResponse: JSON.stringify (this.values.lastestResponse)
      };
    }
    else if (this.values.currentChartType.flags & ChartFlags.INFO)
    {
      return {
        id: this.values.id,
        option: this.values.currentOption,
        title: this.values.chartName,
        analysis: this.values.chartColumnOptions ? this.values.chartColumnOptions.indexOf (this.values.infoVar1) : null,
        xaxis: this.values.chartColumnOptions ? this.values.chartColumnOptions.indexOf (this.values.infoVar2) : null,
        values: this.values.chartColumnOptions ? this.values.chartColumnOptions.indexOf (this.values.infoVar3) : null,
        function: 1,
        chartType: this.chartTypes.indexOf (this.values.currentChartType),
        categoryOptions: this.values.currentOptionCategories ? JSON.stringify (this.values.currentOptionCategories) : null,
        updateTimeInterval: (this.values.updateIntervalSwitch ? this.values.updateTimeLeft : 0)
      };
    }
    else
    {
      return {
        id: this.values.id,
        option: this.values.currentOption,
        title: this.values.chartName,
        analysis: this.values.chartColumnOptions ? this.values.chartColumnOptions.indexOf (this.values.variable) : null,
        xaxis: this.values.chartColumnOptions ? this.values.chartColumnOptions.indexOf (this.values.xaxis) : null,
        values: this.values.chartColumnOptions ? this.values.chartColumnOptions.indexOf (this.values.valueColumn) : null,
        function: this.functions.indexOf (this.values.function),
        chartType: this.chartTypes.indexOf (this.values.currentChartType),
        categoryOptions: this.values.currentOptionCategories ? JSON.stringify (this.values.currentOptionCategories) : null,
        paletteColors: JSON.stringify (this.values.paletteColors),
        updateTimeInterval: (this.values.updateIntervalSwitch ? this.values.updateTimeLeft : 0),
        thresholds: JSON.stringify (this.values.thresholds)
      };
    }
  }

  loadTextSummary(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg, panel, variables;

    this.values.isLoading = true;
    urlBase = this.values.currentOption.baseUrl + "?" + this.getParameters ();
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999&page_number=0";
    console.log (urlBase);
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

    // set panel info for the HTTP message body
    panel = this.getPanelInfo ();
    panel.paletteColors = JSON.stringify (variables); // store the variables into the paletteColors for temporary use

    url = this.service.host + "/secure/getTextSummaryResponse?url=" + urlArg + "&ipAddress=" + this.authService.getIpAddress ();

    this.authService.post (this, url, panel, handlerSuccess, handlerError);
  }

  loadChartData(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg, panel;

    // set panel info for the HTTP message body
    panel = this.getPanelInfo ();
    this.values.isLoading = true;
    urlBase = this.values.currentOption.baseUrl + "?" + this.getParameters ();
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999&page_number=0";
    console.log (urlBase);
    urlArg = encodeURIComponent (urlBase);
    url = this.service.host + "/secure/getChartData?url=" + urlArg + "&optionId=" + this.values.currentOption.id + "&ipAddress=" + this.authService.getIpAddress () +
      "&variable=" + this.values.variable.id + "&valueColumn=" + this.values.valueColumn.id + "&function=" + this.values.function.id;

    // don't use the xaxis parameter if the chart type is pie, donut or radar
    if (!(this.values.currentChartType.flags & ChartFlags.XYCHART))
      url += "&chartType=pie";
    else
      url += "&xaxis=" + this.values.xaxis.id;

    this.authService.post (this, url, panel, handlerSuccess, handlerError);
  }

  loadMapData(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg;

    this.values.isLoading = true;
    urlBase = this.values.currentOption.baseUrl + "?" + this.getParameters ();
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=100&page_number=0";
    console.log (urlBase);
    urlArg = encodeURIComponent (urlBase);
    url = this.service.host + "/secure/consumeWebServices?url=" + urlArg + "&optionId=" + this.values.currentOption.id + "&ipAddress=" + this.authService.getIpAddress ();

    this.authService.get (this, url, handlerSuccess, handlerError);
  }

  loadMapboxData(handlerSuccess, handlerError): void
  {
    let params, url;

    this.values.isLoading = true;
    this.values.displayMapbox = true;
    this.msfMapRef.data = [];
    this.msfMapRef.coordinates = [];
 
    params = this.getParameters ();
    url = this.globals.baseUrl2 + "/getMapBoxTracking?" + params;
    console.log (url);
    this.http.get (this.msfMapRef, url, handlerSuccess, handlerError, null);
  }

  loadFormData(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg;

    this.values.isLoading = true;
    urlBase = this.values.currentOption.baseUrl + "?" + this.getParameters ();
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=1&page_number=0";
    console.log (urlBase);
    urlArg = encodeURIComponent (urlBase);
    url = this.service.host + "/secure/consumeWebServices?url=" + urlArg + "&optionId=" + this.values.currentOption.id + "&ipAddress=" + this.authService.getIpAddress ();

    this.authService.get (this, url, handlerSuccess, handlerError);
  }

  loadPicData(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg;

    // TODO: Use a service that gets a url which contains a picture
    this.values.isLoading = true;
    urlBase = this.values.currentOption.baseUrl + "?" + this.getParameters ();
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=1&page_number=0";
    urlArg = encodeURIComponent (urlBase);
    url = this.service.host + "/secure/consumeWebServices?url=" + urlArg + "&optionId=" + this.values.currentOption.id + "&ipAddress=" + this.authService.getIpAddress ();

    this.authService.get (this, url, handlerSuccess, handlerError);
  }

  loadTableData(moreResults, handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg;

    this.msfTableRef.displayedColumns = [];
  
    if (moreResults)
    {
      this.actualPageNumber++;
      this.moreResults = true;
    }
    else
      this.actualPageNumber = 0;

    if (!this.actualPageNumber)
      this.msfTableRef.dataSource = null;

    this.values.isLoading = true;
    urlBase = this.values.currentOption.baseUrl + "?" + this.getParameters ();
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&&pageSize=100&page_number=" + this.actualPageNumber;
    console.log (urlBase);
    urlArg = encodeURIComponent (urlBase);
    url = this.service.host + "/secure/consumeWebServices?url=" + urlArg + "&optionId=" + this.values.currentOption.id + "&ipAddress=" + this.authService.getIpAddress ();

    for (let tableVariable of this.values.tableVariables)
    {
      if (tableVariable.checked)
        url += "&metaDataIds=" + tableVariable.itemId;
    }

    this.authService.get (this.msfTableRef, url, handlerSuccess, handlerError);
  }

  loadData(): void
  {
    this.globals.startTimestamp = new Date ();

    // check if any variable that requires grouping are in configure properly
    if (!this.checkPanelVariables ())
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "Some variables used to get the results must be added in the grouping inside the control variables." }
      });

      return;
    }

    if (this.values.currentChartType.flags & ChartFlags.MAPBOX)
      this.loadMapboxData (this.msfMapRef.successHandler, this.msfMapRef.errorHandler);
    else if (this.values.currentChartType.flags & ChartFlags.HEATMAP)
      this.loadMapData (this.handlerHeatMapSuccess, this.handlerHeatMapError);
    else if (this.values.currentChartType.flags & ChartFlags.MAP)
      this.loadMapData (this.handlerMapSuccess, this.handlerMapError);
    else if (this.values.currentChartType.flags & ChartFlags.TABLE)
      this.loadTableData (false, this.msfTableRef.handlerSuccess, this.msfTableRef.handlerError);
    else if (this.values.currentChartType.flags & ChartFlags.PICTURE)
      this.loadPicData (this.handlerPicSuccess, this.handlerPicError);
    else if (this.values.currentChartType.flags & ChartFlags.FORM)
      this.loadFormData (this.handlerFormSuccess, this.handlerFormError);
    else if (this.values.currentChartType.flags & ChartFlags.INFO)
      this.loadTextSummary (this.handlerTextSuccess, this.handlerTextError);
    else
      this.loadChartData (this.handlerChartSuccess, this.handlerChartError);
  }

  ngOnDestroy()
  {
    this._onDestroy.next ();
    this._onDestroy.complete ();

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
    this.values.isLoading = false;

    if (this.values.currentChartType.flags & ChartFlags.MAP)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "No data available for the map." }
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
        data: { title: "Error", message: "No picture available." }
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
      this.values.isLoading = false;
      this.handlerMapboxError (this, "Failed to generate the results for the map tracker.");
    }
    else
    {
      this.values.lastestResponse = 1;
      this.service.saveLastestResponse (this, this.getPanelInfo (), this.handlerMapboxLastestResponse, this.handlerMapboxError);
    }
  }

  handlerHeatMapSuccess(_this, data): void
  {
    let response, result;

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
    _this.values.flightRoutes = JSON.parse (JSON.stringify (_this.values.lastestResponse));

    _this.service.saveLastestResponse (_this, _this.getPanelInfo (), _this.handlerMapLastestResponse, _this.handlerMapError);
  }

  handlerPicSuccess(_this, data): void
  {
    if (data == null)
    {
      _this.noDataFound ();
      return;
    }

    // destroy current chart if it's already generated to avoid a blank chart later
    _this.destroyChart ();

    _this.values.isLoading = false;
    _this.values.displayPic = true;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = true;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;

    _this.stopUpdateInterval ();
    _this.startUpdateInterval ();
  }

  handlerFormSuccess(_this, data): void
  {
    let formResults, response, result;

    formResults = [];

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
          result = array[0];
          break;
        }
      }
    }

    for (let formVariable of _this.values.formVariables)
    {
      let value = result[formVariable.column.id];

      formResults.push ({
        value: (isNaN (value) ? value : _this.getResultValue (value)),
        column: _this.values.chartColumnOptions.indexOf (formVariable.column),
        fontSize: _this.fontSizes.indexOf (formVariable.fontSize),
        valueFontSize: _this.fontSizes.indexOf (formVariable.valueFontSize),
        valueOrientation: _this.orientations.indexOf (formVariable.valueOrientation)
      });
    }

    _this.values.lastestResponse = formResults;

    // save the panel into the database
    _this.service.saveLastestResponse (_this, _this.getPanelInfo (), _this.handlerFormLastestResponse, _this.handlerFormError);
  }

  handlerFormLastestResponse(_this): void
  {
    let data = JSON.parse (JSON.stringify (_this.values.lastestResponse));

    _this.values.lastestResponse = [];

    for (let formVariable of data)
    {
      _this.values.lastestResponse.push ({
        value: formVariable.value,
        column: _this.values.chartColumnOptions[formVariable.column],
        fontSize: _this.fontSizes[formVariable.fontSize],
        valueFontSize: _this.fontSizes[formVariable.valueFontSize],
        valueOrientation: _this.orientations[formVariable.valueOrientation]
      });
    }

    // destroy current chart if it's already generated to avoid a blank chart later
    _this.destroyChart ();

    _this.values.isLoading = false;
    _this.values.displayForm = true;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = true;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;

    _this.stopUpdateInterval ();
    _this.startUpdateInterval ();
  }

  handlerTableLastestResponse(_this): void
  {
    _this.values.isLoading = false;

    // destroy current chart if it's already generated to avoid a blank chart later
    _this.destroyChart ();

    _this.values.displayTable = true;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = true;
    _this.values.mapboxGenerated = false;

    _this.stopUpdateInterval ();
    _this.startUpdateInterval ();
  }

  handlerMapboxLastestResponse(_this): void
  {
    _this.values.isLoading = false;

    _this.destroyChart ();

    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = true;

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
    _this.destroyChart ();

    _this.values.displayChart = true;
    _this.values.chartGenerated = true;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;

    setTimeout (() =>
    {
      _this.values.isLoading = false;

      _this.makeChart (_this.values.lastestResponse);
  
      _this.stopUpdateInterval ();
      _this.startUpdateInterval ();
    }, 50);
  }

  handlerMapLastestResponse(_this): void
  {
    // destroy current chart if it's already generated to avoid a blank chart
    _this.destroyChart ();

    _this.values.displayChart = true;
    _this.values.chartGenerated = true;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;

    setTimeout (() =>
    {
      _this.values.isLoading = false;

      _this.makeChart (_this.values.lastestResponse);
  
      _this.stopUpdateInterval ();
      _this.startUpdateInterval ();
    }, 50);
  }

  handlerTextSuccess(_this, data): void
  {
    if (!_this.haveDataInfo (data))
    {
      _this.noDataFound ();
      return;
    }

    _this.values.lastestResponse = data;

    // destroy current chart if it's already generated to avoid a blank chart later
    _this.destroyChart ();

    _this.values.displayInfo = true;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = true;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.isLoading = false;

    _this.stopUpdateInterval ();
    _this.startUpdateInterval ();
  }

  handlerChartSuccess(_this, data): void
  {
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

    _this.values.displayChart = true;
    _this.values.chartGenerated = true;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;

    setTimeout (() =>
    {
      _this.values.isLoading = false;

      _this.makeChart (data);
  
      _this.stopUpdateInterval ();
      _this.startUpdateInterval ();
    }, 50);
  }

  loadChartFilterValues(component): void
  {
    this.values.chartColumnOptions = [];
    this.values.tableVariables = [];

    for (let columnConfig of component.columnOptions)
    {
      this.values.chartColumnOptions.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel, item: columnConfig } );
      this.values.tableVariables.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel, itemId: columnConfig.id, grouping: columnConfig.grouping, checked: true } );
    }

    // load the initial filter variables list
    this.filteredVariables.next (this.values.chartColumnOptions.slice ());

    this.searchChange (this.variableFilterCtrl);
    this.searchChange (this.xaxisFilterCtrl);
    this.searchChange (this.valueFilterCtrl);

    this.searchChange (this.infoVar1FilterCtrl);
    this.searchChange (this.infoVar2FilterCtrl);
    this.searchChange (this.infoVar3FilterCtrl);

    this.searchChange (this.columnFilterCtrl);

    // reset chart filter values and disable generate chart button
    this.chartForm.get ('variableCtrl').reset ();
    this.chartForm.get ('xaxisCtrl').reset ();
    this.chartForm.get ('valueCtrl').reset ();
    this.chartForm.get ('columnCtrl').reset ();
    this.chartForm.get ('geodataValueCtrl').reset ();
    this.chartForm.get ('geodataKeyCtrl').reset ();
    this.chartForm.get ('fontSizeCtrl').setValue (this.fontSizes[1]);
    this.chartForm.get ('valueFontSizeCtrl').setValue (this.fontSizes[1]);
    this.chartForm.get ('valueOrientationCtrl').setValue (this.orientations[0]);
    this.checkChartFilters ();

    this.values.formVariables = [];
    this.variableCtrlBtnEnabled = true;

    this.chartForm.get ('variableCtrl').enable ();
    this.chartForm.get ('infoNumVarCtrl').enable ();

    if (this.values.currentChartType.flags & ChartFlags.XYCHART)
      this.chartForm.get ('xaxisCtrl').enable ();

    this.chartForm.get ('valueCtrl').enable ();
    this.chartForm.get ('columnCtrl').enable ();
    this.chartForm.get ('fontSizeCtrl').enable ();
    this.chartForm.get ('valueFontSizeCtrl').enable ();
    this.chartForm.get ('valueOrientationCtrl').enable ();
    this.chartForm.get ('geodataValueCtrl').enable ();
    this.chartForm.get ('geodataKeyCtrl').enable ();

    this.values.currentOptionCategories = null;
  }

  handlerChartError(_this, result): void
  {
    console.log (result);
    _this.values.lastestResponse = null;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.isLoading = false;

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to generate chart." }
    });
  }

  handlerTextError(_this, result): void
  {
    console.log (result);
    _this.values.lastestResponse = null;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.isLoading = false;

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to get summary." }
    });
  }

  handlerFormError(_this, result): void
  {
    console.log (result);
    _this.values.lastestResponse = null;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.isLoading = false;

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to generate simple form panel." }
    });
  }

  handlerPicError(_this, result): void
  {
    console.log (result);
    _this.values.lastestResponse = null;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.isLoading = false;

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to generate picture panel." }
    });
  }

  handlerTableError(_this, result): void
  {
    _this.values.isLoading = false;

    if (result != null)
      console.log (result);

    _this.values.lastestResponse = null;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to generate table panel." }
    });
  }

  handlerMapboxError(_this, result): void
  {
    console.log (result);
    _this.values.lastestResponse = null;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.isLoading = false;

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to generate map tracker." }
    });
  }

  handlerHeatMapError(_this, result): void
  {
    console.log (result);
    _this.values.lastestResponse = null;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.isLoading = false;

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to generate heat map." }
    });
  }

  handlerMapError(_this, result): void
  {
    console.log (result);
    _this.values.lastestResponse = null;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.isLoading = false;

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to generate map." }
    });
  }

  handlerError(_this, result): void
  {
    console.log (result);
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

    // load the initial filter variables list
    _this.filteredVariables.next (_this.values.chartColumnOptions.slice ());

    _this.searchChange (_this.variableFilterCtrl);
    _this.searchChange (_this.xaxisFilterCtrl);
    _this.searchChange (_this.valueFilterCtrl);

    _this.searchChange (_this.infoVar1FilterCtrl);
    _this.searchChange (_this.infoVar2FilterCtrl);
    _this.searchChange (_this.infoVar3FilterCtrl);

    _this.searchChange (_this.columnFilterCtrl);

    // reset chart filter values and disable generate chart button
    _this.chartForm.get ('variableCtrl').reset ();
    _this.chartForm.get ('xaxisCtrl').reset ();
    _this.chartForm.get ('valueCtrl').reset ();
    _this.chartForm.get ('columnCtrl').reset ();
    _this.chartForm.get ('geodataValueCtrl').reset ();
    _this.chartForm.get ('geodataKeyCtrl').reset ();
    _this.chartForm.get ('fontSizeCtrl').setValue (_this.fontSizes[1]);
    _this.chartForm.get ('valueFontSizeCtrl').setValue (_this.fontSizes[1]);
    _this.chartForm.get ('valueOrientationCtrl').setValue (_this.orientations[0]);
    _this.checkChartFilters ();

    _this.values.formVariables = [];
    _this.variableCtrlBtnEnabled = true;

    _this.chartForm.get ('variableCtrl').enable ();
    _this.chartForm.get ('infoNumVarCtrl').enable ();

    if (_this.values.currentChartType.flags & ChartFlags.XYCHART)
      _this.chartForm.get ('xaxisCtrl').enable ();

    _this.chartForm.get ('valueCtrl').enable ();
    _this.chartForm.get ('columnCtrl').enable ();
    _this.chartForm.get ('fontSizeCtrl').enable ();
    _this.chartForm.get ('valueFontSizeCtrl').enable ();
    _this.chartForm.get ('valueOrientationCtrl').enable ();
    _this.chartForm.get ('geodataValueCtrl').enable ();
    _this.chartForm.get ('geodataKeyCtrl').enable ();

    _this.values.isLoading = false;
    _this.values.currentOptionCategories = null;
  }

  setCategories(_this, data): void
  {
    let optionCategories = [];

    data = data.sort ((a, b) => a["position"] > b["position"] ? 1 : a["position"] === b["position"] ? 0 : -1);

    for (let optionCategory of data)
    {
      for (let category of optionCategory.categoryArgumentsId)
        optionCategories.push (category);
    }

    // if the category is not empty, add the categories that are missing
    if (_this.values.currentOptionCategories != null)
    {
      for (let optionCategory of optionCategories)
      {
        for (let curOptionCategory of _this.values.currentOptionCategories)
        {
          if (curOptionCategory.id == optionCategory.id)
          {
            for (let curCategoryArgument of curOptionCategory.arguments)
            {
              for (let argument of optionCategory.arguments)
              {
                if (curCategoryArgument.id == argument.id)
                {
                  argument.value1 = curCategoryArgument.value1;
                  argument.value2 = curCategoryArgument.value2;
                  argument.value3 = curCategoryArgument.value3;
                  break;
                }
              }
            }

            break;
          }
        }
      }
    }

    _this.values.currentOptionCategories = optionCategories;

    // workaround to prevent errors on certain data forms
    if (!_this.haveSortingCheckboxes ())
      _this.globals.isLoading = false;

    // console.log (_this.values.currentOptionCategories);

    _this.dialog.open (MsfDashboardControlVariablesComponent, {
      height: '605px',
      width: '400px',
      panelClass: 'msf-dashboard-control-variables-dialog',
      data: {
        currentOptionCategories: _this.values.currentOptionCategories,
        currentOptionId: _this.values.currentOption.id,
        title: _this.values.chartName
      }
    });
  }

  searchChange(filterCtrl): void
  {
    // listen for search field value changes
    filterCtrl.valueChanges
      .pipe (takeUntil (this._onDestroy))
      .subscribe (() => {
        this.filterVariables (filterCtrl);
      });
  }

  optionSearchChange(filterCtrl): void
  {
    // load the initial option list
    this.filteredOptions.next (this.values.options.slice ());
    // listen for search field value changes
    filterCtrl.valueChanges
      .pipe (takeUntil (this._onDestroy))
      .subscribe (() => {
        this.filterOptions (filterCtrl);
      });
  }

  haveSortingCheckboxes(): boolean
  {
    let currentOptionCategories = this.values.currentOptionCategories;
    let result = false;

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
            if (ComponentType.sortingCheckboxes == argument.type)
            {
              result = true;
              break;
            }
          }
        }

        if (result)
          break;
      }
    }

    return result;
  }

  goToControlVariables(): void
  {
    this.globals.isLoading = true;

    // load the category arguments before opening the dialog
    this.service.loadOptionCategoryArguments (this, this.values.currentOption,
      this.setCategories, this.handlerError);
  }

  // save chart data into a temporary value
  storeChartValues(): void
  {
    if (!this.temp)
    {
      this.temp = new MsfDashboardPanelValues (this.values.options, this.values.chartName,
        this.values.id, this.values.width, this.values.height);
    }
    else
      this.temp.chartName = this.values.chartName;

    this.temp.currentOption = JSON.parse (JSON.stringify (this.values.currentOption));
    this.temp.variable = this.values.chartColumnOptions.indexOf (this.values.variable);
    this.temp.xaxis = this.values.chartColumnOptions.indexOf (this.values.xaxis);
    this.temp.valueColumn = this.values.chartColumnOptions.indexOf (this.values.valueColumn);
    this.temp.function = this.functions.indexOf (this.values.function);
    this.temp.geodata = this.geodatas.indexOf (this.values.geodata);
    this.temp.currentChartType = JSON.parse (JSON.stringify (this.values.currentChartType));
    this.temp.chartColumnOptions = JSON.parse (JSON.stringify (this.values.chartColumnOptions));
    this.temp.currentOptionCategories = JSON.parse (JSON.stringify (this.values.currentOptionCategories));
    this.temp.thresholds = JSON.parse (JSON.stringify (this.values.thresholds));
    this.temp.style = JSON.parse (JSON.stringify (this.values.style));

    this.temp.formVariables = [];
    this.temp.tableVariables = JSON.parse (JSON.stringify (this.values.tableVariables));

    if (this.values.currentChartType.flags & ChartFlags.FORM)
    {
      this.temp.infoVar1 = null;
      this.temp.infoVar2 = null;
      this.temp.infoVar3 = null;

      for (let i = 0; i < this.values.formVariables.length; i++)
      {
        let formVariable = this.values.formVariables[i];

        this.temp.formVariables.push ({
          value: this.values.lastestResponse[i].value,
          column: this.values.chartColumnOptions.indexOf (formVariable.column),
          fontSize: this.fontSizes.indexOf (formVariable.fontSize),
          valueFontSize: this.fontSizes.indexOf (formVariable.valueFontSize),
          valueOrientation: this.orientations.indexOf (formVariable.valueOrientation)
        });
      }
    }
    else if (this.values.currentChartType.flags & ChartFlags.INFO
      && !(this.values.currentChartType.flags & ChartFlags.PICTURE))
    {
      if (this.values.infoVar1 != null)
        this.temp.infoVar1 = this.values.infoVar1;

      if (this.values.infoVar2 != null)
        this.temp.infoVar2 = this.values.infoVar2;

      if (this.values.infoVar3 != null)
        this.temp.infoVar3 = this.values.infoVar3;
    }
    else
    {
      this.temp.infoVar1 = null;
      this.temp.infoVar2 = null;
      this.temp.infoVar3 = null;
    }

    this.temp.updateIntervalSwitch = this.values.updateIntervalSwitch;
    this.temp.updateTimeLeft = this.values.updateTimeLeft;

    this.stopUpdateInterval ();

    if (this.mapboxInterval)
    {
      clearInterval (this.mapboxInterval);
      this.mapboxInterval = null;
    }
  }

  goToChartConfiguration(): void
  {
    this.values.displayChart = false;
    this.storeChartValues ();
  }

  goToInfoConfiguration(): void
  {
    this.values.displayInfo = false;
    this.storeChartValues ();
  }

  goToFormConfiguration(): void
  {
    this.values.displayForm = false;
    this.storeChartValues ();
  }

  goToPicConfiguration(): void
  {
    this.values.displayPic = false;
    this.storeChartValues ();
  }

  goToTableConfiguration(): void
  {
    this.values.displayTable = false;
    this.storeChartValues ();
  }

  goToMapboxConfiguration(): void
  {
    this.values.displayMapbox = false;
    this.storeChartValues ();
  }

  goToChart(): void
  {
    let i, item;

    if (this.values.picGenerated)
      this.values.displayPic = true;
    else if (this.values.formGenerated)
      this.values.displayForm = true;
    else if (this.values.infoGenerated)
      this.values.displayInfo = true;
    else if (this.values.tableGenerated)
      this.values.displayTable = true;
    else if (this.values.mapboxGenerated)
      this.values.displayMapbox = true;
    else
      this.values.displayChart = true;

    // discard any changes
    this.values.currentOption = JSON.parse (JSON.stringify (this.temp.currentOption));
    this.values.chartName = this.temp.chartName;
    this.values.variable = this.temp.variable;
    this.values.xaxis = this.temp.xaxis;
    this.values.valueColumn = this.temp.valueColumn;
    this.values.function = this.temp.function;
    this.values.geodata = this.temp.geodata;
    this.values.chartColumnOptions = JSON.parse (JSON.stringify (this.temp.chartColumnOptions));
    this.values.currentOptionCategories = JSON.parse (JSON.stringify (this.temp.currentOptionCategories));
    this.values.thresholds = JSON.parse (JSON.stringify (this.temp.thresholds));
    this.values.style = JSON.parse (JSON.stringify (this.temp.style));

    for (i = 0; i < this.chartTypes.length; i++)
    {
      item = this.chartTypes[i];

      if (item.name === this.temp.currentChartType.name)
      {
        this.values.currentChartType = item;
        break;
      }
    }

    if (this.values.currentChartType.flags & ChartFlags.INFO
      && !(this.values.currentChartType.flags & ChartFlags.FORM)
      && !(this.values.currentChartType.flags & ChartFlags.PICTURE)
      && this.values.chartColumnOptions != null)
    {
      if (this.temp.infoVar1 != null)
      {
        for (i = 0; i < this.values.chartColumnOptions.length; i++)
        {
          item = this.values.chartColumnOptions[i];

          if (this.temp.infoVar1.id === item.id)
          {
            this.values.variable = this.values.chartColumnOptions.indexOf (item);
            break;
          }
        }
      }

      if (this.temp.infoVar2 != null)
      {
        for (i = 0; i < this.values.chartColumnOptions.length; i++)
        {
          item = this.values.chartColumnOptions[i];

          if (this.temp.infoVar2.id === item.id)
          {
            this.values.xaxis = this.values.chartColumnOptions.indexOf (item);
            break;
          }
        }
      }

      if (this.temp.infoVar3 != null)
      {
        for (i = 0; i < this.values.chartColumnOptions.length; i++)
        {
          item = this.values.chartColumnOptions[i];

          if (this.temp.infoVar3.id === item.id)
          {
            this.values.valueColumn = this.values.chartColumnOptions.indexOf (item);
            break;
          }
        }
      }
    }

    this.values.formVariables = JSON.parse (JSON.stringify (this.temp.formVariables));
    this.values.tableVariables = JSON.parse (JSON.stringify (this.temp.tableVariables));

    this.values.updateIntervalSwitch = this.temp.updateIntervalSwitch;
    this.values.updateTimeLeft = this.temp.updateTimeLeft;

    // re-initialize panel settings
    this.values.currentChartType = this.chartTypes.indexOf (this.values.currentChartType);
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
  }

  // check if the x axis should be enabled or not depending of the chart type
  checkChartType(): void
  {
    if (this.values.currentChartType.flags & ChartFlags.INFO)
    {
      // disable and reset unused variables
      this.values.variable = null;
      this.chartForm.get ('variableCtrl').reset ();
      this.chartForm.get ('geodataValueCtrl').reset ();

      this.values.xaxis = null;
      this.chartForm.get ('xaxisCtrl').reset ();

      this.values.valueColumn = null;
      this.chartForm.get ('valueCtrl').reset ();
      this.chartForm.get ('geodataKeyCtrl').reset ();

      if (!(this.values.currentChartType.flags & ChartFlags.FORM))
      {
        this.chartForm.get ('columnCtrl').reset ();
        this.chartForm.get ('fontSizeCtrl').setValue (this.fontSizes[1]);
        this.chartForm.get ('valueFontSizeCtrl').setValue (this.fontSizes[1]);
        this.chartForm.get ('valueOrientationCtrl').setValue (this.orientations[0]);

        this.values.formVariables = [];
      }
    }
    else
    {
      let i;

      this.values.infoNumVariables = 0;
      this.chartForm.get ('infoNumVarCtrl').setValue (0);

      if (this.values.currentChartType.flags & ChartFlags.TABLE
        || this.values.currentChartType.flags & ChartFlags.MAP
        || this.values.currentChartType.flags & ChartFlags.HEATMAP)
      {
        if (this.values.currentChartType.flags & ChartFlags.MAP)
        {
          if (this.values.currentOption == null)
          {
            this.values.currentOption = null;
            this.chartForm.get ('dataFormCtrl').reset ();
          }
        }

        this.values.xaxis = null;
        this.chartForm.get ('xaxisCtrl').reset ();
    
        this.chartForm.get ('valueCtrl').reset ();

        if (!(this.values.currentChartType.flags & ChartFlags.HEATMAP))
        {
          this.chartForm.get ('geodataValueCtrl').reset ();
          this.values.variable = null;

          this.chartForm.get ('geodataKeyCtrl').reset ();
          this.values.valueColumn = null;
        }

        this.chartForm.get ('variableCtrl').reset ();
      }
      else if (!(this.values.currentChartType.flags & ChartFlags.XYCHART))
      {
        this.values.xaxis = null;
        this.chartForm.get ('xaxisCtrl').reset ();
        this.chartForm.get ('xaxisCtrl').disable ();
      }
      else
        this.chartForm.get ('xaxisCtrl').enable ();

      this.chartForm.get ('variableCtrl').enable ();
      this.chartForm.get ('valueCtrl').enable ();
      this.chartForm.get ('geodataValueCtrl').enable ();
      this.chartForm.get ('geodataKeyCtrl').enable ();

      this.values.infoVar1 = null;

      for (i = 0; i < this.values.infoFunc1.length; i++)
        this.values.infoFunc1[i].checked = false;

      this.chartForm.get ('infoVar1Ctrl').reset ();
      this.chartForm.get ('infoVar1Ctrl').disable ();

      this.values.infoVar2 = null;

      for (i = 0; i < this.values.infoFunc2.length; i++)
        this.values.infoFunc2[i].checked = false;

      this.chartForm.get ('infoVar2Ctrl').reset ();
      this.chartForm.get ('infoVar2Ctrl').disable ();

      this.values.infoVar3 = null;

      for (i = 0; i < this.values.infoFunc3.length; i++)
        this.values.infoFunc3[i].checked = false;

      this.chartForm.get ('infoVar3Ctrl').reset ();
      this.chartForm.get ('infoVar3Ctrl').disable ();

      this.chartForm.get ('columnCtrl').reset ();
      this.chartForm.get ('fontSizeCtrl').setValue (this.fontSizes[1]);
      this.chartForm.get ('valueFontSizeCtrl').setValue (this.fontSizes[1]);
      this.chartForm.get ('valueOrientationCtrl').setValue (this.orientations[0]);

      this.values.formVariables = [];
    }

    // check the chart filters to see if the chart generation is to be enabled or not
    this.checkChartFilters ();
  }

  checkChartFilters(): void
  {
    if (this.values.currentChartType.flags & ChartFlags.HEATMAP)
    {
      if (this.values.variable != null && this.values.geodata != null)
      {
        this.generateBtnEnabled = true;
        return;
      }
    }
    else if (this.values.currentChartType.flags & ChartFlags.PICTURE
      || this.values.currentChartType.flags & ChartFlags.TABLE
      || this.values.currentChartType.flags & ChartFlags.MAP)
    {
      if (this.values.currentOption != null)
      {
        this.generateBtnEnabled = true;
        return;
      }
    }
    else if (this.values.currentChartType.flags & ChartFlags.FORM)
    {
      if (this.values.formVariables.length)
      {
        this.generateBtnEnabled = true;
        return;
      }
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
      {
        this.generateBtnEnabled = true;
        return;
      }
    }
    else
    {
      if (!(this.values.currentChartType.flags & ChartFlags.XYCHART))
      {
        if (this.values.variable != null && this.values.valueColumn != null)
        {
          this.generateBtnEnabled = true;
          return;
        }
      }
      else
      {
        if (this.values.variable != null && this.values.xaxis != null && this.values.valueColumn != null)
        {
          this.generateBtnEnabled = true;
          return;
        }
      }
    }

    this.generateBtnEnabled = false;
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

      this.filteredVariables.next (this.values.chartColumnOptions.slice ());

      this.searchChange (this.variableFilterCtrl);
      this.searchChange (this.xaxisFilterCtrl);
      this.searchChange (this.valueFilterCtrl);

      this.searchChange (this.infoVar1FilterCtrl);
      this.searchChange (this.infoVar2FilterCtrl);
      this.searchChange (this.infoVar3FilterCtrl);

      this.searchChange (this.columnFilterCtrl);
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
          this.chartForm.get ('dataFormCtrl').setValue (option);
          this.chartForm.get ('variableCtrl').enable ();
          this.chartForm.get ('infoNumVarCtrl').enable ();
          this.chartForm.get ('columnCtrl').enable ();
          this.chartForm.get ('fontSizeCtrl').enable ();
          this.chartForm.get ('valueFontSizeCtrl').enable ();
          this.chartForm.get ('valueOrientationCtrl').enable ();

          // only enable x axis if the chart type is not pie, donut or radar
          if (this.values.currentChartType.flags & ChartFlags.XYCHART)
            this.chartForm.get ('xaxisCtrl').enable ();

          this.chartForm.get ('valueCtrl').enable ();
          this.chartForm.get ('geodataValueCtrl').enable ();
          this.chartForm.get ('geodataKeyCtrl').enable ();
          this.values.currentOption = option;
          break;
        }
      }
    }

    if (this.values.currentChartType.flags & ChartFlags.HEATMAP)
    {
      if (this.values.chartColumnOptions.length)
      {
        this.variableCtrlBtnEnabled = true;

        if (this.values.variable != null && this.values.variable != -1)
        {
          for (i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (i == this.values.variable)
            {
              this.chartForm.get ('geodataValueCtrl').setValue (this.values.chartColumnOptions[i]);
              this.values.variable = this.values.chartColumnOptions[i];
              break;
            }
          }
        }

        if (this.values.valueColumn != null && this.values.valueColumn != -1)
        {
          for (i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (i == this.values.valueColumn)
            {
              this.chartForm.get ('geodataKeyCtrl').setValue (this.values.chartColumnOptions[i]);
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
    if ((this.values.currentChartType.flags & ChartFlags.PICTURE)
      || (this.values.currentChartType.flags & ChartFlags.MAP))
    {
      if (this.values.chartColumnOptions.length)
        this.variableCtrlBtnEnabled = true;

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

    if (this.values.currentChartType.flags & ChartFlags.TABLE)
    {
      if (this.values.chartColumnOptions.length)
        this.variableCtrlBtnEnabled = true;

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
      // reset form column selection combo boxes
      this.chartForm.get ('columnCtrl').reset ();
      this.chartForm.get ('fontSizeCtrl').setValue (this.fontSizes[1]);
      this.chartForm.get ('valueFontSizeCtrl').setValue (this.fontSizes[1]);
      this.chartForm.get ('valueOrientationCtrl').setValue (this.orientations[0]);

      // set form variable settings if loaded from database
      if (this.values.function != null && this.values.function != -1)
      {
        this.values.formVariables = [];
  
        for (let formVariable of this.values.lastestResponse)
        {
          this.values.formVariables.push ({
            value: formVariable.value,
            column: formVariable.column,
            fontSize: formVariable.fontSize,
            valueFontSize: formVariable.valueFontSize,
            valueOrientation: formVariable.valueOrientation
          });
        }
      }

      this.values.lastestResponse = [];

      for (let formVariable of this.values.formVariables)
      {
        this.values.lastestResponse.push ({
          value: formVariable.value,
          column: this.values.chartColumnOptions[formVariable.column],
          fontSize: this.fontSizes[formVariable.fontSize],
          valueFontSize: this.fontSizes[formVariable.valueFontSize],
          valueOrientation: this.orientations[formVariable.valueOrientation]
        });
      }

      this.values.formVariables = this.values.lastestResponse;
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
            if (i == this.values.variable)
            {
              this.chartForm.get ('infoVar1Ctrl').setValue (this.values.chartColumnOptions[i]);
              this.chartForm.get ('infoVar1Ctrl').enable ();
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
            if (i == this.values.xaxis)
            {
              this.chartForm.get ('infoVar2Ctrl').setValue (this.values.chartColumnOptions[i]);
              this.chartForm.get ('infoVar2Ctrl').enable ();
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
            if (i == this.values.valueColumn)
            {
              this.chartForm.get ('infoVar3Ctrl').setValue (this.values.chartColumnOptions[i]);
              this.chartForm.get ('infoVar3Ctrl').enable ();
              this.values.infoVar3 = this.values.chartColumnOptions[i];
              this.values.valueColumn = null;
              this.values.infoNumVariables++;
              break;
            }
          }
        }
      }

      if (this.values.infoNumVariables)
        this.chartForm.get ('infoNumVarCtrl').setValue (this.values.infoNumVariables);

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

      if (this.values.chartColumnOptions.length)
      {
        if (this.values.variable != null && this.values.variable != -1)
        {
          for (i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (i == this.values.variable)
            {
              this.chartForm.get ('variableCtrl').setValue (this.values.chartColumnOptions[i]);
              this.values.variable = this.values.chartColumnOptions[i];
              break;
            }
          }
        }

        if (this.values.xaxis != null && this.values.xaxis != -1)
        {
          for (i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (i == this.values.xaxis)
            {
              this.chartForm.get ('xaxisCtrl').setValue (this.values.chartColumnOptions[i]);
              this.values.xaxis = this.values.chartColumnOptions[i];
              break;
            }
          }
        }

        if (this.values.valueColumn != null && this.values.valueColumn != -1)
        {
          for (i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (i == this.values.valueColumn)
            {
              this.chartForm.get ('valueCtrl').setValue (this.values.chartColumnOptions[i]);
              this.values.valueColumn = this.values.chartColumnOptions[i];
              break;
            }
          }
        }
      }
    }

    if (this.values.chartColumnOptions.length)
      this.variableCtrlBtnEnabled = true;

    this.checkChartType ();

    if (this.values.updateTimeLeft != null)
      this.chartForm.get ('intervalCtrl').setValue (this.values.updateTimeLeft);

    this.toggleIntervalInput ();
  }

  handlerUpdateSuccess(_this): void
  {
    // set lastestResponse to null and remove temporary values since the panel has been updated
    _this.values.lastestResponse = null;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.temp = null;
    _this.values.isLoading = false;
  }

  savePanel(): void
  {
    this.service.confirmationDialog (this, "Are you sure you want to save the changes?",
      function (_this)
      {
        let panel;

        if (_this.values.currentChartType.flags & ChartFlags.TABLE)
        {
          let tableVariableIds = [];

          panel = _this.getPanelInfo ();
          panel.function = -1;

          for (let tableVariable of _this.values.tableVariables)
          {
            tableVariableIds.push ({
              id: tableVariable.itemId,
              checked: tableVariable.checked
            });
          }
  
          panel.lastestResponse = JSON.stringify (tableVariableIds);
        }
        else if (_this.values.currentChartType.flags & ChartFlags.FORM)
        {
          let formVariables = [];

          panel = _this.getPanelInfo ();
          panel.function = 2;

          for (let formVariable of _this.values.formVariables)
          {
            formVariables.push ({
              value: null,
              column: _this.values.chartColumnOptions.indexOf (formVariable.column),
              fontSize: _this.fontSizes.indexOf (formVariable.fontSize),
              valueFontSize: _this.fontSizes.indexOf (formVariable.valueFontSize),
              valueOrientation: _this.orientations.indexOf (formVariable.valueOrientation)
            });
          }

          panel.lastestResponse = JSON.stringify (formVariables);
        }
        else if (_this.values.currentChartType.flags & ChartFlags.INFO
          && !(_this.values.currentChartType.flags & ChartFlags.PICTURE)
          && !(_this.values.currentChartType.flags & ChartFlags.MAP)
          && !(_this.values.currentChartType.flags & ChartFlags.HEATMAP))
        {
          let variables;

          panel = _this.getPanelInfo ();
          panel.function = -1;

          // Prepare list of variables
          variables = [];

          for (let i = 0; i < _this.values.infoNumVariables; i++)
          {
            let infoVar, infoFunc;

            switch (i)
            {
              case 2:
                infoVar = _this.values.infoVar3;
                infoFunc = _this.values.infoFunc3;
                break;

              case 1:
                infoVar = _this.values.infoVar2;
                infoFunc = _this.values.infoFunc2;
                break;

              default:
                infoVar = _this.values.infoVar1;
                infoFunc = _this.values.infoFunc1;
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
        else
        {
          panel = _this.getPanelInfo ();
          panel.lastestResponse = null;
        }

        _this.values.isLoading = true;
        _this.service.updateDashboardPanel (_this, panel, _this.handlerUpdateSuccess, _this.handlerError);
      });
  }

  calcPanelHeight(): number
  {
    return this.panelHeight - 14;
  }

  calcRouteListHeight(): number
  {
    switch (this.panelHeight)
    {
      case 303: // Small
        return 273;

      case 333: // Medium
        return 303;

      case 378: // Large
        return 348;

      default: // 12 = Very Large
        return 438;
    }
  }

  isInformationPanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.INFO
      && !(this.values.currentChartType.flags & ChartFlags.FORM)
      && !(this.values.currentChartType.flags & ChartFlags.PICTURE)) ? true : false;
  }

  isSimpleFormPanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.FORM) ? true : false;
  }

  isPicturePanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.PICTURE) ? true : false;
  }

  isTablePanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.TABLE) ? true : false;
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

    if (this.values.infoNumVariables >= 1)
      this.chartForm.get ('infoVar1Ctrl').enable ();

    if (this.values.infoNumVariables >= 2)
      this.chartForm.get ('infoVar2Ctrl').enable ();
    else
    {
      this.values.infoVar2 = null;

      for (i = 0; i < this.values.infoFunc2.length; i++)
        this.values.infoFunc2[i].checked = false;

      this.chartForm.get ('infoVar2Ctrl').reset ();
      this.chartForm.get ('infoVar2Ctrl').disable ();
    }

    if (this.values.infoNumVariables == 3)
      this.chartForm.get ('infoVar3Ctrl').enable ();
    else
    {
      this.values.infoVar3 = null;

      for (i = 0; i < this.values.infoFunc3.length; i++)
        this.values.infoFunc3[i].checked = false;

      this.chartForm.get ('infoVar3Ctrl').reset ();
      this.chartForm.get ('infoVar3Ctrl').disable ();
    }

    this.checkChartFilters ();
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
      height: '362px',
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
      () => this.checkChartFilters ()
    );
  }

  getResultValue(result): string
  {
    return new Intl.NumberFormat ('en-us', { maximumFractionDigits: 1 }).format (result);
  }

  goToColorPicker(): void
  {
    let dialogHeight, numColors;

    if (this.values.currentChartType.flags & ChartFlags.XYCHART
      || this.values.currentChartType.flags & ChartFlags.PIECHART
      || this.values.currentChartType.flags & ChartFlags.FUNNELCHART)
    {
      dialogHeight = '500px';
      numColors = 12;
    }
    else if (this.values.currentChartType.flags & ChartFlags.HEATMAP)
    {
      dialogHeight = '178px';
      numColors = 1;
    }
    else if (this.values.currentChartType.flags & ChartFlags.FORM)
    {
      dialogHeight = '278px';
      numColors = 0;
    }
    else
    {
      dialogHeight = '338px';
      numColors = 1;
    }

    this.dialog.open (MsfDashboardColorPickerComponent, {
      height: dialogHeight,
      width: '400px',
      panelClass: 'msf-dashboard-control-variables-dialog',
      autoFocus: false,
      data: {
        title: this.values.chartName,
        colors: this.values.paletteColors,
        thresholds: (this.values.currentChartType.flags & ChartFlags.HEATMAP) ? null : this.values.thresholds,
        numColors: numColors
      }
    });
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
      height: (this.values.chartName && this.values.chartName.length >= 45) ? '500px ': '470px',
      width: '450px',
      panelClass: 'msf-dashboard-child-panel-dialog',
      data: {
        title: this.values.chartName,
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
      () => {
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
          chartColumnOptions: JSON.stringify (value.chartColumnOptions),
          chartType: childChartTypes.indexOf (value.currentChartType),
          lastestResponse: JSON.stringify (tableVariableIds)
        });
      }
      else
      {
        childPanels.push ({
          id: value.id,
          option: value.currentOption,
          title: value.chartName,
          chartColumnOptions: JSON.stringify (value.chartColumnOptions),
          analysis: value.chartColumnOptions.indexOf (value.variable),
          xaxis: value.chartColumnOptions.indexOf (value.xaxis),
          values: value.chartColumnOptions.indexOf (value.valueColumn),
          function: this.functions.indexOf (value.function),
          chartType: childChartTypes.indexOf (value.currentChartType),
          paletteColors: JSON.stringify (value.paletteColors)
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
    this.service.saveChildPanels (this, childPanels, this.values.id, drillDownIds, this.drillDownSettingsClear, this.drillDownSettingsClear);
  }

  // update child panel list after success or failure
  drillDownSettingsClear(_this, data): void
  {
    let drillDownIds: number[] = [];

    drillDownIds = data.drillDownIds;

    for (let i = 0; i < drillDownIds.length; i++)
    {
      let newChildPanel: boolean = true;
      let drillDownId = drillDownIds[i];

      for (let j = 0; j < _this.values.childPanels.length; j++)
      {
        let childPanel = _this.values.childPanels[j];

        if (drillDownId == childPanel.id)
        {
          childPanel.title = data.childPanels[i].title;
          newChildPanel = false;
          break;
        }
      }

      if (newChildPanel)
      {
        _this.values.childPanels.push ({
          id: drillDownId,
          title: data.childPanels[i].title
        });
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

  isFormColumnValid(): boolean
  {
    return (this.chartForm.get ('columnCtrl').value && this.chartForm.get ('fontSizeCtrl').value
      && this.chartForm.get ('valueFontSizeCtrl').value && this.chartForm.get ('valueOrientationCtrl').value);
  }

  addColumnIntoForm(): void
  {
    this.values.formVariables.push ({
      column: this.chartForm.get ('columnCtrl').value,
      fontSize:  this.chartForm.get ('fontSizeCtrl').value,
      valueFontSize: this.chartForm.get ('valueFontSizeCtrl').value,
      valueOrientation: this.chartForm.get ('valueOrientationCtrl').value
    });

    // reset main column and font size values
    this.chartForm.get ('columnCtrl').reset ();
    this.chartForm.get ('fontSizeCtrl').setValue (this.fontSizes[1]);
    this.chartForm.get ('valueFontSizeCtrl').setValue (this.fontSizes[1]);
    this.chartForm.get ('valueOrientationCtrl').setValue (this.orientations[0]);
    this.checkChartFilters ();
  }

  deleteColumnFromForm(index): void
  {
    this.values.formVariables.splice (index, 1);
    this.checkChartFilters ();
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
        dashboardContentTitle: this.values.chartName
      }
    });
  }

  toggleIntervalInput(): void
  {
    // this must be inverted since this is called before changing updateIntervalSwitch
    // value
    if (this.values.updateIntervalSwitch)
      this.chartForm.get ('intervalCtrl').enable ();
    else
      this.chartForm.get ('intervalCtrl').disable ();
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

      this.values.displayTable = true;
      this.values.chartGenerated = false;
      this.values.infoGenerated = false;
      this.values.formGenerated = false;
      this.values.picGenerated = false;
      this.values.tableGenerated = true;
      this.values.mapboxGenerated = false;

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
        this.chart.deltaLongitude = 360 - this.chart.homeGeoPoint.longitude;

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
            mapLine.line.strokeOpacity = 0.3;
            mapLine.line.stroke = Themes.AmCharts[theme].mapLineColor;
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

      this.chart.homeZoomLevel = zoomLevel - 0.1;
      this.chart.goHome ();

      // Workaround to avoid double lines
      setTimeout (() =>
      {
        this.chart.homeZoomLevel = zoomLevel;
        this.chart.goHome ();
      }, 50);
    });
  }

  copyControlVariables(): void
  {
    this.globals.copiedPanelInfo = JSON.stringify (this.values.currentOptionCategories);

    this.dialog.open (MessageComponent, {
      data: { title: "Information", message: "Control variables copied sucessfully." }
    });
  }
}
