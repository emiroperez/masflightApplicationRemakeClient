import { Component, OnInit, ViewChild, Input ,ChangeDetectorRef, ElementRef} from '@angular/core';
import {MatSort, MatTableDataSource, MatTab, Sort, MatDialog} from '@angular/material';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { MsfGroupingComponent } from '../msf-grouping/msf-grouping.component';
import { Utils } from '../commons/utils';
import { MessageComponent } from '../message/message.component';
import { parseIntAutoRadix } from '@angular/common/src/i18n/format_number';
import { MsfMoreInfoPopupComponent } from '../msf-more-info-popup/msf-more-info-popup.component';




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

  limitNumber;

  sortingArgument;

  sortedData: any[];

  template;

  @ViewChild(MatSort) sort: MatSort;

  constructor(public globals: Globals, private service: ApplicationService,private ref: ChangeDetectorRef,public dialog: MatDialog) { }

  ngOnInit() {      
    
  }

  ngAfterViewInit(){
    //this.globals.generateDynamicTable = false;
  }

  setGroupingArgument(){
    var menuOptionArguments = this.globals.currentOption.menuOptionArguments;
    var categoryArguments = null;
    if(menuOptionArguments[menuOptionArguments.length-1]!=null){
       categoryArguments = menuOptionArguments[menuOptionArguments.length-1].categoryArguments;
    }
    if(categoryArguments!=null){
      categoryArguments.forEach(element => {
        if(element.arguments!=null){
          element.arguments.forEach(element2 => {
            if(element2.type=="groupingAthena"){
              this.groupingArgument = element2;
            }
            if(element2.type=="sortingCheckboxes"){
              this.sortingArgument = element2;
            }
            if(element2.type=="summary"){
              this.groupingArgument = element2;
            }
            if(element2.type=="grouping"){
              this.groupingArgument = element2;
            }
            if(element2.type=="groupingOperationsSummary"){
              this.groupingArgument = element2;
            }
            if(element2.type=="groupingDailyStatics"){
              this.groupingArgument = element2;
            }
            if(element2.type=="groupingMariaDB"){
              this.groupingArgument = element2;
            }
            if(element2.type=="groupingCompTotal"){
              this.groupingArgument = element2;
            }
            if(element2.type=="groupingCompGenre"){
              this.groupingArgument = element2;
            }
            if(element2.name1=="limitNumber"){
              this.limitNumber = element2;
            }
        });
        }

    });
    }
    }

    addGroupingColumns(displayedColumns: any[]){
      var array =null;
      var array2 =null;
        if(this.groupingArgument!=null){
           array = this.groupingArgument.value1;
           if(array!=null){
            if(array.length==0){
              displayedColumns = this.removeFunctionsColumns(displayedColumns,this);
            }
           }else{
            displayedColumns = this.removeFunctionsColumns(displayedColumns,this);
          }
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
            columnLabel:element.columnLabel,
            drillDowns: [],
            show:true});
          }
        }
    }
    if(array!=null){
      if(Array.isArray(array)){
        for (let index = array.length-1; index >= 0; index--) {
          const element = array[index];
          const indexColumn = displayedColumns.findIndex(column => column.columnName.toLowerCase() === element.columnName.toLowerCase());
          if(indexColumn==-1){
            displayedColumns.unshift({ columnType:"string",
            columnName:element.columnName,
            columnLabel:element.columnLabel,
            drillDowns: [],
            show:true
          });
          }else{
              displayedColumns.splice(indexColumn,1);
              displayedColumns.unshift({ columnType:"string",
              columnName:element.columnName,
              columnLabel:element.columnLabel,
              drillDowns: [],
              show:true});
          }
        }
      }else{
        const indexColumn = displayedColumns.findIndex(column => column.columnName === array.columnName);
        if(indexColumn==-1){
          displayedColumns.unshift({ columnType:"string",
          columnName:array.columnName,
          columnLabel:array.columnLabel,
          drillDowns: [],
          show:true});
        }else{
            displayedColumns.splice(indexColumn,1);
            displayedColumns.unshift({ columnType:"string",
            columnName:array.columnName,
            columnLabel:array.columnLabel,
            drillDowns: [],
            show:true});
        }

      }

    }
    return displayedColumns;
  }

  setMsfChartRef(msfChartRef){
    msfChartRef.setColumns(this.displayedColumns);
  }

  replaceAll(text: string){
     let re = /_/gi;
     return text.replace(re, ' ');
  }

  getData(moreResults: boolean){
    // if(this.globals.moreResultsBtn){
      this.globals.startTimestamp = new Date();
      var pageSize = 100;
        if(moreResults){
          this.actualPageNumber++;
          this.globals.moreResults = true;
        }else{
          this.actualPageNumber=0;
        }
      this.service.getDataTableSource(this, this.handlerSuccess, this.handlerError,""+this.actualPageNumber);
    // }
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
    if(_this.globals.isLoading){
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
            _this.globals.displayedColumns  = _this.addGroupingColumns(_this.globals.displayedColumns);
          }
          _this.metadata = _this.globals.displayedColumns;
          _this.globals.metadata = data.metadata;
          console.log( _this.globals.displayedColumns);
          
          _this.setColumnsDisplayed(_this);
          
          let dataResult = new MatTableDataSource(mainElement);     
          if( _this.globals.moreResults){
            if(_this.globals.currentOption.tabType!="athena"&&_this.globals.currentOption.tabType!="mariadb"){
              _this.dataSource.data = _this.dataSource.data.concat(dataResult.data);
            }else{
              _this.dataSource = dataResult;
            }
          }else{
            _this.dataSource = dataResult;
          }

          if(_this.globals.currentOption.tabType!="athena"&&_this.globals.currentOption.tabType!="mariadb"){
            if( _this.globals.totalRecord<100 ||  _this.globals.totalRecord>100){
              _this.globals.moreResultsBtn = false;
              _this.globals.moreResults = false;
            }else{
              _this.globals.moreResultsBtn = true;
            }
          }else{  
            var aux = (_this.actualPageNumber+1)*100;
            aux = aux!=0 ? aux : 100;
            if( _this.globals.totalRecord<aux){
              _this.globals.moreResultsBtn = false;
              _this.globals.moreResults = false;
            }else{
              _this.globals.moreResultsBtn = true;
            }
          }
          if(_this.limitNumber!=null){
            if(_this.limitNumber.value1!=null &&_this.limitNumber.value1!=""){
              _this.globals.moreResultsBtn = false;
              _this.globals.moreResults = false;
            }
          }
      }else if (_this.globals.currentOption.metaData==0){
        _this.template = data.template;
      }else if (_this.globals.currentOption.metaData==2){
        if(data.metadata.length>0){
          _this.globals.metadata =new Map();
          data.metadata.forEach(element => {
            _this.globals.metadata.set(element.columnName,element.columnLabel);
           });
         
        }
      
        _this.globals.hideParametersPanels = true;
        _this.globals.scheduledata = mainElement;
        _this.globals.scmap=true;
        _this.globals.tab =false;
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
  }

  setColumnsDisplayed(_this){
      for(let column of this.metadata){
        _this.displayedColumns.push(column.columnName);
      }
  }

  handlerError(_this,result){
    _this.globals.isLoading = false; 
    _this.globals.dataSource = false;
    _this.globals.template = false;
    console.log(result);
  }

  getCurrentClass(tableItem:any){
    var aux ="financial-table-item-label-title";
    if(tableItem.bold=='1'){
      aux+=" msf-bold";
    }
    if(tableItem.subtitle=='1'){
      aux+=" parent-cell-subtitle";
    }
    return aux;
  }

  getFormatCell(value:any){
    var aux = String(value);
    if(value==undefined){
      return "";
    }
    aux = aux.replace("%","");
    aux = aux.replace("$","");
    aux = aux.replace("ï¿½","0");
    return aux;
  }

  openSubQuery(drillDown : any,element: any){
    this.globals.popupMainElement = null;
    this.globals.popupResponse = null;
    this.goToPopup(drillDown);
    this.globals.currentDrillDown = drillDown;
    var rowNumber = this.dataSource.filteredData.indexOf(element)
    this.globals.popupLoading = true;
    var parameters = this.getSubOptionParameters(drillDown.drillDownParameter,rowNumber);
    this.service.getSubDataTableSource(this,drillDown.childrenOptionId,parameters,this.getPopupInfo,this.popupInfoError)
   

  }

  popupInfoError(_this,data) {
    console.log("ERROR")
  }

  getPopupInfo(_this,data){
    let response =  data.Response;
    _this.globals.subTotalRecord = response.total;
    let keys = Object.keys(response);
    let dataResult;
    _this.globals.subDisplayedColumns = data.metadata;
    console.log( _this.globals.subDisplayedColumns);
    if( _this.globals.subTotalRecord > 1){
      let mainElement = _this.getMainKey(keys,response);
    if(!(mainElement instanceof Array)){
      mainElement = [mainElement];
    }
        dataResult = new MatTableDataSource(mainElement);     
        _this.setSubColumnsDisplayed(_this);
        _this.globals.subDataSource = dataResult;

    }else if(_this.globals.subTotalRecord==1){
      let mainElement = _this.getMainKey(keys,response);
      if(!(mainElement instanceof Array)){
        mainElement = [mainElement];
      }
      _this.globals.popupResponse = response;
      _this.globals.popupMainElement = mainElement;
      console.log(_this.globals.popupResponse)
      console.log(_this.globals.popupMainElement)
    }else{
      if( _this.globals.subMoreResults){
        _this.globals.moreResultsBtn = false;
          _this.globals.moreResults = false;
      }
    }  
    if(_this.globals.currentDrillDown.title!="More Info Passenger"){
      _this.globals.popupLoading = false;
    }
  }

  setSubColumnsDisplayed(_this){
    for(let column of _this.globals.subDisplayedColumns){
      _this.globals.subDisplayedColumnNames.push(column.columnName);
    }
}


  goToPopup(drillDown:any){
    var width = drillDown.width;
    var height =drillDown.height;
    if(width=="" || width==null){
      width = "1200px";
    }else{
      width +="px";
    }
    if(height=="" || height==null){
      height = "500px";
    }else{
      height +="px";
    }
    this.dialog.open (MsfMoreInfoPopupComponent, {
      height: height,
      width: width,
      panelClass: 'msf-more-info-popup'
    });
  }

  
  getSubOptionParameters(parameters:any[],rowNumber: any){
    var urlPam = "";
    for (let index = 0; index < parameters.length; index++) {
        const element = parameters[index].webservicesMetaId;
        var argName = "";
        if(element.argumentsId!=null){
          if (element.argumentsId.name1)
          argName = element.argumentsId.name1;

          if (element.argumentsId.name2)
          argName = element.argumentsId.name2;

          if (element.argumentsId.name3)
          argName = element.argumentsId.name3;
          
        }else{
          argName = element.columnName;
        }
        if(index==0){
            urlPam+="?"+element.columnName+"="+this.dataSource.filteredData[rowNumber][element.columnName];
        }else{
            urlPam+="&"+element.columnName+"="+this.dataSource.filteredData[rowNumber][element.columnName];
        }
        return urlPam;
    }
}

  removeFunctionsColumns(displayedColumns,_this){
    var aux = displayedColumns.slice();
    var cont = 0;
    for (let index = 0; index < displayedColumns.length; index++) {
      const element = displayedColumns[index];
      var x = index;
      if(element.function==0){
        x = x-cont;
        aux.splice(x,1);
        cont++;
      }
    }
    return aux;
  }

}
