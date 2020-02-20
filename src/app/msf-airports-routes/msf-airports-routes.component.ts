import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
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

  @Input("updateURLResults")
  updateURLResults: boolean;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  loading = false;
  name: any;
  utils: Utils;
  searchString: string = null;
  currentURLFilter: string = "";
  lastURLFilter: string = "";

  constructor(private http: ApiClient, public globals: Globals)
  {
    this.utils = new Utils ();
  }

  ngOnInit() { 
    // this.globals.isLoading = true;
    if (!this.globals.airports)
      this.getAirports (null, this.handlerSuccess);
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if (changes["updateURLResults"] && this.updateURLResults)
      this.getAirports (this.searchString, this.handlerSuccess);
  }

  getAirports(search, handlerSuccess)
  {
    let url;

    this.searchString = search;

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
    this.currentURLFilter = this.utils.setURLfilters (this.argument.filters);
    url += this.currentURLFilter;

    this.http.get(this,url,handlerSuccess,this.handlerError, null);  
  }


  handlerSuccess(_this,data, tab){   
    _this.loading = false;
    _this.globals.airports = of(data).pipe(delay(500));

    if (_this.currentURLFilter !== _this.lastURLFilter)
    {
      _this.lastURLFilter = _this.currentURLFilter;

      if (_this.argument.value1)
      {
        for (let i = _this.argument.value1.length - 1; i >= 0; i--)
        {
          let itemFound = false;

          for (let item of data)
          {
            if (_this.argument.value1[i][_this.argument.visibleAttribute] === item[_this.argument.visibleAttribute])
            {
              itemFound = true;
              _this.argument.value1.splice (i, 1);
              break;
            }

            if (itemFound)
              continue;
          }
        }
      }

      if (_this.argument.value2)
      {
        for (let i = _this.argument.value2.length - 1; i >= 0; i--)
        {
          let itemFound = false;

          for (let item of data)
          {
            if (_this.argument.value2[i][_this.argument.visibleAttribute] === item[_this.argument.visibleAttribute])
            {
              itemFound = true;
              _this.argument.value2.splice (i, 1);
              break;
            }

            if (itemFound)
              continue;
          }
        }
      }
    }
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
