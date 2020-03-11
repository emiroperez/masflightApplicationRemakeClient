import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})

export class MenuService {
  constructor(private authService: AuthService) {
  }

  getMenu(_this,successHandler, errorHandler)
  {
    let url = "/getMenu?";

    if (_this.globals.currentApplication == undefined)
      _this.globals.currentApplication = JSON.parse(localStorage.getItem("currentApplication"));

    url = url + "application="+_this.globals.currentApplication.id;
    if (_this.globals.testingPlan != -1)
      url += "&testPlanId=" + _this.globals.testingPlan;

    _this.globals.isLoading = true;
    this.authService.get (_this, _this.globals.baseUrl + "/secure" + url, successHandler, errorHandler);
  }

  getAdvanceFeatures(_this, successHandler, errorHandler){
    let url = "/getPlanAdvanceFeatures";

    if (_this.globals.testingPlan != -1)
      url += "?testPlanId=" + _this.globals.testingPlan;

    this.authService.get (_this, _this.globals.baseUrl + "/secure" + url, successHandler, errorHandler);
  }

  getUserLoggedin(_this, successHandler, errorHandler){
    let url = _this.globals.baseUrl + "/secure/getUserloggedin";
    //let url = "http://localhost:8887/secure/getUserloggedin"
    this.authService.get (_this, url, successHandler, errorHandler);
  }

  getDashboardsByUser(_this, successHandler, errorHandler){
    if(_this.globals.currentApplication==undefined){
      _this.globals.currentApplication = JSON.parse(localStorage.getItem("currentApplication"));
    }
    let url = "/getDashboards?application=" + _this.globals.currentApplication.id;
    this.authService.get (_this, _this.globals.baseUrl + "/secure" + url, successHandler, errorHandler);
  }

  addDashboard(_this, data, successHandler, errorHandler){
    let url = "/addDashboardMenu";
    this.authService.post (_this, _this.globals.baseUrl + "/secure" + url, data, successHandler, errorHandler);
  }

  updateDashboard(_this, data, successHandler, errorHandler)
  {
    let url = _this.globals.baseUrl + "/updateDashboard";
    this.authService.post (_this, url, data, successHandler, errorHandler);
  }

  deleteDashboard(_this, id, successHandler, errorHandler)
  {
    let url = _this.globals.baseUrl + "/deleteDashboard?id=" + id;
    this.authService.post (_this, url, null, successHandler, errorHandler);
  }

  deleteSharedDashboard(_this, dashboardId, successHandler, errorHandler)
  {
    let url = _this.globals.baseUrl + "/secure/deleteSharedDashboard?dashboardId=" + dashboardId;
    this.authService.post (_this, url, null, successHandler, errorHandler);
  }

  getSharedContentByUser(_this, successHandler, errorHandler)
  {
    let url = _this.globals.baseUrl + "/secure/getSharedContent/byUser?appId=" + _this.globals.currentApplication.id;
    this.authService.get (_this, url, successHandler, errorHandler);
  }

  addSharedDashboard(_this, data, handlerSuccess, handlerError)
  {
    let url = _this.globals.baseUrl + "/secure/addSharedDashboard";
    this.authService.post (_this, url, data, handlerSuccess, handlerError);
  }

  addSharedReadOnlyDashboard(_this, data, handlerSuccess, handlerError)
  {
    let url = _this.globals.baseUrl + "/secure/addSharedReadOnlyDashboard";
    this.authService.post (_this, url, data, handlerSuccess, handlerError);
  }

  getUsers(_this, handlerSuccess, handlerError)
  {
    let url = _this.globals.baseUrl + "/secure/getAllUsers";
    this.authService.get (_this, url, handlerSuccess, handlerError);
  }

  getUsersByCustomerId(_this, handlerSuccess, handlerError)
  {
    let url = _this.globals.baseUrl + "/secure/getUsersByCustomerId";
    this.authService.get (_this, url, handlerSuccess, handlerError);
  }

  addSharedContent(_this, sharedContent, handlerSuccess, handlerError)
  {
    let url = _this.globals.baseUrl + "/secure/addSharedContent";
    this.authService.post (_this, url, sharedContent, handlerSuccess, handlerError);
  }

  updateToken(_this, handlerSuccess, handlerError)
  {
    let url = _this.globals.baseUrl + "/secure/updateToken";
    this.authService.get (_this, url, handlerSuccess, handlerError);
  }
}
