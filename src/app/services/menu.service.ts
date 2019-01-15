import { Injectable } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Menu } from '../model/Menu';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor( private http: HttpClient) { }

  getMenu(_this,successHandler, errorHandler){
    let url = "/getMenu?";
    // let url = "http://localhost:8887/getMenu?"
    if(_this.globals.currentApplication==undefined){
      _this.globals.currentApplication = JSON.parse(localStorage.getItem("currentApplication"));
    }
    url = url + "application="+_this.globals.currentApplication.id;
    _this.globals.isLoading = true;
    this.get(_this,url,successHandler, errorHandler);
  }

  get(_this,url,successHandler, errorHandler){
    this.http.get<Menu>(url).subscribe(result => {
      successHandler(_this,result);
    }, error => 
    errorHandler(_this,error)
  );
  }

}
