import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-taxi-times',
  templateUrl: './msf-taxi-times.component.html',
  styleUrls: ['./msf-taxi-times.component.css']
})
export class MsfTaxiTimesComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  constructor() { }

  ngOnInit() {
    this.argument.value1 = 0;
    this.argument.value2 = 999;
  }

}
