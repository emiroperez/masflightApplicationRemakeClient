import { Injectable } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { Utils } from '../commons/utils';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  utils: Utils;

  host = "http://localhost:8887";
  //host = "";

  host1 = "http://localhost:8886";
  //host1 = "http://69.64.45.220:8886"; 

  constructor(private http: ApiClient) {
    this.utils = new Utils();
  }

  getTracking(_this, successHandler, errorHandler) {
    let params = this.utils.getUrlParameters(_this.globals.currentOption);
    let url = this.host1 + "/getTracking?" + params.url;
    this.http.get(_this, url, successHandler, errorHandler, null);
  }

  getMapBoxTracking(_this, successHandler, errorHandler) {
    let params = this.utils.getUrlParameters(_this.globals.currentOption);
    let url = this.host1 + "/getMapBoxTracking?" + params.url;
    this.http.get(_this, url, successHandler, errorHandler, null);
  }

  getDataTableSource(_this, handlerSuccess, handlerError) {
    _this.dataSource = null;
    _this.displayedColumns = [];
    _this.globals.isLoading = true;
    let param = this.utils.getUrlParameters(_this.globals.currentOption);
    let urlBase = param.url;
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=100";
    console.log(urlBase);
    let urlArg = encodeURIComponent(urlBase);
    let url = this.host + "/consumeWebServices?url=" + urlArg + "&optionId=" + _this.globals.currentOption.id;   
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  getDataTableSourceUsageStatistics(_this, handlerSuccess, handlerError) {
    _this.dataSource = null;
    _this.displayedColumns = [];
    _this.globals.isLoading = true;
    let param = this.utils.getUrlParameters(_this.globals.currentOption);
    let urlBase = param.url;
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=100";
    console.log(urlBase);
    let urlArg = encodeURIComponent(urlBase);
    urlBase += "&optionId=" + _this.globals.currentOption.id;
    //let url = "/consumeWebServices?url=" + urlArg + "&optionId="+ _this.globals.currentOption.id;    
    this.http.get(_this, urlBase, handlerSuccess, handlerError, null);
  }

  loadChartData(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    let param = this.utils.getUrlParameters(_this.globals.currentOption);
    let urlBase = param.url;
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999";
    console.log(urlBase);
    let urlArg = encodeURIComponent(urlBase);
    let url = this.host + "/getChartData?url=" + urlArg + "&variable=" + _this.variable.id + "&xaxis=" + _this.xaxis.id + "&valueColunm=" + _this.valueColunm.id + "&function=" + _this.function.id;
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  loadChartDataUsageStatistics(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    let params = this.utils.getParameters(_this.globals.currentOption);
    params += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999";
    console.log(params);
    let url = "http://localhost:8887/getChartDataUsageStatistics?variable=" + _this.variable.id + "&xaxis=" + _this.xaxis.id + "&valueColunm=" + _this.valueColunm.id + "&function=" + _this.function.id + "&" +params+ "&optionId=" + _this.globals.currentOption.id;;
    //let url = "/getChartData?url=" + urlArg+"&variable="+ _this.variable.id+"&xaxis="+_this.xaxis.id+"&valueColunm="+_this.valueColunm.id+"&function="+_this.function.id;     
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }


  loadDynamicTableData(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    _this.columns = [];

    _this.jqxTreeGridRef.clear();
    let param = this.utils.getUrlParameters(_this.globals.currentOption);
    let urlBase = param.url;
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999";
    console.log(urlBase);
    let urlArg = encodeURIComponent(urlBase);
    let url = this.host + "/getDynamicTableData?url=" + urlArg;
    let data = { variables: _this.globals.variables, values: _this.globals.values };
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  loadMenuOptions(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    let url = this.host + "/getMenuTree";
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  createMenucategory(_this, data, handlerSuccess, handlerError) {      
    let url = this.host + "/menuTreeCategory";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  createMenuOption(_this, data, handlerSuccess, handlerError) {      
    let url = this.host + "/menuTreeOption";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  loadOptionCategoryArguments(_this, data, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    let url = this.host + "/getOptionArgumentsCategories?optionId=" + data.idOption + "&categoryId=" + data.idCategory;
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  loadArguments(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    let url = this.host + "/getArguments";
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  loadCategoryArguments(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    let url = this.host + "/getArgumentsCategories";
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  createArgument(_this, data, handlerSuccess, handlerError) {
    let url = this.host + "/arguments?idOption=" + data.idOption;
    this.http.post(_this, url, data.argument, handlerSuccess, handlerError);
  }

}
