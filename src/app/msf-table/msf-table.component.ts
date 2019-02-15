import { Component, OnInit, ViewChild, Input ,ChangeDetectorRef, ElementRef} from '@angular/core';
import {MatSort, MatTableDataSource, MatTab, Sort} from '@angular/material';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { MsfGroupingComponent } from '../msf-grouping/msf-grouping.component';
import { Utils } from '../commons/utils';




@Component({
  selector: 'app-msf-table',
  templateUrl: './msf-table.component.html',
  styleUrls: ['./msf-table.component.css']
})
export class MsfTableComponent implements OnInit {

  utils: Utils;
  
  isLoading = false;
  color = 'primary';

  @Input('tabRef')
  tabRef: MatTab;

  @Input('displayedColumns')
  displayedColumns: string[] = []; 

  @ViewChild('TABLE') table: ElementRef;

  @Input('msfGroupingComponent')
  msfGroupingComponent: MsfGroupingComponent;

  metadata;

  dataSource : any;

  actualPageNumber;

  groupingArgument;

  sortingArgument;

  sortedData: any[];

  template;

  @ViewChild(MatSort) sort: MatSort;

  constructor(public globals: Globals, private service: ApplicationService,private ref: ChangeDetectorRef) { }

  ngOnInit() {      
    
  }

  ngAfterViewInit(){
    //this.globals.generateDynamicTable = false;
  }

  setGroupingArgument(){
    var menuOptionArguments = this.globals.currentOption.menuOptionArguments;
    var categoryArguments = menuOptionArguments[menuOptionArguments.length-1].categoryArguments;
    categoryArguments.forEach(element => {
            if(element.arguments!=null){
              element.arguments.forEach(element2 => {
                if(element2.type=="groupingAthena"){
                  this.groupingArgument = element2;
                }
                if(element2.type=="sortingCheckboxes"){
                  this.sortingArgument = element2;
                }
                // if(element2.type=="summaryRevenueBuilds"){
                //   this.groupingArgument = element2;
                // }
                if(element2.type=="summary"){
                  this.groupingArgument = element2;
                }
                if(element2.type=="grouping"){
                  this.groupingArgument = element2;
                }
            });
            }

        });
    }

    addGroupingColumns(displayedColumns: any[]){
      var array =null;
      var array2 =null;
        if(this.groupingArgument!=null){
           array = this.groupingArgument.value1;
        }
        if(this.sortingArgument!=null){
           array2 = this.sortingArgument.value1;
        }
    if(array2!=null){
        for (let index = array2.length-1; index >= 0; index--) {
          const element = array2[index];
          const indexColumn = displayedColumns.findIndex(column => column.columnName === element.columnName);
          if(indexColumn==-1){
            displayedColumns.unshift({ columnType:"string",
            columnName:element.columnName,
            columnLabel:element.columnLabel});
          }
        }
    }
    if(array!=null){
      for (let index = array.length-1; index >= 0; index--) {
        const element = array[index];
        const indexColumn = displayedColumns.findIndex(column => column.columnName === element.columnName);
        if(indexColumn==-1){
          displayedColumns.unshift({ columnType:"string",
          columnName:element.columnName,
          columnLabel:element.columnLabel});
        }else{
          if(element.columnName=="Marketing_Carrier"){
            displayedColumns.splice(indexColumn,1);
            displayedColumns.unshift({ columnType:"string",
            columnName:element.columnName,
            columnLabel:element.columnLabel});
          }
          if(element.columnName=="MktCar"){
            displayedColumns.splice(indexColumn,1);
            displayedColumns.unshift({ columnType:"string",
            columnName:element.columnName,
            columnLabel:element.columnLabel});
          }
          if(element.columnName=="Origin"){
            displayedColumns.splice(indexColumn,1);
            displayedColumns.unshift({ columnType:"string",
            columnName:element.columnName,
            columnLabel:element.columnLabel});
          }
          if(element.columnName=="Destination"){
            displayedColumns.splice(indexColumn,1);
            displayedColumns.unshift({ columnType:"string",
            columnName:element.columnName,
            columnLabel:element.columnLabel});
          }
        }
      }
    }
  }


  setMsfChartRef(msfChartRef){
    msfChartRef.setColumns(this.displayedColumns);
  }

  replaceAll(text: string){
     let re = /_/gi;
     return text.replace(re, ' ');
  }

  getData(moreResults: boolean){
    if(this.globals.moreResultsBtn){
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
    _this.globals.totalRecord=0;
    _this.setGroupingArgument();
    _this.globals.endTimestamp = new Date();
    let response = data.Response;
    if(response!=null){
      if(response.total!=null){
        _this.globals.totalRecord = response.total;
      }else{
        for (var key in response) {
          var array = response[key];
          if( array != null){
            if(Array.isArray(array)){
              _this.globals.totalRecord = array.length;
              break;
            }else{
              for (var key in array) {
                var obj = array[key];
                if( obj != null){
                  let keys = Object.keys(response);
                  let mainElement = _this.getMainKey(keys,response);
                  if(mainElement!=null){
                    _this.globals.totalRecord = 1;
                  }
                }
              }
            }
          }
        }
      }
    }
    let keys = Object.keys(response);
    let mainElement = _this.getMainKey(keys,response);
    if(!(mainElement instanceof Array)){
      mainElement = [mainElement];
    }
    if( _this.globals.totalRecord > 0){
      if(_this.globals.currentOption.metaData==1){
        _this.globals.displayedColumns = data.metadata;
        if(_this.groupingArgument!=null){
          _this.addGroupingColumns(_this.globals.displayedColumns);
        }
        _this.metadata = data.metadata;
        _this.globals.metadata = data.metadata;
        console.log( _this.globals.displayedColumns);
        
        _this.setColumnsDisplayed(_this);
        
        let dataResult = new MatTableDataSource(mainElement);     
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
      _this.template = data.template;
    }
    }else{
      if( _this.globals.moreResults){
        _this.globals.moreResultsBtn = false;
          _this.globals.moreResults = false;
      }
    }  
    if(_this.dataSource){
      _this.ref.detectChanges();
      if(_this.sort!=undefined){
        _this.dataSource.sort =_this.sort;
      }
      _this.globals.dataSource = true;
      _this.globals.selectedIndex = 2;
      console.log(_this.dataSource);
    }else{
      _this.globals.dataSource = false;
    }
    
    if(_this.template){
      _this.globals.template = true;
      _this.globals.selectedIndex = 2;
    }else{
      _this.globals.template = false;
    }
    _this.globals.isLoading = false;   

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
