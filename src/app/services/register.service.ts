import { Injectable } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { Utils } from '../commons/utils';
import { Globals } from '../globals/Globals';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  utils: Utils;
  url;
  constructor(private http: ApiClient,private globals:Globals) {
    this.url = this.globals.baseUrl;
  }


  getPlans(_this,successHandler, errorHandler){
    let url= this.globals.baseUrl+'/getPlans';
    // let url='http://localhost:8887/getPlans';
    this.http.get(_this,url,successHandler,errorHandler,null);
  }

  getCountries(_this,successHandler, errorHandler){
    let url= this.globals.baseUrl+'/getCountries';
    // let url='http://localhost:8887/getCountries';
    this.http.get(_this,url,successHandler,errorHandler,null);
  }

  checkEmail(_this,successHandler,errorHandler,email){
    let url= this.globals.baseUrl+'/checkEmail?email='+email;
    // let url='http://localhost:8887/checkEmail?email='+email;
    this.http.get(_this,url,successHandler,errorHandler,null);
  }
}
