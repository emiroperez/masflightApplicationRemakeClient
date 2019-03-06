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
    { id: 'bars', name: 'Bars', rotate: false },
    { id: 'hbars', name: 'Horizontal Bars', rotate: true },
    { id: 'sbars', name: 'Stacked Bars', rotate: false },
    { id: 'hsbars', name: 'Horizontal Stacked Bars', rotate: true },
    { id: 'line', name: 'Lines', rotate: false },                      
    { id: 'area', name: 'Area', rotate: false },
    { id: 'sarea', name: 'Stacked Area', rotate: false },
    { id: 'pie', name: 'Pie', rotate: false },
    { id: 'donut', name: 'Donut', rotate: false },
    { id: 'radar', name: 'Radar', rotate: false }
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

    // add function to sort from the smallest value to the larger one
    /*this.AmCharts.addInitHandler (function (chart)
    {
      for (var i = 0; i < chart.dataProvider.length; i++)
      {
        // Collect all values for all graphs in this data point
        var row = chart.dataProvider[i];
        var values = [];

        for (var g = 0; g < chart.graphs.length; g++)
        {
          var graph = chart.graphs[g];

          values.push
          ({
            "value" : row[graph.valueField],
            "graph" : graph
          });
        }

        // Sort by value
        values.sort (function(a, b)
        {
          return a.value - b.value;
        });

        // Apply 'columnIndexField'
        for (var x = 0; x < values.length; x++)
        {
          var graph = values[x].graph;

          graph.columnIndexField = graph.valueField + "_index";
          row[graph.columnIndexField] = x;
        }
      }
    }, [ "serial" ]);*/
  }

  setChartTypeStack(): boolean
  {
    switch (this.values.currentChartType.id)
    {
      case 'sbars':
      case 'hsbars':
      case 'sarea':
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
  createHorizColumnSeries(_this, chart, field, name): void
  {
    // Set up series
    let series = chart.series.push (new am4charts.ColumnSeries ());
    series.name = name;
    series.dataFields.valueX = field;
    series.dataFields.categoryY = _this.values.xaxis.id;
    series.sequencedInterpolation = true;

    // Check chart type if it should be stacked or not
    series.stacked = _this.setChartTypeStack ();
  
    // Configure columns
    series.columns.template.strokeWidth = 0;
    series.columns.template.width = am4core.percent (60);
    series.columns.template.tooltipText = "{name}[/]\n[font-size:14px]{categoryY}: {valueX}";
  
    return series;
  }

  // Function to create vertical column chart series
  createVertColumnSeries(_this, chart, field, name): void
  {
    // Set up series
    let series = chart.series.push (new am4charts.ColumnSeries ());
    series.name = name;
    series.dataFields.valueY = field;
    series.dataFields.categoryX = _this.values.xaxis.id;
    series.sequencedInterpolation = true;

    // Check chart type if it should be stacked or not
    series.stacked = _this.setChartTypeStack ();
  
    // Configure columns
    series.columns.template.strokeWidth = 0;
    series.columns.template.width = am4core.percent (60);
    series.columns.template.tooltipText = "{name}[/]\n[font-size:14px]{categoryX}: {valueY}";
  
    return series;
  }

  // Function to create vertical line chart series
  createVertLineSeries(_this, chart, field, name): void
  {
    // Set up series
    let series = chart.series.push (new am4charts.LineSeries ());
    series.name = name;
    series.dataFields.valueX = field;
    series.dataFields.categoryY = _this.values.xaxis.id;
    series.sequencedInterpolation = true;
    series.strokeWidth = 2;
    series.minBulletDistance = 10;
    series.tooltipText = "{valueX}";
    series.tooltip.pointerOrientation = "vertical";
    series.tooltip.background.cornerRadius = 20;
    series.tooltip.background.fillOpacity = 0.5;
    series.tooltip.label.padding (12,12,12,12);

    // Fill area below line for area chart types
    if (_this.values.currentChartType.id === 'area' || _this.values.currentChartType.id === 'sarea')
      series.fillOpacity = 0.3;

    // Check chart type if it should be stacked or not
    series.stacked = _this.setChartTypeStack ();
  
    return series;
  }

  // Function to create horizontal line chart series
  createHorizLineSeries(_this, chart, field, name): void
  {
    // Set up series
    let series = chart.series.push (new am4charts.LineSeries ());
    series.name = name;
    series.dataFields.valueY = field;
    series.dataFields.categoryX = _this.values.xaxis.id;
    series.sequencedInterpolation = true;
    series.strokeWidth = 2;
    series.minBulletDistance = 10;
    series.tooltipText = "{valueY}";
    series.tooltip.pointerOrientation = "horizontal";
    series.tooltip.background.cornerRadius = 20;
    series.tooltip.background.fillOpacity = 0.5;
    series.tooltip.label.padding (12,12,12,12);

    // Fill area below line for area chart types
    if (_this.values.currentChartType.id === 'area' || _this.values.currentChartType.id === 'sarea')
      series.fillOpacity = 0.3;

    // Check chart type if it should be stacked or not
    series.stacked = _this.setChartTypeStack ();
  
    return series;
  }

  makeChart(chartInfo): void
  {
    this.zone.runOutsideAngular (() => {
      let chart;

      // Check chart type before generating it
      if (this.values.currentChartType.id === 'pie'
        || this.values.currentChartType.id === 'donut')
      {
        chart = am4core.create ("msf-dashboard-chart-display-" + this.columnPos + "-" + this.rowPos, am4charts.PieChart);
        chart.data = chartInfo.dataProvider;

        // Set inner radius for donut chart
        if (this.values.currentChartType.id === 'donut')
          chart.innerRadius = am4core.percent (60);

        // Configure Pie Chart
        var pieSeries = chart.series.push (new am4charts.PieSeries ());
        pieSeries.dataFields.value = chartInfo.valueField;
        pieSeries.dataFields.category = chartInfo.titleField;

        // This creates initial animation
        pieSeries.hiddenState.properties.opacity = 1;
        pieSeries.hiddenState.properties.endAngle = -90;
        pieSeries.hiddenState.properties.startAngle = -90;

        // Set colors
        pieSeries.ticks.template.strokeOpacity = 1;
        pieSeries.ticks.template.stroke = am4core.color ("#30303d");
        pieSeries.ticks.template.strokeWidth = 1;

        var colorSet = new am4core.ColorSet ();
        colorSet.list = chartInfo.colors.map (function(color) {
          return am4core.color (color);
        });
        pieSeries.colors = colorSet;
      }
      else
      {
        chart = am4core.create ("msf-dashboard-chart-display-" + this.columnPos + "-" + this.rowPos, am4charts.XYChart);
        chart.data = chartInfo.data;

        if (this.values.currentChartType.rotate)
        {
          // Set category axis properties
          var categoryAxis = chart.yAxes.push (new am4charts.CategoryAxis ());
          categoryAxis.dataFields.category = this.values.xaxis.id;
          categoryAxis.renderer.grid.template.location = 0;
          categoryAxis.renderer.grid.template.strokeOpacity = 1;
          categoryAxis.renderer.grid.template.stroke = am4core.color ("#30303d");
          categoryAxis.renderer.grid.template.strokeWidth = 1;
          categoryAxis.renderer.labels.template.fill = am4core.color ("#ffffff");

          // Set value axis properties
          var valueAxis = chart.xAxes.push (new am4charts.ValueAxis ());
          valueAxis.renderer.grid.template.strokeOpacity = 1;
          valueAxis.renderer.grid.template.stroke = am4core.color ("#30303d");
          valueAxis.renderer.grid.template.strokeWidth = 1;
          valueAxis.renderer.labels.template.fill = am4core.color ("#ffffff");

          // Create the series and set colors
          chart.colors.list = [];
          if (this.values.currentChartType.id === 'line' || this.values.currentChartType.id === 'area'
            || this.values.currentChartType.id === 'sarea')
          {
            for (let object of chartInfo.filter)
            {
              chart.colors.list.push (am4core.color (object.lineColor));
              this.createVertLineSeries (this, chart, object.valueField, object.valueAxis);
            }

            // Add cursor
            chart.cursor = new am4charts.XYCursor ();
            chart.cursor.xAxis = valueAxis;
            chart.cursor.snapToSeries = chart.series;
          }
          else
          {
            for (let object of chartInfo.filter)
            {
              chart.colors.list.push (am4core.color (object.lineColor));
              this.createHorizColumnSeries (this, chart, object.valueField, object.valueAxis);
            }
          }

          // Add scrollbar into the chart for zooming
          chart.scrollbarY = new am4core.Scrollbar ();
          chart.scrollbarY.background.fill = am4core.color ("#67b7dc");
        }
        else
        {
          var categoryAxis = chart.xAxes.push (new am4charts.CategoryAxis ());
          categoryAxis.dataFields.category = this.values.xaxis.id;
          categoryAxis.renderer.grid.template.location = 0;
          categoryAxis.renderer.grid.template.strokeOpacity = 1;
          categoryAxis.renderer.grid.template.stroke = am4core.color ("#30303d");
          categoryAxis.renderer.grid.template.strokeWidth = 1;
          categoryAxis.renderer.labels.template.fill = am4core.color ("#ffffff");

          var valueAxis = chart.yAxes.push (new am4charts.ValueAxis ());
          valueAxis.renderer.grid.template.strokeOpacity = 1;
          valueAxis.renderer.grid.template.stroke = am4core.color ("#30303d");
          valueAxis.renderer.grid.template.strokeWidth = 1;
          valueAxis.renderer.labels.template.fill = am4core.color ("#ffffff");

          chart.colors.list = [];
          if (this.values.currentChartType.id === 'line' || this.values.currentChartType.id === 'area'
            || this.values.currentChartType.id === 'sarea')
          {
            for (let object of chartInfo.filter)
            {
              chart.colors.list.push (am4core.color (object.lineColor));
              this.createHorizLineSeries (this, chart, object.valueField, object.valueAxis);
            }

            chart.cursor = new am4charts.XYCursor ();
            chart.cursor.xAxis = valueAxis;
            chart.cursor.snapToSeries = chart.series;
          }
          else
          {
            for (let object of chartInfo.filter)
            {
              chart.colors.list.push (am4core.color (object.lineColor));
              this.createVertColumnSeries (this, chart, object.valueField, object.valueAxis);
            }
          }

          chart.scrollbarX = new am4core.Scrollbar ();
          chart.scrollbarX.background.fill = am4core.color ("#67b7dc");
        }

        // Display Legend
        chart.legend = new am4charts.Legend ();
        chart.legend.labels.template.fill = am4core.color ("#ffffff");

        // Set date format
        if (this.values.xaxis.id.includes ('date'))
          chart.dateFormatter.inputDateFormat = "MM/dd/yyyy";
      }

      // Add export button
      chart.exporting.menu = new am4core.ExportMenu ();
      chart.exporting.menu.verticalAlign = "bottom";

      this.chart = chart;
    });
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

  compareFilterValues(): void
  {
    this.filteredVariables
      .pipe (take (1), takeUntil (this._onDestroy))
      .subscribe (() => {
        this.variableSelect.compareWith = (a: any, b: any) => a.id === b.id;
        this.xaxisSelect.compareWith = (a: any, b: any) => a.id === b.id;
        this.valueSelect.compareWith = (a: any, b: any) => a.id === b.id;
      });
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
    return (chartType.id !== 'pie' && chartType.id !== 'donut' && chartType.id !== 'radar');
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
    this.compareFilterValues ();
    this.loadChartData (this.handlerSuccess, this.handleChartError);
  }

  ngOnDestroy()
  {
    this._onDestroy.next ();
    this._onDestroy.complete ();

    clearInterval (this.timer);

    if (this.chart)
    {
      this.zone.runOutsideAngular (() => {
        if (this.chart)
          this.chart.dispose ();
      });
    }
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

  chartTypeChange(type): void
  {
    switch (type.id)
    {
      case 'line':
        this.changeChartConfig ('line', 1, 0);
        break;

      case 'area':
      case 'sarea':
        this.changeChartConfig ('line', 1, 0.3);
        break;

      case 'bars':
      case 'hbars':
      case 'sbars':
      case 'hsbars':
        this.changeChartConfig ('column', 0, 0.9);
        break;

      case 'pie':
        this.changeChartConfig ('pie', 0, 0);
        break;

      case 'donut':
        this.changeChartConfig ('pie', 0, 60);
        break;

      case 'radar':
        this.changeChartConfig ('radar', 2, 0.15);
        break;
    }
  }

  changeChartConfig(type, param1, param2): void
  {
    /*if (type === 'pie')
    {
      let graph = this.chart;

      graph.radius = param1 + "%";
      graph.innerRadius = param2 + "%";
    }
    else if (type === 'radar')
    {
      let graph = this.chart;

      graph.graphs.lineThickness = param1;
      graph.valueAxes.axisAlpha = param2;
    }
    else
    {
      for (let graph of this.chart.graphs)
      {
        graph.type = type;
        graph.lineAlpha = param1;
        graph.fillAlphas = param2;
      }
    }
      
    this.chart.validateNow ();*/
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

    if (this.values.currentChartType.id === 'pie' || this.values.currentChartType.id === 'donut'
    || this.values.currentChartType.id === 'radar')
    {
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
    if (this.values.currentChartType.id === 'pie' || this.values.currentChartType.id === 'donut'
      || this.values.currentChartType.id === 'radar')
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
