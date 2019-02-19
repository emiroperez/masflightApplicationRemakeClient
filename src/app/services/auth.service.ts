import { Injectable } from '@angular/core';
import {ApiClient} from '../api/api-client';

@Injectable()
export class AuthService {

  constructor(private http: ApiClient) { }

  login(_this,credentials,successHandler, errorHandler){
    // let url = 'http://localhost:8887/login';
    let url = '/login';
    this.http.post(_this,url,credentials,successHandler, errorHandler);
  }
}
