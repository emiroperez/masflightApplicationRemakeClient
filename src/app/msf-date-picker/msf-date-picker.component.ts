import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-date-picker',
  templateUrl: './msf-date-picker.component.html',
  styleUrls: ['./msf-date-picker.component.css']
})
export class MsfDatePickerComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  constructor(public globals: Globals) { }

  ngOnInit() {
  }

}
