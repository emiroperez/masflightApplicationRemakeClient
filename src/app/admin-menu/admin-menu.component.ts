import { OnInit, Component, Inject, ViewChildren, AfterViewInit, QueryList, ChangeDetectorRef, Renderer2, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { MatSnackBar, MatTableDataSource } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'dialog-edit-output-options-dialog',
  templateUrl: 'dialog-edit-output-options.html',
  styleUrls: ['./dialog-output.css'],
  encapsulation: ViewEncapsulation.None
})

export class EditOutputOptionsMetaDialog {

  optionSelected : any;

  constructor(
    public dialogRef: MatDialogRef<EditOutputOptionsMetaDialog>,
    @Inject(MAT_DIALOG_DATA) public data) { }


    displayedColumns = ['columnLabel', 'columnName', 'columnType', 'columnFormat', 'grouping'];
    dataSource = new MatTableDataSource(this.data);

    addOption() {
      console.log()
      this.data.push({
        id: null,
        checked: false,
        order: 'desc',
        optionId: this.data[0].optionId,
        columnLabel: '',
        columnName: '',
        columnType: 'string',
        columnFormat: null,
        grouping: 0,
        delete: false});
      this.dataSource = new MatTableDataSource(this.data);
    }

    onNoClick(): void {
      this.dialogRef.close();
    }

    selectRow(row) {
      this.optionSelected = row;
  }

  deleteOption() {
    if (this.optionSelected) {
      this.optionSelected.delete = true;
      const index: number = this.data.findIndex(d => d === this.optionSelected);
      this.data.splice(index, 1);
      this.dataSource = new MatTableDataSource(this.data);
    }
  }

}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog-edit-argument-category.html',
  styleUrls: ['./admin-menu.component.css']
})

export class EditCategoryArgumentDialog {

  itemSelected: any = {};

  argumentSelected: any = {};

  selectedCategories: any[] = [];

  displayedColumns: string[] = ['label1', 'label2', 'name1', 'name2'];

  constructor(
    public dialogRef: MatDialogRef<EditCategoryArgumentDialog>,
    @Inject(MAT_DIALOG_DATA) public data) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  selectArgumentCategory(category) {
    if (this.itemSelected != category) {
      category.isSelected = !category.isSelected;
      this.itemSelected.isSelected = !this.itemSelected.isSelected;
      this.itemSelected = category;
    } else {
      category.isSelected = !category.isSelected;
      this.itemSelected = {};
    }
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
      "selected": true,
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
    /*
    let filterSelected = item.arguments.filter(node => node.isSelected);
    filterSelected.forEach(function (node, index, array) {
      node.toDelete = true;
    });
    */
    item.toDelete = true;
  }

  setSelectedAgument(item) {
    if (item == this.argumentSelected) {
      this.argumentSelected.isSelected = false;
      this.argumentSelected = {};
    } else {
      this.argumentSelected = item;
      this.argumentSelected.isSelected = true;
    }
  }
}

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.css']
})
export class AdminMenuComponent implements OnInit, AfterViewInit {

  menu: any[] = [];

  categoryArguments: any[] = [];

  categories: any[] = [];

  outputs: any[] = [];

  optionSelected: any = {};

  categorySelected: any = {};

  categoryArgumentSelected: any = {};

  idDomOptionSelected: any;

  constructor(private http: ApiClient, public globals: Globals,
    private service: ApplicationService, public snackBar: MatSnackBar,
    public dialog: MatDialog, private ref: ChangeDetectorRef,
    public rend: Renderer2) {
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
    if (_this.optionSelected.id) {
      _this.getOptionCategoryArguments(_this.optionSelected);
    }
  }

  handlerErrorCategoryArguments(_this, result) {
    console.log(result);
  }

  getMeta() {
    this.service.loadWebservicMeta(this, this.optionSelected, this.handlerSuccessMeta, this.handlerErrorMeta);
  }

