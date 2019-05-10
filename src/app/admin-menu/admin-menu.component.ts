import { OnInit, Component, Inject, AfterViewInit, ChangeDetectorRef, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { MatSnackBar, MatTableDataSource, MatTable, MatSelect, MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MessageComponent } from '../message/message.component';
import {CdkDragDrop, moveItemInArray, CdkDropList, transferArrayItem} from '@angular/cdk/drag-drop';
import { FormControl } from '@angular/forms';
import { DrillDown } from '../model/DrillDown';
import { ReplaySubject, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { CategoryArguments } from '../model/CategoryArguments';
import { DialogArgumentPreviewComponent } from '../dialog-argument-preview/dialog-argument-preview.component';
import { FlatTreeControl } from '@angular/cdk/tree';
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
    public dialogRef: MatDialogRef<EditOutputOptionsMetaDialog>,public dialog: MatDialog,
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
        uid:null,
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
    @Inject(MAT_DIALOG_DATA) public data,public dialog:MatDialog) {

     }



  onNoClick(): void {
    this.dialogRef.close();
  }
  showPreview(argument){
    this.dialog.open (DialogArgumentPreviewComponent, {
      height: "560px",
      width: "500px",
      panelClass: 'msf-argument-preview-popup',
      data:argument
    });
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

export class ExampleFlatNode {
  id: string;
  uid: string;
  expandable: boolean;
  label: string;
  level: number;
  menuOptionArgumentsAdmin: any[];
  categoryParentId: string;
  baseUrl: string;
  icon: string;
  tab: string;
  tabType: string;
  menuParentId: string;
  toDelete: boolean;
  dataAvailability: string;
  metaData: string;
  order: any;
  selected: any;
  applicationId: any;
  isRoot :any;
  children : any[];
  initialRol: string;
  finalRol: string;
  typeOption: string;
}

@Component({
  selector: 'app-admin-menu, FilterPipe',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.css']
})
export class AdminMenuComponent implements OnInit, AfterViewInit {
  dataChange = new BehaviorSubject<any[]>([]);
  get data(): any[] { return this.dataChange.value; }
  expandedNodeSet = new Set<string>();
  dragging = false;
  expandTimeout: any;
  expandDelay = 1000;
  flatNodeMap = new Map<ExampleFlatNode, any>();
  nestedNodeMap = new Map<any, ExampleFlatNode>();
  private transformer = (node: any, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.label === node.label
        ? existingNode
        : new ExampleFlatNode();
        flatNode.expandable= !!node.children && node.children.length > 0;
        flatNode.id= node.id;
        flatNode.uid= node.uid;
        flatNode.label=node.label;
        flatNode.level=level;
        flatNode.menuOptionArgumentsAdmin=node.menuOptionArgumentsAdmin;
        flatNode.categoryParentId=node.categoryParentId;
        flatNode.baseUrl= node.baseUrl;
        flatNode.icon= node.iconicon;
        flatNode.tab= node.tab;
        flatNode.tabType= node.tabType;
        flatNode.menuParentId= node.menuParentId;
        flatNode.toDelete= node.toDelete;
        flatNode.dataAvailability= node.dataAvailability;
        flatNode.metaData=node.metaData;
        flatNode.order=node.order,
        flatNode.selected= node.selected;
        flatNode.applicationId= node.applicationId;
        flatNode.isRoot = node.isRoot;
        flatNode.children = node.children;
        flatNode.initialRol = node.initialRol;
        flatNode.finalRol = node.finalRol;
        flatNode.typeOption = node.typeOption;
        this.flatNodeMap.set(flatNode, node);
        this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };
  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

 innerHeight: number;
  menu: any[] = [];
  idList: any[] = ['firstOne'];
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
  searchTextOption: string;
  idDomOptionSelected: any;
  emptyError: any = 0;
  menuString: any[] = [];
  @ViewChildren('tooltip') tooltips;

  constructor(private http: ApiClient, public globals: Globals,
    private service: ApplicationService, public snackBar: MatSnackBar,
    public dialog: MatDialog, private ref: ChangeDetectorRef,
    public rend: Renderer2) {
      this.dataChange.subscribe(data => {
        this.dataSource.data = data;
      });
  }

  setChange(node){
    const nestedNode = this.flatNodeMap.get(node);
    nestedNode.label = node.label;
    this.dataChange.next(this.data);
  }

  setChangeURL(node){
    const nestedNode = this.flatNodeMap.get(node);
    nestedNode.baseUrl = node.baseUrl;
    this.dataChange.next(this.data);
  }

  setChangeIcon(node){
    const nestedNode = this.flatNodeMap.get(node);
    nestedNode.icon = node.icon;
    this.dataChange.next(this.data);
  }

  setChangeTab(node){
    const nestedNode = this.flatNodeMap.get(node);
    nestedNode.tab = node.tab;
    this.dataChange.next(this.data);
  }
  ngOnInit() {
    this.getMenuData();
    this.getCategoryArguments();
  }

  ngAfterViewInit(): void {
  }

  filterMenuOptions(){
    for (let index = 0; index < this.treeControl.dataNodes.length; index++) {
      const option = this.treeControl.dataNodes[index];
      this.setShowOption(option,this)
        this.recursiveOption(option,this);
    }
    if(this.searchTextOption){
      this.treeControl.expandAll();
    } else {
      this.treeControl.collapseAll();
    }

  }
  recursiveOption(option: any,_this) {
    if(option.children.length!=0){
      for (let index = 0; index < option.children.length; index++) {
        const element = option.children[index];
        _this.setShowOption(element,_this)
        _this.recursiveOption(element,this);
      }
    }else{
      _this.setShowOption(option,_this)
    }

  }

  setShowOption(option,_this){
    if(_this.searchTextOption!="" && _this.searchTextOption!=null){
      if(option.label.toLowerCase().indexOf(_this.searchTextOption)!=-1){
        option.show = true;
        // if(option.menuParentId!=null){
        //   _this.findOnMenu(option.menuParentId)
        // }

        // if(option.categoryParentId!=null){
        //   _this.findOnMenu(option.categoryParentId)
        // }

      }else{
        option.show = false;
      }
    }else{
      option.show = true;
      // this.treeControl.expand(option);

    }
  }
  findOnMenu(optionId){
    for (let index = 0; index < this.treeControl.dataNodes.length; index++) {
      const option = this.treeControl.dataNodes[index];
      if(optionId==option.id){
        this.treeControl.expand(option);
        // option.isOpened=true;
        if(option.menuParentId!=null){
          this.findOnMenu(option.menuParentId)
        }
        if(option.categoryParentId!=null){
          this.findOnMenu(option.categoryParentId)
        }
      }else{
        if(option.children.length!=0){
            this.findOnMenuRecursive(option.children,this,optionId);
        }
      }

    }
  }

  findOnMenuRecursive(options: any[], _this,optionId) {
      for (let index = 0; index < options.length; index++) {
        const element = options[index];
          if(optionId==element.id){
            element.isOpened=true;
            if(element.menuParentId!=null){
              _this.findOnMenu(element.menuParentId)
            }
            if(element.categoryParentId!=null){
              _this.findOnMenu(element.categoryParentId)
            }
          }else{
            if(element.children.length!=0){
              this.findOnMenuRecursive(element.children,this,optionId);
          }
        }
      }
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
      this.optionSelected.isActive = false;
      option.isActive = option.isActive == null ? true : !option.isActive;
      this.optionSelected = option;
      if (!option.isRoot && option.id) {
        this.getOptionCategoryArguments();
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
        console.log(result.confirm);
        if (result.confirm){

          console.log("entra");
          this.optionSelected.toDelete = true;
          this.optionSelected.label+="....";
          const nestedNode = this.flatNodeMap.get(this.optionSelected);
          nestedNode.toDelete = true;
          this.dataChange.next(this.data);
          console.log(this.optionSelected)
          console.log(this.flatNodeMap)
          console.log(this.dataSource.data)
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
      console.log(this.dataSource.data);
     this.service.saveMenu(this, this.dataSource.data, this.handlerSuccessSaveMenuData, this.handlerErrorSaveMenuData);
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
      if (((optionMenu['label'] == null) || (optionMenu['label'] == ""))  &&  !optionMenu.toDelete){
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
    for (let i=0; i < this.dataSource.data.length; i++){
      let optionMenu = this.dataSource.data[i];
      optionMenu.order = i;
      optionMenu.finalRol = 'cat';
      if(optionMenu.initialRol == 'opt'  &&  optionMenu.finalRol == 'cat') {
        optionMenu.toChange = true;
        optionMenu.applicationId= this.globals.currentApplication.id;
      }
      for (let j=0; j < optionMenu.children.length;j++){
        let optionCat = optionMenu.children[j];
        optionCat.order = j;
        optionCat.finalRol = 'opt';
        optionCat.categoryParentId = optionMenu.id;
        if(optionCat.initialRol == 'cat'  &&  optionCat.finalRol == 'opt') {
          optionCat.toChange = true;
          optionCat.idToChange = optionCat.id;
          optionCat.id = null;
        }
        if(optionCat.children){
        this.recursiveOrder(optionCat);
        }
      }
    }
    }


  recursiveOrder(option){
    if(option.children.length > 0){
      for (let i=0; i<option.children.length; i++){
        option.children[i].order = i;
        option.children[i].parentId = option.id;
        option.children[i].finalRol = 'opt';
        option.children[i].categoryParentId = null;
        if(option.children[i].initialRol == 'cat'  &&  option.children[i].finalRol == 'opt') {
          option.children[i].toChange = true;
        }
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

hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  handlerGetSuccessMenuData(_this, data) {
    _this.menu = data;
    _this.dataSource.data = data;
    _this.getUniqueIdDrop(_this.dataSource.data);
    _this.globals.isLoading = false;
    console.log(_this.dataSource.data);
    _this.dataChange.next(data);
  }

  getUniqueIdDrop(data){
    for (let i=0; i < data.length; i++){
      let option = data[i];
      option.uid = `cat${option.id}`;
      option.initialRol = 'cat';
      for (let j=0; j < option.children.length;j++){
        let optionChild = option.children[j];
        optionChild.uid = `op${optionChild.id}`;
        optionChild.initialRol = 'opt';
        this.getUniqueIdDropRecursive(optionChild);
      }
    }
  }

  getUniqueIdDropRecursive(option){
    if(option.children.length > 0){
      for (let i=0; i<option.children.length; i++){
        let optionChild = option.children[i];
        optionChild.initialRol = 'opt';
        optionChild.uid = `opr${optionChild.id}`;
        if(optionChild.children.length > 0){
          this.getUniqueIdDropRecursive(optionChild);
        }
      }
    }

  }


  handlerGetErrorMenuData(_this, result) {
    console.log(result);
    _this.globals.isLoading = false;
  }

  visibleNodes(): any[] {
    this.rememberExpandedTreeNodes(this.treeControl, this.expandedNodeSet);
    const result = [];

    function addExpandedChildren(node: any, expanded: Set<string>) {
      result.push(node);
      if (expanded.has(node.uid)) {
        node.children.map(child => addExpandedChildren(child, expanded));
      }
    }
    this.dataSource.data.forEach(node => {
      addExpandedChildren(node, this.expandedNodeSet);
    });
    return result;
  }

  drop(event: CdkDragDrop<string[]>) {
    const visibleNodes = this.visibleNodes();
    const changedData = JSON.parse(JSON.stringify(this.dataSource.data));
    function findNodeSiblings(arr: Array<any>, id: string): Array<any> {
      let result, subResult;
      arr.forEach(item => {
        if (item.uid === id) {
          result = arr;
        } else if (item.children) {
          subResult = findNodeSiblings(item.children, id);
          if (subResult) result = subResult;
        }
      });
      return result;
    }
    const node = event.item.data;
    const siblings = findNodeSiblings(changedData, node.uid);
    const siblingIndex = siblings.findIndex(n => n.uid === node.uid);
    const nodeToInsert: any = siblings.splice(siblingIndex, 1)[0];
    const nodeAtDest = visibleNodes[event.currentIndex];
    if (nodeAtDest.uid === nodeToInsert.uid) return;
    let relativeIndex = event.currentIndex;
    const nodeAtDestFlatNode = this.treeControl.dataNodes.find(
      n => nodeAtDest.uid === n.uid
    );
    const parent = this.getParentNode(nodeAtDestFlatNode);
    if (parent) {
      const parentIndex = visibleNodes.findIndex(n => n.uid === parent.uid) + 1;
      relativeIndex = event.currentIndex - parentIndex;
    }
    const newSiblings = findNodeSiblings(changedData, nodeAtDest.uid);
    newSiblings.splice(relativeIndex, 0, nodeToInsert);
    this.rebuildTreeForData(changedData);
  }

  dragStart() {
    this.dragging = true;
  }
  dragEnd() {
    this.dragging = false;
  }

  rebuildTreeForData(data: any) {
    this.rememberExpandedTreeNodes(this.treeControl, this.expandedNodeSet);
    this.dataSource.data = data;
    this.forgetMissingExpandedNodes(this.treeControl, this.expandedNodeSet);
    this.expandNodesById(
      this.treeControl.dataNodes,
      Array.from(this.expandedNodeSet)
    );
  }

  private rememberExpandedTreeNodes(
    treeControl: FlatTreeControl<ExampleFlatNode>,
    expandedNodeSet: Set<string>
  ) {
    if (treeControl.dataNodes) {
      treeControl.dataNodes.forEach(node => {
        if (treeControl.isExpandable(node) && treeControl.isExpanded(node)) {
          // capture latest expanded state
          expandedNodeSet.add(node.uid);
        }
      });
    }
  }

  private forgetMissingExpandedNodes(
    treeControl: FlatTreeControl<ExampleFlatNode>,
    expandedNodeSet: Set<string>
  ) {
    if (treeControl.dataNodes) {
      expandedNodeSet.forEach(nodeId => {
        if (!treeControl.dataNodes.find(n => n.uid === nodeId)) {
          expandedNodeSet.delete(nodeId);
        }
      });
    }
  }

  private expandNodesById(flatNodes: ExampleFlatNode[], ids: string[]) {
    if (!flatNodes || flatNodes.length === 0) return;
    const idSet = new Set(ids);
    return flatNodes.forEach(node => {
      if (idSet.has(node.uid)) {
        this.treeControl.expand(node);
        let parent = this.getParentNode(node);
        while (parent) {
          this.treeControl.expand(parent);
          parent = this.getParentNode(parent);
        }
      }
    });
  }

  private getParentNode(node: ExampleFlatNode): ExampleFlatNode | null {
    const currentLevel = node.level;
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (currentNode.level < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  print(node) {
    console.log(node);
  }

  printAll(){
    console.log(this.dataSource.data)
  }

  setSelectedCategoryArguments(category) {
    console.log(category)
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

    const nestedNode = this.flatNodeMap.get(this.optionSelected);
    this.dataChange.next(this.data);
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
    console.log(this.dataSource.data);
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


  editCategoryArguments(cat) {

    var duplicateObject = JSON.parse(JSON.stringify(cat));
    console.log(duplicateObject)
    const dialogRef = this.dialog.open(EditCategoryArgumentDialog, {
      width: '45%',
      data: duplicateObject
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        console.log(result)
        duplicateObject = result;
        this.saveMenuArguments(duplicateObject);
      }
    });
  }
  saveMenuArguments(catId){
    if(this.optionSelected.menuOptionArgumentsAdmin.length>0){
    for (let i=0; i < this.optionSelected.menuOptionArgumentsAdmin.length;i++){
      let aux = this.optionSelected.menuOptionArgumentsAdmin[i];
      if(aux.id==catId.id){
        aux = catId;
        this.optionSelected.menuOptionArgumentsAdmin[i] = aux;
      }
    }
  }else{
    catId.id = null;
    catId.optionId = this.optionSelected.id;
    this.optionSelected.menuOptionArgumentsAdmin.push(catId);

  }
  this.saveCategoryArgument();
  }

  addNewItem() {
    const parentNode = this.flatNodeMap.get(this.optionSelected);
    this.insertItem(parentNode!, '');
    this.treeControl.expand(this.optionSelected);
  }

  insertItem(parent: any, name: string) {
    if(parent){
      parent.children.push({label: null,
      uid: 'optnew'+parent.id+parent.children.length,
      isActive:true,
      baseUrl: null,
      icon: null,
      tab: null,
      tabType: null,
      parentId: null,
      children: [],
      toDelete: false,
      isRoot: false,
      applicationId: this.globals.currentApplication.id,
      metaData: 1,} as any);
      this.dataChange.next(this.data);
  }else{
    this.dataSource.data.push({label: null,
      uid: 'catnew'+this.dataSource.data.length,
      baseUrl: null,
      icon: null,
      tab: null,
      tabType: null,
      parentId: null,
      children: [],
      toDelete: false,
      isRoot: false,
      applicationId: this.globals.currentApplication.id,
      metaData: 1,} as any);
      this.dataChange.next(this.data);
  }
  }
  filterChanged() {
    this.filter(this.searchTextOption);
    if(this.searchTextOption)

    {
      this.treeControl.expandAll();
    } else {
      this.treeControl.collapseAll();
    }
  }

  public filter(filterText: string) {
    let filteredTreeData;
    if (filterText) {
      console.log(this.dataSource.data);
      filteredTreeData = this.dataSource.data.filter(d => d.label.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1);
      Object.assign([], filteredTreeData).forEach(ftd => {
        let str = (<string>ftd.uid);
        while (str.lastIndexOf('.') > -1) {
          const index = str.lastIndexOf('.');
          str = str.substring(0, index);
          if (filteredTreeData.findIndex(t => t.id === str) === -1) {
            const obj = this.dataSource.data.find(d => d.id === str);
            if (obj) {
              filteredTreeData.push(obj);
            }
          }
        }
      });
    } else {
      filteredTreeData = this.dataSource.data;
    }

    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    // file node as children.

    // Notify the change.
    this.dataChange.next(filteredTreeData);
  }

}
