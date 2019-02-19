import { Injectable } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Menu } from '../model/Menu';
import { Globals } from '../globals/Globals';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})

export class MenuService {
  SECURITY_HEADER = "Authorization";
  TOKEN_STORAGE_KEY = "token";
  url;
  constructor( private http: HttpClient, private globals:Globals) { 
    this.url = this.globals.baseUrl;
  }

  getMenu(_this,successHandler, errorHandler){
    // this.url += "/secure/getMenu?";
    let url =this.globals.baseUrl+  "/getMenu?"
    if(_this.globals.currentApplication==undefined){
      _this.globals.currentApplication = JSON.parse(localStorage.getItem("currentApplication"));
    }
    url = url + "application="+_this.globals.currentApplication.id;
    _this.globals.isMenuLoading = true;
    _this.globals.isLoading = true;
    this.get(_this,url,successHandler, errorHandler);
  }

  getAdvanceFeatures(_this, successHandler, errorHandler){
    let url = _this.globals.baseUrl+ "/secure/getPlanAdvanceFeatures";
    // let url = "http://localhost:8887/secure/getPlanAdvanceFeatures";
    this.get(_this, url, successHandler, errorHandler);
  }

  createAuthorizationHeader() {
    httpOptions.headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    httpOptions.headers = httpOptions.headers.append(this.SECURITY_HEADER, localStorage.getItem(this.TOKEN_STORAGE_KEY));
  }

  get = function (_this,url,successHandler, errorHandler){
    this.createAuthorizationHeader();
    this.http.get(url,httpOptions).subscribe(result => {
        successHandler(_this,result);
    }, error =>
        errorHandler(_this,error)
  );
  }

  // get = function (_this,url,successHandler, errorHandler){
  //   this.http.get(url).subscribe(result => {
  //       successHandler(_this,result);
  //   }, error =>
  //       errorHandler(_this,error)
  // );
  // }

}
