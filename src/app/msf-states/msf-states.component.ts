import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Arguments } from '../model/Arguments';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';
import { delay } from 'rxjs/operators';
import { Utils } from '../commons/utils';

@Component({
  selector: 'app-msf-states',
  templateUrl: './msf-states.component.html',
  styleUrls: ['./msf-states.component.css']
})
export class MsfStatesComponent implements OnInit {

  data: Observable<any[]>;
  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Input("updateURLResults")
  updateURLResults: boolean;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  loading = false;
  utils: Utils;
  searchString: string = null;

  constructor(private http: ApiClient, public globals: Globals)
  {
    this.utils = new Utils ();
  }

  ngOnInit()
  {
    this.getRecords(null, this.handlerSuccess);
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if (changes["updateURLResults"] && this.updateURLResults)
      this.getRecords (this.searchString, this.handlerSuccess);
  }
  
  getRecords(search, handlerSuccess)
  {
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
    url += this.utils.setURLfilters (this.argument.filters);

    this.http.get(this,url,handlerSuccess,this.handlerError, null);  
  }

  handlerSuccess(_this,data, tab){   
    _this.loading = false;
    _this.data = of(data).pipe(delay(500));
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
