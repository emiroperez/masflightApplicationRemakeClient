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
                      {id: 'INTERVAL', name: 'Interval', column:'Interval'},
                      {id: 'RANGE', name: 'Range', column:'Range'}
  ];
  constructor() { }


  ngOnInit() { 
    this.argument.value1= {id: 'INTERVAL', name: 'Interval', column:'Interval'};
  }

}
