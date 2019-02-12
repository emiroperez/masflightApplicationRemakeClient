import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { AmChartsService } from '@amcharts/amcharts3-angular';
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
  private timer: number;

  columns:any[] = []; 

  chartTypes:any[] = [
    { id: 'column', name: 'Columns' },
    { id: 'line', name: 'Lines' },                      
    { id: 'area', name: 'Area' }
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

  public variableFilterCtrl: FormControl = new FormControl();
  public xaxisFilterCtrl: FormControl = new FormControl();
  public valueFilterCtrl: FormControl = new FormControl();

  public filteredVariables: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

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
        balloonText: "Delay in [[category]] (" + object.valueField + "): <b>[[value]]</b>",
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

  makeOptions(dataProvider)
  {
    let parserDate = this.values.xaxis.id.includes ('date');

    return {
      "type" : "serial",
      "theme" : "dark",
      "legend" :
      {
        "useGraphSettings" : true
      },
      "dataProvider" : dataProvider.data,
      "synchronizeGrid" :true,
      "valueAxes" : [{
        "gridColor" : "#888888",
        "gridAlpha" : 0.4,
        "dashLength" : 0
      }],
      "graphs" : this.buildGraphs (dataProvider.filter),
      "plotAreaFillAlphas" : 1,
      "plotAreaFillColors" :"#222222",
      "plotAreaBorderColor" :"#888888",
      "plotAreaBorderAlpha" : 0.4,
      "depth3D" : 0,
      "angle" : 30,
      "categoryField" : this.values.xaxis.id,
      "categoryAxis" :
      {
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

  zoomChart()
  {
    let chart = this.values.chart2;
    let lastIndex =  Math.round (chart.dataProvider.length - (chart.dataProvider.length / 2));
    chart.zoomToIndexes (0, lastIndex);  
  }

  ngOnInit()
  {
    this.values.function = this.functions[0];

    if (this.values.currentChartType == null)
      this.values.currentChartType = this.chartTypes[0];
  }

  ngAfterViewInit(): void {
    if (this.values.chartGenerated)
      this.storeChartValues ();
  }

  // sets the initial value after the filteredBanks are loaded initially
  setInitialValue()
  {
    this.filteredVariables
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.variableSelect.compareWith = (a: any, b: any) => a.id === b.id;
        this.xaxisSelect.compareWith = (a: any, b: any) => a.id === b.id;
        this.valueSelect.compareWith = (a: any, b: any) => a.id === b.id;
      });
  }

  private filterVariables(filterCtrl)
  {
    if (!this.columns)
      return;

    // get the search keyword
    let search = filterCtrl.value;
    if (!search)
    {
      this.filteredVariables.next(this.columns.slice ());
      return;
    }

    search = search.toLowerCase ();
    this.filteredVariables.next (
      this.columns.filter (a => a.name.toLowerCase ().indexOf (search) > -1)
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

  loadChartData(handlerSuccess, handlerError) {
    this.globals.isLoading = true;
    let urlBase = this.values.currentOptionUrl + "?" + this.getParameters ();
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999&page_number=0";
    console.log(urlBase);
    let urlArg = encodeURIComponent(urlBase);
    let url = this.service.host + "/getChartData?url=" + urlArg + "&variable=" + this.values.variable.id + "&xaxis=" +
      this.values.xaxis.id + "&valueColumn=" + this.values.valueColumn.id + "&function=" + this.values.function.id;
    this.http.get(this, url, handlerSuccess, handlerError, null);
  }

  loadData()
  {
    this.globals.startTimestamp = new Date();
    this.loadChartData(this.handlerSuccess, this.handlerError);
  }

  ngOnDestroy()
  {
    this._onDestroy.next();
    this._onDestroy.complete();

    clearInterval (this.timer);

    if (this.values.chart2)
      this.AmCharts.destroyChart (this.values.chart2);
  }

  handlerSuccess(_this,data)
  {
    _this.values.chart2 = _this.AmCharts.makeChart ("msf-dashboard-chart-display-" + _this.columnPos + "-" + _this.rowPos, _this.makeOptions(data));
    _this.values.chart2.addListener ("dataUpdated", _this.zoomChart);
    _this.chartTypeChange (_this.values.currentChartType);
    _this.values.displayChart = true;
    _this.values.chartGenerated = true;
    _this.globals.isLoading = false;
  }

  loadChartFilterValues (component)
  {
    this.globals.isLoading = true;
    this.getChartFilterValues (component.id, this.addChartFilterValues);
    this.values.currentOptionUrl = component.baseUrl;
  }

  handlerError(_this,result)
  {
    console.log(result);
    _this.globals.isLoading = false;  
  }

  getChartFilterValues(id, handlerSuccess)
  {
    this.service.getChartFilterValues (this, id, handlerSuccess, this.handlerError);
  }

  addChartFilterValues(_this, data)
  {
    _this.columns = [];
    for (let columnConfig of data)
      _this.columns.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel } );

    _this.searchChange (_this.variableFilterCtrl);
    _this.searchChange (_this.xaxisFilterCtrl);
    _this.searchChange (_this.valueFilterCtrl);

    _this.setInitialValue ();

    // initiate another query to get the category arguments
    _this.service.loadOptionCategoryArguments (_this, _this.values.currentOption, _this.setCategories, _this.handlerError);
  }

  setCategories(_this, data)
  {
    _this.values.currentOptionCategories = [];
    for (let optionCategory of data)
      _this.values.currentOptionCategories.push (optionCategory.categoryArgumentsId);

    _this.globals.isLoading = false;

    _this.chartForm.get ('variableCtrl').enable ();
    _this.chartForm.get ('xaxisCtrl').enable ();
    _this.chartForm.get ('valueCtrl').enable ();

    _this.variableCtrlBtnEnabled = true;
  }

  searchChange(filterCtrl)
  {
    // load the initial airport list
    this.filteredVariables.next(this.columns.slice());
    // listen for search field value changes
    filterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterVariables(filterCtrl);
      });
  }

  chartTypeChange(type)
  {
    switch (type.id)
    {
      case 'line':
        this.changeChartConfig('line', 1, 0);
        break;

      case 'area':
        this.changeChartConfig('line', 1, 0.3);
        break;

      case 'column':
        this.changeChartConfig('column', 0, 0.9);
        break;
    }
  }

  changeChartConfig(type, lineAlpha, fillAlphas)
  {
    for (let graph of this.values.chart2.graphs)
    {
      graph.type = type;
      graph.lineAlpha = lineAlpha;
      graph.fillAlphas = fillAlphas;
    }
      
    this.values.chart2.validateNow();
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
      this.temp = new MsfDashboardChartValues (this.values.options, this.values.chartName);
    else
    {
      this.temp.options = this.values.options;
      this.temp.chartName = this.values.chartName;
    }

    this.temp.displayChart = this.values.displayChart;
    this.temp.currentOptionUrl = this.values.currentOptionUrl;
    this.temp.currentChartType = this.values.currentChartType;
    this.temp.currentOption = this.values.currentOption;
    this.temp.currentOptionCategories = this.values.currentOptionCategories;
    this.temp.variable = this.values.variable;
    this.temp.xaxis = this.values.xaxis;
    this.temp.valueColumn = this.values.valueColumn;
    this.temp.function = this.values.function;
    this.temp.chart2 = this.values.chart2;
    this.temp.chartGenerated = this.values.chartGenerated;
  }

  goToChartConfiguration(): void
  {
    this.values.displayChart = false;
    this.storeChartValues();
  }

  goToChart(): void
  {
    this.values.displayChart = true;

    // restore values from temp if the user decide to return to the chart
    // without generating it
    this.temp.displayChart = true;
    this.values.options = this.temp.options;
    this.values.chartName = this.temp.chartName;
    this.values.currentOptionUrl = this.temp.currentOptionUrl;
    this.values.currentChartType = this.temp.currentChartType;
    this.values.currentOption = this.temp.currentOption;
    this.values.currentOptionCategories = this.temp.currentOptionCategories;
    this.values.variable = this.temp.variable;
    this.values.xaxis = this.temp.xaxis;
    this.values.valueColumn = this.temp.valueColumn;
    this.values.function = this.temp.function;
    this.values.chart2 = this.temp.chart2;
    this.values.chartGenerated = this.temp.chartGenerated;
  }

  checkChartFilters(): void
  {
    if (this.values.variable != null && this.values.xaxis != null && this.values.valueColumn != null)
      this.generateBtnEnabled = true;
    else
      this.generateBtnEnabled = false;
  }
}
