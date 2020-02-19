import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-seat-class',
  templateUrl: './msf-seat-class.component.html',
  styleUrls: ['./msf-seat-class.component.css']
})
export class MsfSeatClassComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  data =  [
    {"id":1,
    "name":"Business",
    "value":"Business"},
    {"id":2,
    "name":"Economy",
    "value":"Economy"},
    {"id":3,
    "name":"All",
    "value":"All"},
    {"id":3,
    "name":"All Combined",
    "value":"Combined"}
];
  constructor() { }

  ngOnInit() {
    if(!this.argument.value1){
      this.argument.value1 = "All";
    }

  }
}
