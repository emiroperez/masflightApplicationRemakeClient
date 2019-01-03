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
  selector: 'app-msf-date-period',
  templateUrl: './msf-date-period.component.html',
  styleUrls: ['./msf-date-period.component.css'],
  providers: [
    {
        provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    {
        provide: MAT_DATE_FORMATS, useValue: MY_FORMATS
    }
    ]
})


export class MsfDatePeriodComponent implements OnInit {
  date: FormControl;
  date2: FormControl;

  quarters: any[] = [
    {id: 0, name: '1st Quarter'},
    {id: 1, name: '2nd Quarter'},
    {id: 2, name: '3rd Quarter'},
    {id: 3, name: '4st Quarter'}
  ];

  @Input("argument") public argument: Arguments;
  
  ngOnInit() {
    this.date =  new FormControl(moment());
  }

  chosenYearHandler(normalizedYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value;
    ctrlValue.year(normalizedYear.year());
    this.date.setValue(ctrlValue);
    this.argument.value1 = this.date;
    datepicker.close();
  }

}
