import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { take, takeUntil, delay } from 'rxjs/operators';
import { Subject, ReplaySubject, of, Observable } from 'rxjs';
import { MatSelect } from '@angular/material';
import { FormControl } from '@angular/forms';
import { Arguments } from '../model/Arguments';
import { Globals } from '../globals/Globals';
import { ApiClient } from '../api/api-client';

@Component({
  selector: 'app-msf-aircraft-type',
  templateUrl: './msf-aircraft-type.component.html',
  styleUrls: ['./msf-aircraft-type.component.css']
})
export class MsfAircraftTypeComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;
  
  multiAircraft: boolean = false;

  data: Observable<any[]>;
   loading = false;
   constructor(private http: ApiClient, public globals: Globals) { }

   ngOnInit() { 
    if (this.argument.selectionMode)
      this.multiAircraft = true;
    // this.getRecords(null, this.handlerSuccess);
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
    if(this.globals.currentAirline!=null&&this.argument.url.substring(0,1)=="/"){
      // url = "http://localhost:8887/getAircraftTypes";
      url = this.globals.baseUrl+ "/getAircraftTypes";
      url += "?search="+ (search != null?search:'') + "&airlineIata=" + this.globals.currentAirline.iata;
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
      this.loading = true;
      this.getRecords($event.term, this.handlerSuccess);
  }

  onFocus(){
    this.loading = true;
    this.getRecords(null, this.handlerSuccess);
}
  
}
