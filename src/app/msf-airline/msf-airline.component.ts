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
  multiAirlines: boolean = false;

  loading = false;
  constructor(private http: ApiClient, public globals: Globals) { }

  ngOnInit() {
    if (this.argument.selectionMode)
      this.multiAirlines = true;

    this.getRecords(null, this.handlerSuccess);
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
  }

  onSearch($event: any){
    if($event.term.length>=2){
      this.loading = true;
      this.getRecords($event.term, this.handlerSuccess);
    }
  }
  

}
