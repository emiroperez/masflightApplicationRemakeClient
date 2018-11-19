import { Injectable } from '@angular/core';
import { ApiClient } from '../api/api-client';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: ApiClient) { }

  save(_this,user,successHandler, errorHandler){
    let url = '/users';
    this.http.post(_this,url,user,successHandler, errorHandler);
  }

  getPlans(_this,successHandler, errorHandler){
    //let url='/getPlans';
    let url='http://localhost:8887/getPlans';
    this.http.get(_this,url,successHandler,errorHandler,null);
  }

}
