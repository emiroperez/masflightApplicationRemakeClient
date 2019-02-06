import { Injectable } from '@angular/core';
import { ApiClient } from '../api/api-client';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  constructor(private http: ApiClient) { }


  savePlans(_this,plans,successHandler, errorHandler){
    let url='http://localhost:8887/savePlans';
    //let url='/savePlans';
    this.http.post(_this,url,plans,successHandler, errorHandler);
  }

}
