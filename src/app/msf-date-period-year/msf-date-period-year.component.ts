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
import { Globals } from '../globals/Globals';

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
  selector: 'app-msf-date-period-year',
  templateUrl: './msf-date-period-year.component.html',
  styleUrls: ['./msf-date-period-year.component.css'],
  providers: [
    {
        provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    {
        provide: MAT_DATE_FORMATS, useValue: MY_FORMATS
    }
    ]
})
export class MsfDatePeriodYearComponent implements OnInit {

  constructor(public globals: Globals) { }
  
  date: FormControl;
  date2: FormControl;
  loading = false;

  @Input("argument") public argument: Arguments;
  
  ngOnInit() {
    if(this.globals.maxDate!=null){
      this.date =  new FormControl(moment(this.globals.maxDate));
      this.date2 =  new FormControl(moment(this.globals.maxDate));
    }else{
      this.date =  new FormControl(moment());
      this.date2 =  new FormControl(moment());
    }

    this.argument.value1 = this.date.value.year();
    this.argument.value2 = this.date2.value.year();
  }

  chosenYearHandler(normalizedYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value;
    ctrlValue.year(normalizedYear.year());
    this.date.setValue(ctrlValue);
    this.argument.value1 = this.date.value.year();
    datepicker.close();
  }

  chosenYearHandler2(normalizedYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date2.value;
    ctrlValue.year(normalizedYear.year());
    this.date2.setValue(ctrlValue);
    this.argument.value2 = this.date2.value.year();
    datepicker.close();
  }

}
