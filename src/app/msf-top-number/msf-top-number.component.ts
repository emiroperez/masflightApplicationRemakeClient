import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-top-number',
  templateUrl: './msf-top-number.component.html',
  styleUrls: ['./msf-top-number.component.css']
})
export class MsfTopNumberComponent implements OnInit {


  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  constructor() { }

  ngOnInit() {
    if(!this.argument.value1){
      this.argument.value1=10;
    }
  }

}
