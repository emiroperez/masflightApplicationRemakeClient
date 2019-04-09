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
  constructor( private http: HttpClient, private globals:Globals) {
  }

  getMenu(_this,successHandler, errorHandler){
    let url = "/getMenu?"
    if(_this.globals.currentApplication==undefined){
      _this.globals.currentApplication = JSON.parse(localStorage.getItem("currentApplication"));
    }
    url = url + "application="+_this.globals.currentApplication.id;

    _this.globals.isLoading = true;
    // if (_this.globals.baseUrl != "")
      // this.get (_this, _this.globals.baseUrl + url, successHandler, errorHandler);
    // else
      this.get (_this, _this.globals.baseUrl + "/secure" + url, successHandler, errorHandler);
  }

  getAdvanceFeatures(_this, successHandler, errorHandler){
    let url = "/getPlanAdvanceFeatures";
    // if (_this.globals.baseUrl != "")
    //   this.get (_this, _this.globals.baseUrl + url, successHandler, errorHandler);
    // else
      this.get (_this, _this.globals.baseUrl + "/secure" + url, successHandler, errorHandler);
  }

  getUserLoggedin(_this,successHandler, errorHandler){
    let url = _this.globals.baseUrl+ "/secure/getUserloggedin";
    //let url = "http://localhost:8887/secure/getUserloggedin"
    this.get(_this, url, successHandler, errorHandler);
  }

  getDashboardsByUser(_this, successHandler, errorHandler){
    let url = "/getDashboards?application=" + _this.globals.currentApplication.id;

    // if (_this.globals.baseUrl != "")
    //   this.get (_this, _this.globals.baseUrl + url, successHandler, errorHandler);
    // else
      this.get (_this, _this.globals.baseUrl + "/secure" + url, successHandler, errorHandler);
  }

  addDashboard(_this, data, successHandler, errorHandler){
    let url = "/addDashboardMenu";
    // if (_this.globals.baseUrl != ""){
    //     this.post (_this,  _this.globals.baseUrl + url,data, successHandler, errorHandler);
    // }else{
      this.postSecure (_this, _this.globals.baseUrl + "/secure" + url, data, successHandler, errorHandler);
// }
  }

  updateDashboardTitle(_this, id, title, successHandler, errorHandler)
  {
    let url = _this.globals.baseUrl+ "/updateDashboardTitle?id=" + id + "&title=" + title;
    this.post (_this, url, null, successHandler, errorHandler);
  }

  deleteDashboard(_this, id, successHandler, errorHandler)
  {
    let url = _this.globals.baseUrl+ "/deleteDashboard?id=" + id;
    this.post (_this, url, null, successHandler, errorHandler);
  }

  getSharedContentByUser(_this, successHandler, errorHandler)
  {
    let url = _this.globals.baseUrl + "/secure/getSharedContent/byUser?appId=" + _this.globals.currentApplication.id;
    this.get (_this, url, successHandler, errorHandler);
  }

  createAuthorizationHeader() {
    let token = localStorage.getItem('token');

    if (!token)
      token = "noUser";

    httpOptions.headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    // httpOptions.headers = httpOptions.headers.append(this.SECURITY_HEADER, localStorage.getItem(this.TOKEN_STORAGE_KEY));
    httpOptions.headers = httpOptions.headers.append('Authorization', token);
  }

  get = function (_this,url,successHandler, errorHandler){
    this.createAuthorizationHeader();
    this.http.get(url,httpOptions).subscribe(result => {
        successHandler(_this,result);
    }, error =>
        errorHandler(_this,error)
  );
  }

  post = function (_this,url, data, successHandler, errorHandler) {
    this.http.post(url, data).subscribe(result => {
        successHandler(_this,result);
      }, error =>
      errorHandler(_this,error)
    );
  }

  postSecure = function (_this,url, data, successHandler, errorHandler) {
    this.createAuthorizationHeader();
    this.http.post(url, data,httpOptions).subscribe(result => {
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
