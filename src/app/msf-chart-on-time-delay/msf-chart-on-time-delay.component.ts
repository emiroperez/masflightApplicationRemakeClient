import { Component, OnInit, ViewChild } from '@angular/core';
import { AmChartsService, AmChart } from "@amcharts/amcharts3-angular";
import { Globals } from '../globals/Globals';
import { ApiClient } from '../api/api-client';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { MatSelect } from '@angular/material';
import { takeUntil, take } from 'rxjs/operators';
import { Utils } from '../commons/utils';
import { MsfTableComponent } from '../msf-table/msf-table.component';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-msf-chart-on-time-delay',
  templateUrl: 'msf-chart-on-time-delay.component.html',
  styleUrls: ['./msf-chart-on-time-delay.component.css']
})
export class MsfChartOnTimeDelayComponent implements OnInit {

  private chart2: AmChart;
  private timer: number;

  type: string = "airport";

  variable;
  xaxis;
  valueColumn;
  function;

  dataSource;

  columns:any[] = []; 

  functions:any[] = [{id:'avg',name:'Average'},
                     {id:'sum',name:'Sum'},
                     {id:'max',name:'Max'},
                     {id:'min',name:'Min'}
                    ]; 

  chartTypes:any[] = [{id:'column',name:'Columns'},
                      {id:'line',name:'Lines'},                      
                      {id:'area',name:'Area'}
                    ]; 

  currentChartType;

  utils: Utils;

  msfTableRef: MsfTableComponent;

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

  constructor(private AmCharts: AmChartsService, public globals: Globals, private service: ApplicationService) {
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
        "gridColor": "#FFFFFF",
        "gridAlpha": 0.2,
        "dashLength": 0
      }],
      "graphs": this.buildGraphs(dataProvider.filter),
      "plotAreaFillAlphas": 0.1,
      "depth3D": 20,
      "angle": 30,
      "categoryField": this.xaxis.id,
      "categoryAxis": {
          "gridPosition": "start",
          "parseDates": parserDate,
          "minorGridEnabled": true,
          "equalSpacing": true
      },
      "export": {
        "enabled": true,
          "position": "bottom-right"
       },
       "chartScrollbar": {
            "scrollbarHeight":2,
            "offset":-1,
            "backgroundAlpha":0.1,
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
    this.function = this.functions[0];
    this.currentChartType = this.chartTypes[0];
  }

  ngAfterViewInit() {
    this.setInitialValue();
    this.setColumns();    
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



  loadData(){
    this.globals.startTimestamp = new Date();
    if(this.globals.currentOption.tabType === 'usageStatistics')
      this.service.loadChartDataUsageStatistics(this, this.handlerSuccess, this.handlerError);
    else
      this.service.loadChartData(this, this.handlerSuccess, this.handlerError);
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
    clearInterval(this.timer);
    if (this.chart2) {
      this.AmCharts.destroyChart(this.chart2);
    }
  }

  handlerSuccess(_this,data){
    _this.globals.endTimestamp = new Date();
    _this.chart2 = _this.AmCharts.makeChart('chartdiv2', _this.makeOptions(data));
    _this.chart2.addListener("dataUpdated", _this.zoomChart);
    _this.zoomChart();
    _this.chartTypeChange(_this.currentChartType);
    _this.globals.selectedIndex = 3;
    _this.globals.isLoading = false; 
  }

  handlerError(_this,result){
    console.log(result);
    _this.globals.isLoading = false;  
  }

  setColumns(){
    for(let columnConfig of this.globals.metadata){
      this.columns.push({id: columnConfig.columnName, name: columnConfig.columnLabel});
    }
    // set initial selection
    this.variableCtrl.setValue([this.columns[0]]);
    this.xaxisCtrl.setValue([this.columns[0]]);
    this.valueCtrl.setValue([this.columns[0]]);

    this.searchChange(this.variableFilterCtrl);
    this.searchChange(this.xaxisFilterCtrl);
    this.searchChange(this.valueFilterCtrl);
  }

  searchChange(filterCtrl){
    // load the initial airport list
    this.filteredVariables.next(this.columns.slice());
    // listen for search field value changes
    filterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterVariables(filterCtrl);
      });
  }


  setMsfTableRef(msfTableRef){
    this.msfTableRef = msfTableRef;
  }

  chartTypeChange(type){
    switch (type.id) {
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

  changeChartConfig(type, lineAlpha, fillAlphas){
    for( let graph of this.chart2.graphs){
      graph.type = type;
      graph.lineAlpha =lineAlpha;
      graph.fillAlphas =fillAlphas;
    }      
    this.chart2.validateNow();
  }

}