  handlerSuccessMeta(__this, result) {
      __this.outputs = result;
      const dialogRef = __this.dialog.open(EditOutputOptionsMetaDialog, {
      width: '80%',
      data: __this.outputs
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result != undefined) {
        __this.outputs = result;
        __this.saveMeta();
        console.log("envio");
        console.log(result);
      }
    });

  }
  handlerErrorMeta(_this, result) {
    console.log(result);
  }
  getOptionSelected(option) {
    //this.categoryArguments = [];
    //this.clearSelectedCategoryArguments();
    if (this.optionSelected == option) {
      this.optionSelected.isActive = false;
      this.optionSelected = {};
      this.idDomOptionSelected = {};
    } else {
      this.optionSelected.isActive = false;
      option.isActive = option.isActive == null ? true : !option.isActive;
      this.optionSelected = option;
      if (!option.isRoot && option.id) {
        this.getOptionCategoryArguments();
      }
      console.log("was selected: " + option.label);
    }
  }

  getSelectIdDom(idDomOption) {
    this.idDomOptionSelected = idDomOption;
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
    this.clearSelectedCategoryArguments();
    var categories = this.categories;
    this.optionSelected.menuOptionArgumentsAdmin.forEach(function (itemOptionCategory, indexOptionCategory, arrayOptionCategory) {
      categories.forEach(function (itemCategory, indexCategory, arrayCategory) {
        if (itemOptionCategory.categoryArgumentsId.id == itemCategory.id) {
          itemCategory.selected = true;
        }
      })
    });
    this.globals.isLoading = false;
  }

  addOption() {
    var newNode = {
      "label": null,
      "baseUrl": null,
      "icon": null,
      "tab": null,
      "tabType": null,
      "parentId": null,
      "children": [],
      "toDelete": false,
      "isRoot": false,
      "applicationId": this.globals.currentApplication.id
    };
    if (this.optionSelected.label != null) {
      this.optionSelected.isOpened = true;
      this.optionSelected.children.unshift(newNode);
    } else {
      newNode.isRoot = true;
      this.menu.unshift(newNode);

    }
    this.ref.detectChanges();
    if (this.optionSelected.label != null) {
      if (this.idDomOptionSelected != null) {
        const element = this.rend.selectRootElement('#root' + this.idDomOptionSelected + '-0');
        element.click();
        setTimeout(() => element.focus(), 10);
      }
    } else {
      const element = this.rend.selectRootElement('#root0');
      element.click();
      setTimeout(() => element.focus(), 10);
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

  saveMeta() {
    this.service.saveMeta(this, this.outputs, this.handlerSuccessSaveMeta, this.handlerErrorSaveMeta);
  }

  handlerSuccessSaveMeta(_this, data) {
    _this.globals.isLoading = false;
  }

  handlerErrorSaveMeta(_this, data) {
    console.log(data);
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

  setSelectedCategoryArguments(category) {
    category.selected = !category.selected;
    var index = this.optionSelected.menuOptionArgumentsAdmin.findIndex(el => el.categoryArgumentsId.id == category.id);
    if (index != -1) {
      if (this.optionSelected.menuOptionArgumentsAdmin[index].id == undefined) {
        this.optionSelected.menuOptionArgumentsAdmin.slice(index, 1);
      } else {
        this.optionSelected.menuOptionArgumentsAdmin[index].toDelete = !category.selected;
      }
    } else {
      var itemToAdd = {
        "categoryArgumentsId": category,
        "selected": true,
        "toDelete": false
      };
      this.optionSelected.menuOptionArgumentsAdmin.push(itemToAdd);
    }
  }

  addCategoryArgument() {
    let node = {
      "label": null,
      "icon:": null,
      "arguments": []
    };
    this.categories.push(node);
  }

  saveCategoryArgument() {
    this.service.saveArgumentsCategory(this, this.categories, this.handlerSuccessSaveCategoryArgument, this.handlerErrorSaveCategoryArgument);
  }

  handlerSuccessSaveCategoryArgument(_this, result) {
    _this.categories = result;
    _this.globals.isLoading = false;
    if (_this.optionSelected.id != undefined) {
      _this.getOptionCategoryArguments();
    }
  }

  handlerErrorSaveCategoryArgument(_this, result) {
    _this.globals.isLoading = false;
  }

  editOutputOptions() {
    this.getMeta();
  }

  editCategoryArguments() {
    var duplicateObject = JSON.parse(JSON.stringify(this.categories));
    const dialogRef = this.dialog.open(EditCategoryArgumentDialog, {
      width: '70%',
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
