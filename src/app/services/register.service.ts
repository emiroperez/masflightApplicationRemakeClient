import { Injectable } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { Utils } from '../commons/utils';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  utils: Utils;
  constructor(private http: ApiClient) { }


  getPlans(_this,successHandler, errorHandler){
    let url='/getPlans';
    // let url='http://localhost:8887/getPlans';
    this.http.get(_this,url,successHandler,errorHandler,null);
  }

  getCountries(_this,successHandler, errorHandler){
    let url='/getCountries';
    // let url='http://localhost:8887/getCountries';
    this.http.get(_this,url,successHandler,errorHandler,null);
  }
  
  checkEmail(_this,successHandler,errorHandler,email){
    let url='/checkEmail?email='+email;
    // let url='http://localhost:8887/checkEmail?email='+email;
    this.http.get(_this,url,successHandler,errorHandler,null);
  }
}