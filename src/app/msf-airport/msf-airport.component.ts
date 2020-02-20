import { Component, OnInit, Input, ViewChild, EventEmitter, Output, SimpleChanges } from '@angular/core';
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
import { AirportSelection } from '../commons/AirportSelection';
import { Utils } from '../commons/utils';

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

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Input("anchoredArgument")
  anchoredArgument: boolean = false;

  @Input("updateURLResults")
  updateURLResults: string;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  data: Observable<any[]>;
  loading = false;

  selectionMode: number;
  multiAirport: boolean;
  utils: Utils;
  searchString: string = null;
  currentURLFilter: string = "";
  lastURLFilter: string = "";

  constructor(private http: ApiClient, public globals: Globals)
  {
    this.utils = new Utils ();
  }

  ngOnInit()
  {
    if (this.argument.selectionMode & AirportSelection.MULTIPLESELECTION)
      this.multiAirport = true;

    this.selectionMode = this.argument.selectionMode & ~AirportSelection.MULTIPLESELECTION;

    this.getRecords(null, this.handlerSuccess);
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if (changes["updateURLResults"] && this.updateURLResults)
      this.getRecords (this.searchString, this.handlerSuccess);
  }

  getBindLabel(){
    if(this.getBindLabel()==null)
      return "name";

    return this.getBindLabel();
  }

  getBindName()
  {
    if(this.argument.selectedAttribute==null)
      return "name";

    return this.argument.selectedAttribute;
  }

 getRecords(search, handlerSuccess){
  let url;

  this.searchString = search;

  if (!this.argument.url)
  {
    this.loading = false;
    return;
  }

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
  _this.data = of(data).pipe(delay(500));

  if (_this.currentURLFilter !== _this.lastURLFilter)
  {
    _this.lastURLFilter = _this.currentURLFilter;

    if (_this.multiAirport)
    {
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

      if (_this.argument.value3)
      {
        for (let i = _this.argument.value3.length - 1; i >= 0; i--)
        {
          let itemFound = false;

          for (let item of data)
          {
            if (_this.argument.value3[i][_this.argument.visibleAttribute] === item[_this.argument.visibleAttribute])
            {
              itemFound = true;
              _this.argument.value3.splice (i, 1);
              break;
            }

            if (itemFound)
              continue;
          }
        }
      }
    }
    else
    {
      if (_this.argument.value1)
      {
        for (let item of data)
        {
          if (_this.argument.value1[_this.argument.visibleAttribute] === item[_this.argument.visibleAttribute])
          {
            _this.argument.value1 = null;
            break;
          }
        }
      }

      if (_this.argument.value2)
      {
        for (let item of data)
        {
          if (_this.argument.value2[_this.argument.visibleAttribute] === item[_this.argument.visibleAttribute])
          {
            _this.argument.value2 = null;
            break;
          }
        }
      }

      if (_this.argument.value3)
      {
        for (let item of data)
        {
          if (_this.argument.value3[_this.argument.visibleAttribute] === item[_this.argument.visibleAttribute])
          {
            _this.argument.value3 = null;
            break;
          }
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
    this.getRecords($event.term, this.handlerSuccess);
  }
}

  isRoute()
  {
    return this.selectionMode >= AirportSelection.ROUTE;
  }

  isRouteWithConnection()
  {
    return this.selectionMode >= AirportSelection.ROUTEWITHCONNECTION;
  }

}
