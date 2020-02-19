import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-taxi-times-checkbox',
  templateUrl: './msf-taxi-times-checkbox.component.html',
  styleUrls: ['./msf-taxi-times-checkbox.component.css']
})
export class MsfTaxiTimesCheckboxComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  checkbox ={
    name:"Multiple Gate Departures",
    value:"Multiple Gate Departures",
  }
  ngOnInit() {
  }

}
