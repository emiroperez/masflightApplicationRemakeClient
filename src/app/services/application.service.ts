import { Injectable, isDevMode } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { Utils } from '../commons/utils';
import { Observable, of } from 'rxjs';
import { Airport } from '../model/Airport';
import { delay } from 'rxjs/operators';
import { Globals } from '../globals/Globals';

import { MatDialog } from '@angular/material';
import { MsfConfirmationDialogComponent } from '../msf-confirmation-dialog/msf-confirmation-dialog.component';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {


  utils: Utils;

  // host = "http://192.168.1.5:8887";
  host = "";

  //host1 = "http://localhost:8886";
  host1 = "http://69.64.45.220:8886";

  constructor(private http: ApiClient, private authService: AuthService, private globals:Globals, private dialog: MatDialog) {
    this.utils = new Utils();
    this.host = this.globals.baseUrl;
    this.host1 = this.globals.baseUrl2;
  }

  getTracking(_this, successHandler, errorHandler) {
    let params = this.utils.getUrlParameters(_this.globals.currentOption,false);
    let url = this.host1 + "/getTracking?" + params.url;
    this.http.get(_this, url, successHandler, errorHandler, null);
  }


  getMapBoxTracking(_this, successHandler, errorHandler) {
    let params = this.utils.getUrlParameters(_this.globals.currentOption,false);
    let url = this.host1 + "/getMapBoxTracking?" + params.url;
					  
    let urlArg = encodeURIComponent (url);

    if (isDevMode ())
      console.log (url);

    url = this.host + "/secure/consumeWebServices?url=" + urlArg + "&optionId=" + this.globals.currentOption.id + "&noXml=true";

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    this.authService.get (_this, url, successHandler, errorHandler);
  }

  getDataTableSource(_this, handlerSuccess, handlerError,pageNumber: String,tokenResultable: String) {
    // _this.globals.isLoading = true;
    _this.displayedColumns = [];
    let param = this.utils.getUrlParameters(_this.globals.currentOption,true);
    let urlBase = param.url;
    if(!urlBase.includes("MIN_VALUE")){
      urlBase += "&MIN_VALUE=0";
    }
    if(!urlBase.includes("MAX_VALUE")){
      urlBase += "&MAX_VALUE=999";
    }
    if(!urlBase.includes("minuteunit")){
      urlBase += "&minuteunit=m";
    }
    urlBase += "&pageSize=50&page_number="+pageNumber+"&token="+tokenResultable;
    if(pageNumber=="0"){
      _this.dataSource = null;
    }
						 
    let urlArg = encodeURIComponent (urlBase);

    if (isDevMode ())
      console.log (urlBase);

    let url = this.host + "/secure/consumeWebServices?url=" + urlArg + "&optionId=" + _this.globals.currentOption.id;

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    this.authService.get(_this, url, handlerSuccess, handlerError);
  }

  getDataTableSourceForCSV(_this, handlerSuccess, handlerError)
  {
    let param = this.utils.getUrlParameters (_this.globals.currentOption, true);
    let urlBase = param.url;

    if (!urlBase.includes("MIN_VALUE"))
      urlBase += "&MIN_VALUE=0";

    if (!urlBase.includes("MAX_VALUE"))
      urlBase += "&MAX_VALUE=999";

    if (!urlBase.includes("minuteunit"))
      urlBase += "&minuteunit=m";

    urlBase += "&pageSize=999999&page_number=0";

    let urlArg = encodeURIComponent (urlBase);

    if (isDevMode ())
      console.log (urlBase);

    let url = this.host + "/secure/consumeWebServices?url=" + urlArg + "&optionId=" + _this.globals.currentOption.id;

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    this.authService.get(_this, url, handlerSuccess, handlerError);
  }

  getDataSource(_this, handlerSuccess, handlerError, tokenResultable: String)
  {
    let param = this.utils.getUrlParameters(_this.globals.currentOption,true);
    let urlBase = param.url;
    if(!urlBase.includes("MIN_VALUE")){
      urlBase += "&MIN_VALUE=0";
    }
    if(!urlBase.includes("MAX_VALUE")){
      urlBase += "&MAX_VALUE=999";
    }
    if(!urlBase.includes("minuteunit")){
      urlBase += "&minuteunit=m";
    }
    urlBase += "&pageSize=999999&page_number=0&token=" + tokenResultable;

    let urlArg = encodeURIComponent (urlBase);

    if (isDevMode ())
      console.log (urlBase);

    let url = this.host + "/secure/consumeWebServices?url=" + urlArg + "&optionId=" + _this.globals.currentOption.id;

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    this.authService.get(_this, url, handlerSuccess, handlerError);
  }

  loadDynamicTableData(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    _this.columns = [];

    let param = this.utils.getUrlParameters(_this.globals.currentOption,true);
    let urlBase = param.url;
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999&page_number=0";
						 
    let urlArg = encodeURIComponent (urlBase);

    if (isDevMode ())
      console.log (urlBase);

    let data = { variables: _this.globals.variables, values: _this.globals.values };
    let url = this.host + "/secure/getHorizontalMatrix?url=" + urlArg + "&optionId=" + _this.globals.currentOption.id;

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    this.authService.post (_this, url, data, handlerSuccess, handlerError);
  }

  loadMenuOptions(_this, handlerSuccess, handlerError) {
    if(_this.globals.currentApplication == undefined){
      _this.globals.currentApplication = JSON.parse(localStorage.getItem("currentApplication"));
    }
    let url = this.host + "/getMenuTree?appId=" + _this.globals.currentApplication.id;
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  loadAllUsers(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    if(_this.globals.currentApplication == undefined){
      _this.globals.currentApplication = JSON.parse(localStorage.getItem("currentApplication"));
    }
    let url = this.host + "/getAllUsers";
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }
/*
  createMenucategory(_this, data, handlerSuccess, handlerError) {
    let url = this.host + "/menuTreeCategory";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  createMenuOption(_this, data, handlerSuccess, handlerError) {
    let url = this.host + "/menuTreeOption";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }
  */

  loadOptionCategoryArguments(_this, optionId, handlerSuccess, handlerError) {
    let url = this.host + "/getOptionArgumentsCategories?optionId=" + optionId;
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  loadWebserviceMeta(_this,data,handlerSuccess, handlerError) {
    let url = this.host+"/getMetaByOptionId?optionId=" + data.id;
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  loadWebserviceMetaAdmin(_this,data,handlerSuccess, handlerError) {
    let url = this.host+"/getMetaAdminByOptionId?optionId=" + data.id;
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  loadWebservicColumn(_this,data,handlerSuccess, handlerError) {
    let url = this.host+"/getAppColumns?search=" + data;
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  loadArgumentsMeta(_this,data,handlerSuccess, handlerError) {
    let url = this.host+"/getArgumentsByOption?optionId=" + data.id;
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  loadArguments(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    let url = this.host + "/getArguments";
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  loadAdvanceFeatures(_this, handlerSuccess, handlerError) {
    let url = this.host + "/getAdvanceFeatures";
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  loadCategoryArguments(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    let url = this.host + "/getArgumentsCategories";
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  loadPlanOptions(_this, data, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    let url = this.host + "/getOptionsPlan?plan="+data+"&application="+_this.globals.currentApplication.id;
    // let url = this.host + "/getOptionsPlan?plan="+data+"&application=4";
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }


  createArgument(_this, data, handlerSuccess, handlerError) {
    let url = this.host +  "/arguments?idOption=" + data.idOption;
    this.http.post(_this, url, data.argument, handlerSuccess, handlerError);
  }

  loadMenuCategories(_this, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/getMenu";
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  saveMenu(_this, defaultMenuId, data, handlerSuccess, handlerError){
    let url;

    _this.globals.isLoading = true;
    url = this.host + "/menu?applicationId=" + _this.globals.currentApplication.id;
    if (defaultMenuId)
      url += "&defaultMenuId=" + defaultMenuId;

    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  saveMeta(_this, data, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/saveWebServieMeta";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  saveDrillDown(_this, data, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/saveDrillDown";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  saveOptionCategoryArguments(_this, data,option, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/saveOptionArgumentsCategories/"+option;
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  loadArgumentsByCategory(_this, data, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/getArgumentsByCategory?idCategory=" + data.id;
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  saveArgumentsCategory(_this, data, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/saveArgumentsCategory";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }


  saveNewCategoryArguments(_this, data, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/saveNewCategoryArguments";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  saveOptionsArgumentsCategory(_this, data, optionId, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/saveOptionsArgumentsCategory/"+optionId;
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }


  saveArguments(_this, data, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/saveArguments";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  deleteArgumentsCategory(_this, data, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/deleteArgumentsCategory";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  deleteArguments(_this, data, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/deleteArguments";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  getDataTableSourceUsageStatistics(_this, handlerSuccess, handlerError) {
    _this.dataSource = null;
    _this.displayedColumns = [];
    _this.globals.isLoading = true;
    let param = this.utils.getUrlParameters(_this.globals.currentOption,true);
    let urlBase = param.url;
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=100";
						 
    // let urlArg = encodeURIComponent(urlBase);
    urlBase += "&optionId=" + _this.globals.currentOption.id;

    if (isDevMode ())
      console.log (urlBase);

    this.http.get(_this, urlBase, handlerSuccess, handlerError, null);
  }

  getMenuString(_this, applicationId, handlerSuccess, handlerError): void
  {
    let url = this.host + "/getMenuString?appId=" + applicationId;
    this.http.get (_this, url, handlerSuccess, handlerError, null);
  }

  getMenuForDashboardString(_this, applicationId, handlerSuccess, handlerError): void
  {
    let url = this.host + "/secure/getMenuForDashboardString?appId=" + applicationId;

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    this.authService.get (_this, url, handlerSuccess, handlerError);
  }

  getChartFilterValues(_this, id, handlerSuccess, handlerError): void
  {
    let url = this.host + "/getMetaByOptionId?optionId=" + id;
    this.http.get (_this, url, handlerSuccess, handlerError, null);
  }

  getWebServicesMeta(_this, optionIds, handlerSuccess, handlerError): void
  {
    let url = "/getMetaByOptionIds";
    this.http.post (_this, this.host + url, optionIds, handlerSuccess, handlerError);
  }

  createDashboardPanel(_this, panels, handlerSuccess, handlerError): void
  {
    let url = "/addDashboardPanels";
    this.http.post (_this, this.host + url, panels, handlerSuccess, handlerError);
  }

  createDashboardPanelInColumn(_this, panels, width, handlerSuccess, handlerError): void
  {
    let url = "/addDashboardPanels/column?width=" + width;
    this.http.post (_this, this.host + url, panels, handlerSuccess, handlerError);
  }

  deleteDashboardPanel(_this, id, width, handlerSuccess, handlerError): void
  {
    let url = this.host + "/deleteDashboardPanel?width=" + width;
    this.http.post (_this, url, id, handlerSuccess, handlerError);
  }

  deleteDashboardColumn(_this, dashboardMenuId, column, handlerSuccess, handlerError): void
  {
    let url = "/updateDashboardPanelColumns?dashboardMenuId=" + dashboardMenuId + "&column=" + column;
    this.http.post (_this, this.host + url, null, handlerSuccess, handlerError);
  }

  getDashboardPanels(_this, dashboardMenuId, handlerSuccess, handlerError): void
  {
    let url = "/getDashboardPanels?dashboardMenuId=" + dashboardMenuId;
    this.http.get (_this, this.host + url, handlerSuccess, handlerError, null);
  }

  getAllChildPanels(_this, dashboardPanelIds, handlerSuccess, handlerError): void
  {
    let url = "/getChildPanels/all";
    this.http.post (_this, this.host + url, dashboardPanelIds, handlerSuccess, handlerError);
  }

  updateDashboardPanel(_this, panel, handlerSuccess, handlerError): void
  {
    let url = this.host + "/updateDashboardPanel";
    this.http.post (_this, url, panel, handlerSuccess, handlerError);
  }

  updateDashboardPanelHeight(_this, dashboardIds, height, handlerSuccess, handlerError): void
  {
    let url = this.host + "/updateDashboardPanelHeight?height=" + height;
    this.http.post (_this, url, dashboardIds, handlerSuccess, handlerError);
  }

  updateDashboardPanelWidth(_this, dashboardIds, handlerSuccess, handlerError): void
  {
    let url = this.host + "/updateDashboardPanelWidth";
    this.http.post (_this, url, dashboardIds, handlerSuccess, handlerError);
  }

  setDashboardPanelRowPositions(_this, panels, handlerSuccess, handlerError): void
  {
    let url = this.host + "/updateDashboardPanelRowPositions";
    this.http.post (_this, url, panels, handlerSuccess, handlerError);
  }

  confirmationDialog(_this, message, callback)
  {
    const dialogRef = this.dialog.open (MsfConfirmationDialogComponent, {
      disableClose: false,
      panelClass: 'msf-dashboard-control-variables-dialog'
    });

    let self = _this;
    dialogRef.componentInstance.confirmMessage = message;

    dialogRef.afterClosed ().subscribe (result =>
    {
      if (result)
        callback (self);
    });
  }

  getSubDataTableSource(_this,option,parameters,handlerSuccess, handlerError,) {
    // _this.globals.isLoading = true;
    // let param = this.utils.getUrlParameters(_this.globals.currentOption);
    let urlBase = option.baseUrl + parameters;
						 
    let urlArg = encodeURIComponent(urlBase);

    if (isDevMode ())
      console.log (urlBase);

    let url = this.host + "/secure/consumeWebServices?url=" + urlArg + "&optionId=" + option.id;

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    this.authService.get(_this, url, handlerSuccess, handlerError);
  }

  getDrillDownAdmin(_this, optionId, handlerSuccess, handlerError)
  {
    let url = this.host + "/getDrillDownsAdmin?optionId="+optionId;
    this.http.get (_this, url, handlerSuccess, handlerError, null);
  }

  getDrillDownOptions(_this, optionIds, handlerSuccess, handlerError)
  {
    let url = this.host + "/getDrillDowns";
    this.http.post (_this, url, optionIds, handlerSuccess, handlerError);
  }

  saveChildPanels(_this, info, parentPanelId, drillDownIds, handlerSuccess, handlerError)
  {
    let url = this.host + "/saveChildPanels?parentPanelId=" + parentPanelId;

    // add every drill down id that exists
    for (let i = 0; i < drillDownIds.length; i++)
      url += "&drillDownId=" + drillDownIds[i];

    this.http.post (_this, url, info, handlerSuccess, handlerError);
  }

  getChildPanels(_this, parentPanelId, handlerSuccess, handlerError)
  {
    let url = this.host + "/getChildPanels?parentPanelId=" + parentPanelId;
    this.http.get (_this, url, handlerSuccess, handlerError, null);
  }

  saveLastestResponse(_this, panel, handlerSuccess, handlerError)
  {
    let url = this.host + "/saveLastestResponse?lastestResponse";
    this.http.post (_this, url, panel, handlerSuccess, handlerError);
  }

  getChildPanel(_this, parentPanelId, drillDownId, handlerSuccess, handlerError)
  {
    let url = this.host + "/getChildPanel?parentPanelId=" + parentPanelId + "&drillDownId=" + drillDownId;
    this.http.get (_this, url, handlerSuccess, handlerError, null);
  }

  deleteChildPanels(_this, parentPanelId, handlerSuccess, handlerError)
  {
    let url = this.host + "/deleteChildPanels?parentPanelId=" + parentPanelId;
    this.http.post (_this, url, null, handlerSuccess, handlerError);
  }

  getSharedContentByDashboard(_this, dashboardMenuId, handlerSuccess, handlerError)
  {
    let url = this.host + "/getSharedContent/byDashboard?dashboardMenuId=" + dashboardMenuId;
    this.http.get (_this, url, handlerSuccess, handlerError, null);
  }

  getSharedContentByPanel(_this, dashboardPanelId, handlerSuccess, handlerError)
  {
    let url = this.host + "/getSharedContent/byPanel?dashboardPanelId=" + dashboardPanelId;
    this.http.get (_this, url, handlerSuccess, handlerError, null);
  }

  deleteSharedContent(_this, shareInfo, handlerSuccess, handlerError)
  {
    let url = this.host + "/deleteSharedContent";
    this.http.post (_this, url, shareInfo, handlerSuccess, handlerError);
  }

  getUsersByEmail(_this, emails, handlerSuccess, handlerError)
  {
    let url = this.host + "/getUsersByEmail";
    this.http.post (_this, url, emails, handlerSuccess, handlerError);
  }

  getUsersById(_this, userIds, handlerSuccess, handlerError)
  {
    let url = this.host + "/getUsersById";
    this.http.post (_this, url, userIds, handlerSuccess, handlerError);
  }

  addSharedPanel(_this, dashboardId, panelId, handlerSuccess, handlerError)
  {
    let url = this.host + "/addSharedPanel?dashboardId=" + dashboardId + "&panelId=" + panelId;
    this.http.post (_this, url, null, handlerSuccess, handlerError);
  }

  setDashboardColumnPositions(_this, columns, handlerSuccess, handlerError): void
  {
    let url = this.host + "/updateDashboardColumnPositions";
    this.http.post (_this, url, columns, handlerSuccess, handlerError);
  }

  getCustomers(_this, handlerSuccess, handlerError): void
  {
    let url = this.host + "/getCustomers";
    this.http.get (_this, url, handlerSuccess, handlerError, null);
  }

  saveCustomers(_this, customers, handlerSuccess, handlerError): void
  {
    let url = this.host + "/saveCustomers";
    this.http.post (_this, url, customers, handlerSuccess, handlerError);
  }

  checkMenuOption(_this, menuOptionId, handlerSuccess, handlerError): void
  {
    let url = this.host + "/checkMenuOption?id=" + menuOptionId;
    this.http.get (_this, url, handlerSuccess, handlerError, null);
  }

  removeDashboardPanelByOptionId(_this, optionId, handlerSuccess, handlerError): void
  {
    let url = this.host + "/removeDashboardPanelByOptionId";
    this.http.post (_this, url, optionId, handlerSuccess, handlerError);
  }

  getDefaultDashboard(_this, handlerSuccess, handlerError): void
  {
    let url = this.host + "/secure/getDefaultDashboard?applicationId=" + this.globals.currentApplication.id;
    this.authService.get (_this, url, handlerSuccess, handlerError);
  }

  setDefaultDashboard(_this, dashboard, handlerSuccess, handlerError): void
  {
    let url = this.host + "/secure/setDefaultDashboard?applicationId=" + this.globals.currentApplication.id;
    this.authService.post (_this, url, dashboard, handlerSuccess, handlerError);
  }

  unsetDefaultDashboard(_this, handlerSuccess, handlerError): void
  {
    let url = this.host + "/secure/setDefaultDashboard?applicationId=" + this.globals.currentApplication.id;
    this.authService.post (_this, url, null, handlerSuccess, handlerError);
  }

  deleteChildPanel(_this, childPanelId, handlerSuccess, handlerError): void
  {
    let url = this.host + "/deleteChildPanel";
    this.authService.post (_this, url, childPanelId, handlerSuccess, handlerError);
  }

  loadGroupArguments(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    let url = this.host + "/secure/Names_Group?Group=";
    // let url = this.host + "/Names_Group?Group=";
    this.authService.get(_this, url, handlerSuccess, handlerError);
  }

  
  saveNewGroupArguments(_this, data, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/secure/saveNewGroupArguments";
    this.authService.post(_this, url, data, handlerSuccess, handlerError);
  }

  getSharedGroupsArg(_this, groupId, handlerSuccess, handlerError)
  {
    let url = this.host + "/getUserGroupShared?search=" + groupId;
    this.http.get (_this, url, handlerSuccess, handlerError, null);
  }

  addSharedGroupArgs(_this, sharedContent, handlerSuccess, handlerError)
  {
    let url = _this.globals.baseUrl + "/addSharedGroupArgs";
    this.http.post (_this, url, sharedContent, handlerSuccess, handlerError);
  }

  deleteSharedGroupArgs(_this, shareInfo, handlerSuccess, handlerError)
  {
    let url = this.host + "/deleteSharedGroupArgs";
    this.http.post (_this, url, shareInfo, handlerSuccess, handlerError);
  }

  getMenuDefaultId(_this, handlerSuccess, handlerError)
  {
    let url;

    if (_this.globals.currentApplication == undefined)
      _this.globals.currentApplication = JSON.parse (localStorage.getItem ("currentApplication"));

    url = this.host + "/getMenuDefaultId?applicationId=" + _this.globals.currentApplication.id;
    this.http.get (_this, url, handlerSuccess, handlerError, null);
  }

  getMenuCategoryWelcome(_this, handlerSuccess, handlerError) {
    let url = this.host + "/secure/getMenuCategoryWelcome?application=" + _this.globals.currentApplication.id;
    this.authService.get (_this, url, handlerSuccess, handlerError);
  }
																 
  getDatalakeRoles(_this, schemaName, handlerSuccess, handlerError): void
  {
    let url = this.host + "/getDatalakeRoles?search=" + schemaName;
    this.http.get (_this, url, handlerSuccess, handlerError, null);
  }
																   
  getDatalakeOptions(_this, schemaName, handlerSuccess, handlerError): void
  {
    let url = this.host + "/getDatalakeOptions?search=" + schemaName;
    this.http.get (_this, url, handlerSuccess, handlerError, null);
  }

  saveNewDatalakeRole(_this, data, handlerSuccess, handlerError): void
  {
    let url = this.host + "/secure/saveNewDatalakeRole";

    _this.globals.isLoading = true;
    this.authService.post (_this, url, data, handlerSuccess, handlerError);
  }

  getNumAirlinesRestriction(_this, handlerSuccess, handlerError)
  {
    let url = this.host + "/secure/getNumAirlinesRestriction";

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;
  
    this.authService.get (_this, url, handlerSuccess, handlerError);
  }

  saveDateRestriction(_this, dataRestriction, handlerSuccess, handlerError)
  {
    let url = this.host + "/saveDateRestriction";
    this.http.post (_this, url, dataRestriction, handlerSuccess, handlerError);
  }

  removeDateRestriction(_this, customerId, handlerSuccess, handlerError)
  {
    let url = this.host + "/removeDateRestriction?customerId=" + customerId;
    this.http.get (_this, url, handlerSuccess, handlerError, null);
  }

  getDateRestriction(_this, handlerSuccess, handlerError)
  {
    let url = this.host + "/secure/getDateRestriction";

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    this.authService.get (_this, url, handlerSuccess, handlerError);
  }

  getDateRestriction2(_this, customerId, handlerSuccess, handlerError)
  {
    let url = this.host + "/getDateRestriction?customerId=" + customerId;
    this.http.get (_this, url, handlerSuccess, handlerError, null);
  }
}
