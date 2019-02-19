import { Injectable } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  constructor(private http: ApiClient, private globals:Globals) {
   }


  savePlans(_this,plans,successHandler, errorHandler){
    // let url='http://localhost:8887/savePlans';
    let url= this.globals.baseUrl+'/savePlans';
    this.http.post(_this,url,plans,successHandler, errorHandler);
  }

}
