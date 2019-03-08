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
import { MatDialog } from '@angular/material';
import { ComponentType } from '../commons/ComponentType';
import { MsfDashboardChartValues } from '../msf-dashboard-chartmenu/msf-dashboard-chartvalues';
import { MessageComponent } from '../message/message.component';

am4core.useTheme(am4themes_animated);
am4core.useTheme(am4themes_dark);

// grid, scrollbar and legend label colors
const white = am4core.color ("#ffffff");
const darkBlue = am4core.color ("#30303d");
const blueJeans = am4core.color ("#67b7dc");

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
    { id: 'bars', name: 'Bars', rotate: false, createSeries: this.createVertColumnSeries },
    { id: 'hbars', name: 'Horizontal Bars', rotate: true, createSeries: this.createHorizColumnSeries },
    { id: 'sbars', name: 'Stacked Bars', rotate: false, createSeries: this.createVertColumnSeries },
    { id: 'hsbars', name: 'Horizontal Stacked Bars', rotate: true, createSeries: this.createHorizColumnSeries },
    { id: 'line', name: 'Lines', rotate: false, createSeries: this.createLineSeries },                      
    { id: 'area', name: 'Area', rotate: false, createSeries: this.createLineSeries },
    { id: 'sarea', name: 'Stacked Area', rotate: false, createSeries: this.createLineSeries },

    // { id: 'sbars', name: 'Simple Bars', rotate: false },
    // { id: 'shbars', name: 'Simple Horizontal Bars', rotate: true },
    // { id: 'ssbars', name: 'Simple Stacked Bars', rotate: false },
    // { id: 'shsbars', name: 'Simple Horizontal Stacked Bars', rotate: true },
    // length: 4

    { id: 'pie', name: 'Pie', rotate: false },
    { id: 'donut', name: 'Donut', rotate: false },
    { id: 'radar', name: 'Radar', rotate: false },

    { id: 'spbars', name: 'Simple Bars', rotate: false, createSeries: this.createSimpleVertColumnSeries },
    { id: 'sphbars', name: 'Simple Horizontal Bars', rotate: true, createSeries: this.createSimpleHorizColumnSeries }
    // { id: 'ssbars', name: 'Simple Stacked Bars', rotate: false, createSeries: this.createSimpleVertColumnSeries },
    // { id: 'shsbars', name: 'Simple Horizontal Stacked Bars', rotate: true, createSeries: this.createSimpleHorizColumnSeries }
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
      valueCtrl: new FormControl ({ value: '', disabled: true })
    });
  }

  setChartTypeStack(): boolean
  {
    switch (this.values.currentChartType.id)
    {
      case 'sbars':
      case 'hsbars':
      case 'sarea':
      case 'ssbars':
      case 'shsbars':
        return true;

      default:
        return false;
    }
  }

  ngOnInit()
  {
    // prepare the data form combo box
    this.optionSearchChange (this.dataFormFilterCtrl);
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
        categoryAxis.dataFields.category = chartInfo.titleField;
        categoryAxis.renderer.grid.template.strokeOpacity = 1;
        categoryAxis.renderer.grid.template.stroke = darkBlue;
        categoryAxis.renderer.grid.template.strokeWidth = 1;

        valueAxis = chart.yAxes.push (new am4charts.ValueAxis ());
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

        // Set colors
        series.ticks.template.strokeOpacity = 1;
        series.ticks.template.stroke = darkBlue;
        series.ticks.template.strokeWidth = 1;

        colorSet = new am4core.ColorSet ();
        colorSet.list = chartInfo.colors.map (function(color) {
          return am4core.color (color);
        });
        series.colors = colorSet;
      }
      else if (this.values.currentChartType.name.includes ('Simple'))
      {
        let categoryAxis, valueAxis;

        chart = am4core.create ("msf-dashboard-chart-display-" + this.columnPos + "-" + this.rowPos, am4charts.XYChart);
        chart.data = chartInfo.dataProvider;

        if (this.values.currentChartType.rotate)
        {
          categoryAxis = chart.yAxes.push (new am4charts.CategoryAxis ());
          valueAxis = chart.xAxes.push (new am4charts.ValueAxis ());

          chart.scrollbarY = new am4core.Scrollbar ();
          chart.scrollbarY.background.fill = blueJeans;
        }
        else
        {
          categoryAxis = chart.xAxes.push (new am4charts.CategoryAxis ())
          valueAxis = chart.yAxes.push (new am4charts.ValueAxis ());

          chart.scrollbarX = new am4core.Scrollbar ();
          chart.scrollbarX.background.fill = blueJeans;
        }

        categoryAxis.dataFields.category = chartInfo.titleField;
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.grid.template.strokeOpacity = 1;
        categoryAxis.renderer.line.strokeOpacity = 1;
        categoryAxis.renderer.grid.template.stroke = darkBlue;
        categoryAxis.renderer.line.stroke = darkBlue;
        categoryAxis.renderer.grid.template.strokeWidth = 1;
        categoryAxis.renderer.line.strokeWidth = 1;

        valueAxis.renderer.grid.template.strokeOpacity = 1;
        valueAxis.renderer.grid.template.stroke = darkBlue;
        valueAxis.renderer.grid.template.strokeWidth = 1;

        this.values.currentChartType.createSeries (this.values, false, chart, chartInfo, null);
      }
      else
      {
        let categoryAxis, valueAxis, parseDate;

        chart = am4core.create ("msf-dashboard-chart-display-" + this.columnPos + "-" + this.rowPos, am4charts.XYChart);
        chart.data = chartInfo.data;

        parseDate = this.values.xaxis.id.includes ('date');

        // Set chart axes depeding on the rotation
        if (this.values.currentChartType.rotate)
        {
          if (parseDate)
          {
            categoryAxis = chart.yAxes.push (new am4charts.DateAxis ());
            categoryAxis.dateFormats.setKey ("day", "MMM d");
            categoryAxis.periodChangeDateFormats.setKey ("day", "yyyy");
          }
          else
            categoryAxis = chart.yAxes.push (new am4charts.CategoryAxis ());

          valueAxis = chart.xAxes.push (new am4charts.ValueAxis ());

          // Add scrollbar into the chart for zooming
          chart.scrollbarY = new am4core.Scrollbar ();
          chart.scrollbarY.background.fill = blueJeans;
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
            categoryAxis = chart.xAxes.push (new am4charts.CategoryAxis ());

          valueAxis = chart.yAxes.push (new am4charts.ValueAxis ());

          chart.scrollbarX = new am4core.Scrollbar ();
          chart.scrollbarX.background.fill = blueJeans;
        }

        // Set category axis properties
        categoryAxis.dataFields.category = this.values.xaxis.id;
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.grid.template.strokeOpacity = 1;
        categoryAxis.renderer.line.strokeOpacity = 1;
        categoryAxis.renderer.grid.template.stroke = darkBlue;
        categoryAxis.renderer.line.stroke = darkBlue;
        categoryAxis.renderer.grid.template.strokeWidth = 1;
        categoryAxis.renderer.line.strokeWidth = 1;

        // Set value axis properties
        valueAxis.renderer.grid.template.strokeOpacity = 1;
        valueAxis.renderer.grid.template.stroke = darkBlue;
        valueAxis.renderer.grid.template.strokeWidth = 1;

        // Avoid negative values on the stacked area chart
        if (this.values.currentChartType.id === 'sarea')
        {
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
        // average value of each key item to compensate for the lack of
        // proper sorting by values
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

        chartInfo.filter = chartInfo.filter.sort (function (e1, e2) { return e1.avg - e2.avg });

        // Create the series and set colors
        chart.colors.list = [];
        for (let object of chartInfo.filter)
        {
          chart.colors.list.push (am4core.color (object.lineColor));
          this.values.currentChartType.createSeries (this.values, this.setChartTypeStack (), chart, object, parseDate);
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
        chart.legend.labels.template.fill = white;
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
      this.makeChart (this.values.lastestResponse);
      this.values.chartGenerated = true;
    }
  }

  ngAfterContentInit(): void
  {
    // these parts must be here because it generate an error if inserted on ngAfterViewInit
    this.initPanelSettings ();

    if (!this.isEmpty (this.values.lastestResponse))
      this.values.displayChart = true;
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

  hasXAxis(chartType): boolean
  {
    return (chartType.id !== 'pie' && chartType.id !== 'donut' && chartType.id !== 'radar'
      && !chartType.name.includes ('Simple'));
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
    if (!this.hasXAxis (this.values.currentChartType))
      url += "&chartType=pie";
    else
      url += "&xaxis=" + this.values.xaxis.id;

    this.http.post (this, url, panel, handlerSuccess, handlerError);
  }

  loadData(): void
  {
    this.globals.startTimestamp = new Date ();
    this.loadChartData (this.handlerSuccess, this.handleChartError);
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

  handlerSuccess(_this, data): void
  {
    if (_this.hasXAxis (_this.values.currentChartType) && _this.isEmpty (data.data))
    {
      _this.noDataFound ();
      return;
    }

    if ((!_this.hasXAxis (_this.values.currentChartType) && data.dataProvider == null) ||
      (_this.hasXAxis (_this.values.currentChartType) && !data.filter))
    {
      _this.noDataFound ();
      return;
    }

    // destroy current chart if it's already generated to avoid a blank chart
    _this.destroyChart ();

    _this.makeChart (data);
    _this.values.displayChart = true;
    _this.values.chartGenerated = true;
    _this.globals.isLoading = false;
  }

  loadChartFilterValues(component): void
  {
    this.globals.isLoading = true;
    this.getChartFilterValues (component.id, this.addChartFilterValues);
  }

  handleChartError(_this, result): void
  {
    console.log (result);
    _this.values.lastestResponse = null;
    _this.values.chartGenerated = false;
    _this.globals.isLoading = false;

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to generate chart." }
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

    if (_this.hasXAxis (_this.values.currentChartType))
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

    const dialogRef = this.dialog.open (MsfDashboardControlVariablesComponent, {
      height: '90%',
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

  goToChart(): void
  {
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

    if (!this.hasXAxis (this.values.currentChartType))
    {
      this.values.xaxis = null;
      this.chartForm.get ('xaxisCtrl').reset ();
      this.chartForm.get ('xaxisCtrl').disable ();
    }
    else
      this.chartForm.get ('xaxisCtrl').enable ();

    // check the chart filters to see if the chart generation is to be enabled or not
    this.checkChartFilters ();
  }

  checkChartFilters(): void
  {
    if (!this.hasXAxis (this.values.currentChartType))
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

          // only enable x axis if the chart type is not pie, donut or radar
          if (this.hasXAxis (this.values.currentChartType))
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

    this.checkChartFilters ();
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
}
