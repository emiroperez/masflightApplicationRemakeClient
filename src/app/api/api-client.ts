import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpEventType } from '@angular/common/http';
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

    post = function (_this,url, data, successHandler, errorHandler) {
        this.http.post(url, data,httpOptions).subscribe(result => {
            /*
            if (result.sessionExpired){

            }
            */
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


   
}