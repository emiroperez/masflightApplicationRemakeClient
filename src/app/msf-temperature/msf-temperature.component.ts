import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-temperature',
  templateUrl: './msf-temperature.component.html',
  styleUrls: ['./msf-temperature.component.css']
})
export class MsfTemperatureComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  constructor() { }

  ngOnInit() {
    this.argument.value1 = -75;
    this.argument.value2 = 125;
    this.argument.value3 = 'f';
  }

}
