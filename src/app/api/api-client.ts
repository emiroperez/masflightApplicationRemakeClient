import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';

@Injectable()
export class ApiClient {
    constructor(private http: HttpClient) {
    }

    put = function (_this, url, data, successHandler, errorHandler) {
        this.http.put(url, data).subscribe(result => {

            successHandler(_this,result);
          }, error => 
          errorHandler(_this,error)
        );
    };

    post = function (_this, url, data, successHandler, errorHandler) {
        this.http.post(url, data).subscribe(result => {

            successHandler(_this,result);
          }, error => 
          errorHandler(_this,error)
        );
    };

    // delete = function (_this, url, data, successHandler, errorHandler) {
    //     this.http.delete(url, {observe: 'events', reportProgress: true}).subscribe(result => {

    //         successHandler(_this,result);
    //       }, error => 
    //       errorHandler(_this,error)
    //     );
    // };


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

    delete = function (_this,url, successHandler, errorHandler, tab) {
        this.http.delete(url, {observe: 'events', reportProgress: true}).subscribe(result => {

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