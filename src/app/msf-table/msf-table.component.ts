import { Component, OnInit, ViewChild, Input } from '@angular/core';
import {MatSort, MatTableDataSource, MatTab} from '@angular/material';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';



@Component({
  selector: 'app-msf-table',
  templateUrl: './msf-table.component.html',
  styleUrls: ['./msf-table.component.css']
})
export class MsfTableComponent implements OnInit {

  isLoading = false;
  color = 'primary';

  @Input('tabRef')
  tabRef: MatTab;

  @Input('displayedColumns')
  displayedColumns: string[] = []; 

  metadata;

  dataSource;

  actualPageNumber;

  @ViewChild(MatSort) sort: MatSort;

  constructor(public globals: Globals, private service: ApplicationService) { }

  ngOnInit() {        
  }

  ngAfterViewInit(){
    //this.globals.generateDynamicTable = false;
  }

  setMsfChartRef(msfChartRef){
    msfChartRef.setColumns(this.displayedColumns);
  }

  replaceAll(text: string){
     let re = /_/gi;
     return text.replace(re, ' ');
  }

  getData(moreResults: boolean){
    this.globals.startTimestamp = new Date();
    var pageSize = 100;
      if(moreResults){
        this.actualPageNumber++;
        this.globals.moreResults = true;
      }else{
        this.actualPageNumber=0;
      }
    this.service.getDataTableSource(this, this.handlerSuccess, this.handlerError,""+this.actualPageNumber);
  }

  getDataUsageStatistics(){
    this.service.getDataTableSourceUsageStatistics(this, this.handlerSuccess, this.handlerError);
  }


  getDataCurrentSource(){
    let tab = this.tabRef;
    for(let data of this.dataSource){
      if(data.id=== tab){
        return data;
      }
    }
    return null;
  }

  getMainKey(keys, response){
    for(let i of keys){
      let obj = response[i];
      if(obj instanceof Object){
        return obj;
      }
    }
    return null;
  }

  handlerSuccess(_this,data, tab){
    _this.globals.endTimestamp = new Date();
    let response = data.Response;
    _this.globals.totalRecord = response.total;
    let keys = Object.keys(response);
    let mainElement = _this.getMainKey(keys,response);
    if(!(mainElement instanceof Array)){
      mainElement = [mainElement];
    }
    if( _this.globals.totalRecord > 0){
      _this.globals.displayedColumns = data.metadata;
      _this.metadata = data.metadata;
      _this.globals.metadata = data.metadata;
      console.log( _this.globals.displayedColumns);
      
      _this.setColumnsDisplayed(_this);
      
      let dataResult = new MatTableDataSource(mainElement);     
      dataResult.sort = _this.sort; 
      if( _this.globals.moreResults){
        if( _this.globals.totalRecord<100){
          _this.globals.moreResultsBtn = false;
          _this.globals.moreResults = false;
        }
          _this.dataSource.data = _this.dataSource.data.concat(dataResult.data);
      }else{
        _this.dataSource = dataResult;
      }
    }else{
      if( _this.globals.moreResults){
        _this.globals.moreResultsBtn = false;
          _this.globals.moreResults = false;
      }
    }  
    _this.globals.isLoading = false;   
    if(_this.dataSource){
      console.log(_this.dataSource);
    }
  }

  setColumnsDisplayed(_this){
      for(let column of this.metadata){
        _this.displayedColumns.push(column.columnName);
      }
  }

  handlerError(_this,result){
    _this.globals.isLoading = false; 
    console.log(result);
  }

}
