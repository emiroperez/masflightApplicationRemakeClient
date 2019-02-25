import { Injectable } from '@angular/core';
import {Option} from '../model/Option';
import { MatSort } from '@angular/material';
import { Observable } from 'rxjs';
import { AmChart, AmChartsService } from '@amcharts/amcharts3-angular';
@Injectable()
export class Globals {
  currentOption: any;
  currentMenuCategory: any;
  currentArgs: any;
  isLoading: boolean = false;
  sort: MatSort;
  chart: boolean = false;
  map: boolean = false;
  mapsc: boolean = false;
  usageStatistics: boolean = false;
  variables;
  values;
  generateDynamicTable = false;
  selectedIndex = 0;
  displayedColumns;
  metadata;
  totalRecord = 0;
  dataSource : boolean = false;
  startTimestamp = null;
  endTimestamp = null;
  bytesLoaded = 0;
  airports: Observable<any[]>;
  moreResults : boolean = false;
  moreResultsBtn : boolean = true;
  currentApplication : any;
  minDate:any;
  maxDate:any;
  welcome:any;
  items:any;
  welcomeDataSource:any;
  query : boolean= false;
  tab : boolean= false;
  showWelcome : boolean= false;
  status: boolean= false;
  currentAirline: any;
  template : boolean = false;
  baseUrl = "http://localhost:8887";
  //baseUrl = "";
  // baseUrl2 = "http://localhost:8886";
  baseUrl2 = "http://69.64.45.220:8886";
  scheduledata:any;
  hideParametersPanels : boolean =false;
  Airportdataorigin:any;
  Airportdatadest:any;
  scheduleChart :AmChart;
   initDataSource(){
    if(this.currentMenuCategory!= null){
    if(this.currentMenuCategory.welcome!= null){
      this.welcome = this.currentMenuCategory.welcome;
      this.items = this.welcome.applicationsDo.split(";");
      if(this.currentMenuCategory.welcomeTable!="0"){
        this.initTableDataSource();
      }
      this.showWelcome = true;
    }else{
      this.showWelcome = false;
    }
  }
}

  initTableDataSource(){
        this.welcomeDataSource = new Array();
    for (let index = 0; index < this.currentMenuCategory.options.length; index++) {
      if(this.currentMenuCategory.options[index].label!="How to use this tool?"){
        this.recursiveOption(this.currentMenuCategory.options[index]);
        this.welcomeDataSource.push(this.currentMenuCategory.options[index]);
      }
    }
    console.log(this.welcomeDataSource)
  }

  recursiveOption(option:any){
    option.outputs ='';
    option.keyControl ='';
    if(option.children.length!=0){
      for (let i = 0; i < option.children.length; i++) {
        const element = option.children[i];
          if(element.menuOptionArguments.length!=0) {
            const aux = element.menuOptionArguments;
            if(i!=option.children.length-1){
              option.outputs += ''+element.label+', ';
            }else{
              option.outputs += ''+element.label+'.';
            }
            for (let j = 0; j < aux.length; j++) {
              const aux2 = aux[j].categoryArguments;
              for (let k = 0; k < aux2.length; k++) {
                const aux3 = aux2[k];
                for (let l = 0; l < aux3.arguments.length; l++) {
                  const aux4 = aux3.arguments[l];
                  if(aux4.required && aux4.title!="Format :"){
                    if(l!=aux3.arguments.length-1){
                      option.keyControl += aux4.title+'*, \n';
                    }else{
                      option.keyControl += aux4.title+'*.';
                    }
                  }
                }
              }
            }
          }else{
            if (element.children.length!=0) {
              this.recursiveOption(element.children);
            }
          }
      }
    }else{
      const aux = option.menuOptionArguments;
      if(aux.length!=0) {
        option.outputs = option.label;
        for (let j = 0; j < aux.length; j++) {
          const aux2 = aux[j].categoryArguments;
          for (let k = 0; k < aux2.length; k++) {
            const aux3 = aux2[k];
            for (let l = 0; l < aux3.arguments.length; l++) {
              const aux4 = aux3.arguments[l];
              if(aux4.required&& aux4.title!="Format :"){
                if(l!=aux3.arguments.length-1){
                  option.keyControl += aux4.title+'*, \n';
                }else{
                  option.keyControl += aux4.title+'*.';
                }
              }
            }
          }
        }
    }
  }
  option.outputs = option.outputs.replace(" :","");
}

  clearVariables(){
    this.currentOption=null;
    this.currentArgs=null;
    this.isLoading = false;
    this.chart = false;
    this.map = false;
    this.mapsc = false;
    this.variables = null;
    this.values = null;
    this.generateDynamicTable = false;
    this.selectedIndex = 0;
    this.totalRecord = 0;
    this.startTimestamp = null;
    this.endTimestamp = null;
    this.bytesLoaded = 0;
    this.moreResults = false;
    this.moreResultsBtn = true;
    this.dataSource = false;
    this.query = false;
    this.tab = false;

  }

  getTime(){
    if( this.endTimestamp != null && this.startTimestamp != null){
      return (this.endTimestamp.getTime() - this.startTimestamp.getTime())/ 1000;
    }
    return 0;
  };

  getBytesLoaded(){
    if(this.getTime() > 0){
      return this.bytesLoaded;
    }
    return 0;
  }

  getSelectedIndex(){
    return this.selectedIndex;
  }

  dataAvailabilityInit(){
    const option = this.currentOption;
    if(option.dataAvailability!=null){
      this.minDate = new Date(option.dataAvailability.startDate);
      this.maxDate = new Date(option.dataAvailability.endDate);
    }else{
      this.minDate = null;
      this.maxDate = null;
    }
  }
}
