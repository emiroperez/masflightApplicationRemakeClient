import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-msf-airports-routes',
  templateUrl: './msf-airports-routes.component.html',
  styleUrls: ['./msf-airports-routes.component.css']
})
export class MsfAirportsRoutesComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  loading = false;
  name:any;
  constructor(private http: ApiClient, public globals: Globals) { }

  ngOnInit() { 
    // this.globals.isLoading = true;
    // this.getAirports(null, this.handlerSuccess);
  }


  

  getAirports(search, handlerSuccess){
      let url = this.globals.baseUrl + this.argument.url + "?search="+ (search != null?search:'');
      this.http.get(this,url,handlerSuccess,this.handlerError, null);  
  }


  handlerSuccess(_this,data, tab){   
    _this.loading = false;
    _this.globals.airports = of(data).pipe(delay(500));;        
  }
  
  handlerError(_this,result){
    _this.loading = false; 
    console.log(result);
  }

  onSearch($event: any){
    if($event.term.length>=3){
      this.loading = true;
      this.getAirports($event.term, this.handlerSuccess);
    }
  }

}
