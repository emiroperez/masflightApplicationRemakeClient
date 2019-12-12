import { Component, OnInit, Input, ChangeDetectionStrategy, OnDestroy, Inject, ChangeDetectorRef } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MatDialog, MAT_DATE_LOCALE, MatDatepicker, MatCalendar } from '@angular/material';
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
  templateUrl: './custom-date-header.html',
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
}

@Component({
  selector: 'year-header',
  templateUrl: './custom-date-header.html',
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

  loadingDefaults: boolean = false;
  minDate: Date;

  calendarHeader: any = MonthHeader;
  currentDateRange: any[] = [];
  currentValueType: number = 0;

  dateValueByFullDate: any[] = [
    {id: 0, name: 'Today', value: "TODAY"},
    {id: 1, name: 'Yesterday', value: "YESTERDAY"},
    {id: 2, name: 'Last Week', value: "LASTWEEK"},
    {id: 3, name: 'Last Month', value: "LASTMONTH"},
    {id: 4, name: 'Last Year', value: "LASTYEAR"}
  ];

  dateRangeByFullDate: any[] = [
    {id: 0, name: 'Today', value: "TODAY"},
    {id: 1, name: 'Yesterday', value: "YESTERDAY"},
    {id: 2, name: 'Last Week', value: "LASTWEEK"},
    {id: 3, name: 'Last Month', value: "LASTMONTH"},
    {id: 4, name: 'Last Year', value: "LASTYEAR"},
    {id: 5, name: 'Until Yesterday', value: "UNTILYESTERDAY"},
    {id: 6, name: 'Until Last Week', value: "UNTILLASTWEEK"},
    {id: 7, name: 'Until Last Month', value: "UNTILLASTMONTH"},
    {id: 8, name: 'Until Last Year', value: "UNTILLASTYEAR"},
    {id: 9, name: 'Until Today', value: "UNTILTODAY"}
  ];

  dateValueByMonth: any[] = [
    {id: 0, name: 'Current Month', value: "CURRENTMONTH"},
    {id: 1, name: 'Last Month', value: "LASTMONTH"},
    {id: 2, name: 'Last Year', value: "LASTYEAR"}
  ];

  dateRangeByMonth: any[] = [
    {id: 0, name: 'Current Month', value: "CURRENTMONTH"},
    {id: 1, name: 'Current Year', value :"CURRENTYEAR"},
    {id: 2, name: 'Last Month', value: "LASTMONTH"},
    {id: 3, name: 'Last Year', value: "LASTYEAR"},
    {id: 4, name: 'Until Last Month', value: "UNTILLASTMONTH"},
    {id: 5, name: 'Until Last Year', value: "UNTILLASTYEAR"},
  ];

  dateValueByQuarter: any[] = [
    {id: 0, name: 'Current Quarter', value: "CURRENTQUARTER"},
    {id: 1, name: 'Last Quarter', value: "LASTQUARTER"},
    {id: 2, name: 'Last Year', value: "LASTYEAR"}
  ];

  dateRangeByQuarter: any[] = [
    {id: 0, name: 'Current Quarter', value: "CURRENTQUARTER"},
    {id: 1, name: 'Current Year', value :"CURRENTYEAR"},
    {id: 2, name: 'Last Quarter', value: "LASTQUARTER"},
    {id: 3, name: 'Last Year', value: "LASTYEAR"},
    {id: 4, name: 'Until Last Quarter', value: "UNTILLASTQUARTER"},
    {id: 5, name: 'Until Last Year', value: "UNTILLASTYEAR"},
  ];

  dateValueByYear: any[] = [
    {id: 0, name: 'Current Year', value: "CURRENTYEAR"},
    {id: 1, name: 'Last Year', value: "LASTYEAR"}
  ];

  dateRangeByYear: any[] = [
    {id: 0, name: 'Current Year', value: "CURRENTYEAR"},
    {id: 1, name: 'Last Year', value: "LASTYEAR"},
    {id: 2, name: 'Until Last Year', value: "UNTILLASTYEAR"}
  ];

  quarters: any[] = [
    {id: 1, name: '1st Quarter', value: "1"},
    {id: 2, name: '2nd Quarter', value: "2"},
    {id: 3, name: '3rd Quarter', value: "3"},
    {id: 4, name: '4th Quarter', value: "4"}
  ];

  monthNames: string[] =
  [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  dateRange: any = null;
  dateStartView: string = "month";
  valueType: string = "fullDate";
  autoSelectDate;

  value1Display: any;
  value2Display: any;
  value1Date: Moment;
  value2Date: Moment;

  constructor(public globals: Globals,public dialog: MatDialog) { }

  ngOnInit()
  {
    this.currentValueType = this.argument.value3;

    switch (this.currentValueType)
    {
      case 3:
        this.calendarHeader = YearHeader;
        this.dateStartView = "multi-year";
        this.valueType = "year";

        if (this.argument.selectionMode == 1)
          this.currentDateRange = this.dateRangeByYear;
        else
          this.currentDateRange = this.dateValueByYear;
        break;

      case 2:
        this.calendarHeader = YearHeader;
        this.dateStartView = "multi-year";
        this.valueType = "quarter";

        if (this.argument.selectionMode == 1)
          this.currentDateRange = this.dateRangeByQuarter;
        else
          this.currentDateRange = this.dateValueByQuarter;
        break;

      case 1:
        this.dateStartView = "year";
        this.valueType = "month";

        if (this.argument.selectionMode == 1)
          this.currentDateRange = this.dateRangeByMonth;
        else
          this.currentDateRange = this.dateValueByMonth;
        break;

      default:
        if (this.argument.selectionMode == 1)
          this.currentDateRange = this.dateRangeByFullDate;
        else
          this.currentDateRange = this.dateValueByFullDate;
        break;
    }

    if (this.argument.value1)
    {
      setTimeout (() => {
        this.loadingDefaults = true;

        // auto select date range after loading the default value
        for (let dateRange of this.currentDateRange)
        {
          if (dateRange.value === this.argument.value1)
          {
            this.argument.value1 = null;
            this.dateRange = dateRange;
            this.autoSelect ();
            break;
          }
        }
  
        this.loadingDefaults = false;
      }, 1);
    }
    else
    {
      setTimeout (() => {
        if (this.currentValueType == 2)
        {
          this.argument.value3 = this.quarters[0];
          this.argument.value4 = this.quarters[3];
        }
        else if (this.currentValueType == 1)
        {
          this.argument.value3 = null;
          this.argument.value4 = null;
        }
      }, 1);
    }

    this.minDate = this.argument.minDate;
  }

  dateChange(event): void
  {
    if (!this.argument.value2 && this.argument.selectionMode == 1)
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

    if (this.argument.selectionMode == 1)
    {
      switch (option)
      {
        case 'TODAY':
          this.calculateDateRange ('Today', option);
          break;

        case 'CURRENTMONTH':
          this.calculateDateRange ('Current Month', option);
          break;

        case 'CURRENTQUARTER':
          this.calculateDateRange ('Current Quarter', option);
          break;

        case 'CURRENTYEAR':
          this.calculateDateRange ('Current Year', option);
          break;

        case 'YESTERDAY':
          this.calculateDateRange ('Yesterday', option);
          break;

        case 'LASTWEEK':
          this.calculateDateRange ('Last Week', option);
          break;

        case 'LASTMONTH':
          this.calculateDateRange ('Last Month', option);
          break;

        case 'LASTQUARTER':
          this.calculateDateRange ('Last Quarter', option);
          break;

        case 'LASTYEAR':
          this.calculateDateRange ('Last Year', option);
          break;

        case 'UNTILYESTERDAY':
          this.calculateDateRange2 ('Until Yesterday', option);
          break;

        case 'UNTILLASTWEEK':
          this.calculateDateRange2 ('Until Last Week', option);
          break;

        case 'UNTILLASTMONTH':
          this.calculateDateRange2 ('Until Last Month', option);
          break;

        case 'UNTILLASTQUARTER':
          this.calculateDateRange2 ('Until Last Quarter', option);
          break;

        case 'UNTILLASTYEAR':
          this.calculateDateRange2 ('Until Last Year', option);
          break;

        case 'UNTILTODAY':
          this.calculateDateRange2 ('Until Today', option);
          break;
      }

      switch (this.currentValueType)
      {
        case 1:
          this.setMonthValue1 (moment (this.argument.value1));
          this.setMonthValue2 (moment (this.argument.value2));
          break;

        case 2:
          this.setQuarterValue1 ();
          this.setQuarterValue2 ();
          break;

        case 3:
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
          this.argument.value1 = new Date (new Date ().getTime ());
          break;

        case 'CURRENTMONTH':
          this.argument.value1 = moment ().startOf ("month").toDate ();
          break;

        case 'CURRENTQUARTER':
          this.argument.value1 = moment ().startOf ("month").toDate ();
          break;

        case 'CURRENTYEAR':
          this.argument.value1 = moment ().startOf ("year").toDate ();
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

        case 'LASTQUARTER':
          this.argument.value1 = moment ().subtract (3, "months").startOf ("month").toDate ();
          break;
  
        case 'LASTYEAR':
          this.argument.value1 = moment ().subtract (1, "years").startOf ("year").toDate ();
          break;   
      }

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

  calculateDateRange(type: string, option: string): void
  {
    let today = new Date ();
    let maximunDateMessage = "the maximun date of the option is ";

    if (this.argument.maxDate == null || today < this.argument.maxDate)
    {
      this.argument.value2 = today;
      maximunDateMessage = "the option doesn't have maximun date";
    }
    else
    {
      this.argument.value2 = this.argument.maxDate;
      maximunDateMessage += this.argument.maxDate.toLocaleString ("en-US").split (",")[0];
    }

    switch (option)
    {
      case 'TODAY':
        this.argument.value1 = new Date (this.argument.value2.getTime ());
        break;

      case 'CURRENTMONTH':
        this.argument.value1 = moment ().startOf ("month").toDate ();
        break;

      case 'CURRENTQUARTER':
        this.argument.value1 = moment ().startOf ("month").toDate ();
        break;

      case 'CURRENTYEAR':
        this.argument.value1 = moment ().startOf ("year").toDate ();
        break;

      case 'YESTERDAY':
        this.argument.value1 = new Date (this.argument.value2.getTime () - (24 * 60 * 60 * 1000));
        break;

      case 'LASTWEEK':
        this.argument.value1 = moment ().day (1).subtract (2, "days").day (1).toDate ();
        break;

      case 'LASTMONTH':
        this.argument.value1 = moment ().subtract (1, "months").startOf ("month").toDate ();
        break;

      case 'LASTQUARTER':
        this.argument.value1 = moment ().subtract (3, "months").startOf ("month").toDate ();
        break;

      case 'LASTYEAR':
        this.argument.value1 = moment ().subtract (1, "years").startOf ("year").toDate ();
        break;   
    }

    this.openDialog ("The date range changed to " + type + ", " + maximunDateMessage);
  }

  calculateDateRange2(type: string, option: string): void
  {
    let maximunDateMessage = "";
    let newDate;

    switch (option)
    {
      case 'UNTILYESTERDAY':
        newDate = new Date (new Date ().getTime () - (24 * 60 * 60 * 1000));
        break;
    
      case 'UNTILLASTWEEK':
        newDate = moment ().day (1).subtract (2, "days").day (7).toDate ();
        break;

      case 'UNTILLASTMONTH':
        newDate = moment ().subtract (1, "months").endOf ("month").toDate ();
        break;

      case 'UNTILLASTQUARTER':
        newDate = moment ().subtract (3, "months").endOf ("month").toDate ();
        break;
    
      case 'UNTILLASTYEAR':
        newDate = moment ().subtract (1, "years").endOf ("year").toDate ();
        break;
    
      case 'UNTILTODAY':
        newDate = new Date (new Date ().getTime ());
        break;
    }

    if (this.argument.value1)
    {
      if (newDate >= new Date (this.argument.value1))
      {
        this.argument.value2 = newDate;

        if (this.argument.maxDate && this.argument.value2 > this.argument.maxDate)
          this.argument.value2 = this.argument.maxDate;

        maximunDateMessage += ", the maximun date of the option is " + new Date (this.argument.value2).toLocaleString ("en-US").split (",")[0];
      }
      else
      {
        this.dateRange = null;
        this.openDialog ("The final date can't be less than the initial date");
        return;
      }
    }
    else
    {
      switch (option)
      {
        case 'UNTILTODAY':
          this.argument.value1 = new Date ();
          break;
  
        case 'UNTILYESTERDAY':
          this.argument.value1 = new Date (new Date ().getTime () - (24 * 60 * 60 * 1000));
          break;
  
        case 'UNTILLASTWEEK':
          this.argument.value1 = moment ().day (1).subtract (2, "days").day (1).toDate ();
          break;
  
        case 'UNTILLASTMONTH':
          this.argument.value1 = moment ().subtract (1, "months").startOf ("month").toDate ();
          break;

        case 'UNTILLASTQUARTER':
          this.argument.value1 = moment ().subtract (3, "months").startOf ("month").toDate ();
          break;
  
        case 'UNTILLASTYEAR':
          this.argument.value1 = moment ().subtract (1, "years").startOf ("year").toDate ();
          break;   
      }

      this.argument.value2 = newDate;
    }

    this.openDialog ("The date range changed to " + type + maximunDateMessage);
  }
  
  openDialog(text: string): void
  {
    if (!this.loadingDefaults)
    {
      this.dialog.open (MessageComponent,
      {
        data: { title: "Message", message: text }
      });
    }
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
    this.argument.value1 = normalizedDate.year ();
    this.argument.value3 = normalizedDate.month ();
    this.value1Display = this.monthNames[normalizedDate.month ()] + "/" + normalizedDate.year ();
    this.value1Date = normalizedDate;
  }

  setMonthValue2(normalizedDate: Moment): void
  {
    this.argument.value2 = normalizedDate.year ();
    this.argument.value4 = normalizedDate.month ();
    this.value2Display = this.monthNames[normalizedDate.month ()] + "/" + normalizedDate.year ();
    this.value2Date = normalizedDate;
  }

  setQuarterValue1(): void
  {
    let normalizedDate = moment (this.argument.value1);
    let quarterValue = Math.trunc (normalizedDate.month () / 3) + 1;

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
    let quarterValue = Math.trunc (normalizedDate.month () / 3) + 1;

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
}
