import { Component, OnInit, ViewChild, HostListener, ChangeDetectorRef, NgZone } from '@angular/core';
import { Menu } from '../model/Menu';
import { CategoryArguments } from '../model/CategoryArguments';
import { Globals } from '../globals/Globals';
import { Arguments } from '../model/Arguments';
import { MatDialog, MatTableDataSource, MatPaginator, PageEvent } from '@angular/material';
import { MsfDynamicTableVariablesComponent } from '../msf-dynamic-table-variables/msf-dynamic-table-variables.component';
import { MsfContainerComponent } from '../msf-container/msf-container.component';
import { MenuService } from '../services/menu.service';
import { Router } from '@angular/router';
import { ExcelService } from '../services/excel.service';
import { DashboardMenu } from '../model/DashboardMenu';
import { MsfEditDashboardComponent } from '../msf-edit-dashboard/msf-edit-dashboard.component';
import { ApplicationService } from '../services/application.service';
import { MsfColumnSelectorComponent } from '../msf-column-selector/msf-column-selector.component';
import { MsfShareDashboardComponent } from '../msf-share-dashboard/msf-share-dashboard.component';
import { AuthService } from '../services/auth.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { AuthGuard } from '../guards/auth.guard';
import { UserService } from '../services/user.service';
import { MessageComponent } from '../message/message.component';
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';
import { ComponentType } from '../commons/ComponentType';
import { AirportSelection } from '../commons/AirportSelection';
import { DecimalPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.css']
})
export class ApplicationComponent implements OnInit {

  isFullscreen: boolean;
  name: string;
  dynamicTablePlan: boolean;
  exportExcelPlan: boolean;
  dashboardPlan: boolean;
  defaultDashboardId: number;
  menu: Menu;
  dashboards: Array<DashboardMenu>;
  sharedDashboards: Array<DashboardMenu>;
  planAdvanceFeatures: any[];
  status: boolean;
  user: any[];
  userName : any;

  // admin: boolean = false;
  ELEMENT_DATA: any[];
  coordinates: any;
  //displayedColumns: string[] = [];
  variables;
  currentOptionBackUp: any;

  exportConfig: ExportAsConfig = {
    type: 'png',
    elementId: 'msf-dashboard-element',
    options: {}
  };

  @ViewChild('msfContainerRef')
  msfContainerRef: MsfContainerComponent;

  @ViewChild('paginator')
  paginator: MatPaginator;

  pageIndex: any;

  pageEvent: PageEvent;

  TabletQuery: MediaQueryList;
  mobileQuery: MediaQueryList;
  ResponsiveQuery: MediaQueryList;
  private _TabletQueryListener: () => void;
  private _mobileQueryListener: () => void;
  private _ResponsiveQueryListener: () => void; 
  lengthpag: any;
  pageI: any;
  pageSize: any;
  showMoreResult: boolean;  

