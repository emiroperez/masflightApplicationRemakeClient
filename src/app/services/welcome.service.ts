import { Injectable } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Menu } from '../model/Menu';

@Injectable({
  providedIn: 'root'
})
export class WelcomeService {

  constructor( private http: HttpClient) { }

  getApplications(_this,successHandler, errorHandler){
    // let url = "/getApplications";
     let url = "http://localhost:8887/getApplications";
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