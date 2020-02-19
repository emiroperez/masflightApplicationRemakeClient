import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-free-text-input',
  templateUrl: './msf-free-text-input.component.html',
  styleUrls: ['./msf-free-text-input.component.css']
})
export class MsfFreeTextInputComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  constructor() { }

  ngOnInit() {
  }

}
