import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-grouping-hub-summaries',
  templateUrl: './msf-grouping-hub-summaries.component.html',
  styleUrls: ['./msf-grouping-hub-summaries.component.css']
})
export class MsfGroupingHubSummariesComponent implements OnInit {

  @Input("argument") public argument: Arguments;
 
  groupingList: any[] = [
                      {id: 'INTERVAL', columnLabel: 'Interval', columnName:'Interval'},
                      {id: 'RANGE', columnLabel: 'Range', columnName:'Range'}
  ];
  constructor() { }


  ngOnInit() { 
    this.argument.value1= {id: 'INTERVAL', columnLabel: 'Interval', columnName:'Interval'};
  }

}
