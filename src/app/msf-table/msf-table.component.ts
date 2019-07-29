import { Component, OnInit, ViewChild, Input ,ChangeDetectorRef, ElementRef, EventEmitter, Output} from '@angular/core';
import {MatSort, MatTableDataSource, MatTab, Sort, MatDialog} from '@angular/material';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { MsfGroupingComponent } from '../msf-grouping/msf-grouping.component';
import { Utils } from '../commons/utils';
import { MessageComponent } from '../message/message.component';
import { parseIntAutoRadix } from '@angular/common/src/i18n/format_number';
import { MsfMoreInfoPopupComponent } from '../msf-more-info-popup/msf-more-info-popup.component';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';



@Component({
  selector: 'app-msf-table',
  templateUrl: './msf-table.component.html',
  styleUrls: ['./msf-table.component.css']
})
export class MsfTableComponent implements OnInit {

  utils: Utils;
  
  color = 'primary';

  @Input('tabRef')
  tabRef: MatTab;

  @Input('displayedColumns')
  displayedColumns: string[] = []; 

  @ViewChild('TABLE') table: ElementRef;

  @Input('msfGroupingComponent')
  msfGroupingComponent: MsfGroupingComponent;

  @Input('isLoading')
  isLoading: any;

  @Output('finishLoading')
  finishLoading = new EventEmitter ();

  @Input('categoryArguments')
  categoryArguments: any;

  @Input('currentOption')
  currentOption: any;

  @Input('isPanel')
  isPanel: boolean;

  metadata;

  dataSource : any;

  actualPageNumber;

  groupingArgument;

  limitNumber;

  sortingArgument;

  sortedData: any[];

  template;

  tableOptions: any;

  specialCharacters = [ '[',']','/','!','"','#','$','%','&',"'",'(',')','*','+',';','<','=','>' 
                          ,'?','@','\\','^','`','{','|','}','~','°','-',':',','];

  @ViewChild(MatSort) sort: MatSort;

  constructor(public globals: Globals, private service: ApplicationService,public dialog: MatDialog, private sanitizer: DomSanitizer) { }

  ngOnInit() {      
    this.tableOptions = this.globals;
  }

  ngAfterViewInit(){
    //this.globals.generateDynamicTable = false;
  }

