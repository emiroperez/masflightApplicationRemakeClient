import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Arguments } from '../model/Arguments';
import { Globals } from '../globals/Globals';
import { delay } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Utils } from '../commons/utils';

@Component({
  selector: 'app-msf-select-box-single-option',
  templateUrl: './msf-select-box-single-option.component.html',
  styleUrls: ['./msf-select-box-single-option.component.css']
})
export class MsfSelectBoxSingleOptionComponent implements OnInit {

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
  currentURLFilter: string = "";
  lastURLFilter: string = "";

  constructor(public globals: Globals, private authService: AuthService)
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

    if(this.globals.currentApplication.name === "DataLake"){
      if(url.indexOf("?") == -1){
        url = url + "?uName="+this.globals.userName;
      }else{
        url = url + "&uName="+this.globals.userName;
      }
    }

    url += "&appId=" + this.globals.currentApplication.id;

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    // set URL filters if available
    this.currentURLFilter = this.utils.setURLfilters (this.argument.filters);
    url += this.currentURLFilter;

    this.authService.get (this,url,handlerSuccess,this.handlerError);  
  }

  handlerSuccess(_this,data, tab){   
    _this.loading = false;
    _this.data = of(data).pipe(delay(500));

    if (_this.currentURLFilter !== _this.lastURLFilter)
    {
      _this.lastURLFilter = _this.currentURLFilter;

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
