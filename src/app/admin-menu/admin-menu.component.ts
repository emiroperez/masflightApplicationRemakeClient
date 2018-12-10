import { OnInit, Component, Inject } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { MatSnackBar } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog-edit-argument-category.html',
  styleUrls: ['./admin-menu.component.css']
})
export class EditCategoryArgumentDialog {

  itemSelected: any = {};

  selectedCategories: any[] = [];

  displayedColumns: string[] = ['label1', 'label2', 'name1', 'name2'];

  constructor(
    public dialogRef: MatDialogRef<EditCategoryArgumentDialog>, @Inject(MAT_DIALOG_DATA) public data) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  setSelectedCategoryArguments(category) {
    if (category.isSelected) {
      this.selectedCategories.forEach(function (currentValue, index, array) {
        if (currentValue == category) {
          array.splice(index, 1);
        }
      });
    } else {
      this.selectedCategories.push(category);
    }
    category.isSelected = !category.isSelected;
  }

  addCategoryArgument() {
    let node = {
      "label": null,
      "icon:": null,
      "arguments": []
    };
    this.data.push(node);
  }

  deleteCategoryArgument() {
    let filterSelected = this.data.filter(item => item.isSelected);
    for (var i = 0; i < filterSelected.length; i += 1) {
      this.selectedCategories.forEach(function (currentValue, index, array) {
        if (currentValue == filterSelected[i]) {
          array.splice(index, 1);
        }
      });
    }

    filterSelected.forEach(function (item, index, array) {
      item.toDelete = true;
    });
  }

  toggleGroup(item) {
    item.isOpened = !item.isOpened;
  }

  addArgument(item) {
    var node = {
      "isSelected": false,
      "toDelete": false
    };
    item.arguments.push(node);
  }

  deleteArgument(item) {
    let filterSelected = item.arguments.filter(node => node.isSelected);
    filterSelected.forEach(function (node, index, array) {
      node.toDelete = true;
    });
  }

}

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.css']
})
export class AdminMenuComponent implements OnInit {

  menu: any[] = [];

  categoryArguments: any[] = [];

  categories: any[] = [];

  optionSelected: any = {};

  categorySelected: any = {};

  categoryArgumentSelected: any = {};

  constructor(private http: ApiClient, public globals: Globals, private service: ApplicationService, public snackBar: MatSnackBar, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.getMenuData();
    this.getCategoryArguments();
  }

  getCategoryArguments() {
    this.service.loadCategoryArguments(this, this.handlerSuccessCategoryArguments, this.handlerErrorCategoryArguments);
  }

  handlerSuccessCategoryArguments(_this, result) {
    _this.categories = result;
    if (_this.optionSelected.id) {
      _this.getOptionCategoryArguments(_this.optionSelected);
    }
  }

  handlerErrorCategoryArguments(_this, result) {
    console.log(result);
  }

  getOptionSelected(option) {
    this.categoryArguments = [];
    this.clearSelectedCategoryArguments();
    if (this.optionSelected == option) {
      this.optionSelected.isActive = false;
      this.optionSelected = {};
    } else {
      this.optionSelected.isActive = false;
      option.isActive = option.isActive == null ? true : !option.isActive;
      this.optionSelected = option;
      if (!option.root && option.id) {
        this.getOptionCategoryArguments();
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

  clearSelectedCategoryArguments() {
    this.categories.forEach(function (itemCategory, indexCategory, arrayCategory) {
      itemCategory.selected = false;
    })
  }

  getOptionCategoryArguments() {
    this.service.loadOptionCategoryArguments(this, this.optionSelected, this.handlerSuccessOptionCategoryArguments, this.handlerErrorOptionCategoryArguments);
  }

  handlerSuccessOptionCategoryArguments(_this, result) {
    _this.clearSelectedCategoryArguments()
    _this.categoryArguments = result;
    _this.categoryArguments.forEach(function (itemOptionCategory, indexOptionCategory, arrayOptionCategory) {
      _this.categories.forEach(function (itemCategory, indexCategory, arrayCategory) {
        if (itemOptionCategory.categoryArgumentsId.id == itemCategory.id) {
          itemCategory.selected = true;
        }
      })
    });
    //_this.globals.isLoading = false;
  }

  handlerErrorOptionCategoryArguments(_this, result) {
    //_this.globals.isLoading = false;
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
    let newNode = {
      "label": null,
      "icon": null
    };
    this.categories.unshift(newNode);
  }  

  saveCategoryArgument() {
    this.service.saveArgumentsCategory(this, this.categories, this.handlerSuccessSaveCategoryArgument, this.handlerErrorSaveCategoryArgument);
  }

  handlerSuccessSaveCategoryArgument(_this, result) {
    _this.categories = result;
    if (_this.optionSelected.id != undefined) {
      _this.getOptionCategoryArguments();
    } else {
      _this.globals.isLoading = false;
    }
  }

  handlerErrorSaveCategoryArgument(_this, result) {
    _this.globals.isLoading = false;
  }

  saveOptionCategoryArguments() {
    if (this.optionSelected.id != undefined) {
      let arrayResult: any = [];
      //let filterSelected = this.categories.filter(item => item.selected);
      let filterSelected = this.categories;
      var optionSelectedId = this.optionSelected.id;
      filterSelected.forEach(function (item, index, array) {
        var itemToAdd = {
          "optionId": optionSelectedId,
          "categoryArgumentsId": item,
          "selected": item.selected
        };
        arrayResult.push(itemToAdd);
      });
      this.service.saveOptionCategoryArguments(this, arrayResult, this.handlerSuccessSaveOptionCategoryArguments, this.handlerErrorSaveOptionCategoryArguments);
    }
  }

  handlerSuccessSaveOptionCategoryArguments(_this, result) {
    _this.getCategoryArguments();
  }

  handlerErrorSaveOptionCategoryArguments(_this, result) {
    _this.globals.isLoading = false;
    console.log(result);
  }

  editCategoryArguments() {
    var duplicateObject = JSON.parse(JSON.stringify(this.categories));

    const dialogRef = this.dialog.open(EditCategoryArgumentDialog, {
      width: '80%',
      data: duplicateObject
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        this.categories = result;
        this.saveCategoryArgument();
      }
    });
  }

}