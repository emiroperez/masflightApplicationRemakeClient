import { Component, OnInit, Input, Injectable, ChangeDetectorRef } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { AppDateAdapter, APP_DATE_FORMATS } from '../commons/date.adapters';
import { DatePipe } from '@angular/common';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-date-range',
  templateUrl: './msf-date-range.component.html',
  styleUrls: ['./msf-date-range.component.css'],
  providers: [
    {
        provide: DateAdapter, useClass: AppDateAdapter
    },
    {   
        provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
    ]
})
export class MsfDateRangeComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  autoSelectDate;
  dates: any[] = [
    {id: 1, name: 'Yesterday',value:"YESTERDAY"},
    {id: 2, name: 'Last week',value:"LASTWEEK"},
    {id: 3, name: 'Last Month',value:"LASTMONTH"},
    {id: 4, name: 'Last Year',value:"LASTYEAR"}
  ];

  constructor(public globals: Globals) { }

  ngOnInit() {
    this.minDate = this.globals.minDate;
  }

  dateChange(event){      
      if(!this.argument.value2){
        this.argument.value2 = this.argument.value1;
      }
      if(this.dates.length==4){
        this.dates.push({id: 5, name: 'Until Yesterday',value:"UNTILYESTERDAY"});
        this.dates.push({id: 6, name: 'Until Last Week',value:"UNTILWEEK"});
        this.dates.push({id: 7, name: 'Until Last Month',value:"UNTILMONTH"});
        this.dates.push({id: 8, name: 'Until Last Year',value:"UNTILYEAR"});
      }
      this.minDate = this.argument.value1;
  }

  hasDate(){
    if(this.dates.length==4){
      this.dates.push({id: 5, name: 'Until Yesterday',value:"UNTILYESTERDAY"});
      this.dates.push({id: 6, name: 'Until Last Week',value:"UNTILWEEK"});
      this.dates.push({id: 7, name: 'Until Last Month',value:"UNTILMONTH"});
      this.dates.push({id: 8, name: 'Until Last Year',value:"UNTILYEAR"});
    }
  }

  validateDate(){
      if(this.argument.value1){
        this.argument.value1 = new DatePipe('en-US').transform(this.argument.value1, 'MM/dd/yyyy');
      }    
  }

  minDate(){
    if(this.argument.value1!=null){
        return this.globals.minDate;
    }else{
      return this.argument.value1; 
    }
  }

  autoSelect(){
    switch (this.argument.value3) {
      case 'YESTERDAY':
        break;
      case 'LASTWEEK':
        break;
      case 'LASTMONTH':
        break;
      case 'LASTYEAR':
        break;
      case 'UNTILYESTERDAY':
        break;
      case 'UNTILWEEK':
        break;
      case 'UNTILMONTH':
        break;
      case 'UNTILYEAR':
        break;                        
    }
  }

}
