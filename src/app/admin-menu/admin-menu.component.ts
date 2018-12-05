import { AfterViewInit, OnInit, Component, ViewChild } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.css']
})
export class AdminMenuComponent implements AfterViewInit {

  menu: any[] = [];

  categoryArguments: any[] = [];

  categories: any[] = [];

  optionSelected: any = {};

  categoryArgumentSelected: any = {};

  constructor(private http: ApiClient, public globals: Globals, private service: ApplicationService, public snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.getMenuData();
    this.getCategoryArguments();
  }

  ngAfterViewInit(): void {

  }

  getCategoryArguments() {
    this.service.loadCategoryArguments(this, this.handlerSuccessCategoryArguments, this.handlerErrorCategoryArguments);
  }

  handlerSuccessCategoryArguments(_this, result) {
    _this.categories = result;
  }

  handlerErrorCategoryArguments(_this, result) {
    console.log(result);
  }

  getOptionSelected(option) {    
    if (this.optionSelected == option) {
      this.optionSelected.isActive = false;
      this.optionSelected = {};      
    } else {
      this.optionSelected.isActive = false;
      option.isActive = option.isActive == null ? true : !option.isActive;
      this.optionSelected = option;
      if (!option.root && option.id) {
        this.getOptionCategoryArguments(option);
      }else{
        this.categoryArguments = [];
      }
      console.log("was selected: " + option.label);
    }
  }

  getSelectCategoryArgument(category) {
    if (this.categoryArgumentSelected.id == category.categoryArgumentsId.id) {
      this.categoryArgumentSelected = {};
    } else {
      this.categoryArgumentSelected = category;
    }
    console.log("was selected: " + category.categoryArgumentsId.label);
  }

  getOptionCategoryArguments(option) {
    this.service.loadOptionCategoryArguments(this, option, this.handlerSuccessOptionCategoryArguments, this.handlerErrorOptionCategoryArguments);
  }

  handlerSuccessOptionCategoryArguments(_this, result) {
    _this.categoryArguments = result;
    _this.globals.isLoading = false;
  }

  handlerErrorOptionCategoryArguments(_this, result) {
    _this.globals.isLoading = false;
  }

  addOption() {
    let newNode = {
      "label": null,
      "baseUrl": null,
      "icon": null,
      "tab": null,
      "tabType": null,
      "parentId": null,
      "children": [],
      "toDelete": false
    };
    if (this.optionSelected.label != null) {
      this.optionSelected.isOpened = true;
      this.optionSelected.children.unshift(newNode);
    } else {
      this.menu.unshift(newNode);
    }
  }

  deleteOption() {
    if (this.optionSelected) {
      this.optionSelected.toDelete = true;
    }
  }

  saveMenu() {
    console.log(this.menu);    
    this.service.saveMenu(this, this.menu, this.handlerSuccessSaveMenuData, this.handlerErrorSaveMenuData);
  }

  handlerSuccessSaveMenuData(_this, data) {
    _this.getMenuData();
  }

  handlerErrorSaveMenuData(_this, data) {
    console.log(data);
    _this.getMenuData();
  }

  getMenuData(): void {
    this.service.loadMenuOptions(this, this.handlerGetSuccessMenuData, this.handlerGetErrorMenuData);
    this.optionSelected = {};
  }

  handlerGetSuccessMenuData(_this, data) {
    _this.menu = data;
    _this.globals.isLoading = false;
  }

  handlerGetErrorMenuData(_this, result) {
    console.log(result);
    _this.globals.isLoading = false;
  }

  addCategoryArgument() {
    if (this.optionSelected.id != null && this.optionSelected.children.length == 0 ) {
      let newNode = {
        "optionId": this.optionSelected.id,
        "categoryArgumentsId": {
          "id": null
        },
        "toDelete": false
      };
      this.categoryArguments.unshift(newNode);
    }
  }

  deleteCategoryArguments() {
    var result = this.categoryArguments.filter(function (object) {
      return object.selected == true;
    });
    result.forEach(function (valor, indice, array) {
      valor.toDelete = true;
    });
  }

  saveCategoryArguments() {
    this.service.saveOptionCategoryArguments(this, this.categoryArguments, this.handlerSuccessSaveOptionCategoryArguments, this.handlerErrorSaveOptionCategoryArguments);
  }

  handlerSuccessSaveOptionCategoryArguments(_this, result) {
    _this.getOptionCategoryArguments(_this.optionSelected);
  }

  handlerErrorSaveOptionCategoryArguments(_this, result) {    
    _this.globals.isLoading = false;
    _this.getOptionCategoryArguments(_this.optionSelected);
    console.log(result);
  }

}
