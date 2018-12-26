import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { FormControl } from '@angular/forms';
import { ReplaySubject, of } from 'rxjs';
import { MatSelect } from '@angular/material';
import { Subject } from 'rxjs';
import { take, takeUntil, delay } from 'rxjs/operators';
import { Airport } from '../model/Airport';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';


@Component({
  selector: 'app-msf-airport-route',
  templateUrl: './msf-airport-route.component.html',
  styleUrls: ['./msf-airport-route.component.css']
})
export class MsfAirportRouteComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  loading = false;
  
  constructor(private http: ApiClient, public globals: Globals) { }

  ngOnInit() { 
    this.getAirports(null, this.handlerSuccess);
  }

  getAirports(search, handlerSuccess){
    if(this.globals.airports == null || this.getAirports.length == 0){
      this.globals.isLoading = true;
      let url = this.argument.url + "?search="+ (search != null?search:'');
      this.http.get(this,url,handlerSuccess,this.handlerError, null);  
    }
          
  }


  handlerSuccess(_this,data, tab){   
    _this.globals.isLoading = false;
    _this.globals.airports = of(data).pipe(delay(500));;        
  }
  
  handlerError(_this,result){
    _this.globals.isLoading = false; 
    console.log(result);
  }

}
