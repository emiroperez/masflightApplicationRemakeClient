import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-wind',
  templateUrl: './msf-wind.component.html',
  styleUrls: ['./msf-wind.component.css']
})
export class MsfWindComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  constructor() { }

  ngOnInit() {
    if(!this.argument.value1&&!this.argument.value2&&!this.argument.value3){
      this.argument.value1 = 0;
      this.argument.value2 = 200;
      this.argument.value3 = 'kts';
    }
  }

}
