import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { AmChartsService, AmChart } from '@amcharts/amcharts3-angular';
import { CategoryArguments } from '../model/CategoryArguments';
import { Globals } from '../globals/Globals';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { MatSelect } from '@angular/material';
import { takeUntil, take } from 'rxjs/operators';
import { ApiClient } from '../api/api-client';
import { Arguments } from '../model/Arguments';
import { Utils } from '../commons/utils';
import { ApplicationService } from '../services/application.service';

import { MsfDashboardControlVariablesComponent } from '../msf-dashboard-control-variables/msf-dashboard-control-variables.component';
import { MatDialog } from '@angular/material';

enum DashboardMenu
{
  CHART_CONFIGURATION = 0,
  CHART_DISPLAY,
  CONTROL_VARIABLES
};

@Component({
  selector: 'app-msf-dashboard-chartmenu',
  templateUrl: './msf-dashboard-chartmenu.component.html',
  styleUrls: ['./msf-dashboard-chartmenu.component.css']
})
export class MsfDashboardChartmenuComponent implements OnInit {
  utils: Utils;

  private chart2: AmChart;
  private timer: number;

  variable;
  xaxis;
  valueColunm;
  function;

  currentMenu:DashboardMenu = DashboardMenu.CHART_CONFIGURATION;

  columns:any[] = []; 

  chartTypes:any[] = [
    { id: 'column', name: 'Columns' },
    { id: 'line', name: 'Lines' },                      
    { id: 'area', name: 'Area' }
  ];

  functions:any[] = [{id:'avg',name:'Average'},
                     {id:'sum',name:'Sum'},
                     {id:'max',name:'Max'},
                     {id:'min',name:'Min'}
                    ]; 

  @Input()
  options:any[] = [];

  @Input()
  columnPos: number;

  @Input()
  rowPos: number;

  currentOptionUrl: String;

  currentChartType;
  currentOption: any;
  currentOptionCategories: any;

  public variableCtrl: FormControl = new FormControl();
  public variableFilterCtrl: FormControl = new FormControl();

  public xaxisCtrl: FormControl = new FormControl();
  public xaxisFilterCtrl: FormControl = new FormControl();

  public valueCtrl: FormControl = new FormControl();
  public valueFilterCtrl: FormControl = new FormControl();

