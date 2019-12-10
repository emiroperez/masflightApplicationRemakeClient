import { Component, OnInit, Input, Injectable, ChangeDetectorRef } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { DateAdapter, MAT_DATE_FORMATS, MatDialog, MAT_DATE_LOCALE } from '@angular/material';
import { AppDateAdapter, APP_DATE_FORMATS } from '../commons/date.adapters';
import { DatePipe } from '@angular/common';
import { Globals } from '../globals/Globals';
import { MessageComponent } from '../message/message.component';
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
  selector: 'app-msf-date-range',
  templateUrl: './msf-date-range.component.html',
  styleUrls: ['./msf-date-range.component.css'],
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
  autoSelectDate;
  dates: any[] = [
    {id: 1, name: 'Today',value:"TODAY"},
    {id: 2, name: 'Yesterday',value:"YESTERDAY"},
    {id: 3, name: 'Last Week',value:"LASTWEEK"},
    {id: 4, name: 'Last Month',value:"LASTMONTH"},
    {id: 5, name: 'Last Year',value:"LASTYEAR"},
    {id: 6, name: 'Until Yesterday',value:"UNTILYESTERDAY"},
    {id: 7, name: 'Until Last Week',value:"UNTILLASTWEEK"},
    {id: 8, name: 'Until Last Month',value:"UNTILLASTMONTH"},
    {id: 9, name: 'Until Last Year',value:"UNTILLASTYEAR"},
    {id: 10, name: 'Until Today',value:"UNTILTODAY"}
  ];

  constructor(public globals: Globals,public dialog: MatDialog) { }

  ngOnInit() {
    if (this.argument.value1)
    {
      setTimeout (() => {
        this.loadingDefaults = true;

        // auto select date range after loading the default value
        for (let dateRange of this.dates)
        {
          if (dateRange.value === this.argument.value1)
          {
            this.argument.value1 = null;
            this.argument.value3 = dateRange;
            this.autoSelect ();
            break;
          }
        }
  
        this.loadingDefaults = false;
      }, 1);
    }

    this.minDate = this.argument.minDate;
  }

  dateChange(event){      
      if(!this.argument.value2){
        this.argument.value2 = this.argument.value1;
      }

      this.minDate = this.argument.value1;
  }

  hasDate(){

  }

  validateDate(){
      if(this.argument.value1){
        this.argument.value1 = new DatePipe('en-US').transform(this.argument.value1, 'MM/dd/yyyy');
      }    
  }

  autoSelect(){
    var option = this.argument.value3;
    if(option!=null){
      option = option.value;
    }
    switch (option) {
      case 'TODAY':
        this.calculateDate ('Today', option);
        break;

      case 'YESTERDAY':
        this.calculateDate ('Yesterday', option);
        break;

      case 'LASTWEEK':
        this.calculateDate ('Last Week', option);
        break;

      case 'LASTMONTH':
        this.calculateDate ('Last Month', option);
        break;

      case 'LASTYEAR':
        this.calculateDate ('Last Year', option);
        break;

      case 'UNTILYESTERDAY':
        this.calculateDate2 ('Until Yesterday', option);
        break;

      case 'UNTILLASTWEEK':
        this.calculateDate2 ('Until Last Week', option);
        break;

      case 'UNTILLASTMONTH':
        this.calculateDate2 ('Until Last Month', option);
        break;

      case 'UNTILLASTYEAR':
        this.calculateDate2 ('Until Last Year', option);
        break;

      case 'UNTILTODAY':
        this.calculateDate2 ('Until Today', option);
        break;
    }
  }

  calculateDate(type: string, option: string): void
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

      case 'YESTERDAY':
        this.argument.value1 = new Date (this.argument.value2.getTime () - (24 * 60 * 60 * 1000));
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

    this.openDialog ("The date range changed to " + type + ", " + maximunDateMessage);
  }

  calculateDate2 (type: string, option: string): void
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
        this.argument.value3 = null;
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
  
        case 'UNTILLASTYEAR':
          this.argument.value1 = moment ().subtract (1, "years").startOf ("year").toDate ();
          break;   
      }

      this.argument.value2 = newDate;
    }

    this.openDialog ("The date range changed to " + type + maximunDateMessage);
  }
  
  openDialog(text:string){
    if (!this.loadingDefaults)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Message", 
        message: text}
      });
    }
  }

}
