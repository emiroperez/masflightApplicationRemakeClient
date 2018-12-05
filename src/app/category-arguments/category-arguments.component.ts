import { Component, OnInit, ViewChild } from '@angular/core';
import { ApplicationService } from '../services/application.service';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-category-arguments',
  templateUrl: './category-arguments.component.html',
  styleUrls: ['./category-arguments.component.css']
})

export class CategoryArgumentsComponent implements OnInit {

  columnDefs = [
    {
      headerName: 'Label',
      field: 'label',
      checkboxSelection: true,
      editable: true
    },
    {
      headerName: 'Icon',
      field: 'icon',
      editable: true
    }
  ];

  columnDefsArguments = [
    {
      headerName: 'Name1',
      field: 'name1',
      checkboxSelection: true,
      editable: true
    },
    {
      headerName: 'Name2',
      field: 'name2',
      editable: true
    },
    {
      headerName: 'Name3',
      field: 'name3',
      editable: true
    },
    {
      headerName: 'Label1',
      field: 'label1',
      editable: true
    },
    {
      headerName: 'Label2',
      field: 'label2',
      editable: true
    },
    {
      headerName: 'Label3',
      field: 'label3',
      editable: true
    },
    {
      headerName: 'Title',
      field: 'title',
      editable: true
    },
    {
      headerName: 'URL',
      field: 'url',
      editable: true
    },
    {
      headerName: 'Type',
      field: "type",
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ["airline", "airportRoute", "timeRange", "dateRange", "tailnumber",
          "singleairline", "aircraftType", "flightNumber", "airport", "grouping",
          "rounding", "date", "windDirection", "ceiling", "windSpeed", "temperature"]
      }
    }
  ];

  rowData: any[] = [];

  rowDataToDelete: any[] = [];  

  rowDataArguments: any[] = [];

  rowDataArgumentsToDelete: any[] = [];

  gridApi: any;

  gridApiArgument: any;

  columnApi: any;

  columnApiArgument: any;

  constructor(public globals: Globals, private service: ApplicationService) { }

  onGridReady(params) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    /*
    this.gridApi.sizeColumnsToFit();
    window.onresize = () => {
      this.gridApi.sizeColumnsToFit();
    }
    */
  }

  onGridReadyArgument(params) {
    this.gridApiArgument = params.api;
    this.columnApiArgument = params.columnApi;
    /*
    this.gridApiArgument.sizeColumnsToFit();
    window.onresize = () => {
      this.gridApiArgument.sizeColumnsToFit();
    }
    */
  }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.service.loadCategoryArguments(this, this.handlerSuccessCategoryArguments, this.handlerErrorCategoryArguments);
  }

  handlerSuccessCategoryArguments(_this, data) {
    _this.rowDataToDelete = [];
    _this.rowData = data;
    _this.globals.isLoading = false;
  }

  handlerErrorCategoryArguments(_this, result) {
    _this.globals.isLoading = false;
    console.log(result);
  }

  getDataCategoryArguments() {
    let rowDataResult = [];    
    this.gridApi.forEachNode(node => rowDataResult.push(node.data));
    return rowDataResult;
  }

  getDataArguments() {
    let rowDataResult = [];
    this.gridApiArgument.forEachNode(node => rowDataResult.push(node.data));
    return rowDataResult;
  }

  onSelectionChanged(event) {
    var selectedRows = this.gridApi.getSelectedRows();
    if (selectedRows.length > 0 && selectedRows[0].id != null) {
      this.service.loadArgumentsByCategory(this, selectedRows[0], this.handlerSuccessArgumentsByCategory, this.handlerErrorArgumentsByCategory);
    } else {
      this.rowDataArguments = [];
      this.rowDataArgumentsToDelete = [];
    }
    console.log(selectedRows);
  }

  handlerSuccessArgumentsByCategory(_this, result) {
    _this.globals.isLoading = false;
    _this.rowDataArgumentsToDelete = [];
    _this.rowDataArguments = result;
  }

  handlerErrorArgumentsByCategory(_this, result) {
    _this.globals.isLoading = false;
    console.log(result);
  }

  addCategoryArgument() {
    var value = {
      "id": null,
      "label": null,
      "icon": null
    };
    this.rowData.unshift(value);
    this.gridApi.setRowData(this.rowData);
  }

  removeCategoryArgument() {
    var selectedData = this.gridApi.getSelectedRows();
    this.rowDataToDelete.push(selectedData[0]);
    var res = this.gridApi.updateRowData({ remove: selectedData });
    console.log(this.rowData);
  }

  saveCategoryArgument() {    
    this.service.saveArgumentsCategory(this, this.getDataCategoryArguments(), this.handlerSuccessSaveCategoryArgument, this.handlerErrorSaveCategoryArgument);
  }

  handlerSuccessSaveCategoryArgument(_this, result) {
    _this.deleteArgumentsCategory();
  }

  handlerErrorSaveCategoryArgument(_this, result) {
    _this.globals.isLoading = false;
  }

  deleteArgumentsCategory() {
    this.service.deleteArgumentsCategory(this, this.rowDataToDelete, this.handlerSuccesDeleteArgumentsCategory, this.handlerErrorDeleteArgumentsCategory)
  }

  handlerSuccesDeleteArgumentsCategory(_this, result) {
    _this.getData();
  }

  handlerErrorDeleteArgumentsCategory(_this, result) {
    console.log(result);
  }

  addArgument() {
    var selectedData = this.gridApi.getSelectedRows();
    if (selectedData.length == 1) {
      var value = {
        "categoryId": selectedData[0].id,
        "name1": null,
        "name2": null,
        "name3": null,
        "url": null,
        "type": null
      };
      this.rowDataArguments.unshift(value);
      this.gridApiArgument.setRowData(this.rowDataArguments);
    }
  }

  saveArguments() {
    this.service.saveArguments(this, this.getDataArguments(), this.handlerSuccessSaveArguments, this.handlerErrorSaveArguments);
  }

  handlerSuccessSaveArguments(_this, result) {
    _this.deleteArgument();
  }

  handlerErrorSaveArguments(_this, result) {
    _this.globals.isLoading = false;
    console.log(result);
  }

  removeArgument() {
    var selectedData = this.gridApiArgument.getSelectedRows();
    this.rowDataArgumentsToDelete.push(selectedData[0]);
    var res = this.gridApiArgument.updateRowData({ remove: selectedData });
    console.log(this.rowDataArgumentsToDelete);
  }

  deleteArgument(){
    this.service.deleteArguments(this, this.rowDataArgumentsToDelete, this.handlerSuccessDeleteArguments, this.handlerErrorDeleteArguments);
  }

  handlerSuccessDeleteArguments(_this, result){    
    _this.onSelectionChanged();
    _this.globals.isLoading = false;
    console.log(result);
  }

  handlerErrorDeleteArguments(_this, result){
    console.log(result);
    
  }

}