import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-service-classes',
  templateUrl: './msf-service-classes.component.html',
  styleUrls: ['./msf-service-classes.component.css']
})
export class MsfServiceClassesComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
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
    this.argument.value1 = "";
  }
  

}
