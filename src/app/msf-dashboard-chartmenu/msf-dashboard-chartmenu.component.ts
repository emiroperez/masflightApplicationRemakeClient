import { Component, OnInit, ViewChild, Input, ChangeDetectorRef } from '@angular/core';
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
    { id: 'bars', name: 'Bars' },
    { id: 'hbars', name: 'Horizontal Bars' },
    { id: 'line', name: 'Lines' },                      
    { id: 'area', name: 'Area' },
    { id: 'pie', name: 'Pie' },
    { id: 'donut', name: 'Donut' }
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
    private formBuilder: FormBuilder, private cdRef: ChangeDetectorRef)
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
        balloonText: "[[category]] (" + object.valueField + "): <b>[[value]]</b>",
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
    if (this.values.currentChartType.id === 'pie'
      || this.values.currentChartType.id === 'donut')
    {
      return {
        "type" : "pie",
        "theme" : "dark",
        "dataProvider" : dataProvider.dataProvider,
        "valueField" : dataProvider.valueField,
        "titleField" : dataProvider.titleField,
        "colors" : dataProvider.colors,
        "color" : "#ffffff",
        "labelColorField" : "#ffffff",
        "labelTickColor" : "#ffffff",
        "balloon" :
        {
          "fixedPosition" : true
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
      "zoomOutButtonImage" : "lensWhite",
      "color" : "#ffffff",
      "zoomOutButtonColor" : "#ffffff",
      "zoomOutButtonRollOverAlpha" : "0.5",
      "plotAreaFillColors" :"#222222",
      "plotAreaBorderColor" :"#888888",
      "plotAreaBorderAlpha" : 0.4,
      "depth3D" : 0,
      "angle" : 30,
      "categoryField" : this.values.xaxis.id,
      "rotate" : (this.values.currentChartType.id == 'hbars' ? true : false),
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

  zoomChart(): void
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

    this.optionSearchChange (this.dataFormFilterCtrl);
  }

  ngAfterViewInit(): void
  {
    if (this.values.chartGenerated)
      this.storeChartValues ();
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
    if (!this.columns)
      return;

    // get the search keyword
    let search = filterCtrl.value;
    if (!search)
    {
      this.filteredVariables.next (this.columns.slice ());
      return;
    }

    search = search.toLowerCase ();
    this.filteredVariables.next (
      this.columns.filter (a => a.name.toLowerCase ().indexOf (search) > -1)
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

  loadChartData(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg;

    this.globals.isLoading = true;
    urlBase = this.values.currentOptionUrl + "?" + this.getParameters ();
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999&page_number=0";
    console.log (urlBase);
    urlArg = encodeURIComponent (urlBase);
    url = this.service.host + "/getChartData?url=" + urlArg + "&variable=" + this.values.variable.id +
      "&valueColumn=" + this.values.valueColumn.id + "&function=" + this.values.function.id;

    // don't use the xaxis parameter if the chart type is pie or donut
    if (this.values.currentChartType.id === 'pie' || this.values.currentChartType.id === 'donut')
      url += "&chartType=pie";
    else
      url += "&xaxis=" + this.values.xaxis.id;

    this.http.get (this, url, handlerSuccess, handlerError, null);
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

    if (this.values.chart2)
      this.AmCharts.destroyChart (this.values.chart2);
  }

  handlerSuccess(_this, data): void
  {
    if (((_this.values.currentChartType.id === 'pie' || _this.values.currentChartType.id === 'donut')
      && data.dataProvider == null) ||
      ((_this.values.currentChartType.id !== 'pie' && _this.values.currentChartType.id !== 'donut')
      && !data.filter.length))
    {
      // TODO: Display a dialog which mentions that no data is found
      _this.values.chartGenerated = false;
      _this.globals.isLoading = false;
      return;
    }

    _this.values.chart2 = _this.AmCharts.makeChart ("msf-dashboard-chart-display-" + _this.columnPos + "-" + _this.rowPos, _this.makeOptions(data));
    _this.values.chart2.addListener ("dataUpdated", _this.zoomChart);
    _this.chartTypeChange (_this.values.currentChartType);
    _this.values.displayChart = true;
    _this.values.chartGenerated = true;
    _this.globals.isLoading = false;
  }

  loadChartFilterValues(component): void
  {
    this.globals.isLoading = true;
    this.values.currentOptionUrl = component.baseUrl;
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
    _this.columns = [];
    for (let columnConfig of data)
      _this.columns.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel } );

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

    if (_this.values.currentChartType.id !== 'pie' && _this.values.currentChartType.id !== 'donut')
      _this.chartForm.get ('xaxisCtrl').enable ();

    _this.chartForm.get ('valueCtrl').enable ();
  }

  searchChange(filterCtrl): void
  {
    // load the initial airport list
    this.filteredVariables.next (this.columns.slice ());
    // listen for search field value changes
    filterCtrl.valueChanges
      .pipe (takeUntil (this._onDestroy))
      .subscribe (() => {
        this.filterVariables (filterCtrl);
      });
  }

  optionSearchChange(filterCtrl): void
  {
    // load the initial airport list
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
        this.changeChartConfig ('line', 1, 0.3);
        break;

      case 'bars':
      case 'hbars':
        this.changeChartConfig ('column', 0, 0.9);
        break;

      case 'pie':
        this.changeChartConfig ('pie', 0, 0);
        break;

      case 'donut':
        this.changeChartConfig ('pie', 0, 40);
        break;
    }
  }

  changeChartConfig(type, param1, param2): void
  {
    if (type === 'pie')
    {
      let graph = this.values.chart2;

      graph.radius = param1;
      graph.innerRadius = param2;
    }
    else
    {
      for (let graph of this.values.chart2.graphs)
      {
        graph.type = type;
        graph.lineAlpha = param1;
        graph.fillAlphas = param2;
      }
    }
      
    this.values.chart2.validateNow ();
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

  // save chart data into a temporary value by performing a deep copy
  storeChartValues(): void
  {
    /*
    if (!this.temp)
      this.temp = new MsfDashboardChartValues (this.values.options, this.values.chartName);
    else
    {
      this.temp.options = { ...this.values.options };
      this.temp.chartName = this.values.chartName;
    }

    this.temp.displayChart = this.values.displayChart;
    this.temp.currentOptionUrl = this.values.currentOptionUrl;
    this.temp.currentChartType = JSON.parse (JSON.stringify (this.values.currentChartType));
    this.temp.currentOption = JSON.parse (JSON.stringify (this.values.currentOption));
    this.temp.currentOptionCategories = JSON.parse (JSON.stringify (this.values.currentOptionCategories));
    this.temp.variable = JSON.parse (JSON.stringify (this.values.variable));
    this.temp.xaxis = JSON.parse (JSON.stringify (this.values.xaxis));
    this.temp.valueColumn = JSON.parse (JSON.stringify (this.values.valueColumn));
    this.temp.function = JSON.parse (JSON.stringify (this.values.function));
    this.temp.chart2 = this.values.chart2; // this one will be never modified unless the chart is generated again
    this.temp.chartGenerated = true; // the chart is already generated when returning to the configuration
    */
  }

  goToChartConfiguration(): void
  {
    this.values.displayChart = false;
    this.storeChartValues ();
  }

  goToChart(): void
  {
    this.values.displayChart = true;

    /*
    // discard changes with a deep copy from temp if the user decide to
    // return to the chart without generating it again
    this.values.displayChart = this.temp.displayChart = true;
    this.values.options = { ...this.temp.options };
    this.values.chartName = this.temp.chartName;
    this.values.currentOptionUrl = this.temp.currentOptionUrl;
    this.values.currentChartType = JSON.parse (JSON.stringify (this.temp.currentChartType));
    this.values.currentOption = JSON.parse (JSON.stringify (this.temp.currentOption));
    this.values.currentOptionCategories = JSON.parse (JSON.stringify (this.temp.currentOptionCategories));
    this.values.variable = JSON.parse (JSON.stringify (this.temp.variable));
    this.values.xaxis = JSON.parse (JSON.stringify (this.temp.xaxis));
    this.values.valueColumn = JSON.parse (JSON.stringify (this.temp.valueColumn));
    this.values.function = JSON.parse (JSON.stringify (this.temp.function));
    this.values.chart2 = this.temp.chart2; // this one will be never modified unless the chart is generated again
    this.values.chartGenerated = this.temp.chartGenerated;

    this.cdRef.detectChanges();
    */
  }

  // check if the x axis should be enabled or not depending of the chart type
  checkChartType(): void
  {
    if (this.values.currentOptionCategories == null)
      return;

    if (this.values.currentChartType.id === 'pie' || this.values.currentChartType.id === 'donut')
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
    if (this.values.currentChartType.id === 'pie' || this.values.currentChartType.id === 'donut')
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
}
