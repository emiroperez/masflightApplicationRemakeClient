import { Component, OnInit, Input } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Arguments } from '../model/Arguments';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-msf-select-box-single-option',
  templateUrl: './msf-select-box-single-option.component.html',
  styleUrls: ['./msf-select-box-single-option.component.css']
})
export class MsfSelectBoxSingleOptionComponent implements OnInit {

  data: Observable<any[]>;

  @Input("argument") public argument: Arguments;

  loading = false;
  constructor(private http: ApiClient, public globals: Globals) { }


  ngOnInit() { 
    this.getRecords(null, this.handlerSuccess);
  }

  getRecords(search, handlerSuccess){
    if(this.data == null || this.getRecords.length == 0){
      let url = this.argument.url + "?search="+ (search != null?search:'');
      this.http.get(this,url,handlerSuccess,this.handlerError, null);  
    }
          
  }

  handlerSuccess(_this,data, tab){   
    _this.data = of(data).pipe(delay(500));;        
  }
  
  handlerError(_this,result){
    console.log(result);
  }

}
