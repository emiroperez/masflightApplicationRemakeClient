import { Component, OnInit, ViewChild, Input, NgZone } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import { CategoryArguments } from '../model/CategoryArguments';
import { Globals } from '../globals/Globals';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { MatSelect } from '@angular/material';
import { takeUntil, take } from 'rxjs/operators';
import { ApiClient } from '../api/api-client';
import { Arguments } from '../model/Arguments';
import { Utils } from '../commons/utils';
import { ApplicationService } from '../services/application.service';

import { MsfDashboardControlVariablesComponent } from '../msf-dashboard-control-variables/msf-dashboard-control-variables.component';
import { MsfDashboardInfoFunctionsComponent } from '../msf-dashboard-info-functions/msf-dashboard-info-functions.component';
import { MatDialog } from '@angular/material';
import { ComponentType } from '../commons/ComponentType';
import { MsfDashboardChartValues } from '../msf-dashboard-chartmenu/msf-dashboard-chartvalues';
import { MessageComponent } from '../message/message.component';

am4core.useTheme(am4themes_animated);
am4core.useTheme(am4themes_dark);

// Grid, scrollbar and legend label colors
const white = am4core.color ("#ffffff");
const darkBlue = am4core.color ("#30303d");
const blueJeans = am4core.color ("#67b7dc");

// Chart flags settings
enum ChartFlags
{
  NONE      = 0x00000000,
  XYCHART   = 0x00000001,
  ROTATED   = 0x00000002,
  STACKED   = 0x00000004,
  INFO      = 0x00000008,
  LINECHART = 0x00000010
}

@Component({
  selector: 'app-msf-dashboard-chartmenu',
  templateUrl: './msf-dashboard-chartmenu.component.html'
})
export class MsfDashboardChartmenuComponent implements OnInit {
  utils: Utils;

  variableCtrlBtnEnabled: boolean = false;
  generateBtnEnabled: boolean = false;

  chartForm: FormGroup;
  chart: any;

  private timer: number;

  chartTypes:any[] = [
    { id: 'bars', name: 'Bars', flags: ChartFlags.XYCHART, createSeries: this.createVertColumnSeries },
    { id: 'hbars', name: 'Horizontal Bars', flags: ChartFlags.XYCHART | ChartFlags.ROTATED, createSeries: this.createHorizColumnSeries },
    { id: 'sbars', name: 'Stacked Bars', flags: ChartFlags.XYCHART | ChartFlags.STACKED, createSeries: this.createVertColumnSeries },
    { id: 'hsbars', name: 'Horizontal Stacked Bars', flags: ChartFlags.XYCHART | ChartFlags.ROTATED | ChartFlags.STACKED, createSeries: this.createHorizColumnSeries },
    { id: 'line', name: 'Lines', flags: ChartFlags.XYCHART | ChartFlags.LINECHART, createSeries: this.createLineSeries },                      
    { id: 'area', name: 'Area', flags: ChartFlags.XYCHART | ChartFlags.LINECHART, createSeries: this.createLineSeries },
    { id: 'sarea', name: 'Stacked Area', flags: ChartFlags.XYCHART | ChartFlags.STACKED | ChartFlags.LINECHART, createSeries: this.createLineSeries },

    { id: 'pie', name: 'Pie', flags: ChartFlags.NONE },
    { id: 'donut', name: 'Donut', flags: ChartFlags.NONE },
    { id: 'radar', name: 'Radar', flags: ChartFlags.NONE },

    { id: 'spbars', name: 'Simple Bars', flags: ChartFlags.NONE, createSeries: this.createSimpleVertColumnSeries },
    { id: 'sphbars', name: 'Simple Horizontal Bars', flags: ChartFlags.ROTATED, createSeries: this.createSimpleHorizColumnSeries }/*,
    { id: 'info', name: 'Information', flags: ChartFlags.INFO }*/
  ];

  functions:any[] = [
    { id: 'avg', name: 'Average' },
    { id: 'sum', name: 'Sum' },
    { id: 'max', name: 'Max' },
    { id: 'min', name: 'Min' },
    { id: 'count', name: 'Count' }
  ]; 

  @Input()
  values: MsfDashboardChartValues;
  temp: MsfDashboardChartValues;

  @Input()
  columnPos: number;

  @Input()
  rowPos: number;

  @Input()
  panelHeight: number;

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

  private _onDestroy = new Subject<void>();

