import { Component, OnInit, Input, ChangeDetectionStrategy, OnDestroy, Inject, ChangeDetectorRef } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDatepicker, MatCalendar } from '@angular/material';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import { Arguments } from '../model/Arguments';
import { Globals } from '../globals/Globals';
import { MessageComponent } from '../message/message.component';

import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
  selector: 'month-header',
  templateUrl: './month-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthHeader<D> implements OnDestroy {
  private _destroyed = new Subject<void> ();

  constructor(
      private _calendar: MatCalendar<D>, private _dateAdapter: DateAdapter<D>,
      public changeDetectorRef: ChangeDetectorRef)
  {
    _calendar.stateChanges.pipe (takeUntil (this._destroyed)).subscribe (() =>
      changeDetectorRef.markForCheck ());
  }

  ngOnDestroy()
  {
    this._destroyed.next ();
    this._destroyed.complete ();
  }

  get periodLabel()
  {
    return this._dateAdapter.getYearName (this._calendar.activeDate);
  }

  previousClicked()
  {
    this._calendar.activeDate = this._dateAdapter.addCalendarYears (this._calendar.activeDate, -1);
  }

  nextClicked(): void
  {
    this._calendar.activeDate = this._dateAdapter.addCalendarYears (this._calendar.activeDate, 1);
  }

  rewindClicked()
  {
    this._calendar.activeDate = this._dateAdapter.addCalendarYears (this._calendar.activeDate, -10);
  }

  forwardClicked(): void
  {
    this._calendar.activeDate = this._dateAdapter.addCalendarYears (this._calendar.activeDate, 10);
  }
}

