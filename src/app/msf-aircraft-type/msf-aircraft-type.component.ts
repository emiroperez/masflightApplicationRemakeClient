import { Component, OnInit, ViewChild, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { take, takeUntil, delay } from 'rxjs/operators';
import { Subject, ReplaySubject, of, Observable } from 'rxjs';
import { MatSelect } from '@angular/material';
import { FormControl } from '@angular/forms';
import { Arguments } from '../model/Arguments';
import { Globals } from '../globals/Globals';
import { ApiClient } from '../api/api-client';
import { Utils } from '../commons/utils';

@Component({
  selector: 'app-msf-aircraft-type',
  templateUrl: './msf-aircraft-type.component.html',
  styleUrls: ['./msf-aircraft-type.component.css']
})
export class MsfAircraftTypeComponent implements OnInit {

   @Input("argument") public argument: Arguments;

   @Input("isDashboardPanel")
   isDashboardPanel: boolean = false;

   @Input("updateURLResults")
   updateURLResults: boolean;

   @Output("startURLUpdate")
   startURLUpdate = new EventEmitter ();

   multiAircraft: boolean = false;
   utils: Utils;

   data: Observable<any[]>;
   loading = false;
   searchString: string = null;
   currentURLFilter: string = "";
   lastURLFilter: string = "";

   constructor(private http: ApiClient, public globals: Globals)
   {
     this.utils = new Utils ();
   }

   ngOnInit() { 
    if (this.argument.selectionMode)
      this.multiAircraft = true;
    // this.getRecords(null, this.handlerSuccess);
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if (changes["updateURLResults"] && this.updateURLResults)
      this.getRecords (this.searchString, this.handlerSuccess);
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

    if (this.globals.currentAirline != null && this.argument.url.includes ("getAircraftTypes"))
      url += "&airlineIata" + this.globals.currentAirline.iata;

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
  
      if (_this.multiAircraft)
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
      }
    }
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