  public filteredVariables: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);


  @ViewChild('variableSelect') variableSelect: MatSelect;
  @ViewChild('xaxisSelect') xaxisSelect: MatSelect;
  @ViewChild('valueSelect') valueSelect: MatSelect;

  private _onDestroy = new Subject<void>();

  constructor(private AmCharts: AmChartsService, public globals: Globals,
    private service: ApplicationService, private http: ApiClient, public dialog: MatDialog)
  {
    this.utils = new Utils();
  }

  buildGraphs(dataProvider){    
    let  graphs = [];
    for(let object of dataProvider){
      graphs.push(
        {
          balloonText: "Delay in [[category]] ("+object.valueField+"): <b>[[value]]</b>",
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

  makeOptions(dataProvider) {
    let parserDate = this.xaxis.id.includes('date');

    return {
      "type": "serial",
      "theme": "dark",
      "legend": {
          "useGraphSettings": true
      },
      "dataProvider": dataProvider.data,
      "synchronizeGrid":true,
      "valueAxes": [{
        "gridColor": "#888888",
        "gridAlpha": 0.4,
        "dashLength": 0
      }],
      "graphs": this.buildGraphs(dataProvider.filter),
      "plotAreaFillAlphas": 1,
      "plotAreaFillColors":"#222222",
      "plotAreaBorderColor":"#888888",
      "plotAreaBorderAlpha":0.4,
      "depth3D": 0,
      "angle": 30,
      "categoryField": this.xaxis.id,
      "categoryAxis": {
          "gridPosition": "start",
          "parseDates": parserDate,
          "minorGridEnabled": true
      },
      "export": {
        "enabled": true,
          "position": "bottom-right"
       },
       "chartScrollbar": {
            "scrollbarHeight":2,
            "offset":-1,
            "backgroundAlpha":0.4,
            "backgroundColor":"#888888",
            "selectedBackgroundColor":"#67b7dc",
            "selectedBackgroundAlpha":1
        },
        "chartCursor": {
            "cursorPosition": "mouse"
        },
      };
  }

  zoomChart(){
    let lastIndex =  Math.round(this.chart2.dataProvider.length - ( this.chart2.dataProvider.length/2));
    this.chart2.zoomToIndexes(0, lastIndex);  
  }

  ngOnInit() {
    this.function = {id:'avg',name:'Average'};
    this.currentChartType = this.chartTypes[0];
  }

   /**
   * Sets the initial value after the filteredBanks are loaded initially
   */
  private setInitialValue() {
    this.filteredVariables
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.variableSelect.compareWith = (a: any, b: any) => a.id === b.id;
        this.xaxisSelect.compareWith = (a: any, b: any) => a.id === b.id;
        this.valueSelect.compareWith = (a: any, b: any) => a.id === b.id;
      });
  }

  private filterVariables(filterCtrl) {
    if (!this.columns) {
      return;
    }
    // get the search keyword
    let search = filterCtrl.value;
    if (!search) {
      this.filteredVariables.next(this.columns.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredVariables.next(
      this.columns.filter(a => a.name.toLowerCase().indexOf(search) > -1)
    );
  }

  getParameters()
  {
    let params;        
           if(this.currentOptionCategories){            
                for( let i = 0; i < this.currentOptionCategories.length;i++){
                    let category: CategoryArguments = this.currentOptionCategories[i];
                    if(category && category.arguments){
                        for( let j = 0; j < category.arguments.length;j++){
                            let argument: Arguments = category.arguments[j];
                            if(params){
                                params += "&" + this.utils.getArguments(argument);
                            }else{
                                params = this.utils.getArguments(argument);
                            }
                        }
                    }        
                }
            }
    
    return params;
}

  loadChartData(handlerSuccess, handlerError) {
    this.globals.isLoading = true;
    let urlBase = this.currentOptionUrl + "?" + this.getParameters ();
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999&page_number=0";
    console.log(urlBase);
    let urlArg = encodeURIComponent(urlBase);
    let url = this.service.host + "/getChartData?url=" + urlArg + "&variable=" + this.variable.id + "&xaxis=" + this.xaxis.id + "&valueColunm=" + this.valueColunm.id + "&function=" + this.function.id;
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
    clearInterval(this.timer);
    if (this.chart2) {
      this.AmCharts.destroyChart(this.chart2);
    }
  }

  handlerSuccess(_this,data)
  {
    _this.globals.endTimestamp = new Date();
    _this.chart2 = _this.AmCharts.makeChart("msf-dashboard-chart-display-" + _this.columnPos + "-" + _this.rowPos, _this.makeOptions(data));
    _this.chart2.addListener("dataUpdated", _this.zoomChart);
    _this.chartTypeChange(_this.currentChartType);
    _this.currentMenu = DashboardMenu.CHART_DISPLAY;
    _this.globals.isLoading = false;
  }

  loadChartFilterValues (component)
  {
    this.globals.isLoading = true;
    this.getChartFilterValues (component.id, this.addChartFilterValues);
    this.currentOptionUrl = component.baseUrl;
  }

  handlerError(_this,result)
  {
    console.log(result);
    _this.globals.isLoading = false;  
  }

  getChartFilterValues(id, handlerSuccess)
  {
    let url = "/getMetaByOptionId?optionId=" + id;
    //let url = "http://localhost:8887/getMetaByOptionId?optionId=" + id;
    this.http.get(this, url, handlerSuccess, this.handlerError, null);  
  }

  addChartFilterValues(_this, data)
  {
    _this.columns = [];
    for(let columnConfig of data)
      _this.columns.push({id: columnConfig.columnName, name: columnConfig.columnLabel});

    // set initial selection
    _this.variableCtrl.setValue([_this.columns[0]]);
    _this.xaxisCtrl.setValue([_this.columns[0]]);
    _this.valueCtrl.setValue([_this.columns[0]]);

    _this.searchChange(_this.variableFilterCtrl);
    _this.searchChange(_this.xaxisFilterCtrl);
    _this.searchChange(_this.valueFilterCtrl);

    _this.setInitialValue();

    // initiate another query to get the category arguments
    _this.service.loadOptionCategoryArguments (_this, _this.currentOption, _this.setCategories, _this.handlerError);
  }

  setCategories(_this, data)
  {
    _this.currentOptionCategories = [];
    for (let optionCategory of data)
      _this.currentOptionCategories.push (optionCategory.categoryArgumentsId);

    _this.globals.isLoading = false;
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
    for (let graph of this.chart2.graphs)
    {
      graph.type = type;
      graph.lineAlpha =lineAlpha;
      graph.fillAlphas =fillAlphas;
    }
      
    this.chart2.validateNow();
  }

  goToControlVariables(): void
  {
    const dialogRef = this.dialog.open (MsfDashboardControlVariablesComponent, {
      height: '90%',
      width: '400px',
      panelClass: 'msf-dashboard-control-variables-dialog',
      data: {
        currentOptionCategories: this.currentOptionCategories,
        currentOptionId: this.currentOption.id,
        title: this.currentOption.name
      }
    });
  }

  goToChartConfiguration(): void
  {
    this.currentMenu = DashboardMenu.CHART_CONFIGURATION;
  }

  isChartConfigurationDisplayed(): boolean
  {
    return this.currentMenu == DashboardMenu.CHART_CONFIGURATION;
  }

  isChartDisplayed(): boolean
  {
    return this.currentMenu == DashboardMenu.CHART_DISPLAY;
  }

  isControlVariablesDisplayed(): boolean
  {
    return this.currentMenu == DashboardMenu.CONTROL_VARIABLES;
  }
}
