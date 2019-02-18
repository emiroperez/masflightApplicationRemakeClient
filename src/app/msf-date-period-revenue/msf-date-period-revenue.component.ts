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
  selector: 'app-msf-date-period-revenue',
  templateUrl: './msf-date-period-revenue.component.html',
  styleUrls: ['./msf-date-period-revenue.component.css'],
  providers: [
    {
        provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    {
        provide: MAT_DATE_FORMATS, useValue: MY_FORMATS
    }
    ]
})
export class MsfDatePeriodRevenueComponent implements OnInit {
  constructor(public globals: Globals) { }
  date: FormControl;
  date2: FormControl;
  loading = false;

  quarters: any[] = [
    {id: 1, name: '1st Quarter',value:"1"},
    {id: 2, name: '2nd Quarter',value:"2"},
    {id: 3, name: '3rd Quarter',value:"3"},
    {id: 4, name: '4st Quarter',value:"4"}
  ];

  @Input("argument") public argument: Arguments;
  
  quarter
  ngOnInit() {
    if(this.globals.maxDate!=null){
      this.date =  new FormControl(moment(this.globals.maxDate));
    }else{
      this.date =  new FormControl(moment());
    }
    this.argument.value1 = this.date.value.year();
    this.argument.value2 = {id: 1, name: '1st Quarter',value:"1"};
  }

  chosenYearHandler(normalizedYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value;
    ctrlValue.year(normalizedYear.year());
    this.date.setValue(ctrlValue);
    this.argument.value1 = this.date.value.year();
    datepicker.close();
  }

}
