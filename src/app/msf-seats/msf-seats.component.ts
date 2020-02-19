import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-seats',
  templateUrl: './msf-seats.component.html',
  styleUrls: ['./msf-seats.component.css']
})
export class MsfSeatsComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  constructor() { }

  ngOnInit() {
    if(!this.argument.value1 && !this.argument.value2){
    this.argument.value1 = 0;
    this.argument.value2 = 600;
  }
}

}
