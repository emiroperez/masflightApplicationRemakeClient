import { OnInit, Component, Inject, AfterViewInit, ChangeDetectorRef, Renderer2, ViewChild, ViewChildren, HostListener } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { MatSnackBar, MatTableDataSource, MatTable, MatSelect, MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MessageComponent } from '../message/message.component';
import { CdkDragDrop, moveItemInArray, CdkDropList, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { DrillDown } from '../model/DrillDown';
import { ReplaySubject, Subject, BehaviorSubject, of, Observable } from 'rxjs';
import { takeUntil, take, delay } from 'rxjs/operators';
import { CategoryArguments } from '../model/CategoryArguments';
import { DialogArgumentPreviewComponent } from '../dialog-argument-preview/dialog-argument-preview.component';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MaterialIconPickerComponent } from '../material-icon-picker/material-icon-picker.component';
import { ComponentType } from '../commons/ComponentType';
import { Arguments } from '../model/Arguments';
//import  clonedeep from 'lodash.clonedeep';

@Component({
  selector: 'confirm-delete-dialog',
  templateUrl: 'confirm-delete-dialog.html',
})

export class ConfirmDeleteDialog {

  constructor(public dialogRef: MatDialogRef<ConfirmDeleteDialog>, private dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: { message: string, title: string, confirm: boolean }) {
  }

  close() {
    this.data.confirm = false;
    this.dialogRef.close();
  }

