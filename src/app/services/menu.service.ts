import { Injectable } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Menu } from '../model/Menu';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})

export class MenuService {
  SECURITY_HEADER = "Authorization";
  TOKEN_STORAGE_KEY = "token";
  constructor( private http: HttpClient) { }

  getMenu(_this,successHandler, errorHandler){
    let url = "/secure/getMenu?";
    // let url = "http://localhost:8887/getMenu?"
    if(_this.globals.currentApplication==undefined){
      _this.globals.currentApplication = JSON.parse(localStorage.getItem("currentApplication"));
    }
    url = url + "application="+_this.globals.currentApplication.id;
    _this.globals.isLoading = true;
    this.get(_this,url,successHandler, errorHandler);
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
