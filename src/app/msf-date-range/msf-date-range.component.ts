import { Component, OnInit, Input, Injectable, ChangeDetectorRef } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { DateAdapter, MAT_DATE_FORMATS, MatDialog, MAT_DATE_LOCALE } from '@angular/material';
import { AppDateAdapter, APP_DATE_FORMATS } from '../commons/date.adapters';
import { DatePipe } from '@angular/common';
import { Globals } from '../globals/Globals';
import { MessageComponent } from '../message/message.component';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

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
      this.loadingDefaults = true;

      // auto select date range after loading the default value
      for (let dateRange of this.dates)
      {
        if (dateRange.value === this.argument.value1)
        {
          this.argument.value3 = dateRange;
          this.autoSelect ();
          break;
        }
      }

      this.loadingDefaults = false;
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
        this.calculateDate('Today', 0);
        break;
      case 'YESTERDAY':
      this.calculateDate('Yesterday',24*60*60*1000);
        break;
      case 'LASTWEEK':
      this.calculateDate('Last Week',(24*60*60*1000)*7);
        break;
      case 'LASTMONTH':
      this.calculateDate('Last Month',(24*60*60*1000)*30);
        break;
      case 'LASTYEAR':
        this.calculateDate('Last Year',(24*60*60*1000)*365);
        break;    
      case 'UNTILYESTERDAY':
        this.calculateDate2('Until Yesterday',24*60*60*1000);
          break;
      case 'UNTILLASTWEEK':
        this.calculateDate2('Until Last Week',(24*60*60*1000)*7);
          break;
      case 'UNTILLASTMONTH':
        this.calculateDate2('Until Last Month',(24*60*60*1000)*30);
          break;
      case 'UNTILLASTYEAR':
          this.calculateDate2('Until Last Year',(24*60*60*1000)*365);
          break;    
      case 'UNTILTODAY':
          this.calculateDate2('Until Today',0);
          break;                      
                     
    }
  }
  calculateDate(type: string,milis: any) {
    var today = new Date();
    var maximunDateMessage = "the maximun date of the option is ";
        if(this.argument.maxDate==null){
          this.argument.value2 = today;
          maximunDateMessage = "the option doesn't have maximun date";
        }else{
          this.argument.value2 = this.argument.maxDate;
          maximunDateMessage += this.argument.maxDate.toLocaleString("en-US").split(",")[0];
        }
          this.argument.value1 = new Date(this.argument.value2.getTime() - milis);

          this.openDialog("The date range changed to "+ type+", "+maximunDateMessage);

  }

  calculateDate2(type: string,milis: any) {
    var today = new Date();
    var aux;
    var maximunDateMessage = "the maximun date of the option is ";
      if(this.argument.value1){
        if(this.argument.maxDate==null){
          aux = today
          maximunDateMessage = "the option doesn't have maximun date"
        }else{
          aux = this.argument.maxDate;
          maximunDateMessage += this.argument.maxDate.toLocaleString("en-US").split(",")[0];
        }
        var diff = aux.getTime() - milis;
        if(this.argument.value1.getTime()<=diff){
          this.argument.value2 = new Date(diff);
        }else{
          this.openDialog("The final date can't be less than the initial date, "+maximunDateMessage);
          return;
        }
        this.openDialog("The date range changed to "+ type+", "+maximunDateMessage);
      }else{
        this.argument.value3 = null;
        this.openDialog("Please select the initial date");
      }
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
