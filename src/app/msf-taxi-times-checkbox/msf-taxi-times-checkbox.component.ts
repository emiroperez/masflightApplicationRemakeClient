import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-taxi-times-checkbox',
  templateUrl: './msf-taxi-times-checkbox.component.html',
  styleUrls: ['./msf-taxi-times-checkbox.component.css']
})
export class MsfTaxiTimesCheckboxComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  checkbox ={
    name:"Multiple Gate Departures",
    value:"Multiple Gate Departures",
  }
  ngOnInit() {
  }

}
