import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-grouping-comp-total',
  templateUrl: './msf-grouping-comp-total.component.html',
  styleUrls: ['./msf-grouping-comp-total.component.css']
})
export class MsfGroupingCompTotalComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  groupingList: any[] = [
    {id: 'world_region', columnLabel: 'World Region', columnName:'world_region'},
    {id: 'month', columnLabel: 'Month', columnName:'month'},
    {id: 'type', columnLabel: 'Type', columnName:'type'},
    {id: 'date', columnLabel: 'Date', columnName:'date'}
];
  
  constructor() { }


  ngOnInit() {
  }
}
