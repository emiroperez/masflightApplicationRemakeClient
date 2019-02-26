import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { AmChart, AmChartsService } from '@amcharts/amcharts3-angular';
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
import { MsfConfirmationDialogComponent } from '../msf-confirmation-dialog/msf-confirmation-dialog.component';

@Component({
  selector: 'app-msf-dashboard-chartmenu',
  templateUrl: './msf-dashboard-chartmenu.component.html',
  styleUrls: ['./msf-dashboard-chartmenu.component.css']
})
export class MsfDashboardChartmenuComponent implements OnInit {
  utils: Utils;

  variableCtrlBtnEnabled: boolean = false;
  generateBtnEnabled: boolean = false;

  chartForm: FormGroup;
  chart: AmChart;

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
    { id: 'min', name: 'Min' }
  ]; 

  @Input()
  values: MsfDashboardChartValues;
  temp: MsfDashboardChartValues;

  @Input()
  columnPos: number;

  @Input()
  rowPos: number;

  @Input()
  height: number;

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

  constructor(private AmCharts: AmChartsService, public globals: Globals,
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
    this.AmCharts.addInitHandler (function (chart)
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
    }, [ "serial" ]);
  }

  buildGraphs(dataProvider)
  {
    let graphs = [];

    for (let object of dataProvider)
    {
      graphs.push
      ({
        //balloonText: "[[category]] (" + object.valueField + "): <b>[[value]]</b>",
        showBalloon : false,
        fillAlphas: 0.9,
        lineAlpha: 0.2,
        valueAxis: object.valueAxis,
        lineColor: object.lineColor,
        title: object.valueField,
        type: "column",
        valueField: object.valueField
      });
    }

    return graphs;
  }

  setChartStackType(): string
  {
    switch (this.values.currentChartType.id)
    {
      case 'sbars':
      case 'hsbars':
      case 'sarea':
        return "regular";

      default:
        return "none";
    }
  }

  makeOptions(dataProvider)
  {
    if (this.values.currentChartType.id === 'radar')
    {
      return {
        "type" : "radar",
        "theme" : "dark",
        "dataProvider" : dataProvider.dataProvider,
        "colors" : dataProvider.colors,
        "valueAxes" : [{
          "axisTitleOffset" : 20,
          "axisColor" : "#30303d",
          "gridColor" : "#30303d",
          "axisAlpha" : 1,
          "gridAlpha" : 1,
          "minimum" : 0
        }],
        "color" : "#ffffff",
        "graphs": [{
          "balloonText" : "[[category]]: <b>[[value]]</b>",
          "bullet" : "round",
          "valueField" : dataProvider.valueField,
          "lineAlpha": 1
        }],
        "categoryField": this.values.variable.id,
        "export" :
        {
          "enabled" : true,
          "position" : "bottom-right"
        },
        "chartCursor" :
        {
          "cursorPosition" : "mouse"
        }
      };
    }
    else if (this.values.currentChartType.id === 'pie'
      || this.values.currentChartType.id === 'donut')
    {
      return {
        "type" : "pie",
        "theme" : "dark",
        "dataProvider" : dataProvider.dataProvider,
        "valueField" : dataProvider.valueField,
        "titleField" : dataProvider.titleField,
        "colors" : dataProvider.colors,
        "labelTickAlpha" : 1,
        "labelTickColor" : "#30303d",
        "color" : "#ffffff",
        "balloon" :
        {
          "enabled" : false
        },
        "export" :
        {
          "enabled" : true,
          "position" : "bottom-right"
        },
        "chartCursor" :
        {
          "cursorPosition" : "mouse"
        }
      };
    }

    let parserDate = this.values.xaxis.id.includes ('date');

    return {
      "type" : "serial",
      "theme" : "dark",
      "legend" :
      {
        "useGraphSettings" : true,
        "color" : "#ffffff"
      },
      "dataProvider" : dataProvider.data,
      "synchronizeGrid" : true,
      "guides" : [{
        "lineColor" : "#30303d",
        "lineAlpha": 1
      }],
      "valueAxes" : [{
        "stackType" : this.setChartStackType (),
        "axisColor" : "#30303d",
        "gridColor" : "#30303d",
        "gridAlpha" : 1,
        "dashLength" : 0
      }],
      "graphs" : this.buildGraphs (dataProvider.filter),
      "plotAreaFillAlphas" : 1,
      "zoomOutButtonImage" : "lensWhite",
      "zoomOutButtonRollOverAlpha" : "0.5",
      "plotAreaFillColors" : "#222222",
      "color" : "#ffffff",
      "plotAreaBorderColor" : "#222222",
      "plotAreaBorderAlpha" : 1,
      "depth3D" : 0,
      "angle" : 30,
      "categoryField" : this.values.xaxis.id,
      "rotate" : this.values.currentChartType.rotate,
      "categoryAxis" :
      {
        "axisColor" : "#30303d",
        "gridColor" : "#30303d",
        "gridAlpha" : 1,
        "gridPosition" : "start",
        "parseDates" : parserDate,
        "minorGridEnabled" : true,
        "equalSpacing": true
      },
      "export" :
      {
        "enabled" : true,
        "position" : "bottom-right"
      },
      "chartScrollbar" :
      {
        "scrollbarHeight" : 2,
        "offset" : -1,
        "backgroundAlpha" : 0.4,
        "backgroundColor" : "#888888",
        "selectedBackgroundColor" : "#67b7dc",
        "selectedBackgroundAlpha" : 1
      },
      "chartCursor" :
      {
        "cursorPosition" : "mouse"
      }
    };
  }

  zoomChart(): void
  {
    let chart = this.chart;
    let lastIndex =  Math.round (chart.dataProvider.length - (chart.dataProvider.length / 2));
    chart.zoomToIndexes (0, lastIndex);  
  }

  ngOnInit()
  {
  }

  ngAfterViewInit(): void
  {
    this.initPanelSettings ();

    if (this.values.lastestResponse)
    {
      this.chart = this.AmCharts.makeChart ("msf-dashboard-chart-display-" + this.columnPos + "-" + this.rowPos, this.makeOptions (this.values.lastestResponse));
      this.chart.addListener ("dataUpdated", this.zoomChart);
      this.chartTypeChange (this.values.currentChartType);
      this.values.chartGenerated = true;
    }
  }

  ngAfterContentInit(): void
  {
    // this part must be here because it generate an error if inserted on ngAfterViewInit
    if (this.values.lastestResponse)
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
    if (this.values.currentChartType.id === 'pie' || this.values.currentChartType.id === 'donut'
      || this.values.currentChartType.id === 'radar')
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
      this.AmCharts.destroyChart (this.chart);
  }

  handlerSuccess(_this, data): void
  {
    if (((_this.values.currentChartType.id === 'pie' || _this.values.currentChartType.id === 'donut'
      || _this.values.currentChartType.id === 'radar')
      && data.dataProvider == null) ||
      ((_this.values.currentChartType.id !== 'pie' && _this.values.currentChartType.id !== 'donut'
        && _this.values.currentChartType.id !== 'radar')
      && !data.filter.length))
    {
      // TODO: Display a dialog which mentions that no data is found
      _this.values.chartGenerated = false;
      _this.globals.isLoading = false;
      return;
    }

    _this.chart = _this.AmCharts.makeChart ("msf-dashboard-chart-display-" + _this.columnPos + "-" + _this.rowPos, _this.makeOptions(data));
    _this.chart.addListener ("dataUpdated", _this.zoomChart);
    _this.chartTypeChange (_this.values.currentChartType);
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
    // TODO: Display a dialog that display the message
    console.log (result);
    _this.values.chartGenerated = false;
    _this.globals.isLoading = false;  
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

    if (_this.values.currentChartType.id !== 'pie' && _this.values.currentChartType.id !== 'donut'
      && _this.values.currentChartType.id !== 'radar')
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
    if (type === 'pie')
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
      
    this.chart.validateNow ();
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
      this.temp = new MsfDashboardChartValues (this.values.options, this.values.chartName, this.values.id);
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

    // prepare the combo boxes
    this.optionSearchChange (this.dataFormFilterCtrl);

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
          if (this.values.currentChartType.id !== 'pie' && this.values.currentChartType.id !== 'donut'
            && this.values.currentChartType.id !== 'radar')
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
    return this.height - 14;
  }
}