  confirm() {
    this.data.confirm = true;
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
  dataToSend: any[] = [];
  dataToDelete: any[] = [];
  protected options: any[];
  public optCtrl: FormControl = new FormControl();
  public optFilterCtrl: FormControl = new FormControl();
  public filteredOpts: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  @ViewChild('singleSelect') singleSelect: MatSelect;
  protected _onDestroy = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<DrillDownDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { optionString: any, option: any, drillDown: any }) {

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


  displayedColumns = ['title', 'childrenOptionId'];
  dataSource = this.data.drillDown;


  addDrillDown() {
    this.data.drillDown.push({
      id: null,
      title: '',
      childrenOptionId: 0,
      parentOptionId: this.data.option.id,
      delete: false
    });
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
  optionSelected: any;
  dataToSend: any[] = [];
  dataToDelete: any[] = [];
  arg: any[];

  constructor(
    public dialogRef: MatDialogRef<EditOutputOptionsMetaDialog>, public dialog: MatDialog,
    private service: ApplicationService,
    @Inject(MAT_DIALOG_DATA) public data: { outputs: any, option: any, arguments: any }, private globals: Globals) {
    this.arg = data.arguments;
  }

  displayedColumns = ['columnLabel', 'columnName', 'columnType', 'columnFormat', 'prefix', 'suffix', 'grouping', 'unit', 'arguments'];
  dataSource = this.data.outputs;

  dropTable(event: CdkDragDrop<any[]>) {
    const prevIndex = this.dataSource.findIndex((d) => d === event.item.data);
    moveItemInArray(this.dataSource, prevIndex, event.currentIndex);
    this.table.renderRows();
    console.log(this.dataSource)
  }


  addOption() {
    this.data.outputs.push({
      uid: null,
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
      function: '1',
      delete: false
    });
    this.dataSource = new MatTableDataSource(this.data.outputs);
  }

  UploadColumn() {
    if (this.data.outputs.length==0){
    this.service.loadWebservicColumn(this, this.data.option.baseUrl, this.handlerSuccessMetaColumn, this.handlerErrorMetaColumn);
    }else {
      //mostrar MJ
      const dialogRef2 = this.dialog.open(MessageComponent, {
        data: { title: "Information", message: "if you want to load the columns, you should delete the columns that exist" }
      });
    }
  }

  handlerSuccessMetaColumn(_this, result) {
    if (result.length!=0) {
      for (let i = 0; i < result.length; i++) {
        _this.data.outputs.push({
          uid: null,
          id: null,
          checked: false,
          order: 'desc',
          optionId: _this.data.option.id,
          columnLabel: result[i].name,
          columnName: result[i].name,
          columnType: 'string',
          columnFormat: null,
          grouping: 0,
          unit: '',
          argumentsId: '',
          function: '1',
          delete: false
        });
      }
      _this.dataSource = new MatTableDataSource(_this.data.outputs);
    } else {
      //mostrar MJ
      const dialogRef2 = _this.dialog.open(MessageComponent, {
        data: { title: "Error", message: "Columns not found" }
      });
    }
  }


  handlerErrorMetaColumn(_this, result) {
    console.log(result);
    _this.globals.isLoading = false;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  sendData() {
    this.saveOrder();
    this.dataToSend = this.data.outputs.concat(this.dataToDelete);
    this.dialogRef.close(this.dataToSend);
  }

  saveOrder() {
    for (let i = 0; i < this.data.outputs.length; i++) {
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

  enableDrag(element): void
  {
    element.enabled = true;
  }

  disableDrag(element): void
  {
    element.enabled = null;
  }
}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog-edit-argument-category.html',
  styleUrls: ['./admin-menu.component.css']
})

export class EditCategoryArgumentDialog {
  groupingData: Observable<any[]>;
  itemSelected: any = {};
  loading: boolean;

  argumentSelected: any = {};

  category: any[] = [];

  selectedCategories: any[] = [];

  displayedColumns: string[] = ['label1', 'label2', 'name1', 'name2'];

  constructor(
    private globals: Globals,
    private http: ApiClient,
    public dialogRef: MatDialogRef<EditCategoryArgumentDialog>,
    @Inject(MAT_DIALOG_DATA) public data, public dialog: MatDialog) {
      for (let argument of data.categoryArgumentsId[0].arguments)
      {
        if (this.isSelectBoxMultipleOption (argument) && argument.url)
          this.getRecords (argument, "", this.handlerSuccess);

        if (argument.value1)
          argument.value1 = JSON.parse (argument.value1);

        if (argument.minDate)
          argument.minDate = new Date (argument.minDate);

        if (argument.maxDate)
          argument.maxDate = new Date (argument.maxDate);
      }
  }

  isDate(argument: Arguments){
    if (ComponentType.dateRange == argument.type || ComponentType.date == argument.type
      || ComponentType.datePicker == argument.type || ComponentType.dateTimePicker == argument.type
      || ComponentType.datePeriod == argument.type || ComponentType.datePeriodYear == argument.type
      || ComponentType.datePeriodYearMonth == argument.type || ComponentType.datePeriodRevenue == argument.type)
      return true;

    return false;
  }

  isGroupAAA(argument: Arguments){
    return ComponentType.AAA_Group == argument.type;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  showPreview(argument,group) {
    this.dialog.open(DialogArgumentPreviewComponent, {
      height: "560px",
      width: "500px",
      panelClass: 'msf-argument-preview-popup',
      data: argument
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

  onSearch(item, $event: any){
    if($event.term.length>=2){
      this.loading = true;
      this.getRecords(item, $event.term, this.handlerSuccess);
    }
  }

  getRecords(item, search, handlerSuccess){
    let url;

    if (!item.url)
    {
      this.loading = false;
      return;
    }

    if(item.url.substring(0,1)=="/"){
      url = this.globals.baseUrl + item.url + "?search="+ (search != null?search:'');
    }else{
     url = item.url + "/?search=" + (search != null?search:'');
    }

    this.http.get(this,url,handlerSuccess, this.handlerError, null);  
  }

  handlerSuccess(_this,data, tab){   
    _this.loading = false;
    _this.groupingData = of(data).pipe(delay(500));
  }

  handlerError(_this,result){
    _this.loading = false;
    console.log(result);
  }

  isSelectBoxMultipleOption(item){
    return ComponentType.selectBoxMultipleOption == item.type;
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
  isRoot: any;
  children: any[];
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
    flatNode.expandable = !!node.children && node.children.length > 0;
    flatNode.id = node.id;
    flatNode.uid = node.uid;
    flatNode.label = node.label;
    flatNode.level = level;
    flatNode.menuOptionArgumentsAdmin = node.menuOptionArgumentsAdmin;
    flatNode.categoryParentId = node.categoryParentId;
    flatNode.baseUrl = node.baseUrl;
    flatNode.icon = node.icon;
    flatNode.tab = node.tab;
    flatNode.tabType = node.tabType;
    flatNode.menuParentId = node.menuParentId;
    flatNode.toDelete = node.toDelete;
    flatNode.dataAvailability = node.dataAvailability;
    flatNode.metaData = node.metaData;
    flatNode.order = node.order,
      flatNode.selected = node.selected;
    flatNode.applicationId = node.applicationId;
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
  categories: any[] = [];
  drillDown: any[] = [];
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
  optionForm: FormGroup;
  recursiveDeleteDone: boolean;

  @ViewChild("materialIconPicker")
  materialIconPicker: MaterialIconPickerComponent;

  optionTypes: any[] = [
    { name: 'Normal', value: 0 },
    { name: 'Main Menu Only', value: 1 },
    { name: 'Dashboard Only', value: 2 }
  ];

  numArgumentsPerType: any[] = [
    { type: "airline", numArguments: 1 },
    { type: "airport", numArguments: 1 },
    { type: "airportRoute", numArguments: 2 },
    { type: "ceiling", numArguments: 2 },
    { type: "timeRange", numArguments: 2 },
    { type: "dateRange", numArguments: 2 },
    { type: "tailnumber", numArguments: 2 },
    { type: "singleairline", numArguments: 1 },
    { type: "flightNumber", numArguments: 1 },
    { type: "windSpeed", numArguments: 3 },
    { type: "windDirection", numArguments: 2 },
    { type: "temperature", numArguments: 3 },
    { type: "aircraftType", numArguments: 1 },
    { type: "grouping", numArguments: 1 },
    { type: "rounding", numArguments: 1 },
    { type: "date", numArguments: 1 },
    { type: "userList", numArguments: 1 },
    { type: "optionList", numArguments: 1 },
    { type: "freeTextInput", numArguments: 1 },
    { type: "selectBoxSingleOption", numArguments: 1 },
    { type: "selectBoxMultipleOption", numArguments: 1 },
    { type: "datePicker", numArguments: 1 },
    { type: "timePicker", numArguments: 1 },
    { type: "dateTimePicker", numArguments: 2 },
    { type: "checkBox", numArguments: 1 },
    { type: "cancelsCheckBox", numArguments: 1 },
    { type: "diversionsCheckbox", numArguments: 1 },
    { type: "flightDelaysCheckbox", numArguments: 1 },
    { type: "causesFlightDelaysCheckbox", numArguments: 1 },
    { type: "taxiTimes", numArguments: 2 },
    { type: "taxiTimesCheckbox", numArguments: 1 },
    { type: "taxiTimesCheckboxes", numArguments: 1 },
    { type: "datePeriod", numArguments: 2 },
    { type: "region", numArguments: 1 },
    { type: "datePeriodYear", numArguments: 2 },
    { type: "datePeriodYearMonth", numArguments: 2 },
    { type: "sorting", numArguments: 1 },
    { type: "sortingCheckboxes", numArguments: 1 },
    { type: "groupingAthena", numArguments: 1 },
    { type: "flightDistance", numArguments: 2 },
    { type: "fareTypes", numArguments: 1 },
    { type: "serviceClasses", numArguments: 1 },
    { type: "summary", numArguments: 1 },
    { type: "resultsLess", numArguments: 1 },
    { type: "geography", numArguments: 1 },
    { type: "excludeFollowing", numArguments: 1 },
    { type: "singleCheckbox", numArguments:  1 },
    { type: "excludeItineraries", numArguments: 1 },
    { type: "filterAirlineType", numArguments: 1 },
    { type: "fareIncrements", numArguments: 1 },
    { type: "fareIncrementMiddle", numArguments: 1 },
    { type: "fareIncrementMax", numArguments: 1 },
    { type: "title", numArguments: 0 },
    { type: "airportsRoutes", numArguments: 2 },
    { type: "fareLower", numArguments: 1 },
    { type: "percentIncrement", numArguments: 1 },
    { type: "groupingDailyStatics", numArguments: 1 },
    { type: "quarterHour", numArguments: 2 },
    { type: "functions", numArguments: 1 },
    { type: "groupingOperationsSummary", numArguments: 1 },
    { type: "groupingHubSummaries", numArguments: 1 },
    { type: "regionSchedule", numArguments: 1 },
    { type: "aircraftTypeCheckboxes", numArguments: 1 },
    { type: "seats", numArguments: 2 },
    { type: "sortingNostop", numArguments: 1 },
    { type: "sortingConnectionBuilder", numArguments: 1 },
    { type: "stops", numArguments: 1 },
    { type: "connectionTime", numArguments: 2 },
    { type: "circuityType", numArguments: 1 },
    { type: "circuity", numArguments: 1 },
    { type: "singleAirport", numArguments: 1 },
    { type: "summaryRevenueBuilds", numArguments: 1 },
    { type: "datePeriodRevenue", numArguments: 2 },
    { type: "fareIncrementsMarketHistograms", numArguments: 1 },
    { type: "topNumber", numArguments: 1 },
    { type: "seatClass", numArguments: 1 },
    { type: "groupingMariaDB", numArguments: 1 },
    { type: "contentType", numArguments: 1 },
    { type: "totalType", numArguments: 1 },
    { type: "groupingCompGenre", numArguments: 1 },
    { type: "groupingCompTotal", numArguments: 1 },
    { type: "groupingOpSum", numArguments: 1 },
    { type: "groupingOpSum2", numArguments: 1 },
    { type: "states", numArguments: 1 },
    { type: "flightSegments", numArguments: 1 },
    { type: "AAA_Group", numArguments: 1 }
  ]

  constructor(private http: ApiClient, public globals: Globals,
    private service: ApplicationService, public snackBar: MatSnackBar,
    public dialog: MatDialog, private ref: ChangeDetectorRef,
    private formBuilder: FormBuilder, public rend: Renderer2) {
    this.optionForm = this.formBuilder.group({
      optionTypeCtrl: new FormControl()
    });

    this.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
  }

  setChange(node) {
    const nestedNode = this.flatNodeMap.get(node);
    nestedNode.label = node.label;
    this.dataChange.next(this.data);
  }

  setChangeURL(node) {
    const nestedNode = this.flatNodeMap.get(node);
    nestedNode.baseUrl = node.baseUrl;
    this.dataChange.next(this.data);
  }

  setChangeIcon(icon, node) {
    node.icon = icon;
    const nestedNode = this.flatNodeMap.get(node);
    nestedNode.icon = icon;
    this.dataChange.next(this.data);
  }

  setChangeTab(node) {
    const nestedNode = this.flatNodeMap.get(node);
    nestedNode.tab = node.tab;
    this.dataChange.next(this.data);
  }

  setChangeOptionType(item, node) {
    node.typeOption = item.value.value;
    const nestedNode = this.flatNodeMap.get(node);
    nestedNode.typeOption = node.typeOption;
    this.dataChange.next(this.data);
  }

  ngOnInit() {
    this.innerHeight = window.innerHeight;
    this.getMenuData();
    this.getCategoryArguments();
  }

  ngAfterViewInit(): void {
  }

  filterMenuOptions() {
    for (let index = 0; index < this.treeControl.dataNodes.length; index++) {
      const option = this.treeControl.dataNodes[index];
      this.setShowOption(option, this)
      this.recursiveOption(option, this);
    }
    if (this.searchTextOption) {
      this.treeControl.expandAll();
    } else {
      this.treeControl.collapseAll();
    }
  }
  recursiveOption(option: any, _this) {
    if (option.children.length != 0) {
      for (let index = 0; index < option.children.length; index++) {
        const element = option.children[index];
        _this.setShowOption(element, _this)
        _this.recursiveOption(element, this);
      }
    } else {
      _this.setShowOption(option, _this)
    }

  }

  setShowOption(option, _this) {
    if (_this.searchTextOption != "" && _this.searchTextOption != null) {
      if (option.label.toLowerCase().indexOf(_this.searchTextOption) != -1) {
        option.show = true;
        // if(option.menuParentId!=null){
        //   _this.findOnMenu(option.menuParentId)
        // }
        // if(option.categoryParentId!=null){
        //   _this.findOnMenu(option.categoryParentId)
        // }
      } else {
        option.show = false;
      }
    } else {
      option.show = true;
      // this.treeControl.expand(option);
    }
  }

  findOnMenu(optionId) {
    for (let index = 0; index < this.treeControl.dataNodes.length; index++) {
      const option = this.treeControl.dataNodes[index];
      if (optionId == option.id) {
        this.treeControl.expand(option);
        // option.isOpened=true;
        if (option.menuParentId != null) {
          this.findOnMenu(option.menuParentId)
        }
        if (option.categoryParentId != null) {
          this.findOnMenu(option.categoryParentId)
        }
      } else {
        if (option.children.length != 0) {
          this.findOnMenuRecursive(option.children, this, optionId);
        }
      }

    }
  }

  findOnMenuRecursive(options: any[], _this, optionId) {
    for (let index = 0; index < options.length; index++) {
      const element = options[index];
      if (optionId == element.id) {
        element.isOpened = true;
        if (element.menuParentId != null) {
          _this.findOnMenu(element.menuParentId)
        }
        if (element.categoryParentId != null) {
          _this.findOnMenu(element.categoryParentId)
        }
      } else {
        if (element.children.length != 0) {
          this.findOnMenuRecursive(element.children, this, optionId);
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

  getArgumentsByOption() {
    this.service.loadArgumentsMeta(this, this.optionSelected, this.handlerSuccessArgumentsMeta, this.handlerErrorMeta);
  }

  editVariables(item) {
    var index;
    this.optionSelected.menuOptionArgumentsAdmin.forEach(element => {
      element.categoryArgumentsId.forEach(element2 => {
        if (element2.id == item.id) {
          index = element;
        }
      });
    });
    // findIndex(el => el.categoryArgumentsId.id == item.id);
    // var cat = (this.optionSelected.menuOptionArgumentsAdmin[index]);
    this.editCategoryArguments(index);
  }



  handlerSuccessArgumentsMeta(___this, result) {
    ___this.argumentsDrillDown = result;
    const dialogRef = ___this.dialog.open(EditOutputOptionsMetaDialog, {
      width: '1090px',
      data: { outputs: ___this.outputs, option: ___this.optionSelected, arguments: ___this.argumentsDrillDown }
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

    this.optionForm.get('optionTypeCtrl').setValue(null);

    for (let i = 0; i < this.optionTypes.length; i++) {
      if (option.typeOption == this.optionTypes[i].value) {
        this.optionForm.get('optionTypeCtrl').setValue(this.optionTypes[i]);
        break;
      }
    }

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
    let self = this;

    this.clearSelectedCategoryArguments();
    var categories = this.categories;
    this.optionSelected.menuOptionArgumentsAdmin.forEach(function (itemOptionCategory, indexOptionCategory, arrayOptionCategory) {
      categories.forEach(function (itemCategory, indexCategory, arrayCategory) {
        for (let index = 0; index < itemOptionCategory.categoryArgumentsId.length; index++) {
          const element = itemOptionCategory.categoryArgumentsId[index];

          for (let j = 0; j < element.arguments.length; j++)
          {
            let argumentType = element.arguments[j].type;
            let numArguments = 3; // display all sub-arguments if no type

            // set the number of sub-arguments depending of the argument type
            for (let k = 0; k < self.numArgumentsPerType.length; k++)
            {
              let item = self.numArgumentsPerType[k];

              if (item.type === argumentType)
              {
                numArguments = item.numArguments;
                break;
              }
            }

            element.arguments[j].numArguments = numArguments;
          }

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
        width: '550px',
        data: {
          message: message,
          title: "Confirmation required",
          confirm: confirm
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result)
        {
          console.log(result.confirm);
          if (result.confirm) {

            if (this.optionSelected.uid.includes("catnew") || this.optionSelected.uid.includes("optnew"))
              this.deleteNewItem();
            else {
              // check if any dashboard panel is using the selected option
              this.globals.isLoading = true;
              this.service.checkMenuOption(this, this.optionSelected.id, this.checkSuccess, this.checkError);
            }
          }
        }
      });
    }
  }

  checkSuccess(_this, result) {
    if (!result) {
      const confirm: boolean = false;
      let dialogRef;

      _this.globals.isLoading = false;

      dialogRef = _this.dialog.open(ConfirmDeleteDialog, {
        width: '360px',
        data: {
          message: "Several dashboard panels are using this option. Do you want to continue?",
          title: "Warning",
          confirm: confirm
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result && result.confirm)
        {
          _this.globals.isLoading = true;
          _this.service.removeDashboardPanelByOptionId (_this, _this.optionSelected.id, _this.checkSuccess, _this.checkError);
        }
      });

      return;
    }

    console.log("entra");
    _this.optionSelected.toDelete = true;
    _this.optionSelected.label += "....";
    const nestedNode = _this.flatNodeMap.get(_this.optionSelected);
    nestedNode.toDelete = true;
    _this.dataChange.next(_this.data);
    console.log(_this.optionSelected)
    console.log(_this.flatNodeMap)
    console.log(_this.dataSource.data)
    _this.saveMenu();
  }

  checkError(_this, error) {
    _this.globals.isLoading = false;
    console.log(error);
  }

  saveNewArgumentsCategory(category) {
    let arrayArg = [];
    arrayArg.push(category);
    this.service.saveNewCategoryArguments(this, arrayArg, this.handlerSuccess, this.handlerErrorMeta);

  }

  handlerSuccess(_this, result) {
    _this.categories = result;
    _this.getOptionCategoryArguments();

  }

  saveMenu() {
    this.emptyError = 0;
    let verify = this.verifyMenu();
    if (verify > 0) {
      const dialogRef = this.dialog.open(MessageComponent, {
        data: { title: "Error", message: "You have empty options, please complete them and try again." }
      });
    } else {
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

  verifyMenu() {

    for (let i = 0; i < this.menu.length; i++) {
      let optionMenu = this.menu[i];
      if (((optionMenu['label'] == null) || (optionMenu['label'] == "")) && !optionMenu.toDelete) {
        this.emptyError = this.emptyError + 1;
      }
      this.recursiveVerify(optionMenu);
    }
    let valueError = this.emptyError;
    return valueError;
  }


  recursiveVerify(option) {
    if (option.children.length > 0) {
      for (let i = 0; i < option.children.length; i++) {
        const element = option.children[i];
        if ((element['label'] == null) || (element['label'] == "")) {
          this.emptyError = this.emptyError + 1;
        }
        if (element.children.length > 0) {
          this.recursiveVerify(element);
        }
      }
    }

  }

  verifyOrder() {
    for (let i = 0; i < this.dataSource.data.length; i++) {
      let optionMenu = this.dataSource.data[i];
      optionMenu.order = i;
      optionMenu.finalRol = 'cat';
      if (optionMenu.initialRol == 'opt' && optionMenu.finalRol == 'cat') {
        optionMenu.toChange = true;
        optionMenu.applicationId = this.globals.currentApplication.id;
      }
      for (let j = 0; j < optionMenu.children.length; j++) {
        let optionCat = optionMenu.children[j];
        optionCat.order = j;
        optionCat.finalRol = 'opt';
        optionCat.categoryParentId = optionMenu.id;
        if (optionCat.initialRol == 'cat' && optionCat.finalRol == 'opt') {
          optionCat.toChange = true;
          optionCat.idToChange = optionCat.id;
          optionCat.id = null;
        }
        if (optionCat.children) {
          this.recursiveOrder(optionCat);
        }
      }
    }
  }


  recursiveOrder(option) {
    if (option.children.length > 0) {
      for (let i = 0; i < option.children.length; i++) {
        option.children[i].order = i;
        option.children[i].parentId = option.id;
        option.children[i].finalRol = 'opt';
        option.children[i].categoryParentId = null;
        if (option.children[i].initialRol == 'cat' && option.children[i].finalRol == 'opt') {
          option.children[i].toChange = true;
        }
        if (option.children[i].children.length > 0) {
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

  getUniqueIdDrop(data) {
    for (let i = 0; i < data.length; i++) {
      let option = data[i];
      option.uid = `cat${option.id}`;
      option.initialRol = 'cat';
      for (let j = 0; j < option.children.length; j++) {
        let optionChild = option.children[j];
        optionChild.uid = `op${optionChild.id}`;
        optionChild.initialRol = 'opt';
        this.getUniqueIdDropRecursive(optionChild);
      }
    }
  }

  getUniqueIdDropRecursive(option) {
    if (option.children.length > 0) {
      for (let i = 0; i < option.children.length; i++) {
        let optionChild = option.children[i];
        optionChild.initialRol = 'opt';
        optionChild.uid = `opr${optionChild.id}`;
        if (optionChild.children.length > 0) {
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

  printAll() {
    console.log(this.dataSource.data)
  }

  setSelectedCategoryArguments(category) {
    console.log(category)
    // var index = this.optionSelected.menuOptionArgumentsAdmin.findIndex(el => el.categoryArgumentsId.id == category.id);
    var index = -1;
    this.optionSelected.menuOptionArgumentsAdmin.forEach(function (element, i) {
      element.categoryArgumentsId.forEach(function (element2, i2) {
        if (element2.id == category.id) {
          index = i;
        }
      })
    });

    if (index != -1) {
      if (this.optionSelected.menuOptionArgumentsAdmin[index].id == undefined) {
        for (let i = 0; i < this.optionSelected.menuOptionArgumentsAdmin.length; i++) {
          if (this.optionSelected.menuOptionArgumentsAdmin[i].position && this.optionSelected.menuOptionArgumentsAdmin[i].position > this.optionSelected.menuOptionArgumentsAdmin[index].position)
            this.optionSelected.menuOptionArgumentsAdmin[i].position--;
        }

        this.optionSelected.menuOptionArgumentsAdmin[index].position = -1;
        this.optionSelected.menuOptionArgumentsAdmin.splice(index, 1);
      } else {
        if (category.selected) {
          let newPos = 0;

          // set new position for the argument
          for (let categorySelected of this.optionSelected.menuOptionArgumentsAdmin) {
            if (categorySelected.position > newPos)
              newPos = categorySelected.position;
          }

          newPos++;
          this.optionSelected.menuOptionArgumentsAdmin[index].position = newPos;
        }
        else {
          for (let i = 0; i < this.optionSelected.menuOptionArgumentsAdmin.length; i++) {
            if (this.optionSelected.menuOptionArgumentsAdmin[i].position && this.optionSelected.menuOptionArgumentsAdmin[i].position > this.optionSelected.menuOptionArgumentsAdmin[index].position)
              this.optionSelected.menuOptionArgumentsAdmin[i].position--;
          }

          this.optionSelected.menuOptionArgumentsAdmin[index].position = -1;
        }

        this.optionSelected.menuOptionArgumentsAdmin[index].toDelete = !category.selected;
      }
    } else {
      let newPos = 0;

      // set new position for the argument
      for (let categorySelected of this.optionSelected.menuOptionArgumentsAdmin) {
        if (categorySelected.position > newPos)
          newPos = categorySelected.position;
      }

      newPos++;

      var itemToAdd = {
        "categoryArgumentsId": [category],
        "selected": true,
        "toDelete": false,
        "order": newPos
      };

      for (let j = 0; j < category.arguments.length; j++)
      {
        let argumentType = category.arguments[j].type;
        let numArguments = 3; // display all sub-arguments if no type

        // set the number of sub-arguments depending of the argument type
        for (let k = 0; k < this.numArgumentsPerType.length; k++)
        {
          let item = this.numArgumentsPerType[k];

          if (item.type === argumentType)
          {
            numArguments = item.numArguments;
            break;
          }
        }

        category.arguments[j].numArguments = numArguments;
      }

      this.optionSelected.menuOptionArgumentsAdmin.push (itemToAdd);
    }

    const nestedNode = this.flatNodeMap.get (this.optionSelected);
    nestedNode.menuOptionArgumentsAdmin = this.optionSelected.menuOptionArgumentsAdmin;
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
    for (let i = 0; i < this.optionSelected.menuOptionArgumentsAdmin.length; i++) {
      arrayMenuOptionArg.push(this.optionSelected.menuOptionArgumentsAdmin[i]);
    }
    console.log(this.dataSource.data);
    this.service.saveOptionsArgumentsCategory(this, arrayMenuOptionArg, this.optionSelected.id, this.handlerSuccessSaveCategoryArgument, this.handlerErrorSaveCategoryArgument);
  }

  handlerSuccessSaveCategoryArgument(_this, result) {
    _this.optionSelected.menuOptionArgumentsAdmin = result;
    const nestedNode = _this.flatNodeMap.get(_this.optionSelected);
    nestedNode.menuOptionArgumentsAdmin = result;
    _this.dataChange.next(_this.data);
    _this.getOptionCategoryArguments();
  }

  handlerErrorSaveCategoryArgument(_this, result) {
    _this.globals.isLoading = false;
  }

  editOutputOptions() {
    this.getMeta();
  }

  getMenuOptionsString(_this) {
    _this.service.getMenuString(_this, _this.globals.currentApplication.id, _this.handleSuccessString, _this.handlerErrorMeta);
  }

  handleSuccessString(_this, data) {
    console.log(data);
    console.log(_this.optionSelected);
    console.log(_this.drillDown);
    let menuString = data;

    // prepare drill down for option selection
    for(let dD of _this.drillDown)
    {
      for (let data of menuString)
      {
        if (dD.childrenOptionId == data.id)
        {
          dD.childrenOptionId = data.id;
          break;
        }
      }
    }

    const dialogRef = _this.dialog.open(DrillDownDialog, {
      width: '90%',
      data: { optionString: menuString, option: _this.optionSelected, drillDown: _this.drillDown }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result != undefined) {
        _this.drillDown = result;
        _this.saveDrillDown();
      }
    });

  }

  getDrillDowns() {
    this.service.getDrillDownAdmin(this, this.optionSelected.id, this.handlerSuccessDrillDown, this.handlerErrorMeta);
  }

  handlerSuccessDrillDown(_this, data) {
    console.log(data);
    _this.drillDown = data;
    _this.getMenuOptionsString(_this);
  }
  editDrillDown() {
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

        for (let argument of duplicateObject.categoryArgumentsId[0].arguments)
        {
          if (argument.value1)
            argument.value1 = JSON.stringify (argument.value1);
        }

        this.saveMenuArguments(duplicateObject);
      }
    });
  }
  saveMenuArguments(catId) {
    if (this.optionSelected.menuOptionArgumentsAdmin.length > 0) {
      for (let i = 0; i < this.optionSelected.menuOptionArgumentsAdmin.length; i++) {
        let aux = this.optionSelected.menuOptionArgumentsAdmin[i];
        if (aux.id == null && catId.id == null) {
          if (aux.categoryArgumentsId[0].id == catId.categoryArgumentsId[0].id) {
            aux = catId;
            this.optionSelected.menuOptionArgumentsAdmin[i] = aux;
          }
        } else {
          if (aux.id == catId.id) {
            aux = catId;
            this.optionSelected.menuOptionArgumentsAdmin[i] = aux;
          }
        }

      }
    } else {
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

  recursiveDelete(node) {
    if (!node.children)
      return;

    for (let i = 0; i < node.children.length; i++) {
      if (node.children[i].uid === this.optionSelected.uid) {
        node.children.splice(node.children.indexOf(this.optionSelected), 1);
        this.dataChange.next(this.data);
        this.recursiveDeleteDone = true;
      }
      else
        this.recursiveDelete(node.children[i]);

      if (this.recursiveDeleteDone)
        break;
    }
  }

  deleteNewItem() {
    this.recursiveDeleteDone = false;

    // find the node and delete it
    for (let i = 0; i < this.dataSource.data.length; i++) {
      if (this.dataSource.data[i].uid === this.optionSelected.uid) {
        this.dataSource.data.splice(this.dataSource.data.indexOf(this.optionSelected), 1);
        this.dataChange.next(this.data);
        this.recursiveDeleteDone = true;
      }
      else
        this.recursiveDelete(this.dataSource.data[i]);

      if (this.recursiveDeleteDone)
        break;
    }

    this.optionSelected = {};
  }

  insertItem(parent: any, name: string) {
    if (parent) {
      parent.children.push({
        label: null,
        uid: 'optnew' + parent.id + parent.children.length,
        isActive: true,
        baseUrl: null,
        icon: null,
        tab: null,
        tabType: null,
        parentId: null,
        children: [],
        toDelete: false,
        isRoot: false,
        typeOption: "0",
        applicationId: this.globals.currentApplication.id,
        metaData: 1,
      } as any);
      this.dataChange.next(this.data);
    } else {
      this.dataSource.data.push({
        label: null,
        uid: 'catnew' + this.dataSource.data.length,
        baseUrl: null,
        icon: null,
        tab: null,
        tabType: null,
        parentId: null,
        children: [],
        toDelete: false,
        isRoot: false,
        typeOption: "0",
        applicationId: this.globals.currentApplication.id,
        metaData: 1,
      } as any);
      this.dataChange.next(this.data);
    }
  }

  filterChanged() {
    this.filter(this.searchTextOption);
    if (this.searchTextOption) {
      this.treeControl.expandAll();
    } else {
      this.treeControl.collapseAll();
    }
  }

  public filter(filterText: string) {
    let filteredTreeData;
    if (filterText) {
      console.log(this.dataSource.data);
      Object.assign([], filteredTreeData).forEach(ftd => {
        let str = String(ftd.id);
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

    // Notify the change.
    this.dataChange.next(filteredTreeData);
  }

  getIndex(checkbox: any) {
    let index = -1;

    if (this.optionSelected.menuOptionArgumentsAdmin) {
      for (let categorySelected of this.optionSelected.menuOptionArgumentsAdmin) {
        if (checkbox.id === categorySelected.categoryArgumentsId[0].id && !categorySelected.toDelete) {
          if (!categorySelected.position)
            categorySelected.position = this.optionSelected.menuOptionArgumentsAdmin.indexOf(categorySelected) + 1;

          index = categorySelected.position;
          break;
        }
      }
    }

    return index;
  }

  @HostListener('window:resize', ['$event'])
  checkScreen(event): void {
    this.innerHeight = event.target.innerHeight;

    // if(!this.mobileQuery.matches)
    // {
    if (event.target.innerHeight == window.screen.height && event.target.innerWidth == window.screen.width)
      this.globals.isFullscreen = true;
    else
      this.globals.isFullscreen = false;
    // }
    // else{
    //   this.globals.isFullscreen = false;
    // }
  }

  getInnerHeight(): number {
    return this.innerHeight;
  }

  hideIconPicker(): void {
    if (this.materialIconPicker)
      this.materialIconPicker.disableIconPicker();
  }

  isMatIcon(icon): boolean {
    return !icon.endsWith(".png");
  }

  getImageIcon(url): string
  {
    let newurl, filename: string;
    let path: string[];

    path = url.split ('/');
    filename = path.pop ().split ('?')[0];
    newurl = "";

    // recreate the url with the theme selected
    for (let dir of path)
      newurl += dir + "/";

    newurl += this.globals.theme + "-" + filename;
    return newurl;
  }
}

