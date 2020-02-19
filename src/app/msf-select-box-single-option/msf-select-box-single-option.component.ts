import { Component, OnInit, Input } from '@angular/core';
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

  loading = false;
  utils: Utils;

  constructor(public globals: Globals, private authService: AuthService)
  {
    this.utils = new Utils ();
  }

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
    url += this.utils.setURLfilters (this.argument.filters);

    this.authService.get (this,url,handlerSuccess,this.handlerError);  
  }

  handlerSuccess(_this,data, tab){   
    _this.loading = false;
    _this.data = of(data).pipe(delay(500));;        
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
