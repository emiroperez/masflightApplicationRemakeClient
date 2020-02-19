import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-flight-distance',
  templateUrl: './msf-flight-distance.component.html',
  styleUrls: ['./msf-flight-distance.component.css']
})
export class MsfFlightDistanceComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  constructor() { }

  ngOnInit() {
    if(!this.argument.value1&&!this.argument.value2){
    this.argument.value1 = 0;
    this.argument.value2 = 25000;
    }
  }

}