  constructor(public dialog: MatDialog, public globals: Globals, private menuService: MenuService,private router: Router,private excelService:ExcelService,
    private appService: ApplicationService, private authService: AuthService, private changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private authGuard: AuthGuard,
    private userService: UserService, private exportAsService: ExportAsService)
  {
    this.status = false;
    //media querys

    this.TabletQuery = media.matchMedia('(max-width: 768px)');
    this._TabletQueryListener = () => changeDetectorRef.detectChanges();
    this.TabletQuery.addListener(this._TabletQueryListener);
    
    this.mobileQuery = media.matchMedia('(max-width: 480px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.ResponsiveQuery = media.matchMedia('(max-width: 759px)');
    this._ResponsiveQueryListener = () => changeDetectorRef.detectChanges();
    this.ResponsiveQuery.addListener(this._ResponsiveQueryListener);
  }

  ngOnInit() {
    this.globals.lastTime = null;
    this.globals.clearVariables();
    this.globals.clearVariablesMenu();

    this.globals.appLoading = true;
    this.globals.isLoading = true;
    this.appService.getNumAirlinesRestriction (this, this.restrictAirlineSuccess, this.errorLogin);
  }

  ngOnDestroy(): void {
    this.TabletQuery.removeListener(this._TabletQueryListener);
	this.mobileQuery.removeListener(this._mobileQueryListener);
	  this.ResponsiveQuery.removeListener(this._ResponsiveQueryListener);
  }

  parseTimeStamp(timeStamp): string
  {
    let hours: number;
    let minutes: any;
    let ampm: string;
    let date: Date;

    const monthNames: string[] =
    [
      "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ];

    if (timeStamp == null)
      return null;

    date = new Date (timeStamp);
    if (Object.prototype.toString.call (date) === "[object Date]")
    {
      if (isNaN (date.getTime()))
        return null;
    }
    else
      return null;

    hours = date.getHours ();
    if (hours >= 12)
    {
      if (hours > 12)
        hours -= 12;

      ampm = " PM";
    }
    else
    {
      if (!hours)
        hours = 12;

      ampm = " AM";
    }

    minutes = date.getMinutes ();
    if (minutes < 10)
      minutes = "0" + minutes;

    return monthNames[date.getMonth ()] + " " + date.getDate () + ", " + date.getFullYear () + " " + hours + ":" + minutes + ampm;
  }

  validateAdmin(){
    this.menuService.getUserLoggedin(this, this.handleLogin, this.errorLogin);
  }

  handleLogin(_this,data){
    _this.user = data;
    _this.globals.currentUser = data.name;
    _this.userName = data.name;
    _this.globals.admin = data.admin;
    _this.userService.getUserLastLoginTime (_this, _this.lastTimeSuccess, _this.errorLogin);
  }

  lastTimeSuccess(_this, data)
  {
    _this.globals.lastTime = _this.parseTimeStamp (data);
    _this.appService.getDefaultDashboard (_this, _this.handlerDefaultDashboard, _this.errorLogin);
  }

  restrictAirlineSuccess(_this, data)
  {
    if (data)
      _this.globals.restrictedAirlines = true;
    else
      _this.globals.restrictedAirlines = false;

    _this.appService.getDateRestriction (_this, _this.restrictDateSuccess, _this.errorLogin);
  }

  restrictDateSuccess(_this, data)
  {
    if (data)
    {
      _this.globals.dateRestrictionInfo = data;
      _this.globals.dateRestrictionInfo.startDate = _this.globals.dateRestrictionInfo.startDate ? new Date (_this.globals.dateRestrictionInfo.startDate) : null;
      _this.globals.dateRestrictionInfo.endDate = _this.globals.dateRestrictionInfo.endDate ? new Date (_this.globals.dateRestrictionInfo.endDate) : null;
    }
    else
    {
      _this.globals.dateRestrictionInfo = {
        startDate: null,
        endDate: null
      };
    }

    _this.getMenu();
  }

  handlerDefaultDashboard(_this, data): void
  {
    // if the user has a default dashboard selected, go to it
    if (data)
    {
      _this.defaultDashboardId = data.id;
      _this.globals.currentDashboardMenu = null;

      for (let dashboard of _this.dashboards)
      {
        if (dashboard.id == data.id)
        {
          _this.globals.currentDashboardMenu = data;
          _this.globals.currentOption = 'dashboard';
          _this.globals.readOnlyDashboard = false;
          break;
        }
      }
    
      if (!_this.globals.currentDashboardMenu)
      {
        for (let dashboard of _this.sharedDashboards)
        {
          if (dashboard.id == data.id)
          {
            _this.globals.currentDashboardMenu = data;
            _this.globals.currentOption = 'dashboard';
            _this.globals.readOnlyDashboard = true;
            break;
          }
        }
      }

      if (!_this.globals.currentDashboardMenu)
      {
        _this.globals.appLoading = false;
        _this.globals.isLoading = false;
      }
    }
    else
    {
      _this.defaultDashboardId = null;
      _this.globals.appLoading = false;
      _this.globals.isLoading = false;
    }
  }

  errorLogin(_this, result)
  {
    _this.globals.appLoading = false;
    _this.globals.isLoading = false;
  }

  getDashboardsUser(){
    this.menuService.getDashboardsByUser(this, this.handlerDashboard, this.errorHandler);
  }

  handlerDashboard(_this, data){
    _this.dashboards = data;
    _this.menuService.getSharedDashboardsByUser(_this, _this.handlerSharedDashboard, _this.errorHandler);
  }

  handlerSharedDashboard(_this, data)
  {
    _this.sharedDashboards = data;
    _this.getAdvanceFeatures();
  }

  errorHandler(_this,result){
    _this.globals.appLoading = false;
    _this.globals.isLoading = false;
  }
  getAdvanceFeatures(){
    this.menuService.getAdvanceFeatures(this,this.handlerSuccessAF,this.handlerErrorAF);

    }

  handlerSuccessAF(_this,data){
    _this.planAdvanceFeatures = data;

    _this.globals.readOnlyDashboardPlan = false;
    _this.dashboardPlan = false;
    _this.dynamicTablePlan = false;
    _this.exportExcelPlan = false;

    // Do not allow a user without customer to use any advanced features
    if (!_this.planAdvanceFeatures)
      _this.globals.readOnlyDashboardPlan = true;
    else
    {
      _this.planAdvanceFeatures.forEach (item => {
        if (item.advanceFeatureId == 1)
          _this.globals.readOnlyDashboardPlan = true;

        if (item.advanceFeatureId == 2)
          _this.dashboardPlan = true;

        if (item.advanceFeatureId == 3)
          _this.dynamicTablePlan = true;

        if (item.advanceFeatureId == 4)
          _this.exportExcelPlan = true;
      });
    }

    _this.validateAdmin ();
  }

  handlerErrorAF(_this,result){
    _this.globals.readOnlyDashboardPlan = true;
    _this.dashboardPlan = false;
    _this.dynamicTablePlan = false;
    _this.exportExcelPlan = false;

    _this.validateAdmin ();
  }


  getMenu(){
    this.menuService.getMenu(this,this.handlerSuccess,this.handlerError);
  }

  handlerSuccess(_this,data)
  {
    if (!data.categories.length && (!_this.globals.admin ||
      (_this.globals.admin && _this.globals.testingPlan != -1)))
    {
      // send user back to welcome screen if no category menu is found
      _this.router.navigate (["/welcome"]);
      return;
    }

    _this.menu = data;
    _this.temporalSelectOption(_this);
    _this.currentOptionBackUp = _this.globals.currentOption; 
  }

  handlerError(_this,result){
    _this.getAdvanceFeatures();
  }


  temporalSelectOption(_this){
    _this.menu.categories.forEach(category => {
      category.options.forEach(option => {
        if (option.children.length > 0)
          _this.recursiveSearch (option.children,_this,category);
        else
        {
          if (option.id == _this.globals.currentApplication.defaultMenu)
          {
            _this.globals.clearVariables();
            _this.globals.isLoading = true;
            _this.globals.currentMenuCategory = category;
            _this.globals.currentOption = option;
            _this.globals.initDataSource();
            _this.globals.dataAvailabilityInit();
            _this.globals.status = true;
          }
        }
      });
    });

    _this.getDashboardsUser();
  }

  recursiveSearch(childrens,_this,category){
    childrens.forEach(option => {
      if (option.children.length > 0)
        _this.recursiveSearch (option.children,_this,category);
      else
      {
        if (option.id == _this.globals.currentApplication.defaultMenu)
        {
          _this.globals.clearVariables();
          _this.globals.isLoading = true;
          _this.globals.currentMenuCategory = category;
          _this.globals.currentOption = option;
          _this.globals.initDataSource();
          _this.globals.dataAvailabilityInit();
          _this.globals.status = true;
        }
      }
    })
  }



toggle(){
    this.status  = !this.status ;
    if(!this.status && this.globals.currentArgs){
      this.globals.currentArgs.open=false;
    }if(this.status && this.globals.currentArgs){
      this.globals.currentArgs.open=true;
    }

    this.globals.status  = !this.globals.status ;
    if(!this.globals.status && this.globals.currentArgs){
      this.globals.currentArgs.open=false;
    }if(this.globals.status && this.globals.currentArgs){
      this.globals.currentArgs.open=true;
    }
  }

  search() {
    if(!this.globals.showMenu && this.globals.showCategoryArguments){
		//para mobile
      this.globals.showCategoryArguments=false;
      this.globals.showIntroWelcome=false;
      this.globals.showTabs=true;
    }
    if (this.globals.currentOption.metaData == 3)
    {
      this.configureCoordinates ();
      return;
    }

    this.globals.moreResults = false;
    this.globals.query = true;
    this.globals.mapsc=false;
    this.globals.tab = true;

    this.globals.isLoading = true;
    if(this.globals.currentOption.tabType === 'map'){
      this.globals.map = true;
      this.globals.showBigLoading = false;
      this.globals.selectedIndex = 3;
      this.msfContainerRef.msfMapRef.getTrackingDataSource();
    }else if(this.globals.currentOption.tabType === 'usageStatistics'){
      this.msfContainerRef.msfTableRef.getDataUsageStatistics();
    }else {
      this.globals.showBigLoading = false;
      this.globals.selectedIndex = 2;
    }

    // close dynamic table tab if visible
    this.globals.generateDynamicTable = false;

    setTimeout(() => {
      this.search2();
  }, 3000);

  }

  search2(){
    if(this.globals.currentOption.tabType === 'map'&& this.globals.currentOption.url!=null){
      this.globals.map = true;
      this.msfContainerRef.msfMapRef.getTrackingDataSource();
      this.msfContainerRef.msfTableRef.getData(false);
    }else if(this.globals.currentOption.tabType === 'usageStatistics'){
      this.msfContainerRef.msfTableRef.getDataUsageStatistics();
    }else{
      this.msfContainerRef.msfTableRef.getData(false);
    }
  }

  moreResults(){
    if(this.globals.moreResultsBtn){
      this.globals.moreResults = false;
      this.globals.query = true;
      this.globals.mapsc=false;
      this.globals.tab = true;

      this.globals.isLoading = true;
      if(this.globals.currentOption.tabType === 'map'){
        this.globals.map = true;
        this.globals.showBigLoading = false;
        this.globals.selectedIndex = 3;
        this.msfContainerRef.msfMapRef.getTrackingDataSource();
      }else if(this.globals.currentOption.tabType === 'usageStatistics'){
        this.msfContainerRef.msfTableRef.getDataUsageStatistics();
      }else {
        this.globals.showBigLoading = false;
        this.globals.selectedIndex = 2;
      }
      setTimeout(() => {
        this.moreResults2();
    }, 3000);
    }
  }

  moreResults2(){
    if(this.globals.currentOption.tabType === 'map' && this.globals.currentOption.url!=null){
      this.globals.map = true;
      // this.msfContainerRef.msfMapRef.getTrackingDataSource();
      this.msfContainerRef.msfTableRef.getData(true);
    }else if(this.globals.currentOption.tabType === 'usageStatistics'){
      this.msfContainerRef.msfTableRef.getDataUsageStatistics();
    }else{
      this.msfContainerRef.msfTableRef.getData(true);
    }
  }


  disabled(){
    let option:any = this.globals.currentOption;
    let disabled = false;
    if (option)
    {
      if (option.metaData == 3)
      {
        if (!this.globals.coordinates.length)
          disabled = true;
      }
      else if (option.menuOptionArguments) {
        for (let menuOptionArguments of option.menuOptionArguments) {
          if (menuOptionArguments.categoryArguments) {
            if (menuOptionArguments.categoryArguments) {
              for (let i = 0; i < menuOptionArguments.categoryArguments.length; i++) {
                let category: CategoryArguments = menuOptionArguments.categoryArguments[i];
                if (category && category.arguments) {
                  for (let j = 0; j < category.arguments.length; j++) {
                    let argument: Arguments = category.arguments[j];
                    if (argument.required == 1) {
                        if (argument.type == ComponentType.airport)
                        {
                          if (argument.value1 == null || argument.value1.toString () == "")
                            return true;

                          if (argument.selectionMode)
                          {
                            let selectionMode = argument.selectionMode & ~AirportSelection.MULTIPLESELECTION;

                            if (selectionMode == AirportSelection.ROUTE)
                            {
                              if (argument.value2 == null || argument.value2.toString () == "")
                                return true;
                            }
                            else if (selectionMode == AirportSelection.ROUTEWITHCONNECTION)
                            {
                              if (argument.value3 == null || argument.value3.toString () == "")
                                return true;
                            }
                          }
                        }
                        else
                        {
                          if ((argument.value1 == null || argument.value1.toString () == "") || (argument.name2 && (argument.value2 == null || argument.value2.toString () == ""))) {
                            return true;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return disabled;
  }


  openChart(){
    this.globals.chart = !this.globals.chart;
    this.globals.selectedIndex = 3;
  }

  dynamicTable(){
    this.openDialog();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(MsfDynamicTableVariablesComponent, {
      width: '600px',
      data: {metadata:this.msfContainerRef.msfTableRef.metadata, variables: this.variables}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result)
      {
        this.globals.showBigLoading = false;
        this.msfContainerRef.msfDynamicTableRef.loadData ();
      }
    });
  }

  goHome()
  {
    this.router.navigate (["/welcome"]);
  }

  exportToExcel():void {
    let tableColumnFormats: any[] = [];
    let columnMaxWidth: any[] = [];
    let excelData: any[] = [];

    // prepare the column max width values
    for (let column of this.msfContainerRef.msfTableRef.tableOptions.displayedColumns)
    {
      if (column.columnFormat && column.columnFormat.length > column.columnLabel.length
        && (column.columnType === "date" || column.columnType === "time"))
      {
        columnMaxWidth.push (column.columnFormat.length);
        continue;
      }

      columnMaxWidth.push (column.columnLabel.length);
    }

    // create a new JSON for the XLSX creation
    for (let item of this.msfContainerRef.msfTableRef.dataSource.data)
    {
      let excelItem: any = {};

      // if there are any flight connections, check the sub elements instead
      if (this.globals.currentOption.tabType === "scmap" && this.msfContainerRef.msfTableRef.isArray (item.Flight))
      {
        for (let subItem of item.Flight)
        {
          excelItem = {};

          for (let i = 0; i < this.msfContainerRef.msfTableRef.tableOptions.displayedColumns.length; i++)
          {
            let column = this.msfContainerRef.msfTableRef.tableOptions.displayedColumns[i];
            let curitem = subItem[column.columnName].parsedValue;

            if (curitem == undefined)
            {
              excelItem[column.columnLabel] = "";
              continue;
            }
    
            if (column.columnType === "date")
            {
              let date: Date = new Date (curitem);
    
              // Advance one day, since on Excel files will be one day behind
              date.setDate (date.getDate () + 1);

              excelItem[column.columnLabel] = date.toISOString ();
            }
            else if (column.columnType === "time")
            {
              let time: Date = new Date (curitem);

              // Advance one minute, since on time on Excel files will be one minute behind
              time.setMinutes (time.getMinutes () + 1);

              excelItem[column.columnLabel] = time.toISOString ();
            }
            else
            {
              excelItem[column.columnLabel] = curitem;
    
              // Get the maximun width for visible results for each column
              if (curitem.toString ().length > columnMaxWidth[i])
                columnMaxWidth[i] = curitem.toString ().length;
            }
          }

          excelData.push (excelItem);
        }

        continue;
      }
  
      for (let i = 0; i < this.msfContainerRef.msfTableRef.tableOptions.displayedColumns.length; i++)
      {
        let column = this.msfContainerRef.msfTableRef.tableOptions.displayedColumns[i];
        let curitem = item[column.columnName];

        if (curitem == undefined)
        {
          excelItem[column.columnLabel] = "";
          continue;
        }

        if (column.columnType === "date")
        {
          let date: Date = new Date (curitem);

          // Advance one day, since on Excel files will be one day behind
          date.setDate (date.getDate () + 1);

          excelItem[column.columnLabel] = date.toISOString ();
        }
        else if (column.columnType === "time")
        {
          let time: Date = new Date (curitem);

          // Advance one minute, since on time on Excel files will be one minute behind
          time.setMinutes (time.getMinutes () + 1);

          excelItem[column.columnLabel] = time.toISOString ();
        }
        else
        {
          excelItem[column.columnLabel] = curitem;

          // Get the maximun width for visible results for each column
          if (curitem.toString ().length > columnMaxWidth[i])
            columnMaxWidth[i] = curitem.toString ().length;
        }
      }

      excelData.push (excelItem);
    }

    // prepare Excel column formats
    for (let i = 0; i < this.msfContainerRef.msfTableRef.tableOptions.displayedColumns.length; i++)
    {
      let column = this.msfContainerRef.msfTableRef.tableOptions.displayedColumns[i];

      tableColumnFormats.push ({
        type: column.columnType,
        format: column.outputFormat,
        prefix: column.prefix,
        suffix: column.suffix,
        pos: i,
        width: columnMaxWidth[i] + 1
      });
    }

    this.excelService.exportAsExcelFile(excelData, this.globals.currentOption.label, tableColumnFormats);
  }

  exportToCSV(): void
  {
    this.globals.isLoading = true;
    this.appService.getDataTableSourceForCSV (this, this.prepareDataForCSV, this.CSVFail);
  }

  prepareDataForCSV(_this, result): void
  {
    let displayedColumns = _this.msfContainerRef.msfTableRef.tableOptions.displayedColumns;
    let keys, data, response, totalRecord;
    let blob, link, url;
    let CSVdata = "";
    let i, j;

    response = result.Response;
    if (response != null)
    {
      if (response.total != null)
        totalRecord = response.total;
      else
      {
        for (let key in response)
        {
          let array = response[key];

          if (array != null)
          {
            if (Array.isArray(array))
            {
              totalRecord = array.length;
              break;
            }
            else
            {
              for (let key in array)
              {
                let obj = array[key];

                if (obj != null)
                {
                  let keys = Object.keys (response);
                  let mainElement = _this.msfContainerRef.msfTableRef.getMainKey (keys, response);

                  if (mainElement != null)
                    totalRecord = 1;
                }
              }
            }
          }
        }
      }
    }

    keys = Object.keys (response);
    data = _this.msfContainerRef.msfTableRef.getMainKey (keys, response);
    if (!(data instanceof Array))
      data = [data];

    if (totalRecord > 0)
      data = _this.msfContainerRef.msfTableRef.parseResults (data, displayedColumns, _this.globals.currentOption);
    else
    {
      _this.globals.isLoading = false;

      _this.dialog.open (MessageComponent, {
        data: { title: "Information", message: "No results were found." }
      });

      return;
    }

    // Add columns first
    for (i = 0; i < displayedColumns.length; i++)
    {
      let column = displayedColumns[i];

      CSVdata += column.columnLabel;

      if (i != displayedColumns.length - 1)
        CSVdata += ";";
    }

    CSVdata += "\n";

    // Then the values
    for (i = 0; i < data.length; i++)
    {
      let item = data[i];

      // if there are any flight connections, check the sub elements instead
      if (_this.globals.currentOption.tabType === "scmap" && _this.msfContainerRef.msfTableRef.isArray (item.Flight))
      {
        for (j = 0; j < item.Flight.length; j++)
        {
          let subItem = item.Flight[j];

          for (let k = 0; k < displayedColumns.length; k++)
          {
            let column = displayedColumns[k];
            let curitem = subItem[column.columnName].parsedValue;

            if (curitem == null || curitem == "")
            {
              if (k != displayedColumns.length - 1)
                CSVdata += ";";

              continue;
            }
    
            if (column.columnType === "date" || column.columnType === "time")
            {
              let date: Date = new Date (curitem);

              CSVdata += new DatePipe ('en-US').transform (date, column.outputFormat);
            }
            else if (column.columnType === "number")
            {
              if (column.prefix)
                CSVdata += column.prefix;

              if (column.outputFormat)
                CSVdata += new DecimalPipe ('en-US').transform (curitem, column.outputFormat);
              else
                CSVdata += new DecimalPipe ('en-US').transform (curitem, '.0-2');

              if (column.suffix)
                CSVdata += column.suffix;
            }
            else
              CSVdata += curitem;

            if (k != displayedColumns.length - 1)
              CSVdata += ";";
          }

          if (j != item.Flight.length - 1)
            CSVdata += "\n";
        }

        continue;
      }
  
      for (j = 0; j < displayedColumns.length; j++)
      {
        let column = displayedColumns[j];
        let curitem = item[column.columnName];

        if (curitem == null || curitem == "")
        {
          if (j != displayedColumns.length - 1)
            CSVdata += ";";

          continue;
        }

        if (column.columnType === "date" || column.columnType === "time")
        {
          let date: Date = new Date (curitem);

          CSVdata += new DatePipe ('en-US').transform (date, column.outputFormat);
        }
        else if (column.columnType === "number")
        {
          if (column.prefix)
            CSVdata += column.prefix;

          if (column.outputFormat)
            CSVdata += new DecimalPipe ('en-US').transform (curitem, column.outputFormat);
          else
            CSVdata += new DecimalPipe ('en-US').transform (curitem, '.0-2');

          if (column.suffix)
            CSVdata += column.suffix;
        }
        else
          CSVdata += curitem;

        if (j != displayedColumns.length - 1)
          CSVdata += ";";
      }

      if (i != data.length - 1)
        CSVdata += "\n";
    }

    blob = new Blob(['\ufeff' + CSVdata], { type: 'text/csv;charset=utf-8;' });
    link = document.createElement ("a");
    url = URL.createObjectURL (blob);

    // if the web browser is Apple Safari, then open in new window to export file
    if (navigator.userAgent.indexOf ('Safari') != -1 && navigator.userAgent.indexOf ('Chrome') == -1)
      link.setAttribute ("target", "_blank");

    link.setAttribute ("href", url);
    link.setAttribute ("download", _this.globals.currentOption.label + ".csv");
    link.style.visibility = "hidden";
    document.body.appendChild (link);
    link.click ();
    document.body.removeChild (link);

    _this.globals.isLoading = false;
  }

  CSVFail(_this): void
  {
    _this.globals.isLoading = false;

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to export CSV." }
    });
  }

  isSimpleContent(): boolean {
    return (this.globals.currentOption === "dashboard" || !this.globals.currentOption);
  }


  // logOut(){
  //   this.userService.setUserLastLoginTime (this, this.logoutSuccess, this.logoutError);
  // }

  logOut(){
    this.appService.confirmationDialog (this, "Are you sure you want to Log Out?",
      function (_this)
      {
        _this.userService.setUserLastLoginTime (_this, _this.logoutSuccess, _this.logoutError);
      });
  }
  
  logoutSuccess(_this): void
  {
    _this.authGuard.disableSessionInterval ();
    _this.authService.removeToken ();
    _this.router.navigate (['']);
  }

  logoutError(_this, error): void
  {
    _this.authGuard.disableSessionInterval ();
    _this.authService.removeToken ();
    _this.router.navigate (['']);
  }

  goToFullscreen(): void
  {
    let element: any = document.documentElement;

    if (element.requestFullscreen)
      element.requestFullscreen ();
    else if (element.mozRequestFullScreen)
      element.mozRequestFullScreen ();
    else if (element.webkitRequestFullscreen)
      element.webkitRequestFullscreen ();
    else if (element.msRequestFullscreen)
      element.msRequestFullscreen ();
  }

  @HostListener('window:resize', ['$event'])
  checkScreen(event)
  {
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

  changeDashboardName(): void
  {
    this.dialog.open (MsfEditDashboardComponent, {
      height: '160px',
      width: '400px',
      panelClass: 'msf-dashboard-control-variables-dialog',
      data: {
        currentDashboardMenu: this.globals.currentDashboardMenu
      }
    });
  }

  deleteSuccess(_this): void
  {
    _this.temporalSelectOption (_this);
  }

  deleteError(_this): void
  {
    _this.globals.isLoading = false;
  }

  shareDashboard(): void
  {
    this.dialog.open (MsfShareDashboardComponent, {
      height: '430px',
      width: '400px',
      panelClass: 'msf-dashboard-child-panel-dialog',
      data: {
        isPanel: false,
        dashboardContentId: this.globals.currentDashboardMenu.id,
        dashboardContentTitle: this.globals.currentDashboardMenu.title
      }
    });
  }

  deleteDashboard(): void
  {
    this.appService.confirmationDialog (this, "Are you sure you want to delete this dashboard?",
      function (_this)
      {
        _this.globals.isLoading = true;

        if (_this.globals.readOnlyDashboard)
        {
          _this.menuService.deleteSharedDashboard (_this, _this.globals.currentDashboardMenu.id,
            _this.deleteSuccess, _this.deleteError);
        }
        else
        {
          _this.menuService.deleteDashboard (_this, _this.globals.currentDashboardMenu.id,
            _this.deleteSuccess, _this.deleteError);
        }
      }
    );
  }

  columnSelector(){
    this.dialog.open (MsfColumnSelectorComponent, {
      width: "auto",
      height: "auto",
      maxHeight: "700px",
      maxWidth: "1000px",
      panelClass: 'msf-column-selector-popup'
    });
  }

  optionHandler()
  {
    if (this.msfContainerRef && this.msfContainerRef.msfTableRef)
      this.msfContainerRef.msfTableRef = null;

    this.changeDetectorRef.detectChanges ();
  }

  parseCoordinates(): void
  {
    let coordsString;
    let pos = 0;

    this.coordinates = [{
      type: "FeatureCollection",
      features: []
    }];

    do
    {
      let commaPos, endCoords, latitude, longitude;

      coordsString = this.globals.coordinates.substring(pos);
      commaPos = coordsString.indexOf (',');
      endCoords = coordsString.indexOf ('\n');
      if (endCoords == -1)
        endCoords = coordsString.length;

      latitude = parseFloat (coordsString.substring (0, commaPos));
      longitude = parseFloat (coordsString.substring (commaPos + 1, endCoords));

      this.coordinates[0].features.push (
      {
        type: "Feature",
        geometry: 
        {
          type: "Point",
          coordinates:
          [
            longitude,
            latitude
          ]
        },
        origin:
        {
          iata: "",
          latitude: latitude,
          longitude: longitude
        },
        dest:
        {
          iata: "",
          latitude: latitude,
          longitude: longitude
        }
      });

      pos += endCoords + 1;
    }
    while (pos < this.globals.coordinates.length);
  }

  configureCoordinates(): void
  {
    this.parseCoordinates ();
    this.msfContainerRef.msfMapRef.generateCoordinates (this.coordinates);
  }

  setDefaultDashboard(): void
  {
    this.appService.confirmationDialog (this, "Do you want to set this dashboard as the default?",
      function (_this)
      {
        _this.globals.isLoading = true;

        if (_this.isDefaultDashboard ())
          _this.appService.unsetDefaultDashboard (_this, _this.unsetDashboardDefaultSuccess, _this.setDashboardDefaultError);
        else
          _this.appService.setDefaultDashboard (_this, _this.globals.currentDashboardMenu, _this.setDashboardDefaultSuccess, _this.setDashboardDefaultError);
      }
    );
  }

  unsetDashboardDefaultSuccess(_this): void
  {
    _this.globals.isLoading = false;
    _this.defaultDashboardId = null;

    _this.dialog.open (MessageComponent, {
      data: { title: "Information", message: "This dashboard is no longer the default." }
    });
  }

  setDashboardDefaultSuccess(_this): void
  {
    _this.globals.isLoading = false;
    _this.defaultDashboardId = _this.globals.currentDashboardMenu.id;

    _this.dialog.open (MessageComponent, {
      data: { title: "Information", message: "This dashboard has been set to default successfully." }
    });
  }

  setDashboardDefaultError(_this): void
  {
    _this.globals.isLoading = false;

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Unable to set default dashboard." }
    });
  }

  isDefaultDashboard(): boolean
  {
    if (!this.globals.currentDashboardMenu || !this.defaultDashboardId)
      return false;

    return this.defaultDashboardId == this.globals.currentDashboardMenu.id;
  }
  
  showMenu(){
    if (this.mobileQuery.matches){
      if(!this.globals.showMenu){
        this.globals.showCategoryArguments= false;
        this.globals.showIntroWelcome = false;
        this.globals.showTabs=false;
        this.globals.showDashboard=false;
        this.globals.showMenu = true;
      }else if(this.globals.showMenu && !this.globals.showIntroWelcome){
        // this.globals.clearVariables ();
        // this.globals.currentOption = this.currentOptionBackUp;
        this.globals.showMenu = false;
        this.globals.showCategoryArguments= false;
        this.globals.showTabs=false;
        this.globals.showDashboard=false;
        this.globals.showIntroWelcome = true;
        this.globals.selectedIndex = 0;
      }
    }else if (this.ResponsiveQuery.matches){
      if(!this.globals.showMenu){
        this.globals.showCategoryArguments= false;
        this.globals.showIntroWelcome = false;
        this.globals.showTabs=false;
        this.globals.showDashboard=false;
        this.globals.showMenu = true;
      }else{
        this.globals.showCategoryArguments= false;
        this.globals.showIntroWelcome = true;
        this.globals.showTabs=false;
        this.globals.showDashboard=false;
        this.globals.showMenu = false;
      }
    }    

    this.changeDetectorRef.detectChanges ();
  }

  backMenu(){
    if (this.mobileQuery.matches){
    if(!this.globals.showMenu && (this.globals.showCategoryArguments || this.globals.showDashboard)){
      this.globals.showIntroWelcome = false;
      this.globals.showCategoryArguments = false;
      this.globals.showTabs=false;
      this.globals.showDashboard=false;
      this.globals.showMenu = true;
    }else if(!this.globals.showMenu && this.globals.showTabs){
      this.globals.showMenu = false;
      this.globals.showIntroWelcome = false;
      this.globals.showTabs=false;
      this.globals.showDashboard=false;
      this.globals.showCategoryArguments = true;
    }
  }
    /*else if(!this.globals.showMenu && this.globals.showTabs && this.ResponsiveQuery.matches){
      this.globals.showIntroWelcome = false;
      this.globals.showCategoryArguments = false;
      this.globals.showTabs=false;
      this.globals.showDashboard=false;
      this.globals.showMenu = true;
    }*/

    this.changeDetectorRef.detectChanges ();
  }

  getMenuVisibility(): string
  {
    if (!this.mobileQuery.matches && !this.ResponsiveQuery.matches)
      return "block";

    return "none";
  }


  exportDashboardAsPNG(): void
  {
    let dashboardElement: any = document.getElementById ("msf-dashboard-element");

    let contentHeight: number = dashboardElement.scrollHeight;
    let contentWidth: number = dashboardElement.scrollWidth;

    // Set PNG width and height for the dashboard content
    this.globals.isLoading = true;
    this.exportConfig.options.width = contentWidth;
    this.exportConfig.options.windowWidth = contentWidth;
    this.exportConfig.options.height = contentHeight;
    this.exportConfig.options.windowHeight = contentHeight + 90;

    this.exportAsService.save (this.exportConfig, this.globals.currentDashboardMenu.title).subscribe (() => 
    {
      this.globals.isLoading = false;
    });
  }

  stopPlanTest(): void
  {
    this.globals.testingPlan = -1;

    // reload menu
    this.globals.lastTime = null;
    this.globals.clearVariables ();
    this.globals.clearVariablesMenu ();
    this.getMenu ();
  }

  public getServerData(event?:PageEvent){
    if(!this.globals.isLoading){
      this.pageIndex = event;
      this.globals.moreResultsBtn = true;
      // this.pageIndex = event.pageIndex;
      this.moreResults();
      return event;
    }

  }

  lengthpaginator(event: any) {
    this.lengthpag = event.length;
    this.pageI = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  moreResult(event: any){
    this.showMoreResult = event;
  }
}
