import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { Airport } from '../model/Airport';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { AppDateAdapter, APP_DATE_FORMATS } from '../commons/date.adapters';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Observable, of ,  Subject } from 'rxjs';
import { MatSelect, VERSION } from '@angular/material';
import { take, takeUntil, delay } from 'rxjs/operators';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';

interface Bank {
  id: string;
  name: string;
}

@Component({
  selector: 'app-msf-airport',
  templateUrl: './msf-airport.component.html',
  styleUrls: ['./msf-airport.component.css'],
  providers: [
    {
        provide: DateAdapter, useClass: AppDateAdapter
    },
    {
        provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
    ]
})
export class MsfAirportComponent implements OnInit {

  @Input("argument") public argument: Arguments;

data: Observable<any[]>;
loading = false;
constructor(private http: ApiClient, public globals: Globals) { }


ngOnInit() { 
  this.getRecords(null, this.handlerSuccess);
}

getBindLabel(){
  if(this.getBindLabel()==null){
    return "name";
  }
  return this.getBindLabel();
}

getBindName(){
  if(this.argument.selectedAttribute==null){
    return "name";
  }
  return this.argument.selectedAttribute;
}

 getRecords(search, handlerSuccess){
  let url;

  if (!this.argument.url)
  {
    this.loading = false;
    return;
  }

  if(this.argument.url.substring(0,1)=="/"){
    url = this.globals.baseUrl + this.argument.url + "?search="+ (search != null?search:'');
  }else{
   url = this.argument.url+ (search != null?search:'');
  }
  this.http.get(this,url,handlerSuccess,this.handlerError, null);  
}

handlerSuccess(_this,data, tab){   
  _this.loading = false;
  _this.data = of(data).pipe(delay(500));;        
}

handlerError(_this,result){
  _this.loading = false;
  console.log (result);
}

onSearch($event: any){
  if($event.term.length>=3){
    this.loading = true;
    this.getRecords($event.term, this.handlerSuccess);
  }
}

}
