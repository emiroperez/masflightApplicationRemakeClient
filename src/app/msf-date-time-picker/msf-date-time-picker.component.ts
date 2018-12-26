import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';


@Component({
  selector: 'app-msf-date-time-picker',
  templateUrl: './msf-date-time-picker.component.html',
  styleUrls: ['./msf-date-time-picker.component.css']
})
export class MsfDateTimePickerComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  constructor() { }

  ngOnInit() {
  }

}
