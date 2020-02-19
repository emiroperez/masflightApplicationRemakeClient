import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Utils } from '../commons/utils';

@Component({
  selector: 'app-msf-airports-routes',
  templateUrl: './msf-airports-routes.component.html',
  styleUrls: ['./msf-airports-routes.component.css']
})
export class MsfAirportsRoutesComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;
  
  loading = false;
  name: any;
  utils: Utils;

  constructor(private http: ApiClient, public globals: Globals)
  {
    this.utils = new Utils ();
  }

  ngOnInit() { 
    // this.globals.isLoading = true;
    if (!this.globals.airports)
      this.getAirports (null, this.handlerSuccess);
  }


  

  getAirports(search, handlerSuccess)
  {
    let url;

    if (this.argument.url.includes ("?"))
    {
      if (this.argument.url.substring (0, 1) == "/")
        url = this.globals.baseUrl + this.argument.url + "&search=" + (search != null ? search : '');
      else
        url = this.argument.url + "&search=" + (search != null ? search : '');
    }
    else
    {
      if (this.argument.url.substring (0, 1) == "/")
        url = this.globals.baseUrl + this.argument.url + "?search=" + (search != null ? search : '');
      else
        url = this.argument.url + "?search=" + (search != null ? search : '');
    }

    url += "&appId=" + this.globals.currentApplication.id;

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    // set URL filters if available
    url += this.utils.setURLfilters (this.argument.filters);

    this.http.get(this,url,handlerSuccess,this.handlerError, null);  
  }


  handlerSuccess(_this,data, tab){   
    _this.loading = false;
    _this.globals.airports = of(data).pipe(delay(500));;        
  }
  
  handlerError(_this,result){
    _this.loading = false; 
  }

  onSearch($event: any){
    if($event.term.length>=3){
      this.loading = true;
      this.getAirports($event.term, this.handlerSuccess);
    }
  }

}
