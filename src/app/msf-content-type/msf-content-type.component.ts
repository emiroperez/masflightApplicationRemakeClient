import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-content-type',
  templateUrl: './msf-content-type.component.html',
  styleUrls: ['./msf-content-type.component.css']
})
export class MsfContentTypeComponent implements OnInit {


  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  data =  [
    {"id":1,
    "name":"TV",
    "value":"TV"},
    {"id":2,
    "name":"Movie",
    "value":"Movie"},
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
