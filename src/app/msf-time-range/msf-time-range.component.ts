import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-time-range',
  templateUrl: './msf-time-range.component.html',
  styleUrls: ['./msf-time-range.component.css']
})
export class MsfTimeRangeComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  constructor() { }

  ngOnInit() {
    if (!this.argument.value1)
      this.argument.value1 = '12:00 am';

    if (!this.argument.value2)
      this.argument.value2 = '11:59 pm';
  }

}
