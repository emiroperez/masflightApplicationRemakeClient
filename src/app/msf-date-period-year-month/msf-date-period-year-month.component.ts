import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';
import {FormControl} from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatDatepicker } from '@angular/material/datepicker';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../commons/date.adapters';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment, Moment} from 'moment';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'MMM YYYY',
    yearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


@Component({
  selector: 'app-msf-date-period-year-month',
  templateUrl: './msf-date-period-year-month.component.html',
  styleUrls: ['./msf-date-period-year-month.component.css']
})
export class MsfDatePeriodYearMonthComponent implements OnInit {
  date: FormControl;
  date2: FormControl;
  loading = false;

  quarters: any[] = [
    {id: 0, name: '1st Quarter',value:"1"},
    {id: 1, name: '2nd Quarter',value:"2"},
    {id: 2, name: '3rd Quarter',value:"3"},
    {id: 3, name: '4st Quarter',value:"4"}
  ];

  @Input("argument") public argument: Arguments;
  
  ngOnInit() {
    this.date =  new FormControl(moment());
    this.date2 =  new FormControl(moment());
  }

  chosenYearHandler(normalizedYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value;
    ctrlValue.year(normalizedYear.year());
    this.date.setValue(ctrlValue);
    this.argument.value1 = this.date;
  }

  chosenMonthHandler(normalizedYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date2.value;
    ctrlValue.month(normalizedYear.month());
    this.date.setValue(ctrlValue);
    this.argument.value2 = this.date2;
    datepicker.close();
  }

}
