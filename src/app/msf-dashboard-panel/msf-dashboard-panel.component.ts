import { Component, OnInit, ViewChild, Input, NgZone, SimpleChanges } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import { CategoryArguments } from '../model/CategoryArguments';
import { Globals } from '../globals/Globals';
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
import { ComponentType } from '../commons/ComponentType';
import { MsfDashboardPanelValues } from '../msf-dashboard-panel/msf-dashboard-panelvalues';
import { MessageComponent } from '../message/message.component';
import { ChartFlags } from '../msf-dashboard-panel/msf-dashboard-chartflags';

am4core.useTheme(am4themes_animated);
am4core.useTheme(am4themes_dark);

// Grid, scrollbar and legend label colors
const white = am4core.color ("#ffffff");
const darkBlue = am4core.color ("#30303d");
const blueJeans = am4core.color ("#67b7dc");

@Component({
  selector: 'app-msf-dashboard-panel',
  templateUrl: './msf-dashboard-panel.component.html'
})
export class MsfDashboardPanelComponent implements OnInit {
  utils: Utils;

  variableCtrlBtnEnabled: boolean = false;
  generateBtnEnabled: boolean = false;

  chartForm: FormGroup;
  chart: any;

  private timer: number;

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
    { name: 'Information', flags: ChartFlags.INFO }
  ];

  functions:any[] = [
    { id: 'avg', name: 'Average' },
    { id: 'sum', name: 'Sum' },
    { id: 'max', name: 'Max' },
    { id: 'min', name: 'Min' },
    { id: 'count', name: 'Count' }
  ]; 

  @Input()
  values: MsfDashboardPanelValues;
  temp: MsfDashboardPanelValues;

  @Input()
  panelHeight: number;

  @Input()
  reAppendChart: boolean;

  public dataFormFilterCtrl: FormControl = new FormControl ();
  public variableFilterCtrl: FormControl = new FormControl ();
  public xaxisFilterCtrl: FormControl = new FormControl ();
  public valueFilterCtrl: FormControl = new FormControl ();

  public infoVar1FilterCtrl: FormControl = new FormControl ();
  public infoVar2FilterCtrl: FormControl = new FormControl ();
  public infoVar3FilterCtrl: FormControl = new FormControl ();

  public filteredVariables: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filteredOptions: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('variableSelect') variableSelect: MatSelect;
  @ViewChild('xaxisSelect') xaxisSelect: MatSelect;
  @ViewChild('valueSelect') valueSelect: MatSelect;

  private _onDestroy = new Subject<void> ();

  constructor(private zone: NgZone, public globals: Globals,
    private service: ApplicationService, private http: ApiClient, public dialog: MatDialog,
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
      infoVar3Ctrl: new FormControl ({ value: '', disabled: true })
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
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if (changes['reAppendChart'] && this.reAppendChart && this.values.chartGenerated)
    {
      let chartElement = document.getElementById ("msf-dashboard-chart-display-" + this.values.id);
      document.getElementById ("msf-dashboard.chart-display-container-" + this.values.id).appendChild (chartElement);
    }
  }

  isEmpty(obj): boolean
  {
    if (obj == null)
      return true;

    for (let key in obj)
    {
      if (obj.hasOwnProperty (key))
        return false;
    }

    return true;
  }

  // Function to create horizontal column chart series
  createHorizColumnSeries(values, stacked, chart, item, parseDate): void
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

    // Add an event that hide the column chart when clicked
    // series.columns.template.events.on ("hit", function(event) {
      //event.target.parent.hide ();
