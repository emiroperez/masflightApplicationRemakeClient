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
  
  /** control for the selected airline */
  public airlineCtrl: FormControl = new FormControl();
 
  /** control for the MatSelect filter keyword */
  public airlineFilterCtrl: FormControl = new FormControl();
 
  
 
  //   data: any[] = [
  //    {name: 'ALL ', id: ''},
  //    {name: 'A300-600', id: 'A300-600'},
  //    {name: 'B-727-2', id: 'B-727-2'},
  //    {name: 'B-757-2', id: 'B-757-2'},
  //    {name: 'B-767-3', id: 'B-767-3'}   
  //  ];
  data: Observable<any[]>;
   loading = false;
   constructor(private http: ApiClient, public globals: Globals) { }

   ngOnInit() { 
    // this.getRecords(null, this.handlerSuccess);
  }

  getRecords(search, handlerSuccess){
    let url = this.argument.url + "?search="+ (search != null?search:'');
    if(this.globals.currentAirline!=null){
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
    console.log(result);
  }

  onSearch($event: any){
      this.loading = true;
      this.getRecords($event, this.handlerSuccess);
  }

  onFocus(){
    this.loading = true;
    this.getRecords(null, this.handlerSuccess);
}
  
}
