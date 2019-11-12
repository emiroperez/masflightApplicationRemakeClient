import { Component, OnInit, Input } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-single-airport',
  templateUrl: './msf-single-airport.component.html',
  styleUrls: ['./msf-single-airport.component.css']
})
export class MsfSingleAirportComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  data: Observable<any[]>;
  loading = false;
  constructor(private http: ApiClient, public globals: Globals) { }
  
  
  ngOnInit() { 
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
    if($event.term.length>=3){
      this.loading = true;
      this.getRecords($event.term, this.handlerSuccess);
    }
}
}