import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';
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
  selector: 'app-msf-date',
  templateUrl: './msf-date.component.html',
  styleUrls: ['./msf-date.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    { provide: MAT_DATE_FORMATS, useValue: US_DATE_FORMAT },
  ]
})
export class MsfDateComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  constructor()
  {
  }

  ngOnInit()
  {
    if (this.argument.value1)
    {
      switch (this.argument.value1)
      {
        case "TODAY":
          this.calculateDate (0);
          break;

        case "YESTERDAY":
          this.calculateDate (24 * 60 * 60 * 1000);
          break;

        case "LASTWEEK":
          this.calculateDate ((24 * 60 * 60 * 1000) * 7);
          break;

        case "LASTMONTH":
          this.calculateDate ((24 * 60 * 60 * 1000) * 30);
          break;

        case "LASTYEAR":
          this.calculateDate ((24 * 60 * 60 * 1000) * 365);
          break;
      }
    }
  }

  calculateDate(milis: any)
  {
    this.argument.value1 = new Date (moment ().toDate ().getTime() - milis);
  }
}
