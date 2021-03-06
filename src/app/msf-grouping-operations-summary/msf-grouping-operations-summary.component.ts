import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-grouping-operations-summary',
  templateUrl: './msf-grouping-operations-summary.component.html',
  styleUrls: ['./msf-grouping-operations-summary.component.css']
})
export class MsfGroupingOperationsSummaryComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();
 
  groupingList: any[] = [
                      {id: 'YEAR', columnLabel: 'Year', columnName:'years'},
                      {id: 'MONTH', columnLabel: 'Month', columnName:'months'},
                      {id: 'DAY', columnLabel: 'Day' ,columnName:'date'},
                      {id: 'HOUR', columnLabel: 'Hour', columnName: 'hours'},
                      {id: 'QUARTER', columnLabel: 'Quarter Hour',columnName:'quarters'}
  ];
  constructor() { }


  ngOnInit() { 
    if (!this.argument.value1){
    this.argument.value1= {id: 'YEAR', columnLabel: 'Year', columnName:'years'}
  }
  }

}