//      chart.legend.dispatchImmediately ("hide");
      //event.target.dataItem.categoryY;
    // });

    // Display a special context menu when a chart column is right clicked
    series.columns.template.events.on ("rightclick", function(event) {
      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[values.xaxis.id];
    });
  }

  // Function to create vertical column chart series
  createVertColumnSeries(values, stacked, chart, item, parseDate): void
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

    series.columns.template.events.on ("rightclick", function(event) {
      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[values.xaxis.id];
    });
  }

  // Function to create line chart series
  createLineSeries(values, stacked, chart, item, parseDate): void
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

    // Display a special context menu when a chart line segment is right clicked
    series.segments.template.interactionsEnabled = true;
    series.segments.template.events.on ("rightclick", function(event) {
      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.component.tooltipDataItem.dataContext[values.xaxis.id];
    });
  }

  // Function to create simple vertical column chart series
  createSimpleVertColumnSeries(values, stacked, chart, item, parseDate): void
  {
    let series = chart.series.push (new am4charts.ColumnSeries());
    series.dataFields.valueY = item.valueField;
    series.dataFields.categoryX = item.titleField;
    series.name = item.valueField;
    series.columns.template.tooltipText = "{categoryX}: {valueY}";
    series.columns.template.strokeWidth = 0;

    series.stacked = stacked;

    // Set colors
    series.columns.template.adapter.add ("fill", (fill, target) => {
      return am4core.color (values.paletteColors[0]);
    });

    // Display a special context menu when a chart column is right clicked
    series.columns.template.events.on ("rightclick", function(event) {
      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
    });
  }

  // Function to create simple horizontal column chart series
  createSimpleHorizColumnSeries(values, stacked, chart, item, parseDate): void
  {
    let series = chart.series.push (new am4charts.ColumnSeries());
    series.dataFields.valueX = item.valueField;
    series.dataFields.categoryY = item.titleField;
    series.name = item.valueField;
    series.columns.template.tooltipText = "{categoryY}: {valueX}";
    series.columns.template.strokeWidth = 0;

    series.stacked = stacked;

    series.columns.template.adapter.add ("fill", (fill, target) => {
      return am4core.color (values.paletteColors[0]);
    });

    series.columns.template.events.on ("rightclick", function(event) {
      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
    });
  }

  // Function to create pie chart series
  createPieSeries(values, stacked, chart, item, parseDate): void
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

    // Disable label and ticks
    series.ticks.template.disabled = true;
    series.labels.template.disabled = true;

    // Set the color for the chart to display
    colorSet = new am4core.ColorSet ();
    colorSet.list = values.paletteColors.map (function(color) {
      return am4core.color (color);
    });
    series.colors = colorSet;

    // Display a special context menu when a pie slice is right clicked
    series.slices.template.events.on ("rightclick", function(event) {
      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
    });
  }

  // Function to create funnel chart series
  createFunnelSeries(values, stacked, chart, item, parseDate): void
  {
    let series, colorSet;

    series = chart.series.push (new am4charts.FunnelSeries ());
    series.dataFields.value = item.valueField;
    series.dataFields.category = item.titleField;

    // Set chart apparence
    series.sliceLinks.template.fillOpacity = 0;
    series.ticks.template.strokeOpacity = 1;
    series.ticks.template.stroke = darkBlue;
    series.ticks.template.strokeWidth = 1;
    series.alignLabels = true;

    // Set the color for the chart to display
    colorSet = new am4core.ColorSet ();
    colorSet.list = values.paletteColors.map (function(color) {
      return am4core.color (color);
    });
    series.colors = colorSet;

    // Display a special context menu when a funnel slice is right clicked
    series.slices.template.events.on ("rightclick", function(event) {
      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
    });
  }

  makeChart(chartInfo): void
  {
    this.zone.runOutsideAngular (() => {
      let chart;

      // Check chart type before generating it
      if (this.values.currentChartType.flags & ChartFlags.FUNNELCHART
        || this.values.currentChartType.flags & ChartFlags.PIECHART)
      {
        if (this.values.currentChartType.flags & ChartFlags.FUNNELCHART)
          chart = am4core.create ("msf-dashboard-chart-display-" + this.values.id, am4charts.SlicedChart);
        else
          chart = am4core.create ("msf-dashboard-chart-display-" + this.values.id, am4charts.PieChart);

        chart.data = chartInfo.dataProvider;

        // Set label font size
        chart.fontSize = 10;

        // Create the series
        this.values.currentChartType.createSeries (this.values, false, chart, chartInfo, null);

        if (this.values.currentChartType.flags & ChartFlags.FUNNELCHART)
        {
          // Sort values from greatest to least on funnel chart types
          chart.events.on ("beforedatavalidated", function(event) {
            chart.data.sort (function(e1, e2) {
              return e2[chartInfo.valueField] - e1[chartInfo.valueField];
            });
          });
        }
      }
      else
      {
        let categoryAxis, valueAxis, parseDate, stacked;

        chart = am4core.create ("msf-dashboard-chart-display-" + this.values.id, am4charts.XYChart);

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
            chart.scrollbarY.background.fill = blueJeans;
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
            chart.scrollbarX.background.fill = blueJeans;
          }
        }

        // Set category axis properties
        categoryAxis.renderer.labels.template.fontSize = 10;
        categoryAxis.renderer.labels.template.wrap = true;
        categoryAxis.renderer.labels.template.horizontalCenter  = "right";
        categoryAxis.renderer.labels.template.textAlign  = "end";
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.grid.template.strokeOpacity = 1;
        categoryAxis.renderer.line.strokeOpacity = 1;
        categoryAxis.renderer.grid.template.stroke = darkBlue;
        categoryAxis.renderer.line.stroke = darkBlue;
        categoryAxis.renderer.grid.template.strokeWidth = 1;
        categoryAxis.renderer.line.strokeWidth = 1;

        // Set value axis properties
        valueAxis.renderer.labels.template.fontSize = 10;
        valueAxis.renderer.grid.template.strokeOpacity = 1;
        valueAxis.renderer.grid.template.stroke = darkBlue;
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

            chart.events.on ("beforedatavalidated", function(event) {
              chart.data.sort (function(e1, e2) {
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
  
              chart.events.on ("beforedatavalidated", function(event) {
                chart.data.sort (function(e1, e2) {
                  return +(new Date(e1[axisField])) - +(new Date(e2[axisField]));
                });
              });
            }

            chartInfo.filter.sort (function(e1, e2) {
              return e1.avg - e2.avg;
            });
          }

          // Create the series and set colors
          chart.colors.list = [];

          for (let color of this.values.paletteColors)
            chart.colors.list.push (am4core.color (color));

          for (let object of chartInfo.filter)
            this.values.currentChartType.createSeries (this.values, stacked, chart, object, parseDate);

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
          chart.events.on ("beforedatavalidated", function(event) {
            chart.data.sort (function(e1, e2) {
              return e1[chartInfo.valueField] - e2[chartInfo.valueField];
            });
          });

          // Create the series
          this.values.currentChartType.createSeries (this.values, false, chart, chartInfo, parseDate);
        }
      }

      if (this.values.currentChartType.flags & ChartFlags.XYCHART
        || this.values.currentChartType.flags & ChartFlags.PIECHART)
      {
        // Display Legend
        chart.legend = new am4charts.Legend ();
        chart.legend.markers.template.width = 15;
        chart.legend.markers.template.height = 15;
        chart.legend.labels.template.fontSize = 10;

        /*chart.legend.itemContainers.template.events.on (
          "hide",
          ev => {
            chart.legend.data[0].hide ();
            // var item = ev.target.dataItem.component.tooltipDataItem.dataContext;
            //alert("line clicked on: " + item.country + ": " + item.marketing);
          },
          this
        );*/
      }

      // Add export button
      chart.exporting.menu = new am4core.ExportMenu ();
      chart.exporting.menu.verticalAlign = "bottom";

      this.chart = chart;
    });
  }

  destroyChart(): void
  {
    if (this.chart)
    {
      this.zone.runOutsideAngular (() => {
        if (this.chart)
          this.chart.dispose ();
      });
    }
  }

  ngAfterViewInit(): void
  {
    if (!this.isEmpty (this.values.lastestResponse))
    {
      if (this.values.currentChartType.flags & ChartFlags.INFO)
      {
        if (this.values.function == 1)
        {
          this.values.infoGenerated = true;
          this.values.function = -1;
        }
      }
      else
      {
        this.makeChart (this.values.lastestResponse);
        this.values.chartGenerated = true;
      }
    }
  }

  ngAfterContentInit(): void
  {
    // these parts must be here because it generate an error if inserted on ngAfterViewInit
    this.initPanelSettings ();

    if (!this.isEmpty (this.values.lastestResponse))
    {
      if (this.values.currentChartType.flags & ChartFlags.INFO)
      {
        if (this.values.function == 1)
          this.values.displayInfo = true;
      }
      else
        this.values.displayChart = true;
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
              params += "&" + this.utils.getArguments (argument);
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
  getPanelInfo(infoChartType: boolean): any
  {
    if (infoChartType)
    {
      return {
        id: this.values.id,
        option: this.values.currentOption,
        title: this.values.chartName,
        chartColumnOptions: JSON.stringify (this.values.chartColumnOptions),
        analysis: this.values.chartColumnOptions.indexOf (this.values.infoVar1),
        xaxis: this.values.chartColumnOptions.indexOf (this.values.infoVar2),
        values: this.values.chartColumnOptions.indexOf (this.values.infoVar3),
        function: 1,
        chartType: this.chartTypes.indexOf (this.values.currentChartType),
        categoryOptions: JSON.stringify (this.values.currentOptionCategories)
      };
    }
    else
    {
      return {
        id: this.values.id,
        option: this.values.currentOption,
        title: this.values.chartName,
        chartColumnOptions: JSON.stringify (this.values.chartColumnOptions),
        analysis: this.values.chartColumnOptions.indexOf (this.values.variable),
        xaxis: this.values.chartColumnOptions.indexOf (this.values.xaxis),
        values: this.values.chartColumnOptions.indexOf (this.values.valueColumn),
        function: this.functions.indexOf (this.values.function),
        chartType: this.chartTypes.indexOf (this.values.currentChartType),
        categoryOptions: JSON.stringify (this.values.currentOptionCategories),
        paletteColors: JSON.stringify (this.values.paletteColors)
      };
    }
  }

  loadTextSummary(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg, panel, variables;

    this.globals.isLoading = true;
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
    panel = this.getPanelInfo (true);
    panel.paletteColors = JSON.stringify (variables); // store the variables into the paletteColors for temporary use

    url = this.service.host + "/getTextSummaryResponse?url=" + urlArg;

    this.http.post (this, url, panel, handlerSuccess, handlerError);
  }

  loadChartData(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg, panel;

    // set panel info for the HTTP message body
    panel = this.getPanelInfo (false);
    this.globals.isLoading = true;
    urlBase = this.values.currentOption.baseUrl + "?" + this.getParameters ();
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999&page_number=0";
    console.log (urlBase);
    urlArg = encodeURIComponent (urlBase);
    url = this.service.host + "/getChartData?url=" + urlArg + "&variable=" + this.values.variable.id +
      "&valueColumn=" + this.values.valueColumn.id + "&function=" + this.values.function.id;

    // don't use the xaxis parameter if the chart type is pie, donut or radar
    if (!(this.values.currentChartType.flags & ChartFlags.XYCHART))
      url += "&chartType=pie";
    else
      url += "&xaxis=" + this.values.xaxis.id;

    this.http.post (this, url, panel, handlerSuccess, handlerError);
  }

  loadData(): void
  {
    this.globals.startTimestamp = new Date ();

    if (this.values.currentChartType.flags & ChartFlags.INFO)
      this.loadTextSummary (this.handlerTextSuccess, this.handlerTextError);
    else
      this.loadChartData (this.handlerChartSuccess, this.handlerChartError);
  }

  ngOnDestroy()
  {
    this._onDestroy.next ();
    this._onDestroy.complete ();

    clearInterval (this.timer);

    this.destroyChart ();
  }

  noDataFound(): void
  {
    this.values.lastestResponse = null;
    this.values.chartGenerated = false;
    this.values.infoGenerated = false;
    this.globals.isLoading = false;

    if (this.values.currentChartType.flags & ChartFlags.INFO)
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

    //console.log (data);
    _this.values.displayInfo = true;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = true;
    _this.globals.isLoading = false;
  }

  handlerChartSuccess(_this, data): void
  {
    if (_this.values.currentChartType.flags & ChartFlags.XYCHART && _this.isEmpty (data.data))
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

    _this.makeChart (data);
    _this.values.displayChart = true;
    _this.values.chartGenerated = true;
    _this.values.infoGenerated = false;
    _this.globals.isLoading = false;
  }

  loadChartFilterValues(component): void
  {
    this.globals.isLoading = true;
    this.getChartFilterValues (component.id, this.addChartFilterValues);
  }

  handlerChartError(_this, result): void
  {
    console.log (result);
    _this.values.lastestResponse = null;
    _this.values.chartGenerated = false;
    _this.globals.isLoading = false;

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to generate chart." }
    });
  }

  handlerTextError(_this, result): void
  {
    console.log (result);
    _this.values.lastestResponse = null;
    _this.values.chartGenerated = false;
    _this.globals.isLoading = false;

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to get summary." }
    });
  }

  handlerError(_this, result): void
  {
    console.log (result);
    _this.globals.isLoading = false;  
  }

  getChartFilterValues(id, handlerSuccess): void
  {
    this.service.getChartFilterValues (this, id, handlerSuccess, this.handlerError);
  }

  addChartFilterValues(_this, data): void
  {
    _this.values.chartColumnOptions = [];
    for (let columnConfig of data)
      _this.values.chartColumnOptions.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel, item: columnConfig } );

    // load the initial filter variables list
    _this.filteredVariables.next (_this.values.chartColumnOptions.slice ());

    _this.searchChange (_this.variableFilterCtrl);
    _this.searchChange (_this.xaxisFilterCtrl);
    _this.searchChange (_this.valueFilterCtrl);

    _this.searchChange (_this.infoVar1FilterCtrl);
    _this.searchChange (_this.infoVar2FilterCtrl);
    _this.searchChange (_this.infoVar3FilterCtrl);

    // reset chart filter values and disable generate chart button
    _this.chartForm.get ('variableCtrl').reset ();
    _this.chartForm.get ('xaxisCtrl').reset ();
    _this.chartForm.get ('valueCtrl').reset ();
    _this.checkChartFilters ();

    // initiate another query to get the category arguments
    _this.service.loadOptionCategoryArguments (_this, _this.values.currentOption, _this.setCategories, _this.handlerError);
  }

  setCategories(_this, data): void
  {
    _this.values.currentOptionCategories = [];

    for (let optionCategory of data)
      _this.values.currentOptionCategories.push (optionCategory.categoryArgumentsId);
    _this.variableCtrlBtnEnabled = true;

    _this.globals.isLoading = false;

    _this.chartForm.get ('variableCtrl').enable ();
    _this.chartForm.get ('infoNumVarCtrl').enable ();

    if (_this.values.currentChartType.flags & ChartFlags.XYCHART)
      _this.chartForm.get ('xaxisCtrl').enable ();

    _this.chartForm.get ('valueCtrl').enable ();
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
    // workaround to prevent errors on certain data forms
    if (this.haveSortingCheckboxes ())
      this.globals.isLoading = true;

    this.dialog.open (MsfDashboardControlVariablesComponent, {
      height: '605px',
      width: '400px',
      panelClass: 'msf-dashboard-control-variables-dialog',
      data: {
        currentOptionCategories: this.values.currentOptionCategories,
        currentOptionId: this.values.currentOption.id,
        title: this.values.chartName
      }
    });
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
    this.temp.currentChartType = JSON.parse (JSON.stringify (this.values.currentChartType));
    this.temp.chartColumnOptions = JSON.parse (JSON.stringify (this.values.chartColumnOptions));
    this.temp.currentOptionCategories = JSON.parse (JSON.stringify (this.values.currentOptionCategories));

    if (this.values.currentChartType.flags & ChartFlags.INFO)
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

  goToChart(): void
  {
    let i, item;

    if (this.values.infoGenerated)
      this.values.displayInfo = true;
    else
      this.values.displayChart = true;

    // discard any changes
    this.values.currentOption = JSON.parse (JSON.stringify (this.temp.currentOption));
    this.values.chartName = this.temp.chartName;
    this.values.variable = this.temp.variable;
    this.values.xaxis = this.temp.xaxis;
    this.values.valueColumn = this.temp.valueColumn;
    this.values.function = this.temp.function;
    this.values.chartColumnOptions = JSON.parse (JSON.stringify (this.temp.chartColumnOptions));
    this.values.currentOptionCategories = JSON.parse (JSON.stringify (this.temp.currentOptionCategories));

    for (i = 0; i < this.chartTypes.length; i++)
    {
      item = this.chartTypes[i];

      if (item.name === this.temp.currentChartType.name)
      {
        this.values.currentChartType = item;
        break;
      }
    }

    if (this.values.currentChartType.flags & ChartFlags.INFO)
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

    // re-initialize panel settings
    this.values.currentChartType = this.chartTypes.indexOf (this.values.currentChartType);
    this.initPanelSettings ();
  }

  // check if the x axis should be enabled or not depending of the chart type
  checkChartType(): void
  {
    if (this.values.currentOptionCategories == null)
      return;

    if (this.values.currentChartType.flags & ChartFlags.INFO)
    {
      // disable and reset unused variables
      this.values.variable = null;
      this.chartForm.get ('variableCtrl').reset ();

      this.values.xaxis = null;
      this.chartForm.get ('xaxisCtrl').reset ();

      this.values.valueColumn = null;
      this.chartForm.get ('valueCtrl').reset ();
    }
    else
    {
      let i;

      this.values.infoNumVariables = 0;
      this.chartForm.get ('infoNumVarCtrl').setValue (0);

      if (!(this.values.currentChartType.flags & ChartFlags.XYCHART))
      {
        this.values.xaxis = null;
        this.chartForm.get ('xaxisCtrl').reset ();
        this.chartForm.get ('xaxisCtrl').disable ();
      }
      else
        this.chartForm.get ('xaxisCtrl').enable ();

      this.chartForm.get ('variableCtrl').enable ();
      this.chartForm.get ('valueCtrl').enable ();

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
    }

    // check the chart filters to see if the chart generation is to be enabled or not
    this.checkChartFilters ();
  }

  checkChartFilters(): void
  {
    if (this.values.currentChartType.flags & ChartFlags.INFO)
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

    if (this.values.chartColumnOptions)
    {
      this.filteredVariables.next (this.values.chartColumnOptions.slice ());

      this.searchChange (this.variableFilterCtrl);
      this.searchChange (this.xaxisFilterCtrl);
      this.searchChange (this.valueFilterCtrl);

      this.searchChange (this.infoVar1FilterCtrl);
      this.searchChange (this.infoVar2FilterCtrl);
      this.searchChange (this.infoVar3FilterCtrl);
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

          // only enable x axis if the chart type is not pie, donut or radar
          if (!(this.values.currentChartType.flags & ChartFlags.XYCHART))
            this.chartForm.get ('xaxisCtrl').enable ();

          this.chartForm.get ('valueCtrl').enable ();
          this.values.currentOption = option;
          break;
        }
      }
    }

    if (this.values.currentChartType.flags & ChartFlags.INFO)
    {
      let lastvar;

      this.values.infoNumVariables = 0;

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
            this.values.variable = null;
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

    if (this.values.currentOptionCategories)
      this.variableCtrlBtnEnabled = true;

    this.checkChartType ();
  }

  handlerUpdateSuccess(_this): void
  {
    // set lastestResponse to null and remove temporary values since the panel has been updated
    _this.values.lastestResponse = null;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.temp = null;
    _this.globals.isLoading = false;
  }

  savePanel(): void
  {
    this.service.confirmationDialog (this, "Are you sure you want to save the changes?",
      function (_this)
      {
        let panel;

        if (_this.values.currentChartType.flags & ChartFlags.INFO)
        {
          let variables;

          panel = _this.getPanelInfo (true);
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
          panel = _this.getPanelInfo (false);

        _this.globals.isLoading = true;
        _this.service.updateDashboardPanel (_this, panel, _this.handlerUpdateSuccess, _this.handlerError);
      });
  }

  calcChartHeight(): number
  {
    return this.panelHeight - 14;
  }

  isInformationPanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.INFO) ? true : false;
  }

  getButtonColor(infoVarNum): String
  {
    if (infoVarNum == null)
      return "#343434";

    return "primary";
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
      dialogHeight = '340px';
      numColors = 12;
    }
    else
    {
      dialogHeight = '178px';
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
        numColors: numColors
      }
    });
  }

  goToDrillDownSettings(): void
  {
    this.dialog.open (MsfDashboardDrillDownComponent, {
      height: '370px',
      width: '400px',
      panelClass: 'msf-dashboard-control-variables-dialog',
      data: {
        title: this.values.chartName,
        chartColumnOptions: this.values.chartColumnOptions
      }
    });
  }
}
