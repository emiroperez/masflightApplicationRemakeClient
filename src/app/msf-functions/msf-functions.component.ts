import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-functions',
  templateUrl: './msf-functions.component.html',
  styleUrls: ['./msf-functions.component.css']
})
export class MsfFunctionsComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  data =  [
    {"id":1,
    "name":"Average(Mean)",
    "value":"m"},
    {"id":2,
    "name":"Total (Sum)",
    "value":"s"},
    {"id":3,
    "name":"Standard Deviation",
    "value":"d"}
];
  constructor() { }

  ngOnInit() {
    this.argument.value1 = "s";
  }

}
