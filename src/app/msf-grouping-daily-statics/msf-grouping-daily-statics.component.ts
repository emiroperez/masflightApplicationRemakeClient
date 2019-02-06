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
                {id: 'HOUR', name: 'Hour', column: 'Hour'},
                {id: 'QUARTERHOUR', name: 'Quarter Hour',column:'Quarter Hour'},
  ];
  constructor() { }


  ngOnInit() { 
  }

}