  constructor(private zone: NgZone, public globals: Globals,
    private service: ApplicationService, private http: ApiClient, public dialog: MatDialog,
    private formBuilder: FormBuilder)
  {
    this.utils = new Utils();

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
    /*series.columns.template.events.on ("hit", function(event) {
//      console.log ("clicked on ", event.target);
//      series.hidden = true;
      series.hide ();
    });*/
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
    if (values.currentChartType.id === 'area' || values.currentChartType.id === 'sarea')
      series.fillOpacity = 0.3;

    series.stacked = stacked;
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
      return am4core.color (item.colors[target.dataItem.index]);
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

    // Set colors
    series.columns.template.adapter.add ("fill", (fill, target) => {
      return am4core.color (item.colors[target.dataItem.index]);
    });
  }

  makeChart(chartInfo): void
  {
    this.zone.runOutsideAngular (() => {
      let chart;

      // Check chart type before generating it
      if (this.values.currentChartType.id === 'radar')
      {
        let categoryAxis, valueAxis, series;

        chart = am4core.create ("msf-dashboard-chart-display-" + this.columnPos + "-" + this.rowPos, am4charts.RadarChart);
        chart.data = chartInfo.dataProvider;

        // Configure Radar Chart
        categoryAxis = chart.xAxes.push (new am4charts.CategoryAxis ());
        categoryAxis.renderer.labels.template.fontSize = 10;
        categoryAxis.dataFields.category = chartInfo.titleField;
        categoryAxis.renderer.grid.template.strokeOpacity = 1;
        categoryAxis.renderer.grid.template.stroke = darkBlue;
        categoryAxis.renderer.grid.template.strokeWidth = 1;

        valueAxis = chart.yAxes.push (new am4charts.ValueAxis ());
        valueAxis.renderer.labels.template.fontSize = 10;
        valueAxis.renderer.axisFills.template.fillOpacity = 1;
        valueAxis.renderer.grid.template.strokeOpacity = 1;
        valueAxis.renderer.grid.template.stroke = darkBlue;
        valueAxis.renderer.grid.template.strokeWidth = 1;

        series = chart.series.push (new am4charts.RadarColumnSeries ());
        series.dataFields.valueY = chartInfo.valueField;
        series.dataFields.categoryX = chartInfo.titleField;
        series.columns.template.tooltipText = "{categoryX}: {valueY}";
        series.columns.template.strokeWidth = 0;

        // Set colors
        series.columns.template.adapter.add ("fill", (fill, target) => {
          return am4core.color (chartInfo.colors[target.dataItem.index]);
        });
      }
      else if (this.values.currentChartType.id === 'pie'
        || this.values.currentChartType.id === 'donut')
      {
        let series, colorSet;

        chart = am4core.create ("msf-dashboard-chart-display-" + this.columnPos + "-" + this.rowPos, am4charts.PieChart);
        chart.data = chartInfo.dataProvider;

        // Set label font size
        chart.fontSize = 10;

        // Set inner radius for donut chart
        if (this.values.currentChartType.id === 'donut')
          chart.innerRadius = am4core.percent (60);

        // Configure Pie Chart
        series = chart.series.push (new am4charts.PieSeries ());
        series.dataFields.value = chartInfo.valueField;
        series.dataFields.category = chartInfo.titleField;

        // This creates initial animation
        series.hiddenState.properties.opacity = 1;
        series.hiddenState.properties.endAngle = -90;
        series.hiddenState.properties.startAngle = -90;

        // Disable label and ticks
        series.ticks.template.disabled = true;
        series.labels.template.disabled = true;

        colorSet = new am4core.ColorSet ();
        colorSet.list = chartInfo.colors.map (function(color) {
          return am4core.color (color);
        });
        series.colors = colorSet;

        // Display chart legend
        chart.legend = new am4charts.Legend ();
        chart.legend.markers.template.width = 15;
        chart.legend.markers.template.height = 15;
        chart.legend.labels.template.fontSize = 10;
      }
      else if (!(this.values.currentChartType.flags & ChartFlags.XYCHART))
      {
        let categoryAxis, valueAxis;

        chart = am4core.create ("msf-dashboard-chart-display-" + this.columnPos + "-" + this.rowPos, am4charts.XYChart);
        chart.data = chartInfo.dataProvider;

        if (this.values.currentChartType.flags & ChartFlags.ROTATED)
        {
          categoryAxis = chart.yAxes.push (new am4charts.CategoryAxis ());
          valueAxis = chart.xAxes.push (new am4charts.ValueAxis ());

          categoryAxis.renderer.labels.template.maxWidth = 130;
          categoryAxis.renderer.minGridDistance = 15;

          if (chart.data.length > 1)
          {
            chart.scrollbarY = new am4core.Scrollbar ();
            chart.scrollbarY.background.fill = blueJeans;
          }
        }
        else
        {
          categoryAxis = chart.xAxes.push (new am4charts.CategoryAxis ())
          valueAxis = chart.yAxes.push (new am4charts.ValueAxis ());

          categoryAxis.renderer.labels.template.maxWidth = 100;
          categoryAxis.renderer.labels.template.rotation = 330;
          categoryAxis.renderer.minGridDistance = 30;

          if (chart.data.length > 1)
          {
            chart.scrollbarX = new am4core.Scrollbar ();
            chart.scrollbarX.background.fill = blueJeans;
          }
        }

        categoryAxis.renderer.labels.template.fontSize = 10;
        categoryAxis.renderer.labels.template.wrap = true;
        categoryAxis.renderer.labels.template.horizontalCenter  = "right";
        categoryAxis.renderer.labels.template.textAlign  = "end";
        categoryAxis.dataFields.category = chartInfo.titleField;
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.grid.template.strokeOpacity = 1;
        categoryAxis.renderer.line.strokeOpacity = 1;
        categoryAxis.renderer.grid.template.stroke = darkBlue;
        categoryAxis.renderer.line.stroke = darkBlue;
        categoryAxis.renderer.grid.template.strokeWidth = 1;
        categoryAxis.renderer.line.strokeWidth = 1;

        valueAxis.renderer.labels.template.fontSize = 10;
        valueAxis.renderer.grid.template.strokeOpacity = 1;
        valueAxis.renderer.grid.template.stroke = darkBlue;
        valueAxis.renderer.grid.template.strokeWidth = 1;

        this.values.currentChartType.createSeries (this.values, false, chart, chartInfo, null);
      }
      else
      {
        let categoryAxis, valueAxis, parseDate, stacked;

        chart = am4core.create ("msf-dashboard-chart-display-" + this.columnPos + "-" + this.rowPos, am4charts.XYChart);
        chart.data = chartInfo.data;

        parseDate = this.values.xaxis.id.includes ('date');

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
            categoryAxis.renderer.labels.template.maxWidth = 130;
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
            categoryAxis.renderer.labels.template.maxWidth = 100;
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
        categoryAxis.dataFields.category = this.values.xaxis.id;
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

        stacked = (this.values.currentChartType.flags & ChartFlags.STACKED) ? true : false;
        if ((this.values.currentChartType.flags & ChartFlags.LINECHART) && stacked)
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
          if (parseDate && (this.values.currentChartType.flags & ChartFlags.LINECHART))
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
        for (let object of chartInfo.filter)
        {
          chart.colors.list.push (am4core.color (object.lineColor));
          this.values.currentChartType.createSeries (this.values, stacked, chart, object, parseDate);
        }

        // Add cursor if the chart type is line, area or stacked area
        if (this.values.currentChartType.id === 'line' || this.values.currentChartType.id === 'area'
          || this.values.currentChartType.id === 'sarea')
        {
          chart.cursor = new am4charts.XYCursor ();
          chart.cursor.xAxis = valueAxis;
          chart.cursor.snapToSeries = chart.series;
        }

        // Display Legend
        chart.legend = new am4charts.Legend ();
        chart.legend.markers.template.width = 15;
        chart.legend.markers.template.height = 15;
        chart.legend.labels.template.fontSize = 10;

        /*chart.legend.itemContainers.template.events.on (
          "hit",
          ev => {
            var item = ev.target.dataItem.component.tooltipDataItem.dataContext;
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
        // TODO: Generate information here
        this.values.infoGenerated = true;
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
        this.values.displayInfo = true;
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
  getPanelInfo(): any
  {
    return {
      'id' : this.values.id,
      'option' : this.values.currentOption,
      'title' : this.values.chartName,
      'chartColumnOptions' : this.values.chartColumnOptions,
      'analysis' : this.values.chartColumnOptions.indexOf (this.values.variable),
      'xaxis' : this.values.chartColumnOptions.indexOf (this.values.xaxis),
      'values' : this.values.chartColumnOptions.indexOf (this.values.valueColumn),
      'function' : this.functions.indexOf (this.values.function),
      'chartType' : this.chartTypes.indexOf (this.values.currentChartType),
      'categoryOptions' : this.values.currentOptionCategories
    };
  }

  loadTextSummary(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg, variables;

    this.globals.isLoading = true;
    urlBase = this.values.currentOption.baseUrl + "?" + this.getParameters ();
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999&page_number=0";
    console.log (urlBase);
    urlArg = encodeURIComponent (urlBase);

    // Prepare list of variables
    variables = [];

    for (let i = 0; i < this.values.infoNumVariables; i++)
    {
      for (let j = 0; j < 5; j++)
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

        if (!infoFunc[j].checked)
          continue;

        variables.push ({
          id : this.values.id,
          function : infoFunc[j].id, // avg
          column : infoVar.id     // columnLabel
        });
      }
    }

    url = this.service.host + "/getTextSummaryResponse?url=" + urlArg;

    this.http.post (this, url, variables, handlerSuccess, handlerError);
  }

  loadChartData(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg, panel;

    // set panel info for the HTTP message body
    panel = this.getPanelInfo ();
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
    this.globals.isLoading = false;

    this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "No data available for chart generation." }
    });
  }

  handlerTextSuccess(_this, data): void
  {
    // TODO: Check if no information could be found
    // 0: {id: 7, text: null, value: 42964, column: "Hits"}
    // 1: {id: 7, text: null, value: 131692.75, column: "PlayDuration"}
    // length: 2
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
    if ((_this.values.currentChartType.flags & ChartFlags.XYCHART) && _this.isEmpty (data.data))
    {
      _this.noDataFound ();
      return;
    }

    if ((!(_this.values.currentChartType.flags & ChartFlags.XYCHART) && data.dataProvider == null) ||
      ((_this.values.currentChartType.flags & ChartFlags.XYCHART) && !data.filter))
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
      height: '92%',
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
      this.temp = new MsfDashboardChartValues (this.values.options, this.values.chartName,
        this.values.id, this.values.width, this.values.height);
    }
    else
      this.temp.chartName = this.values.chartName;

    this.temp.currentOption = JSON.parse (JSON.stringify (this.values.currentOption));
    this.temp.variable = this.values.chartColumnOptions.indexOf (this.values.variable);
    this.temp.xaxis = this.values.chartColumnOptions.indexOf (this.values.xaxis);
    this.temp.valueColumn = this.values.chartColumnOptions.indexOf (this.values.valueColumn);
    this.temp.function = this.functions.indexOf (this.values.function);
    this.temp.currentChartType = this.chartTypes.indexOf (this.values.currentChartType);
    this.temp.chartColumnOptions = JSON.parse (JSON.stringify (this.values.chartColumnOptions));
    this.temp.currentOptionCategories = JSON.parse (JSON.stringify (this.values.currentOptionCategories));
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
    this.values.currentChartType = this.temp.currentChartType;
    this.values.chartColumnOptions = JSON.parse (JSON.stringify (this.temp.chartColumnOptions));
    this.values.currentOptionCategories = JSON.parse (JSON.stringify (this.temp.currentOptionCategories));

    // re-initialize panel settings
    this.initPanelSettings ();
  }

  // check if the x axis should be enabled or not depending of the chart type
  checkChartType(): void
  {
    if (this.values.currentOptionCategories == null)
      return;

    if (this.values.currentChartType.flags & ChartFlags.INFO)
    {
      let i;

      // disable and reset any variables when selecting the information panel
      this.values.variable = null;
      this.chartForm.get ('variableCtrl').reset ();

      this.values.xaxis = null;
      this.chartForm.get ('xaxisCtrl').reset ();

      this.values.valueColumn = null;
      this.chartForm.get ('valueCtrl').reset ();

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
    else
    {
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

    // set any values if loading a panel already created
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

    if (this.values.currentOptionCategories)
      this.variableCtrlBtnEnabled = true;

    this.checkChartType ();
  }

  handlerUpdateSucess(_this): void
  {
    // set lastestResponse to null and remove temporary values since the panel has been updated
    _this.values.lastestResponse = null;
    _this.values.chartGenerated = false;
    _this.temp = null;
    _this.globals.isLoading = false;
  }

  savePanel(): void
  {
    this.service.confirmationDialog (this, "Are you sure you want to save the changes?",
      function (_this)
      {
        let panel = _this.getPanelInfo ();
        _this.globals.isLoading = true;
        _this.service.updateDashboardPanel (_this, panel, _this.handlerUpdateSucess, _this.handlerError);
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
      height: '58%',
      width: '400px',
      panelClass: 'msf-dashboard-control-variables-dialog',
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
}
