import { Component, OnInit, Input } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Arguments } from '../model/Arguments';
import { Globals } from '../globals/Globals';
import { ApiClient } from '../api/api-client';
import { delay } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

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

  loading = false;
  constructor(private authService: AuthService, public globals: Globals) { }


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

    this.authService.get(this,url,handlerSuccess,this.handlerError);  
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
