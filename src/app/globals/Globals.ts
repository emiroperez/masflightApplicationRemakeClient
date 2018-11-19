import { Injectable } from '@angular/core';
import {Option} from '../model/Option';
import { MatSort } from '@angular/material';

@Injectable()
export class Globals {
  currentOption: any;
  currentAgts: any;
  isLoading: boolean = false;
  sort: MatSort;
  chart: boolean = false;
  map: boolean = false;
  variables;
  values;
  generateDynamicTable = false;
  selectedIndex = 1;
  displayedColumns;
  metadata;
  totalRecord = 0;

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
  }
}