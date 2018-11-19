import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-time-range',
  templateUrl: './msf-time-range.component.html',
  styleUrls: ['./msf-time-range.component.css']
})
export class MsfTimeRangeComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  constructor() { }

  ngOnInit() {
    this.argument.value1 = '12:00 am';
    this.argument.value2 = '11:59 pm';
  }

}
