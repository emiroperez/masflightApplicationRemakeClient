import { Injectable } from '@angular/core';
import {Option} from '../model/Option';
import { MatSort } from '@angular/material';
import { Observable } from 'rxjs';

@Injectable()
export class Globals {
  currentOption: any;
  currentAgts: any;
  isLoading: boolean = false;
  sort: MatSort;
  chart: boolean = false;
  map: boolean = false;
  usageStatistics: boolean = false;
  variables;
  values;
  generateDynamicTable = false;
  selectedIndex = 1;
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

  clearVariables(){
    this.currentOption=null;
    this.currentAgts=null;
    this.isLoading = false;
    this.chart = false;
    this.map = false;
    this.variables = null;
    this.values = null;
    this.generateDynamicTable = false;
    this.selectedIndex = 1;
    this.totalRecord = 0;
    this.startTimestamp = null;
    this.endTimestamp = null;
    this.bytesLoaded = 0;
    this.moreResults = false;
    this.moreResultsBtn = true;
    this.dataSource = false;

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
}