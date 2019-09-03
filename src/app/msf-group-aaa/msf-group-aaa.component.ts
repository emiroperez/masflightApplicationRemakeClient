import { Component, OnInit, Input } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Arguments } from '../model/Arguments';
import { Globals } from '../globals/Globals';
import { ApiClient } from '../api/api-client';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-msf-group-aaa',
  templateUrl: './msf-group-aaa.component.html',
  styleUrls: ['./msf-group-aaa.component.css']
})
export class MsfGroupAaaComponent implements OnInit {


  data: Observable<any[]>;
  @Input("argument") public argument: Arguments;

  loading = false;
  constructor(private http: ApiClient, public globals: Globals) { }


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

    if(this.argument.url.substring(0,1)=="/"){
      // url = this.globals.baseUrl + this.argument.url +this.argument.aaaGroup;
      url = this.globals.baseUrl + this.argument.url ;
    }else{
    //  url = this.argument.url +this.argument.aaaGroup;
     url = this.argument.url;
    }
    this.http.get(this,url,handlerSuccess,this.handlerError, null);  
  }

  handlerSuccess(_this,data, tab){   
    _this.loading = false;
    _this.data = of(data).pipe(delay(500));;        
  }

  handlerError(_this,result){
    _this.loading = false;
    console.log(result);
  }

  onSearch($event: any){
    if($event.term.length>=2){
      this.loading = true;
      this.getRecords($event.term, this.handlerSuccess);
    }
  }
  onChange(){
    console.log(this.argument.value1)
  }

}
