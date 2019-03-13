import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-grouping-daily-statics',
  templateUrl: './msf-grouping-daily-statics.component.html',
  styleUrls: ['./msf-grouping-daily-statics.component.css']
})
export class MsfGroupingDailyStaticsComponent implements OnInit {

  @Input("argument") public argument: Arguments;
 
  groupingList: any[] = [
                // {id: 'HOUR', columnLabel: 'Hour', columnName: 'Hour'},
                {id: 'QUARTER', columnLabel: 'Quarter Hour',columnName:'quarter'}
  ];
  constructor() { }


  ngOnInit() { 
    // this.argument.value1= {id: 'HOUR', columnLabel: 'Hour', columnName: 'Hour'};
  }

}
