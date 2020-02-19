import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-service-classes',
  templateUrl: './msf-service-classes.component.html',
  styleUrls: ['./msf-service-classes.component.css']
})
export class MsfServiceClassesComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();
  
  data =  [
    {"id":1,
    "name":"Premium",
    "value":"Premium"},
    {"id":2,
    "name":"Economy",
    "value":"Economy"},
    {"id":3,
    "name":"Both",
    "value":""}
];
  constructor() { }

  ngOnInit() {
    if(!this.argument.value1){
    this.argument.value1 = "";
    }
  }
  

}
