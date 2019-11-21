import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { Globals } from '../globals/Globals';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';

const moment = _rollupMoment || _moment;

export const US_DATE_FORMAT = {
  parse: {
    dateInput: 'MM/DD/YYYY',
  },
  display: {
    dateInput: 'MM/DD/YYYY',
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

  ngOnInit()
  {
    if (this.argument.value1)
    {
      switch (this.argument.value1)
      {
        case 'TODAY':
          this.argument.value1 = new Date (new Date ().getTime ());
          break;
  
        case 'YESTERDAY':
          this.argument.value1 = new Date (new Date ().getTime () - (24 * 60 * 60 * 1000));
          break;
  
        case 'LASTWEEK':
          this.argument.value1 = moment ().day (1).subtract (2, "days").day (1).toDate ();
          break;
  
        case 'LASTMONTH':
          this.argument.value1 = moment ().subtract (1, "months").startOf ("month").toDate ();
          break;
  
        case 'LASTYEAR':
          this.argument.value1 = moment ().subtract (1, "years").startOf ("year").toDate ();
          break;   
      }
    }
  }
}