@Component({
  selector: 'year-header',
  templateUrl: './year-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YearHeader<D> implements OnDestroy {
  private _destroyed = new Subject<void> ();

  constructor(
      private _calendar: MatCalendar<D>, private _dateAdapter: DateAdapter<D>,
      public changeDetectorRef: ChangeDetectorRef)
  {
    _calendar.stateChanges.pipe (takeUntil (this._destroyed)).subscribe (() =>
      changeDetectorRef.markForCheck ());
  }

  ngOnDestroy()
  {
    this._destroyed.next ();
    this._destroyed.complete ();
  }

  get periodLabel()
  {
    let activeYear = Math.trunc (parseInt (this._dateAdapter.getYearName (this._calendar.activeDate)) / 24) * 24;
    return activeYear + " - " + (activeYear + 23);
  }

  previousClicked()
  {
    this._calendar.activeDate = this._dateAdapter.addCalendarYears (this._calendar.activeDate, -23);
  }

  nextClicked(): void
  {
    this._calendar.activeDate = this._dateAdapter.addCalendarYears (this._calendar.activeDate, 23);
  }
}

@Component({
  selector: 'app-msf-date-range',
  templateUrl: './msf-date-range.component.html',
  providers: [
    {
        provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]
    },
    {   
        provide: MAT_DATE_FORMATS, useValue: US_DATE_FORMAT
    }
    ]
})
export class MsfDateRangeComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  prepareAutoDateRange: boolean = false;
  minDate: Date;

  calendarHeader: any = MonthHeader;
  currentDateRange: any[] = [];
  currentValueType: number = 0;
  selectionMode: string = "manual";

  dateValueByFullDate: any[] = [
    { id: 0, name: 'Today', value: "TODAY" },
    { id: 1, name: 'Yesterday', value: "YESTERDAY" }
  ];

  dateRangeByFullDate: any[] = [
    { id: 0, name: 'Today', value: "TODAY" },
    { id: 1, name: 'Yesterday', value: "YESTERDAY" },
    { id: 2, name: 'Current Week', value: "CURRENTWEEK" },
    { id: 3, name: 'Current Quarter', value: "CURRENTQUARTER" },
    { id: 4, name: 'Current Month', value: "CURRENTMONTH" },
    { id: 5, name: 'Current Year', value: "CURRENTYEAR" },
    { id: 6, name: 'Last 7 Days', value: "LAST7DAYS" },
    { id: 7, name: 'Last 30 Days', value: "LAST30DAYS" },
    { id: 8, name: 'Last Week', value: "LASTWEEK" },
    { id: 9, name: 'Last Month', value: "LASTMONTH" },
    { id: 10, name: 'Last Quarter', value: "LASTQUARTER" },
    { id: 11, name: 'Last Year', value: "LASTYEAR" },
    { id: 12, name: 'Until Today', value: "UNTILTODAY" },
    { id: 13, name: 'Until Yesterday', value: "UNTILYESTERDAY" },
    { id: 14, name: 'Until Last 7 Days', value: "UNTILLAST7DAYS" },
    { id: 15, name: 'Until Last 30 Days', value: "UNTILLAST30DAYS" },
    { id: 16, name: 'Until Last Week', value: "UNTILLASTWEEK" },
    { id: 17, name: 'Until Last Month', value: "UNTILLASTMONTH" },
    { id: 18, name: 'Until Last Quarter', value: "UNTILLASTQUARTER" },
    { id: 19, name: 'Until Last Year', value: "UNTILLASTYEAR" }
  ];

  dateValueByMonth: any[] = [
    { id: 0, name: 'Current Month', value: "CURRENTMONTH" },
    { id: 1, name: 'Last Month', value: "LASTMONTH" }
  ];

  dateRangeByMonth: any[] = [
    { id: 0, name: 'Current Month', value: "CURRENTMONTH" },
    { id: 1, name: 'Current Quarter', value: "CURRENTQUARTER" },
    { id: 2, name: 'Current Year', value :"CURRENTYEAR" },
    { id: 3, name: 'Last Month', value: "LASTMONTH" },
    { id: 4, name: 'Last Quarter', value: "LASTQUARTER" },
    { id: 5, name: 'Last Year', value: "LASTYEAR" },
    { id: 6, name: 'Until Last Month', value: "UNTILLASTMONTH" },
    { id: 7, name: 'Until Last Quarter', value: "UNTILLASTQUARTER" },
    { id: 8, name: 'Until Last Year', value: "UNTILLASTYEAR" }
  ];

  dateValueByQuarter: any[] = [
    { id: 0, name: 'Current Quarter', value: "CURRENTQUARTER" },
    { id: 1, name: 'Last Quarter', value: "LASTQUARTER" }
  ];

  dateRangeByQuarter: any[] = [
    { id: 0, name: 'Current Quarter', value: "CURRENTQUARTER" },
    { id: 1, name: 'Current Year', value :"CURRENTYEAR" },
    { id: 2, name: 'Last Quarter', value: "LASTQUARTER" },
    { id: 3, name: 'Last Year', value: "LASTYEAR" },
    { id: 4, name: 'Until Last Quarter', value: "UNTILLASTQUARTER" },
    { id: 5, name: 'Until Last Year', value: "UNTILLASTYEAR" }
  ];

  dateValueByYear: any[] = [
    { id: 0, name: 'Current Year', value: "CURRENTYEAR" },
    { id: 1, name: 'Last Year', value: "LASTYEAR" }
  ];

  dateRangeByYear: any[] = [
    { id: 0, name: 'Current Year', value: "CURRENTYEAR" },
    { id: 1, name: 'Last Year', value: "LASTYEAR" },
    { id: 2, name: 'Until Last Year', value: "UNTILLASTYEAR" }
  ];

  quarters: any[] = [
    { id: 1, name: '1st Quarter', value: "1" },
    { id: 2, name: '2nd Quarter', value: "2" },
    { id: 3, name: '3rd Quarter', value: "3" },
    { id: 4, name: '4th Quarter', value: "4" }
  ];

  quarterRange: any[] = [
    { id: 1, start: 0, end: 2 },
    { id: 2, start: 3, end: 5 },
    { id: 3, start: 6, end: 8 },
    { id: 4, start: 9, end: 11 }
  ];

  monthNames: string[] =
  [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  dateRange: any = null;
  dateStartView: string = "month";
  valueType: string = "fullDate";
  isDateRange: boolean = false;
  autoSelectDate;

  value1Display: any;
  value2Display: any;
  value1Date: Moment;
  value2Date: Moment;

  leadingZero: number;
  monthDateFormat: number;

  constructor(public globals: Globals) { }

  ngOnInit()
  {
    this.currentValueType = (this.argument.selectionMode >> 1) & 3;

    if (!this.argument.currentDateRangeValue)
      this.argument.currentDateRangeValue = (this.argument.selectionMode >> 3) & 31;

    this.leadingZero = (this.argument.selectionMode >> 11) & 1;
    this.monthDateFormat = (this.argument.selectionMode >> 12) & 1;

    this.isDateRange = (this.argument.selectionMode & 1) ? true : false;

    switch (this.currentValueType)
    {
      case 3:
        this.calendarHeader = YearHeader;
        this.dateStartView = "multi-year";
        this.valueType = "year";

        if (this.isDateRange)
          this.currentDateRange = this.dateRangeByYear;
        else
          this.currentDateRange = this.dateValueByYear;
        break;

      case 2:
        this.calendarHeader = YearHeader;
        this.dateStartView = "multi-year";
        this.valueType = "quarter";

        if (this.isDateRange)
          this.currentDateRange = this.dateRangeByQuarter;
        else
          this.currentDateRange = this.dateValueByQuarter;
        break;

      case 1:
        this.dateStartView = "year";
        this.valueType = "month";

        if (this.isDateRange)
          this.currentDateRange = this.dateRangeByMonth;
        else
          this.currentDateRange = this.dateValueByMonth;
        break;

      default:
        if (this.isDateRange)
          this.currentDateRange = this.dateRangeByFullDate;
        else
          this.currentDateRange = this.dateValueByFullDate;
        break;
    }

    if (!this.argument.dateLoaded)
    {
      this.prepareAutoDateRange = true;

      // auto select date range after loading the default value
      for (let dateRange of this.currentDateRange)
      {
        if (dateRange.id === this.argument.currentDateRangeValue)
        {
          this.dateRange = dateRange;
          this.autoSelect ();
          break;
        }
      }
  
      this.prepareAutoDateRange = false;
      this.argument.dateLoaded = true;
    }
    else
    {
      for (let dateRange of this.currentDateRange)
      {
        if (dateRange.id === this.argument.currentDateRangeValue)
        {
          this.dateRange = dateRange;
          break;
        }
      }

      // set display and date values
      switch (this.currentValueType)
      {
        case 3:
          this.setYearValue1 (moment (this.argument.value1, "YYYY"));

          if (this.isDateRange)
            this.setYearValue2 (moment (this.argument.value2, "YYYY"));
          break;

        case 2:
          this.setQuarterValue1FromArgument ();

          if (this.isDateRange)
            this.setQuarterValue2FromArgument ();
          break;

        case 1:
          this.setMonthValue1 (moment (this.argument.value1, "MMM/YYYY"));

          if (this.isDateRange)
            this.setMonthValue2 (moment (this.argument.value1, "MMM/YYYY"));
      }
    }

    this.minDate = this.argument.minDate;
  }

  dateChange(event): void
  {
    if (!this.argument.value2 && this.isDateRange)
      this.argument.value2 = this.argument.value1;

    this.minDate = this.argument.value1;
  }

  validateDate(): void
  {
    if (this.argument.value1)
      this.argument.value1 = new DatePipe ('en-US').transform (this.argument.value1, 'MM/dd/yyyy');   
  }

  autoSelect(): void
  {
    var option = this.dateRange;

    if (option != null)
      option = option.value;

    if (this.isDateRange)
    {
      if (option.startsWith ("UNTIL"))
        this.calculateDateRange2 (option);
      else
        this.calculateDateRange (option);

      // check date range
      if (this.argument.maxDate)
      {
        if (this.argument.value1 && this.argument.value1 > this.argument.maxDate)
          this.argument.value1 = this.argument.maxDate;

        if (this.argument.value2 && this.argument.value2 > this.argument.maxDate)
          this.argument.value2 = this.argument.maxDate;
      }

      if (this.argument.minDate)
      {
        if (this.argument.value1 && this.argument.value1 < this.argument.minDate)
          this.argument.value1 = this.argument.minDate;

        if (this.argument.value2 && this.argument.value2 < this.argument.minDate)
          this.argument.value2 = this.argument.minDate;
      }

      switch (this.currentValueType)
      {
        case 1:
          if (this.argument.value1)
            this.setMonthValue1 (moment (this.argument.value1));

          this.setMonthValue2 (moment (this.argument.value2));
          break;

        case 2:
          if (this.argument.value1)
            this.setQuarterValue1 ();

          this.setQuarterValue2 ();
          break;

        case 3:
          if (this.argument.value1)
            this.setYearValue1 (moment (this.argument.value1));

          this.setYearValue2 (moment (this.argument.value2));
          break;
      }
    }
    else
    {
      switch (option)
      {
        case 'TODAY':
          this.argument.value1 = moment ().toDate ();
          break;

        case 'CURRENTWEEK':
          this.argument.value1 = moment ().day (1).toDate ();
          break;

        case 'CURRENTMONTH':
          this.argument.value1 = moment ().startOf ("month").toDate ();
          break;

        case 'CURRENTQUARTER':
        {
          let date = moment ().startOf ("month");
          let quarter = date.quarter ();
    
          for (let quarterIndex of this.quarterRange)
          {
            if (quarterIndex.id == quarter)
            {
              date.set ("month", quarterIndex.start);
              this.argument.value1 = date.toDate ();
              break;
            }
          }
    
          break;
        }

        case 'CURRENTYEAR':
          this.argument.value1 = moment ().startOf ("year").toDate ();
          break;
  
        case 'YESTERDAY':
          this.argument.value1 = moment ().subtract (1, "days").toDate ();
          break;

        case 'LAST7DAYS':
          this.argument.value1 = moment ().subtract (7, "days").toDate ();
          break;

        case 'LAST30DAYS':
          this.argument.value1 = moment ().subtract (30, "days").toDate ();
          break;

        case 'LASTWEEK':
          this.argument.value1 = moment ().day (1).subtract (2, "days").day (1).toDate ();
          break;
  
        case 'LASTMONTH':
          this.argument.value1 = moment ().subtract (1, "months").startOf ("month").toDate ();
          break;

        case 'LASTQUARTER':
        {
          let date = moment ().subtract (3, "months").startOf ("month");
          let quarter = date.quarter ();
    
          for (let quarterIndex of this.quarterRange)
          {
            if (quarterIndex.id == quarter)
            {
              date.set ("month", quarterIndex.end);
              this.argument.value1 = date.endOf ("month").toDate ();
              break;
            }
          }
    
          break;
        }
  
        case 'LASTYEAR':
          this.argument.value1 = moment ().subtract (1, "years").startOf ("year").toDate ();
          break;   
      }

      // check date range
      if (this.argument.maxDate && this.argument.value1 > this.argument.maxDate)
        this.argument.value1 = this.argument.maxDate;
      else if (this.argument.minDate && this.argument.value1 < this.argument.minDate)
        this.argument.value1 = this.argument.minDate;

      switch (this.currentValueType)
      {
        case 1:
          this.setMonthValue1 (moment (this.argument.value1));
          break;

        case 2:
          this.setQuarterValue1 ();
          break;

        case 3:
          this.setYearValue1 (moment (this.argument.value1));
          break;
      }
    }
  }

  calculateDateRange(option: string): void
  {
    let today = moment ().toDate ();

    switch (option)
    {
      case 'TODAY':
        this.argument.value1 = this.argument.value2 = moment ().toDate ();
        break;

      case 'CURRENTWEEK':
        this.argument.value1 = moment ().day (1).toDate ();
        this.argument.value2 = moment ().day (7).toDate ();
        break;

      case 'CURRENTMONTH':
        this.argument.value1 = moment ().startOf ("month").toDate ();
        this.argument.value2 = moment ().endOf ("month").toDate ();
        break;

      case 'CURRENTQUARTER':
      {
        let date = moment ().startOf ("month");
        let quarter = date.quarter ();

        for (let quarterIndex of this.quarterRange)
        {
          if (quarterIndex.id == quarter)
          {
            date.set ("month", quarterIndex.start);
            this.argument.value1 = date.toDate ();
            date.set ("month", quarterIndex.end);
            this.argument.value2 = date.endOf ("month").toDate ();
            break;
          }
        }

        break;
      }

      case 'CURRENTYEAR':
        this.argument.value1 = moment ().startOf ("year").toDate ();
        this.argument.value2 = moment ().endOf ("year").toDate ();
        break;

      case 'YESTERDAY':
        this.argument.value1 = this.argument.value2 = moment ().subtract (1, "days").toDate ();
        break;

      case 'LAST7DAYS':
        this.argument.value1 = moment ().subtract (7, "days").toDate ();
        this.argument.value2 = moment ().toDate ();
        break;

      case 'LAST30DAYS':
        this.argument.value1 = moment ().subtract (30, "days").toDate ();
        this.argument.value2 = moment ().toDate ();
        break;

      case 'LASTWEEK':
        this.argument.value1 = moment ().day (1).subtract (2, "days").day (1).toDate ();
        this.argument.value2 = moment ().day (1).subtract (2, "days").day (7).toDate ();
        break;

      case 'LASTMONTH':
        this.argument.value1 = moment ().subtract (1, "months").startOf ("month").toDate ();
        this.argument.value2 = moment ().subtract (1, "months").endOf ("month").toDate ();
        break;

      case 'LASTQUARTER':
      {
        let date = moment ().subtract (3, "months").startOf ("month");
        let quarter = date.quarter ();
  
        for (let quarterIndex of this.quarterRange)
        {
          if (quarterIndex.id == quarter)
          {
            date.set ("month", quarterIndex.start);
            this.argument.value1 = date.toDate ();
            date.set ("month", quarterIndex.end);
            this.argument.value2 = date.endOf ("month").toDate ();
            break;
          }
        }
  
        break;
      }

      case 'LASTYEAR':
        this.argument.value1 = moment ().subtract (1, "years").startOf ("year").toDate ();
        this.argument.value2 = moment ().subtract (1, "years").endOf ("year").toDate ();
        break;   
    }

    if (this.argument.maxDate == null || today < this.argument.maxDate)
    {
      if (this.argument.value2 > today)
        this.argument.value2 = today;
    }
    else
      this.argument.value2 = this.argument.maxDate;
  }

  calculateDateRange2(option: string): void
  {
    let newDate;

    switch (option)
    {
      case 'UNTILYESTERDAY':
        newDate = moment ().subtract (1, "days").toDate ();
        break;

      case 'UNTILLAST7DAYS':
        newDate = moment ().subtract (7, "days").toDate ();
        break;

      case 'UNTILLAST30DAYS':
        newDate = moment ().subtract (30, "days").toDate ();
        break;

      case 'UNTILLASTWEEK':
        newDate = moment ().day (1).subtract (2, "days").day (7).toDate ();
        break;

      case 'UNTILLASTMONTH':
        newDate = moment ().subtract (1, "months").endOf ("month").toDate ();
        break;

      case 'UNTILLASTQUARTER':
      {
        let date = moment ().subtract (3, "months").startOf ("month");
        let quarter = date.quarter ();
  
        for (let quarterIndex of this.quarterRange)
        {
          if (quarterIndex.id == quarter)
          {
            date.set ("month", quarterIndex.end);
            newDate = date.endOf ("month").toDate ();
            break;
          }
        }
  
        break;
      }
    
      case 'UNTILLASTYEAR':
        newDate = moment ().subtract (1, "years").endOf ("year").toDate ();
        break;
    
      case 'UNTILTODAY':
        newDate = moment ().toDate ();
        break;
    }

    if (!this.prepareAutoDateRange)
      this.argument.value1 = null;

    this.argument.value2 = newDate;

    if (this.argument.maxDate && this.argument.value2 > this.argument.maxDate)
      this.argument.value2 = this.argument.maxDate;
  }

  getMonthDateFormat(): string
  {
    let format = this.argument.dateFormat;

    if (!format)
      return "MMyyyy"; // default date format if not set

    format = format.replace (/m/g, "M");
    format = format.replace (/Y/g, "y");

    return format;
  }

  chosenYearHandler1(normalizedDate: Moment, datepicker: MatDatepicker<Moment>): void
  {
    if (this.valueType !== "year" && this.valueType !== "quarter")
      return;

    this.setYearValue1 (normalizedDate);
    datepicker.close ();
  }

  chosenYearHandler2(normalizedDate: Moment, datepicker: MatDatepicker<Moment>): void
  {
    if (this.valueType !== "year" && this.valueType !== "quarter")
      return;

    this.setYearValue2 (normalizedDate);
    datepicker.close ();
  }

  chosenMonthHandler1(normalizedDate: Moment, datepicker: MatDatepicker<Moment>): void
  {
    if (this.valueType === "fullDate")
      return;

    this.setMonthValue1 (normalizedDate);
    datepicker.close ();
  }

  chosenMonthHandler2(normalizedDate: Moment, datepicker: MatDatepicker<Moment>): void
  {
    if (this.valueType === "fullDate")
      return;

    this.setMonthValue2 (normalizedDate);
    datepicker.close ();
  }

  setYearValue1(normalizedDate: Moment): void
  {
    this.argument.value1 = normalizedDate.year ();
    this.value1Display = normalizedDate.year ();
    this.value1Date = normalizedDate;
  }

  setYearValue2(normalizedDate: Moment): void
  {
    this.argument.value2 = normalizedDate.year ();
    this.value2Display = normalizedDate.year ();
    this.value2Date = normalizedDate;
  }

  setMonthValue1(normalizedDate: Moment): void
  {
    if (this.monthDateFormat)
      this.argument.value1 = new DatePipe ('en-US').transform (normalizedDate.toDate (), this.getMonthDateFormat ());
    else
    {
      this.argument.value1 = normalizedDate.year ();

      this.argument.value3 = normalizedDate.month () + 1;
      if (this.leadingZero && this.argument.value3 < 10)
        this.argument.value3 = '0' + this.argument.value3;
    }

    this.value1Display = this.monthNames[normalizedDate.month ()] + "/" + normalizedDate.year ();
    this.value1Date = normalizedDate;
  }

  setMonthValue2(normalizedDate: Moment): void
  {
    if (this.monthDateFormat)
      this.argument.value2 = new DatePipe ('en-US').transform (normalizedDate.toDate (), this.getMonthDateFormat ());
    else
    {
      this.argument.value2 = normalizedDate.year ();

      this.argument.value4 = normalizedDate.month () + 1;
      if (this.leadingZero && this.argument.value4 < 10)
        this.argument.value4 = '0' + this.argument.value4;
    }

    this.value2Display = this.monthNames[normalizedDate.month ()] + "/" + normalizedDate.year ();
    this.value2Date = normalizedDate;
  }

  setQuarterValue1(): void
  {
    let normalizedDate = moment (this.argument.value1);
    let quarterValue = normalizedDate.quarter ();

    for (let quarter of this.quarters)
    {
      if (quarter.id === quarterValue)
      {
        this.argument.value3 = quarter;
        break;
      }
    }

    this.setYearValue1 (normalizedDate);
  }

  setQuarterValue2(): void
  {
    let normalizedDate = moment (this.argument.value2);
    let quarterValue = normalizedDate.quarter ();

    for (let quarter of this.quarters)
    {
      if (quarter.id === quarterValue)
      {
        this.argument.value4 = quarter;
        break;
      }
    }

    this.setYearValue2 (normalizedDate);
  }

  setQuarterValue1FromArgument(): void
  {
    let normalizedDate = moment (this.argument.value1, "YYYY");

    for (let quarter of this.quarters)
    {
      if (quarter.id === this.argument.value3.id)
      {
        this.argument.value3 = quarter;
        break;
      }
    }

    this.setYearValue1 (normalizedDate);
  }

  setQuarterValue2FromArgument(): void
  {
    let normalizedDate = moment (this.argument.value2, "YYYY");

    for (let quarter of this.quarters)
    {
      if (quarter.id === this.argument.value4.id)
      {
        this.argument.value4 = quarter;
        break;
      }
    }

    this.setYearValue2 (normalizedDate);
  }

  setCurrentDateRangeValue(): void
  {
    if (this.dateRange)
      this.argument.currentDateRangeValue = this.dateRange.id;
    else
      this.argument.currentDateRangeValue = null;
  }

  setDateRange(): void
  {
    if (this.selectionMode === "auto")
    {
      this.prepareAutoDateRange = true;
      this.autoSelect ();
      this.prepareAutoDateRange = false;
    }
  }
}
