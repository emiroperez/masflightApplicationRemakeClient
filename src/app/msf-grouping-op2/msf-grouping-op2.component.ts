import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-grouping-op2',
  templateUrl: './msf-grouping-op2.component.html',
  styleUrls: ['./msf-grouping-op2.component.css']
})
export class MsfGroupingOp2Component implements OnInit {

  @Input("argument") public argument: Arguments;
 
  groupingList: any[] = [
                      {id: 'YEAR', columnLabel: 'Year', columnName:'year'},
                      {id: 'MONTH', columnLabel: 'Month', columnName:'month'},
                      {id: 'DAY', columnLabel: 'Day' ,columnName:'date'},
                      {id: 'HOUR', columnLabel: 'Hour', columnName: 'hour'},
                      {id: 'QUARTER', columnLabel: 'Quarter Hour',columnName:'quarter'}
  ];
  constructor() { }


  ngOnInit() { 
    if (!this.argument.value1){
    this.argument.value1= {id: 'YEAR', columnLabel: 'Year', columnName:'year'}
  }
  }
}
