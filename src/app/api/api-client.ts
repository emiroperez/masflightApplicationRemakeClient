import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpEventType } from '@angular/common/http';
import {Http, Headers} from '@angular/http';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import * as xml2js from 'xml2js';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

@Injectable()
export class ApiClient {
    SECURITY_HEADER = "Authorization";
    TOKEN_STORAGE_KEY = "token";
    
    constructor(private http: HttpClient) {
    }


    createAuthorizationHeader() {
        httpOptions.headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        httpOptions.headers = httpOptions.headers.append(this.SECURITY_HEADER, localStorage.getItem(this.TOKEN_STORAGE_KEY));
      }

    post = function (_this,url, data, successHandler, errorHandler) {
        this.http.post(url, data).subscribe(result => {

            successHandler(_this,result);
          }, error => 
          errorHandler(_this,error)
        );
    };


    get = function (_this,url, successHandler, errorHandler, tab) {
        this.http.get(url, {observe: 'events', reportProgress: true}).subscribe(result => {

            if (result.type === HttpEventType.DownloadProgress) {
                if( _this.globals != null){
                    if(result.total != null){
                        _this.globals.bytesLoaded = result.total;
                    }else if(result.loaded != null){
                        _this.globals.bytesLoaded = result.loaded;
                    }                    
                }   
            }           
            if (result.type === HttpEventType.Response) {
                successHandler(_this,result.body, tab);
            }           
            
          }, error => 
          errorHandler(_this,error)
        );
    };

    postSecure = function (_this, url, data, successHandler, errorHandler) {
        this.createAuthorizationHeader ();
        this.http.post(url, data, httpOptions).subscribe(result => {

            successHandler(_this,result);
          }, error => 
          errorHandler(_this,error)
        );
    };

    getSecure = function (_this, url, successHandler, errorHandler, tab) {
        this.createAuthorizationHeader ();
        this.http.get(url, {observe: 'events', reportProgress: true, headers: httpOptions.headers}).subscribe(result => {

            if (result.type === HttpEventType.DownloadProgress) {
                if( _this.globals != null){
                    if(result.total != null){
                        _this.globals.bytesLoaded = result.total;
                    }else if(result.loaded != null){
                        _this.globals.bytesLoaded = result.loaded;
                    }                    
                }   
            }           
            if (result.type === HttpEventType.Response) {
                successHandler(_this,result.body, tab);
            }           
            
          }, error => 
          errorHandler(_this,error)
        );
    };
   
}