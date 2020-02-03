import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-geography',
  templateUrl: './msf-geography.component.html',
  styleUrls: ['./msf-geography.component.css']
})
export class MsfGeographyComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  data =  [
    {"id":1,
    "name":"Domestic",
    "value":"Domestic"},
    {"id":2,
    "name":"International",
    "value":"International"},
    {"id":3,
    "name":"Both",
    "value":"Both"}
];
  constructor() { }

  ngOnInit() {
    if(!this.argument.value1){
    this.argument.value1 = "Both";
  }
}  
}
