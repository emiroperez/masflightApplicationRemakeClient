import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApplicationService } from '../services/application.service';
import { delay } from 'rxjs/operators';
import { ApiClient } from '../api/api-client';

@Component({
  selector: 'app-msf-test',
  templateUrl: './msf-test.component.html',
  styleUrls: ['./msf-test.component.css']
})
export class MsfTestComponent implements OnInit {

  airports: Observable<any[]>;

  selectedAirport;
  
  loading = false;

  constructor(private services: ApplicationService, private http: ApiClient) { }

  ngOnInit() {

     this.getAirports(null, this.handlerSuccess);

  }

  getAirports(search, handlerSuccess){
    this.loading = true;
    let url = 'http://localhost:8887/getAirports?search='+ (search != null?search:'');
    //let url = '/getAirports?search='+ (search != null?search:'');
    this.http.get(this,url,handlerSuccess,this.handlerError, null);        
  }


  handlerSuccess(_this,data, tab){   
    _this.airports = of(data).pipe(delay(500)); 
    _this.loading = false;  
  }


  handlerError(_this,result){
    _this.loading = false; 
    console.log(result);
  }


  

}
