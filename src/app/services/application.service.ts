import { Injectable } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { Utils } from '../commons/utils';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  utils: Utils;

  constructor(private http: ApiClient) {
    this.utils = new Utils();
  }

  getTracking(_this, successHandler, errorHandler) {
    let params = this.utils.getUrlParameters(_this.globals.currentOption);
    let url = "http://69.64.45.220:8886/getTracking?" + params.url;
    //let url = "http://localhost:8886/getTracking?" + params.url;
    this.http.get(_this, url, successHandler, errorHandler, null);
  }

  getMapBoxTracking(_this, successHandler, errorHandler) {
    let params = this.utils.getUrlParameters(_this.globals.currentOption);
    let url = "http://69.64.45.220:8886/getMapBoxTracking?airline=DL&origin=LGA&destination=MCO&initialdate=20181011&finaldate=20181011&flightNo=1071";// + params.url;
    //let url = "http://localhost:8886/getMapBoxTracking?airline=DL&origin=LGA&destination=MCO&initialdate=20181011&finaldate=20181011&flightNo=1071";// + params.url;
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
    //let url = "http://localhost:8887/consumeWebServices?url=" + urlArg + "&optionId=" + _this.globals.currentOption.id;
    let url = "/consumeWebServices?url=" + urlArg + "&optionId="+ _this.globals.currentOption.id;    
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  loadChartData(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    let param = this.utils.getUrlParameters(_this.globals.currentOption);
    let urlBase = param.url;
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999";
    console.log(urlBase);
    let urlArg = encodeURIComponent(urlBase);
    //let url = "http://localhost:8887/getChartData?url=" + urlArg + "&variable=" + _this.variable.id + "&xaxis=" + _this.xaxis.id + "&valueColunm=" + _this.valueColunm.id + "&function=" + _this.function.id;
    let url = "/getChartData?url=" + urlArg+"&variable="+ _this.variable.id+"&xaxis="+_this.xaxis.id+"&valueColunm="+_this.valueColunm.id+"&function="+_this.function.id;     
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
    //let url = "http://localhost:8887/getDynamicTableData?url=" + urlArg;
    let url = "/getDynamicTableData?url=" + urlArg; 
    let data = { variables: _this.globals.variables, values: _this.globals.values };
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  loadMenuOptions(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    //let url = "http://localhost:8887/getMenuTree";
    let url = "/getMenuTree";
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  createMenucategory(_this, data, handlerSuccess, handlerError) {      
    //let url = "http://localhost:8887/menuTreeCategory";
    let url = "/menuTreeCategory";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  createMenuOption(_this, data, handlerSuccess, handlerError) {      
    //let url = "http://localhost:8887/menuTreeOption";
    let url = "/menuTreeOption";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  loadOptionCategoryArguments(_this, data, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    //let url = "http://localhost:8887/getOptionArgumentsCategories?optionId=" + data.idOption + "&categoryId=" + data.idCategory;
    let url = "/getOptionArgumentsCategories?optionId=" + data.idOption + "&categoryId=" + data.idCategory;
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  loadArguments(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    //let url = "http://localhost:8887/getArguments";
    let url = "/getArguments";
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  loadCategoryArguments(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    //let url = "http://localhost:8887/getArgumentsCategories";
    let url = "/getArgumentsCategories";
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  createArgument(_this, data, handlerSuccess, handlerError) {
    //let url = "http://localhost:8887/arguments?idOption=" + data.idOption;
    let url = "/arguments?idOption=" + data.idOption;
    this.http.post(_this, url, data.argument, handlerSuccess, handlerError);
  }

}
