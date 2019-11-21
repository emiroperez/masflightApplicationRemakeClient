import { Injectable } from '@angular/core';
import { Globals } from '../globals/Globals';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WelcomeService {
  constructor(private globals:Globals, private authService: AuthService) {
   }

  getApplications(_this,successHandler, errorHandler){
    let url= this.globals.baseUrl+"/secure/getApplications";
    _this.globals.isLoading = true;
    this.authService.get(_this,url,successHandler, errorHandler);
  }

}