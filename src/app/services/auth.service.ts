import { Injectable } from '@angular/core';
import {ApiClient} from '../api/api-client';
import { Globals } from '../globals/Globals';

@Injectable()
export class AuthService {
  constructor(private http: ApiClient, private globals:Globals) { 
  }

  login(_this,credentials,successHandler, errorHandler){
    // let url = 'http://localhost:8887/login';
    let url = this.globals.baseUrl+'/login';
    this.http.post(_this, url,credentials,successHandler, errorHandler);
  }
}
