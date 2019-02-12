import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-quarter-hour',
  templateUrl: './msf-quarter-hour.component.html',
  styleUrls: ['./msf-quarter-hour.component.css']
})
export class MsfQuarterHourComponent implements OnInit {


  quarters: any[] = [
    {id: 1, name: '0:00-0:14',value:"1"},
    {id: 2, name: '0:15-0:29',value:"2"},
    {id: 3, name: '0:30-0:44',value:"3"},
    {id: 4, name: '0:45-0:59',value:"4"}
  ];

  @Input("argument") public argument: Arguments;
  
  constructor() { }

  ngOnInit() {
    this.argument.value1 = {id: 1, name: '0:00-0:14',value:"1"};
    this.argument.value2 = {id: 4, name: '0:45-0:59',value:"4"};
  }

}
