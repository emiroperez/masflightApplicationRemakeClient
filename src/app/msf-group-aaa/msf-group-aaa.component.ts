import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Arguments } from '../model/Arguments';
import { Globals } from '../globals/Globals';
import { ApiClient } from '../api/api-client';
import { delay } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Utils } from '../commons/utils';

@Component({
  selector: 'app-msf-group-aaa',
  templateUrl: './msf-group-aaa.component.html',
  styleUrls: ['./msf-group-aaa.component.css']
})
export class MsfGroupAaaComponent implements OnInit {


  data: Observable<any[]>;
  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Input("updateURLResults")
  updateURLResults: boolean;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  loading = false;
  searchString: string = null;
  currentURLFilter: string = "";
  lastURLFilter: string = "";
  utils: Utils;

  constructor(private authService: AuthService, public globals: Globals)
  {
    this.utils = new Utils ();
  }

  ngOnInit() { 
    this.getRecords(null, this.handlerSuccess);
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if (changes["updateURLResults"] && this.updateURLResults)
      this.getRecords (this.searchString, this.handlerSuccess);
  }

  getRecords(search, handlerSuccess){
    let url;

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

    this.authService.get(this,url,handlerSuccess,this.handlerError);  
  }

  handlerSuccess(_this,data, tab){   
    _this.loading = false;
    _this.data = of(data).pipe(delay(500));

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
    }
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
  
  onChange(){
  }

}
