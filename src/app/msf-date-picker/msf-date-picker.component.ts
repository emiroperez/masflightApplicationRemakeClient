import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { Globals } from '../globals/Globals';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

export const US_DATE_FORMAT = {
  parse: {
    dateInput: 'MM-DD-YYYY',
  },
  display: {
    dateInput: 'MM-DD-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-msf-date-picker',
  templateUrl: './msf-date-picker.component.html',
  styleUrls: ['./msf-date-picker.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    { provide: MAT_DATE_FORMATS, useValue: US_DATE_FORMAT },
  ]
})
export class MsfDatePickerComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  constructor(public globals: Globals) { }

  ngOnInit() {
  }

}
