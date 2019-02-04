import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-flight-distance',
  templateUrl: './msf-flight-distance.component.html',
  styleUrls: ['./msf-flight-distance.component.css']
})
export class MsfFlightDistanceComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  constructor() { }

  ngOnInit() {
    this.argument.value1 = 0;
    this.argument.value2 = 25000;
  }

}
