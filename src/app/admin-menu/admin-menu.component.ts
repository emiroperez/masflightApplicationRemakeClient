import { OnInit, Component, Inject, AfterViewInit, ChangeDetectorRef, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { MatSnackBar, MatTableDataSource, MatTable, MatSelect } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MessageComponent } from '../message/message.component';
import {CdkDragDrop, moveItemInArray, CdkDropList} from '@angular/cdk/drag-drop';
import { FormControl } from '@angular/forms';
import { DrillDown } from '../model/DrillDown';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { CategoryArguments } from '../model/CategoryArguments';
//import  clonedeep from 'lodash.clonedeep';

@Component({
  selector: 'confirm-delete-dialog',
  templateUrl: 'confirm-delete-dialog.html',
})

export class ConfirmDeleteDialog {

  constructor(public dialogRef: MatDialogRef<ConfirmDeleteDialog>, private dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: {message: string, confirm: boolean}) {
  }

  close() {
    this.data.confirm = false;
    this.dialogRef.close ();
  }

  confirm() {
    this.data.confirm = true;
  }
}



@Component({
  selector: 'new-category-dialog-app',
  templateUrl: 'new-category-dialog.html',
  styleUrls: ['./admin-menu.component.css']
})

export class NewCategoryDialog {
  category:any = {label:'',icon:'',description:'',isSelected:false};
  categories: any[] =[];
  optionSelected: any;
  idDomOptionSelected: any;
  categoryDelete: any[] = [];
  argumentDelete: any[] = [];
  dataToSend: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<NewCategoryDialog>,private service: ApplicationService, private globals: Globals,
    @Inject(MAT_DIALOG_DATA) public data) {
      this.categories = data;
}

onNoClick(){
  this.dialogRef.close();
}

sendData() {
  this.dataToSend = this.categories.concat(this.categoryDelete);
  this.dialogRef.close(this.dataToSend);
}

getSelectedOption(option) {
  if (this.category != option) {
    option.isSelected = !option.isSelected;
    this.category.isSelected = !this.category.isSelected;
    this.category = option;
  } else {
    option.isSelected = !option.isSelected;
    this.category = {};
  }

  console.log(this.category)
}

addCategory(){
  let cat = {
    label:'',
    icon:'',
    description:'',
    arguments: []
  }
  this.categories.unshift(cat);
  this.getSelectedOption(this.categories[0]);
}

deleteCategory(){
  this.category.delete=true;
  this.categoryDelete.push(this.category);
  const index: number = this.categories.findIndex(d => d === this.category);
  this.categories.splice(index,1);
}

addArgument(){
  let arg = {
    description:'',
    type:''
  }
  this.category.arguments.push(arg);
}

deleteArgument(argument){
  argument.delete=true;
  this.argumentDelete.push(argument);
  const index: number = this.category.arguments.findIndex(d => d === argument);
  this.category.arguments.spice(index,1);
}

}


@Component({
  selector: 'drill-down-app',
  templateUrl: 'drill-down-setup.html',
  styleUrls: ['./dialog-output.css']
})

