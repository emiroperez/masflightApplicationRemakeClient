import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-region-schedule',
  templateUrl: './msf-region-schedule.component.html',
  styleUrls: ['./msf-region-schedule.component.css']
})
export class MsfRegionScheduleComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  data =  [
    {"id":1,
    "name":"Domestic",
    "value":"Domestic"},
    {"id":2,
    "name":"International",
    "value":"International"},
    {"id":3,
    "name":"All",
    "value":"All"}
];
  constructor() { }

  ngOnInit() {
    if(!this.argument.value1){
    this.argument.value1 = "All";
    }
  }

}