  setGroupingArgument(){
    var categoryArguments = this.categoryArguments;
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
            if(element2.type=="groupingOpSum2"){
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
      }else{
        displayedColumns = this.removeFunctionsColumns(displayedColumns,this);
      }
        if(this.sortingArgument!=null){
           array2 = this.sortingArgument.value1;
        }
    if(array2!=null){
        for (let index = array2.length-1; index >= 0; index--) {
          const element = array2[index];
          const indexColumn = displayedColumns.findIndex(column => column.columnName === element.columnName);
          if(indexColumn==-1){
            displayedColumns.unshift({ columnType: "string",
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
            displayedColumns.unshift({ columnType: "string",
            columnName:element.columnName,
            columnLabel:element.columnLabel,
            drillDowns: [],
            show:true
          });
          }else{
            let columnType = displayedColumns[indexColumn].columnType;
            let columnFormat = displayedColumns[indexColumn].columnFormat;
  
              displayedColumns.splice(indexColumn,1);
              displayedColumns.unshift({ columnType:columnType,
              columnName:element.columnName,
              columnLabel:element.columnLabel,
              columnFormat:columnFormat,
              drillDowns: [],
              show:true});
          }
        }
      }else{
        const indexColumn = displayedColumns.findIndex(column => column.columnName === array.columnName);
        if(indexColumn==-1){
          displayedColumns.unshift({ columnType: "string",
          columnName:array.columnName,
          columnLabel:array.columnLabel,
          drillDowns: [],
          show:true});
        }else{
          let columnType = displayedColumns[indexColumn].columnType;
          let columnFormat = displayedColumns[indexColumn].columnFormat;

            displayedColumns.splice(indexColumn,1);
            displayedColumns.unshift({ columnType: columnType,
            columnName:array.columnName,
            columnLabel:array.columnLabel,
            columnFormat:columnFormat,
            drillDowns: [],
            show:true});
        }

      }

    }
    return displayedColumns;
  }


  deleteEmptyColumns(dataResult,displayedColumns: any[]){
    var aux = displayedColumns.slice();
    var cont = 0;
    for (let index = 0; index < displayedColumns.length; index++) {
      const element = displayedColumns[index];
      var x = index;
      if(element.grouping==1){
        if(dataResult.data[0][element.columnName]==null){
            x = x-cont;
            aux.splice(x,1);
            cont++;
        }
      }
    }
    return aux;
  }

  replaceAll(text: string){
     let re = /_/gi;
     return text.replace(re, ' ');
  }

  getData(moreResults: boolean){
    // if(this.tableOptions.moreResultsBtn){
      this.globals.startTimestamp = new Date();

        if(moreResults){
          this.actualPageNumber++;
          this.tableOptions.moreResults = true;
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
    if(_this.isLoading) {
      _this.tableOptions.totalRecord=0;
      _this.setGroupingArgument();
      _this.globals.endTimestamp = new Date();
      let response = data.Response;
      if(response!=null){
        if(response.total!=null){
          _this.tableOptions.totalRecord = response.total;
        }else{
          for (var key in response) {
            var array = response[key];
            if( array != null){
              if(Array.isArray(array)){
                _this.tableOptions.totalRecord = array.length;
                break;
              }else{
                for (var key in array) {
                  var obj = array[key];
                  if( obj != null){
                    let keys = Object.keys(response);
                    let mainElement = _this.getMainKey(keys,response);
                    if(mainElement!=null){
                      _this.tableOptions.totalRecord = 1;
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
      if( _this.tableOptions.totalRecord > 0){
        if(_this.currentOption.metaData==1 || _this.currentOption.metaData==3 || _this.currentOption.tabType=='scmap'){  
          _this.tableOptions.displayedColumns = data.metadata;
          let dataResult = new MatTableDataSource(mainElement);     
            _this.tableOptions.displayedColumns  = _this.addGroupingColumns(_this.tableOptions.displayedColumns);
            _this.tableOptions.displayedColumns  = _this.deleteEmptyColumns(dataResult,_this.tableOptions.displayedColumns);
          _this.metadata = _this.tableOptions.displayedColumns;
          _this.tableOptions.metadata = data.metadata;
          console.log( _this.tableOptions.displayedColumns);
          
          _this.setColumnsDisplayed(_this);
          

          if( _this.tableOptions.moreResults){
            if(_this.currentOption.tabType === "legacy" || _this.currentOption.tabType === "scmap")
              _this.dataSource.data = _this.dataSource.data.concat(dataResult.data);
            else
              _this.dataSource = dataResult;
          }else{
            _this.dataSource = dataResult;
          }

          // special cases for date and time formats, so ngx-mask can display those values properly
          for (let i = 0; i < _this.tableOptions.displayedColumns.length; i++)
          {
            let column = _this.tableOptions.displayedColumns[i];

            if (column.columnType == 'time')
            {
              for (let j = 0; j < _this.dataSource.data.length; j++)
                _this.dataSource.data[j][column.columnName] = _this.parseTime (_this.dataSource.data[j][column.columnName]);
            }
            else if (column.columnType == 'date')
            {
              for (let j = 0; j < _this.dataSource.data.length; j++)
                _this.dataSource.data[j][column.columnName] = _this.parseDate (_this.dataSource.data[j][column.columnName], column.columnFormat);
            }
          }

          if(_this.currentOption.tabType === "legacy" || _this.currentOption.tabType === "scmap"){
            if( _this.tableOptions.totalRecord<100 ||  _this.tableOptions.totalRecord>100){
              _this.tableOptions.moreResultsBtn = false;
              _this.tableOptions.moreResults = false;
            }else{
              _this.tableOptions.moreResultsBtn = true;
            }
          }else{  
            if(_this.tableOptions.actualPageNumber==undefined)
              _this.tableOptions.actualPageNumber = _this.actualPageNumber;
            
            var aux = (_this.tableOptions.actualPageNumber+1)*100;
            aux = aux!=0 ? aux : 100;
            if( _this.tableOptions.totalRecord<aux){
              _this.tableOptions.moreResultsBtn = false;
              _this.tableOptions.moreResults = false;
            }else{
              _this.tableOptions.moreResultsBtn = true;
            }
          }
          if(_this.limitNumber!=null){
            if(_this.limitNumber.value1!=null &&_this.limitNumber.value1!=""){
              _this.tableOptions.moreResultsBtn = false;
              _this.tableOptions.moreResults = false;
            }
          }
      }else if (_this.currentOption.metaData==0){
        _this.template = data.template;
      }
      if (_this.currentOption.metaData==2){
        if(data.metadata.length>0){
          _this.tableOptions.metadata =new Map();
          data.metadata.forEach(element => {
            _this.tableOptions.metadata.set(element.columnName,element.columnLabel);
           });
         
        }
      
        _this.globals.hideParametersPanels = true;
        _this.globals.scheduledata = mainElement;
        _this.globals.scmap=true;
        // _this.globals.tab =false;
      }
      }else{
        if( _this.tableOptions.moreResults){
          _this.tableOptions.moreResultsBtn = false;
            _this.tableOptions.moreResults = false;
        }
      }  
      if(_this.dataSource){
        if(_this.sort!=undefined){
          _this.dataSource.sort =_this.sort;
        }
        _this.tableOptions.dataSource = true;
        _this.tableOptions.selectedIndex = 2;
        console.log(_this.dataSource);
      }else{
        _this.tableOptions.dataSource = false;
      }
      
      if(_this.template){
        _this.tableOptions.template = true;

      }else{
        _this.tableOptions.template = false;
      }
      _this.tableOptions.selectedIndex = 2;
      _this.finishLoading.emit (false);
      if(!_this.globals.isLoading){
        _this.globals.showBigLoading = true;
      }
    }
  }

  setColumnsDisplayed(_this){
      for(let column of this.metadata){
        _this.displayedColumns.push(column.columnName);
      }
  }

  handlerError(_this,result) {
    _this.finishLoading.emit (true);
    if(!_this.globals.isLoading){
      _this.globals.showBigLoading = true;
    }
    _this.tableOptions.dataSource = false;
    _this.tableOptions.template = false;
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

  parseDate(date, format): string
  {
    let day, month;
    let d: Date;

    if (date == null)
      return "";


    if (format === "M0/0000")
      d = moment (date, "MMYYYY").toDate ();
    else if (format === "0000/M0")
      d = moment (date, "YYYYMM").toDate ();
    else
      d = new Date (date);

    if (Object.prototype.toString.call (d) === "[object Date]")
    {
      if (isNaN (d.getTime ()))
        return "";
    }
    else
      return "";

    if (format === "M0/0000")
    {
      month = (d.getMonth () + 1);
      if (month < 10)
        month = "0" + month;

      return month + "/" + d.getFullYear ();
    }
    else if (format == "0000/M0")
    {
      month = (d.getMonth () + 1);
      if (month < 10)
        month = "0" + month;

      return d.getFullYear () + "/" + month;
    }

    month = (d.getMonth () + 1);
    if (month < 10)
      month = "0" + month;

    day = d.getDate ();
    if (day < 10)
      day = "0" + day;

    return month + "/" + day + "/" + d.getFullYear ();
  }

  parseTime(date): string
  {
    let hour, minute, second;
    let d: Date;

    if (date == null)
      return "";

    d = moment (date, "HHmm").toDate ();
    if (Object.prototype.toString.call (d) === "[object Date]")
    {
      if (isNaN (d.getTime ()))
        return "";
    }
    else
      return "";

    hour = d.getHours ();
    if (hour < 10)
      hour = "0" + hour;

    minute = d.getMinutes ();
    if (minute < 10)
      minute = "0" + minute;

    second = d.getSeconds ();
    if (second < 10)
      second = "0" + second;

    return hour + ":" + minute + ":" + second + "." + d.getMilliseconds ();
  }

  getFormatCell(value:any,element:any,column:any,flightArray:any[]){
    var aux: any = String(value);
    if(value==undefined){
      if(this.currentOption.tabType=='scmap'&& this.currentOption.metaData==2){
        var flight  = element['Flight'];
          if(flight!=undefined){
            aux =""+ flight[column.columnName]!=undefined ? String(flight[column.columnName]) : "";
          }else{
            if(flightArray){
              aux =""+ flightArray[column.columnName]!=undefined ? String(flightArray[column.columnName]) : "";
            }
          }
        }else{
          if(column.columnType=='number'){
            aux = "0";
          }else{
            aux = "";
          }
        }
    }

    aux = aux.replace("%","");
    aux = aux.replace("$","");
    aux = aux.replace("ï¿½","0");

    element[column.columnName] = aux;
  }

  isArray( element:any){
   return element instanceof Array;
  }

  getDecoration(array,j){
    if(j > 0 && j < array.length){
      return 'msf-sub-cell msf-border-top';
    }else{
      return 'msf-sub-cell'
    }
  }

  openSubQuery(drillDown : any,element: any){
    this.globals.popupMainElement = null;
    this.globals.popupResponse = null;
    this.globals.subDataSource = null;
    this.globals.subPdfViewer = null;
    this.goToPopup(drillDown);
    this.globals.currentDrillDown = drillDown;
    var rowNumber = this.dataSource.filteredData.indexOf(element);
    this.globals.popupLoading2 = true;
    var parameters = this.getSubOptionParameters(drillDown.drillDownParameter,rowNumber);
    this.service.getSubDataTableSource(this,drillDown.childrenOptionId,parameters,this.getPopupInfo,this.popupInfoError)
  }

  popupInfoError(_this,data) {
    _this.globals.popupLoading2 = false;
    console.log("ERROR")
  }

  getPopupInfo(_this,data){
    let response =  data.Response;
    _this.globals.subTotalRecord = response.total;
    let keys = Object.keys(response);
    let dataResult;

    if (response.url && response.url != "")
    {
      // sanitize this html code in order to be able to use the pdf viewer for the drill down
      _this.globals.subPdfViewer = _this.sanitizer.bypassSecurityTrustHtml (
        "<object data='" + response.url + "' type='application/pdf' width='100%' height='100%'>" + 
          "<embed src='" + response.url + "' type='application/pdf' width='100%' height='100%'/>" +
        "</object>"
      );
    }
 
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
      _this.globals.popupLoading2 = false;
    }
  }

  setSubColumnsDisplayed(_this){
    for(let column of _this.globals.subDisplayedColumns){
      _this.globals.subDisplayedColumnNames.push(column.columnName);
    }
}


  goToPopup(drillDown:any)
  {
    var width = drillDown.width;
    var height = drillDown.height;

    if (!width || width == "")
      width = "auto";
    else
      width += " !important";

    if (!height || height == "")
      height = "500px";
    else
      height += " !important";

    this.dialog.open (MsfMoreInfoPopupComponent, {
      height: height,
      width: width,
      panelClass: 'msf-more-info-popup',
      data: {
        tableWidth: (drillDown.width && drillDown.width != "" && drillDown.width != "auto" ? (Number (drillDown.width) - 116) : 1084)
      }
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
            urlPam+="?" + argName + "=" + this.dataSource.filteredData[rowNumber][element.columnName];
        }else{
            urlPam+="&" + argName + "=" + this.dataSource.filteredData[rowNumber][element.columnName];
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

  resultsAvailable()
  {
    if (this.currentOption == null)
      return 'msf-no-visible';

    if (this.tableOptions.dataSource && !this.tableOptions.template && ((this.currentOption.metaData==1) || (this.currentOption.metaData==3) || (this.currentOption.tabType=='scmap'))) {
        return 'msf-visible'
    } else {
      return 'msf-no-visible'
    }
  }

  cancelLoading(){
    this.isLoading = false;
    this.globals.showBigLoading = true;
  }

  noResults(){
    if(this.tableOptions){
      if(!this.tableOptions.dataSource && !this.tableOptions.template){
        return "msf-show";
      }
    }
    return "msf-hide";
  }

}