export class DrillDownDialog {
  drillDownSelected: any;
  menuString;
  dataToSend : any [] = [];
  dataToDelete: any[] = [];
  protected options: any[];
  public optCtrl: FormControl = new FormControl();
  public optFilterCtrl: FormControl = new FormControl();
  public filteredOpts: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  @ViewChild('singleSelect') singleSelect: MatSelect;
  protected _onDestroy = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<DrillDownDialog>,
    @Inject(MAT_DIALOG_DATA) public data : {optionString: any, option:any, drillDown:any}) {
      this.menuString = data.optionString;
      this.optCtrl = this.menuString[0];
    this.filteredOpts.next(this.menuString.slice());

    // listen for search field value changes
    this.optFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterOptions();
      });
     }

     protected setInitialValue() {
      this.filteredOpts
        .pipe(take(1), takeUntil(this._onDestroy))
        .subscribe(() => {
          this.singleSelect.compareWith = (a: any, b: any) => a && b && a.id === b.id;
        });
    }

    protected filterOptions() {
      if (!this.menuString) {
        return;
      }
      let search = this.optFilterCtrl.value;
      if (!search) {
        this.filteredOpts.next(this.menuString.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      this.filteredOpts.next(
        this.menuString.filter(mString => mString.stringSearch.toLowerCase().indexOf(search) > -1)
      );
    }


    displayedColumns = ['title','childrenOptionId'];
    dataSource = this.data.drillDown;


    addDrillDown() {
      this.data.drillDown.push({
        id: null,
        title: '',
        childrenOptionId: 0,
        parentOptionId: this.data.option,
        delete: false});
      this.dataSource = new MatTableDataSource(this.data.drillDown);
    }

    onNoClick(): void {
      this.dialogRef.close();
    }

    sendData() {
      this.dataToSend = this.data.drillDown.concat(this.dataToDelete);
      this.dialogRef.close(this.dataToSend);
    }

    selectRow(row) {
      this.drillDownSelected = row;
  }

  deleteDrillDown() {
    if (this.drillDownSelected) {
      this.drillDownSelected.delete = true;
      this.dataToDelete.push(this.drillDownSelected);
      const index: number = this.data.drillDown.findIndex(d => d === this.drillDownSelected);
      this.data.drillDown.splice(index, 1);
      this.dataSource = new MatTableDataSource(this.data.drillDown);
    }
  }
}

@Component({
  selector: 'dialog-edit-output-options-dialog',
  templateUrl: 'dialog-edit-output-options.html',
  styleUrls: ['./dialog-output.css']
})

export class EditOutputOptionsMetaDialog {
  @ViewChild('table') table: MatTable<any>;
  @ViewChild('list') list: CdkDropList;
  optionSelected : any;
  dataToSend : any [] = [];
  dataToDelete : any [] = [];
  arg: any[];

  constructor(
    public dialogRef: MatDialogRef<EditOutputOptionsMetaDialog>,
    @Inject(MAT_DIALOG_DATA) public data : {outputs: any, option: any, arguments: any}) {
      this.arg = data.arguments;
     }


    displayedColumns = ['columnLabel','columnName', 'columnType', 'columnFormat', 'grouping', 'unit', 'arguments'];
    dataSource = this.data.outputs;

    dropTable(event: CdkDragDrop<any[]>) {
      const prevIndex = this.dataSource.findIndex((d) => d === event.item.data);
      moveItemInArray(this.dataSource, prevIndex, event.currentIndex);
      this.table.renderRows();
      console.log(this.dataSource)
    }


    addOption() {
      this.data.outputs.push({
        id: null,
        checked: false,
        order: 'desc',
        optionId: this.data.option.id,
        columnLabel: '',
        columnName: '',
        columnType: 'string',
        columnFormat: null,
        grouping: 0,
        unit: '',
        argumentsId: '',
        function:'1',
        delete: false});
      this.dataSource = new MatTableDataSource(this.data.outputs);
    }

    onNoClick(): void {
      this.dialogRef.close();
    }

    sendData() {
      this.saveOrder();
      this.dataToSend = this.data.outputs.concat(this.dataToDelete);
      this.dialogRef.close(this.dataToSend);
    }

    saveOrder(){
      for (let i=0; i< this.data.outputs.length;i++){
        this.data.outputs[i].columnOrder = i;
        console.log(this.data.outputs[i]);
      }
    }

    selectRow(row) {
      this.optionSelected = row;
  }

  deleteOption() {
    if (this.optionSelected) {
      this.optionSelected.delete = true;
      this.dataToDelete.push(this.optionSelected);
      const index: number = this.data.outputs.findIndex(d => d === this.optionSelected);
      this.data.outputs.splice(index, 1);
      this.dataSource = new MatTableDataSource(this.data.outputs);
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

  category: any[] = [];

  selectedCategories: any[] = [];

  displayedColumns: string[] = ['label1', 'label2', 'name1', 'name2'];

  constructor(
    public dialogRef: MatDialogRef<EditCategoryArgumentDialog>,
    @Inject(MAT_DIALOG_DATA) public data) {

     }



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
  selector: 'app-admin-menu, FilterPipe',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.css']
})
export class AdminMenuComponent implements OnInit, AfterViewInit {

  menu: any[] = [];
  categoryArguments: any[] = [];
  drillDown: any[] = [];
  categories: any[] = [];
  outputs: any[] = [];
  argumentsDrillDown: any[] = [];
  optionSelected: any = {};
  categorySelected: any = {};
  optionsCategoriesArguments: any[] = [];
  categoryArgumentSelected: any = {};
  searchText: string;
  idDomOptionSelected: any;
  emptyError: any = 0;
  menuString: any[] = [];
  @ViewChildren('tooltip') tooltips;

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
    this.service.loadWebservicMetaAdmin(this, this.optionSelected, this.handlerSuccessMeta, this.handlerErrorMeta);
  }

  getArgumentsByOption(){
    this.service.loadArgumentsMeta(this, this.optionSelected, this.handlerSuccessArgumentsMeta, this.handlerErrorMeta);
  }

  editVariables(item){
    var index;
    this.optionSelected.menuOptionArgumentsAdmin.forEach(element => {
      element.categoryArgumentsId.forEach(element2 => {
        if (element2.id==item.id) {
          index = element;
        }
      });
    });
    // findIndex(el => el.categoryArgumentsId.id == item.id);
    // var cat = (this.optionSelected.menuOptionArgumentsAdmin[index]);
    this.editCategoryArguments(index);
  }



  handlerSuccessArgumentsMeta(___this,result){
    ___this.argumentsDrillDown = result;
    const dialogRef = ___this.dialog.open(EditOutputOptionsMetaDialog, {
      width: '90%',
      data: {outputs : ___this.outputs, option : ___this.optionSelected, arguments: ___this.argumentsDrillDown}
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result != undefined) {
        ___this.outputs = result;
        ___this.saveMeta();
      }
    });
  }
  handlerSuccessMeta(__this, result) {
      __this.outputs = result;
      __this.getArgumentsByOption();



  }
  handlerErrorMeta(_this, result) {
    console.log(result);
    _this.globals.isLoading = false;
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
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.menu, event.previousIndex, event.currentIndex);
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
        for (let index = 0; index < itemOptionCategory.categoryArgumentsId.length; index++) {
          const element = itemOptionCategory.categoryArgumentsId[index];
          if (element.id == itemCategory.id) {
            itemCategory.selected = true;
          }
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
      "applicationId": this.globals.currentApplication.id,
      "metaData": 1,
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
    const message = 'If you delete this option, all it children and relationships with memberships will be deleted. Do you want to continue?';
    const confirm: boolean = false;
    if (this.optionSelected) {
      const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
        width: '40%',
        data: { message: message, confirm: confirm }
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result.confirm){
          this.optionSelected.toDelete = true;
          this.optionSelected.label+="....";
          this.saveMenu();
        }
      });
    }
  }

  saveNewArgumentsCategory(category){
    let arrayArg = [];
    arrayArg.push(category);
    this.service.saveNewCategoryArguments(this, arrayArg, this.handlerSuccess, this.handlerErrorMeta);

  }

   handlerSuccess(_this, result){
     _this.categories = result;
     _this.getOptionCategoryArguments();

  }

  addCategoryArguments(){
    const dialogRef = this.dialog.open(NewCategoryDialog, {
      width: '70%',
      data: this.categories
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result){
        this.categories = result;
        this.saveNewArgumentsCategory(result);
      }
    });
  }


  saveMenu() {
    this.emptyError=0;
    let verify = this.verifyMenu();
    if (verify > 0){
      const dialogRef = this.dialog.open(MessageComponent, {
        data: { title:"Error", message: "You have empty options, please complete them and try again."}
      });
    }else {
      this.verifyOrder();
      this.service.saveMenu(this, this.menu, this.handlerSuccessSaveMenuData, this.handlerErrorSaveMenuData);
    }
  }

  handlerSuccessSaveMenuData(_this, data) {
    _this.getMenuData();
  }

  handlerErrorSaveMenuData(_this, data) {
    _this.getMenuData();
  }

  verifyMenu(){

    for (let i=0; i < this.menu.length; i++){
      let optionMenu = this.menu[i];
      if ((optionMenu['label'] == null) || (optionMenu['label'] == "")){
        this.emptyError = this.emptyError+1;
      }
      this.recursiveVerify(optionMenu);
    }
    let valueError =  this.emptyError;
    return valueError;
    }


  recursiveVerify(option){
    if(option.children.length > 0){
      for (let i=0; i<option.children.length; i++){
        const element = option.children[i];
        if((element['label'] == null) || (element['label'] == "")){
          this.emptyError = this.emptyError+1;
        }
        if(element.children.length > 0){
          this.recursiveVerify(element);
      }
      }
    }

  }

  verifyOrder(){

    for (let i=0; i < this.menu.length; i++){
      let optionMenu = this.menu[i];
      this.menu[i].order = i;
      this.recursiveOrder(optionMenu);
    }
    return this.menu;
    }


  recursiveOrder(option){
    if(option.children.length > 0){
      for (let i=0; i<option.children.length; i++){
        option.children[i].order = i;
        if(option.children[i].children.length > 0){
          this.recursiveOrder(option.children[i]);
      }
      }
    }

  }

  saveMeta() {
    this.service.saveMeta(this, this.outputs, this.handlerSuccessSaveMeta, this.handlerErrorSaveMeta);
  }

  handlerSuccessSaveMeta(_this, data) {
    _this.globals.isLoading = false;
  }

  handlerErrorSaveMeta(_this, data) {
    console.log(data);
    _this.globals.isLoading = false;
  }

  saveDrillDown() {
    this.service.saveDrillDown(this, this.drillDown, this.handlerSuccessdrillDown, this.handlerErrorSaveMeta);
  }

  handlerSuccessdrillDown(_this, data) {
    _this.globals.isLoading = false;
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
    // var index = this.optionSelected.menuOptionArgumentsAdmin.findIndex(el => el.categoryArgumentsId.id == category.id);
    var index = -1;
    this.optionSelected.menuOptionArgumentsAdmin.forEach(function(element,i){
        element.categoryArgumentsId.forEach(function(element2,i2){
          if(element2.id==category.id){
              index = i;
          }
        })
    });

    if (index != -1) {
      if (this.optionSelected.menuOptionArgumentsAdmin[index].id == undefined) {
        this.optionSelected.menuOptionArgumentsAdmin.splice(index, 1);
      } else {
        this.optionSelected.menuOptionArgumentsAdmin[index].toDelete = !category.selected;
      }
    } else {
      var itemToAdd = {
        "categoryArgumentsId": [category],
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
    let arrayMenuOptionArg = [];
    for(let i =0; i <this.optionSelected.menuOptionArgumentsAdmin.length;i++){
      arrayMenuOptionArg.push(this.optionSelected.menuOptionArgumentsAdmin[i]);
    }
    this.service.saveOptionsArgumentsCategory(this, arrayMenuOptionArg, this.optionSelected.id, this.handlerSuccessSaveCategoryArgument, this.handlerErrorSaveCategoryArgument);
  }

  handlerSuccessSaveCategoryArgument(_this, result) {
    _this.optionSelected.menuOptionArgumentsAdmin = result;
    _this.getOptionCategoryArguments();
  }

  handlerErrorSaveCategoryArgument(_this, result) {
    _this.globals.isLoading = false;
  }

  editOutputOptions() {
    this.getMeta();
  }

  getMenuOptionsString(_this){
    _this.service.getMenuString(_this, _this.globals.currentApplication.id, _this.handleSuccessString, _this.handlerErrorMeta);
  }

  handleSuccessString(_this,data){
    console.log(data);
    console.log(_this.optionSelected);
    console.log(_this.drillDown);
    let menuString = data;
    const dialogRef = _this.dialog.open(DrillDownDialog, {
      width: '90%',
      data: {optionString : menuString, option : _this.optionSelected, drillDown : _this.drillDown}
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result != undefined) {
        _this.drillDown = result;
        _this.saveDrillDown();
      }
    });

  }

  getDrillDowns(){
    this.service.getDrillDownAdmin(this, this.optionSelected.id, this.handlerSuccessDrillDown, this.handlerErrorMeta);
  }

  handlerSuccessDrillDown(_this,data){
    console.log(data);
    _this.drillDown = data;
    _this.getMenuOptionsString(_this);
  }
  editDrillDown(){
    this.getDrillDowns();
  }

  fillArguments(data){
    console.log(data)
    if(!data.hasOwnProperty('id')){
      data.id = null;
    }

    console.log(data)
    for(let i=0; i<data.categoryArgumentsId.arguments.length;i++){
    if(data.categoryArgumentsId.arguments[i].optionCategoryArguments == null){
      data.categoryArgumentsId.arguments[i].optionCategoryArguments = {};
        data.categoryArgumentsId.arguments[i].optionCategoryArguments.id= null;
        data.categoryArgumentsId.arguments[i].optionCategoryArguments.label1= '';
        data.categoryArgumentsId.arguments[i].optionCategoryArguments.label2= '';
        data.categoryArgumentsId.arguments[i].optionCategoryArguments.label3='';
        data.categoryArgumentsId.arguments[i].optionCategoryArguments.name1= '';
        data.categoryArgumentsId.arguments[i].optionCategoryArguments.name2= '';
        data.categoryArgumentsId.arguments[i].optionCategoryArguments.name3= '';
        data.categoryArgumentsId.arguments[i].optionCategoryArguments.required= false;
        data.categoryArgumentsId.arguments[i].optionCategoryArguments.title= '';
        data.categoryArgumentsId.arguments[i].optionCategoryArguments.url= '';
    }
    data.categoryArgumentsId.arguments[i].optionCategoryArguments.menuOptionId = this.optionSelected.id;
    data.categoryArgumentsId.arguments[i].optionCategoryArguments.menuOptionArguments = data.id;
    data.categoryArgumentsId.arguments[i].optionCategoryArguments.argumentCategoryId = data.categoryArgumentsId.id;
    data.categoryArgumentsId.arguments[i].optionCategoryArguments.argumentId = data.categoryArgumentsId.arguments[i].id;

  }
  }

  editCategoryArguments(cat) {

    var duplicateObject = JSON.parse(JSON.stringify(cat));
    //this.fillArguments(duplicateObject);
    console.log(duplicateObject)
    const dialogRef = this.dialog.open(EditCategoryArgumentDialog, {
      width: '45%',
      data: duplicateObject
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        console.log(result)
        duplicateObject = result;
        console.log("objeto")
        console.log(duplicateObject);
        this.saveMenuArguments(duplicateObject);
      }
    });
  }
  saveMenuArguments(catId){
    console.log("met");
    console.log(catId);
    if(this.optionSelected.menuOptionArgumentsAdmin.length>0){
      console.log("priimer if")
    for (let i=0; i < this.optionSelected.menuOptionArgumentsAdmin.length;i++){
      let aux = this.optionSelected.menuOptionArgumentsAdmin[i];
      console.log(aux.id)
      if(aux.id==catId.id){
        console.log("entra")
        aux = catId;
        this.optionSelected.menuOptionArgumentsAdmin[i] = aux;
        console.log("aux")
        console.log(aux)
      }
    }
  }else{
    console.log("entra al else")
    catId.id = null;
    catId.optionId = this.optionSelected.id;
    console.log(catId)
    this.optionSelected.menuOptionArgumentsAdmin.push(catId);

  }
  console.log(this.optionSelected)
  this.saveCategoryArgument();
  }



}
