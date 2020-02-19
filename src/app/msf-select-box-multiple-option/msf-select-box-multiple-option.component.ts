import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Arguments } from '../model/Arguments';
import { Globals } from '../globals/Globals';
import { delay } from 'rxjs/operators';
import { forEach } from '@angular/router/src/utils/collection';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-msf-select-box-multiple-option',
  templateUrl: './msf-select-box-multiple-option.component.html',
  styleUrls: ['./msf-select-box-multiple-option.component.css']
})
export class MsfSelectBoxMultipleOptionComponent implements OnInit {

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

  constructor(public globals: Globals, private authService: AuthService) { }

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
      if(url.indexOf("?")==-1){
        url = url + "?uName="+this.globals.userName;
      }else{
        url = url + "&uName="+this.globals.userName;
      }
    }

    url += "&appId=" + this.globals.currentApplication.id;

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

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
  onChange(){
  }

}
