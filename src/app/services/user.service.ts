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

  saveUser(_this,user,successHandler, errorHandler){
    let url='/saveUser';
    //let url='http://localhost:8887/saveUser';
    this.http.post(_this,url,user,successHandler, errorHandler);
  }

  activationUsers(_this,users,successHandler, errorHandler){
    let url='/saveUsersActivation';
    //let url='http://localhost:8887/saveUsersActivation';
    this.http.post(_this,url,users,successHandler, errorHandler);
  }

}
