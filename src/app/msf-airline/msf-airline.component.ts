import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject, Observable, of } from 'rxjs';
import { MatSelect } from '@angular/material';
import { takeUntil, take, delay } from 'rxjs/operators';
import { Airline } from '../model/Airline';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-airline',
  templateUrl: './msf-airline.component.html',
  styleUrls: ['./msf-airline.component.css']
})
export class MsfAirlineComponent implements OnInit {

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
    let url = this.globals.baseUrl + this.argument.url + "?search="+ (search != null?search:'');
    this.http.get(this,url,handlerSuccess,this.handlerError, null);  
  }

  handlerSuccess(_this,data, tab){   
    _this.loading = false;
    _this.data = of(data).pipe(delay(500));;        
  }

  handlerError(_this,result){
    _this.loading = false;
    console.log(result);
  }

  onSearch($event: any){
    if($event.term.length>=2){
      this.loading = true;
      this.getRecords($event.term, this.handlerSuccess);
    }
  }
  

}
