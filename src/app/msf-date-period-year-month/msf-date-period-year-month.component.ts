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
    dateInput: 'MMM/YYYY',
  },
  display: {
    dateInput: 'MMM/YYYY',
    monthYearLabel: 'MMM YYYY',
    yearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMM YYYY',
  },
};

@Component({
  selector: 'app-msf-date-period-year-month',
  templateUrl: './msf-date-period-year-month.component.html',
  styleUrls: ['./msf-date-period-year-month.component.css'],
  providers: [
    {
        provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    {
        provide: MAT_DATE_FORMATS, useValue: MY_FORMATS
    }
    ]
})
export class MsfDatePeriodYearMonthComponent implements OnInit {

  constructor(public globals: Globals) { }

  date: FormControl;
  loading = false;

  @Input("argument") public argument: Arguments;
  
  ngOnInit() {
    if(this.argument.maxDate!=null){
      this.date =  new FormControl(moment(this.argument.maxDate));
    }else{
      this.date =  new FormControl(moment());
    }
    if(!this.argument.value1&&!this.argument.value2){
    this.argument.value1 = this.date.value.year();
    this.argument.value2 = this.date.value.month() + 1;
    }
    else if (this.argument.value1)
    {
      let ctrlValue;

      switch (this.argument.value1)
      {
        case "CURRENTYEAR":
          this.argument.value1 = this.date.value.year ();
          this.argument.value2 = this.date.value.month () + 1;
          this.setCtrlValue ();
          break;

        case "LASTMONTH":
          this.argument.value1 = this.date.value.year ();
          this.argument.value2 = this.date.value.month ();
          this.setCtrlValue ();
          break;
  
        case "LASTYEAR":
          this.argument.value1 = this.date.value.year () - 1;
          this.argument.value2 = this.date.value.month () + 1;
          this.setCtrlValue ();
          break;
      }
    }

    this.onChanges ();
  }

  setCtrlValue(): void
  {
    let ctrlValue;

    ctrlValue = this.date.value;
    ctrlValue.year (this.argument.value1);
    ctrlValue.month (this.argument.value2 - 1);
    this.date.setValue (ctrlValue);
  }

  onChanges(): void
  {
    this.date.valueChanges.subscribe (value =>
    {
      let normalizedDate: Moment = moment (value, "MMM/YYYY");
      this.argument.value1 = normalizedDate.year ();
      this.argument.value2 = normalizedDate.month () + 1;
    });
  }

  chosenYearHandler(normalizedYear: Moment) {
    const ctrlValue = this.date.value;
    ctrlValue.year(normalizedYear.year());
    this.date.setValue(ctrlValue);
    this.argument.value1 = normalizedYear.year();
  }

  chosenMonthHandler(normalizedYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value;
    ctrlValue.month(normalizedYear.month());
    this.date.setValue(ctrlValue);
    this.argument.value2 = normalizedYear.month() + 1;
    datepicker.close();
  }

  

}
