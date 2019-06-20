import { Injectable } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: ApiClient, private globals:Globals, private authService: AuthService) {
  }

  save(_this,user,successHandler, errorHandler){
    let url= this.globals.baseUrl+'/users';
    this.http.post(_this,url,user,successHandler, errorHandler);
  }

  saveUser(_this,user,successHandler, errorHandler){
    let url= this.globals.baseUrl+'/saveUser';
    //let url='http://localhost:8887/saveUser';
    this.http.post(_this,url,user,successHandler, errorHandler);
  }


  resetPassword(_this,user,successHandler, errorHandler){
    let url= this.globals.baseUrl+'/resetPassword';
    //let url='http://localhost:8887/saveUser';
    this.http.post(_this,url,user,successHandler, errorHandler);
  }

  activationUsers(_this,users,successHandler, errorHandler){
    let url= this.globals.baseUrl+'/saveUsersActivation';
    //let url='http://localhost:8887/saveUsersActivation';
    this.http.post(_this,url,users,successHandler, errorHandler);
  }


  checkEmail(_this,successHandler,errorHandler,email){
    let url= this.globals.baseUrl+'/checkEmail?email='+email;
    // let url='http://localhost:8887/checkEmail?email='+email;
    this.http.get(_this,url,successHandler,errorHandler,null);
  }

  sendEmailPassword(_this,successHandler,errorHandler,email){
    let url= this.globals.baseUrl+'/sendemailreset?email='+email;
    // let url='http://localhost:8887/sendemailreset?email='+email;
    this.http.get(_this,url,successHandler,errorHandler,null);
  }

  verifyToken(_this,successHandler,errorHandler,token){
    let url= this.globals.baseUrl+'/verifytoken?token='+token;
    // let url='http://localhost:8887/sendemailreset?email='+email;
    this.http.get(_this,url,successHandler,errorHandler,null);
  }

  getUserLastLoginTime(_this, handlerSuccess, handlerError): void
  {
    let url = this.globals.baseUrl + "/secure/users/getLastTime";
    this.authService.get (_this, url, handlerSuccess, handlerError);
  }

  setUserLastLoginTime(_this, handlerSuccess, handlerError): void
  {
    let url = this.globals.baseUrl + "/secure/users/setLastTime";
    this.authService.post (_this, url, null, handlerSuccess, handlerError);
  }
}
