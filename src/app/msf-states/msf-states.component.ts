import { Component, OnInit, Input } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Arguments } from '../model/Arguments';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-msf-states',
  templateUrl: './msf-states.component.html',
  styleUrls: ['./msf-states.component.css']
})
export class MsfStatesComponent implements OnInit {

  data: Observable<any[]>;
  @Input("argument") public argument: Arguments;

  loading = false;
  constructor(private http: ApiClient, public globals: Globals) { }


  ngOnInit() { 
    this.getRecords(null, this.handlerSuccess);
  }
  
   getRecords(search, handlerSuccess){
    let url = this.globals.baseUrl + this.argument.url + "?search="+ (search != null?search:'');
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

}
