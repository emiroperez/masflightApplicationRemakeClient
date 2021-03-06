import { Component, OnInit, ViewChild, HostListener, ChangeDetectorRef, NgZone, ElementRef } from '@angular/core';
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
import { DashboardCategory } from '../model/DashboardCategory';
import { MsfPartialSummariesComponent } from '../msf-partial-summaries/msf-partial-summaries.component';
import { ExportCsvDialogComponent } from '../export-csv-dialog/export-csv-dialog.component';
import { SearchDynamicTableComponent } from '../search-dynamic-table/search-dynamic-table.component';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.css']
})
export class ApplicationComponent implements OnInit {

  tableLoading: boolean = false;
  mapboxLoading: boolean = false;
  routeLoading: boolean = false;
  dynTableLoading: boolean = false;
  searchFilter: string = null;
  isFullscreen: boolean;
  name: string;
  dynamicTablePlan: boolean;
  exportExcelPlan: boolean;
  dashboardPlan: boolean;
  defaultDashboardId: number;
  menu: Menu;
  dashboardCategories: Array<DashboardCategory>;
  dashboards: Array<DashboardMenu>;
  sharedDashboards: Array<DashboardMenu>;
  planAdvanceFeatures: any[];
  status: boolean;
  user: any[];
  userName : any;
  partialSummaryValues: any = null;
  dynamicTableValues: any = null;
  dynTableFilterValues: any = null;
  CSVseparator: string = "\t";
  searchColumnFilter: boolean = false;
  dynTableSearchColumnFilter: boolean = false;
  dynTableData: any = null;
  nameAirlines: any[] = null;

  // admin: boolean = false;
  ELEMENT_DATA: any[];
  coordinates: any;
  //displayedColumns: string[] = [];
  currentOptionBackUp: any;

  exportConfig: ExportAsConfig = {
    type: 'png',
    elementId: 'msf-dashboard-element',
    options: {}
  };

  @ViewChild('msfContainerRef', { static: false })
  msfContainerRef: MsfContainerComponent;

  @ViewChild('paginator', { static: false })
  paginator: MatPaginator;

  @ViewChild('searchFilterInput', { static: false })
  searchFilterInput: ElementRef;

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
  defaultOptionId: number = null;

  dynTableXAxis: any[];
  dynTableYAxis: any[];
  dynTableValues: any[];

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
    _this.globals.SuperAdmin = data.superAdmin;
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

    _this.appService.getDefaultOptionId (_this, _this.defaultOptionSuccess, _this.errorLogin);
  }

  defaultOptionSuccess(_this, data)
  {
    _this.defaultOptionId = data;
    _this.getMenu ();
  }

  recursiveDashboardFullPath(category, dashboard, arg): any
  {
    let fullPath = arg.fullPath;

    for (let item of category.children)
    {
      let path = fullPath + item.title + "/";

      if (dashboard.parentId == item.id)
      {
        return {
          item: item,
          fullPath: path,
          found: true
        };
      }

      if (item.children && item.children.length)
      {
        arg = this.recursiveDashboardFullPath (item, dashboard, {
          item: item,
          fullPath: path
        });

        if (arg.found)
          return arg;
      }
    }

    return arg;
  }

  getDashboardFullPath(dashboard, arg): any
  {
    if (dashboard.parentId != null)
    {
      let fullPath = arg.fullPath;

      for (let category of this.dashboardCategories)
      {
        let path = fullPath + category.title + "/";

        if (dashboard.parentId == category.id)
        {
          return {
            item: category,
            fullPath: path,
            found: true
          };
        }

        if (category.children && category.children.length)
        {
          arg = this.recursiveDashboardFullPath (category, dashboard, {
            item: category,
            fullPath: path
          });

          if (arg.found)
            return arg;
        }
      }
    }

    return arg;
  }

  recursiveDashboardCategory(category, data, arg): void
  {
    for (let child of category.children)
    {
      this.recursiveDashboardCategory (child, data, arg);

      if (this.globals.currentDashboardMenu != null)
        break;
    }

    if (!this.globals.currentDashboardMenu)
    {
      for (let dashboard of category.dashboards)
      {
        if (dashboard.id == data.id)
        {
          this.globals.currentDashboardMenu = data;
          this.globals.currentDashboardLocation = this.getDashboardFullPath (dashboard, arg);
          this.globals.currentOption = 'dashboard';
          this.globals.readOnlyDashboard = null;
          break;
        }
      }
    }

    if (!this.globals.currentDashboardMenu)
    {
      for (let dashboard of category.sharedDashboards)
      {
        if (dashboard.dashboardMenuId.id == data.id)
        {
          this.globals.currentDashboardMenu = data;
          this.globals.currentDashboardLocation = this.getDashboardFullPath (dashboard, arg);
          this.globals.currentOption = 'dashboard';
          this.globals.readOnlyDashboard = dashboard;
          break;
        }
      }
    }
  }

  handlerDefaultDashboard(_this, data): void
  {
    let arg = {
      item: null,
      fullPath: "/"
    };

    // if the user has a default dashboard selected, go to it
    if (data)
    {
      _this.defaultDashboardId = data.id;
      _this.globals.currentDashboardMenu = null;
      _this.globals.currentDashboardLocation = null;

      for (let category of _this.dashboardCategories)
      {
        _this.recursiveDashboardCategory (category, data, arg);

        if (_this.globals.currentDashboardMenu != null)
          break;
      }

      if (!_this.globals.currentDashboardMenu)
      {
        for (let dashboard of _this.dashboards)
        {
          if (dashboard.id == data.id)
          {
            _this.globals.currentDashboardMenu = data;
            _this.globals.currentDashboardLocation = _this.getDashboardFullPath (dashboard, arg);
            _this.globals.currentOption = 'dashboard';
            _this.globals.readOnlyDashboard = null;
            break;
          }
        }
      }

      if (!_this.globals.currentDashboardMenu)
      {
        for (let dashboard of _this.sharedDashboards)
        {
          if (dashboard.dashboardMenuId.id == data.id)
          {
            _this.globals.currentDashboardMenu = data;
            _this.globals.currentDashboardLocation = _this.getDashboardFullPath (dashboard, arg);
            _this.globals.currentOption = 'dashboard';
            _this.globals.readOnlyDashboard = dashboard;
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
    _this.dashboardCategories = data.children;
    _this.dashboards = data.dashboards;
    _this.sharedDashboards = data.sharedDashboards;
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
    if (!data.categories.length && (!_this.globals.admin && !_this.globals.superAdmin||
      ((_this.globals.admin || _this.globals.superAdmin) && _this.globals.testingPlan != -1)))
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
          if (option.id == _this.defaultOptionId)
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
        if (option.id == _this.defaultOptionId)
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

  search()
  {
    let isMobile = false;

    this.searchFilter = null;
    this.searchColumnFilter = false;

    if (this.mobileQuery.matches)
      isMobile = true;

  	// for mobile devices
    this.globals.showCategoryArguments = false;
    this.globals.showIntroWelcome = false;
    this.globals.showTabs = true;

    // remove summary configuration
    this.partialSummaryValues = null;
    this.dynamicTableValues = null;
    this.dynTableFilterValues = null;
    this.dynTableData = null;

    if (this.globals.currentOption.metaData == 3)
    {
      this.configureCoordinates ();
      return;
    }

    this.globals.moreResults = false;
    this.globals.query = true;
    this.globals.mapsc = false;
    this.globals.tab = true;

    if (isMobile)
    {
      this.changeDetectorRef.detectChanges ();

      setTimeout (() => {
        this.startSearch ();
      }, 750);
    }
    else
      this.startSearch ();
  }

  startSearch(): void
  {
    if (this.globals.currentOption.tabType === 'scmap2' && (this.globals.currentOption.metaData == 4 || this.globals.currentOption.metaData == 5))
    {
      this.globals.mapsc = true;
      this.routeLoading = true;
    }
    else if (this.globals.currentOption.tabType === 'map' && this.globals.currentOption.baseUrl != null)
    {
      this.globals.map = true;
      this.globals.selectedIndex = 3;
      this.tableLoading = true;
      this.mapboxLoading = true;
    }
    else
    {
      if (this.globals.currentOption.tabType !== 'usageStatistics')
        this.globals.selectedIndex = 2;

      this.tableLoading = true;
    }

    // close dynamic table tab if visible
    this.globals.generateDynamicTable = false;
    this.changeDetectorRef.detectChanges ();

    setTimeout (() => {
      this.search2 ();
    }, 3000);
  }

  search2() {
    if (this.globals.currentOption.tabType === 'scmap2' && (this.globals.currentOption.metaData == 4 || this.globals.currentOption.metaData == 5))
      this.getRoutes ();
    else if (this.globals.currentOption.tabType === 'map' && this.globals.currentOption.baseUrl != null)
    {
      this.globals.map = true;
      this.msfContainerRef.msfMapRef.getTrackingDataSource ();
      this.msfContainerRef.msfTableRef.getData (false, this.searchFilter);
    }
    else if (this.globals.currentOption.tabType === 'usageStatistics')
      this.msfContainerRef.msfTableRef.getDataUsageStatistics ();
    else
    {
      this.clearSort ();
      this.msfContainerRef.msfTableRef.getData(false, this.searchFilter);
    }
  }

  getRoutes(): void
  {
    this.globals.startTimestamp = new Date();

    this.authService.removeTokenResultTable();
    let tokenResultTable = this.authService.getTokenResultTable() ? this.authService.getTokenResultTable() : "";

    this.appService.getDataSource (this, this.handlerRouteSuccess, this.handlerRouteError, tokenResultTable);
  }

  handlerRouteSuccess(_this, data): void
  {
    if (!_this.routeLoading)
      return;

    if (!data.Response || (data.Response.records && !data.Response.records.length))
    {
      _this.routeLoading = false;

      _this.globals.mapsc = false;
      _this.globals.query = false;
      _this.globals.tab = false;

      _this.dialog.open (MessageComponent, {
        data: { title: "Information", message: "Results not available, please select your Filters and click on Search button." }
      });

      return;
    }

    // set cities and routes
    _this.msfContainerRef.msfScMapRef.destroyScheduleChart ();

    setTimeout (() => {
      _this.msfContainerRef.msfScMapRef.setRoutesToScMap (data.Response.records, false);

      _this.routeLoading = false;
    }, 50);
  }

  handlerRouteError(_this): void
  {
    _this.routeLoading = false;

    _this.globals.mapsc = false;
    _this.globals.query = false;
    _this.globals.tab = false;

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to find results!" }
    });
  }

  moreResults(){
    if(this.globals.moreResultsBtn){
      this.globals.moreResults = false;
      this.globals.query = true;
      this.globals.mapsc=false;
      this.globals.tab = true;

      this.tableLoading = true;
      if(this.globals.currentOption.tabType === 'map'){
        this.globals.map = true;
        this.globals.selectedIndex = 3;
        this.mapboxLoading = true;
      }
      else
        this.globals.selectedIndex = 2;

      setTimeout(() => {
        this.moreResults2();
    }, 3000);
    }
  }

  moreResults2(){
    if(this.globals.currentOption.tabType === 'map' && this.globals.currentOption.url!=null){
      this.msfContainerRef.msfMapRef.getTrackingDataSource();
      this.msfContainerRef.msfTableRef.getData(true, this.searchFilter);
    }else if(this.globals.currentOption.tabType === 'usageStatistics'){
      this.msfContainerRef.msfTableRef.getDataUsageStatistics();
    }else{
      this.msfContainerRef.msfTableRef.getData(true, this.searchFilter);
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

  dynamicTable(){
    this.openDialog();
  }

  partialSummaries(): void
  {
    const dialogRef = this.dialog.open (MsfPartialSummariesComponent, {
      width: '1100px',
      height: '600px',
      panelClass: 'partial-summaries-dialog',
      autoFocus: false,
      data: {
        metadata: this.msfContainerRef.msfTableRef.metadata,
        partialSummaryValues: this.partialSummaryValues
      }
    });

    dialogRef.afterClosed ().subscribe(result => {
      if (result)
      {
        let tokenResultTable;

        this.globals.moreResults = false;
        this.globals.query = true;
        this.globals.tab = true;

        this.globals.selectedIndex = 2;
        this.tableLoading = true;

        // always display the summary for the last column breaker
        if (result.columnBreakers.length)
          result.columnBreakers[result.columnBreakers.length - 1].summary = true;

        this.partialSummaryValues = result; // store the partial summary configuration

        this.clearSort ();
        this.msfContainerRef.msfTableRef.displayedColumns = [];

        this.globals.startTimestamp = new Date();
        this.msfContainerRef.msfTableRef.actualPageNumber = 0;

        this.authService.removeTokenResultTable ();
        tokenResultTable = this.authService.getTokenResultTable () ? this.authService.getTokenResultTable () : "";

        this.appService.getSummaryResponse (this, result, "" + this.msfContainerRef.msfTableRef.actualPageNumber, tokenResultTable, this.msfContainerRef.msfTableRef.ListSortingColumns,
          this.summarySuccess, this.summaryError, this.searchFilter);
      }
    });
  }

  openDialog(): void
  {
    const dialogRef = this.dialog.open (MsfDynamicTableVariablesComponent,
    {
      width: '1100px',
      height: '600px',
      panelClass: 'dynamic-table-dialog',
      autoFocus: false,
      data: {
        metadata: this.msfContainerRef.msfTableRef.metadata,
        dynamicTableValues: this.dynamicTableValues,
        configurePanel: false
      }
    });

    dialogRef.afterClosed ().subscribe (result => {
      if (result != null)
      {
        this.dynTableXAxis = result.xaxis;
        this.dynTableYAxis = result.yaxis;
        this.dynTableValues = result.values;

        this.globals.selectedIndex = 3;
        this.dynTableLoading = true;
        this.dynamicTableValues = result; // store the dynamic table configuration
        this.dynTableFilterValues = null;
        this.dynTableData = null;
        this.msfContainerRef.msfDynamicTableRef.loadData (result.xaxis, result.yaxis, result.values);
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
              if (column.outputFormat === "min")
                excelItem[column.columnLabel] = this.msfContainerRef.msfTableRef.getFormatMinutes (curitem);
              else
              {
                let time: Date = new Date (curitem);

                // Advance one minute, since on time on Excel files will be one minute behind
                time.setMinutes (time.getMinutes () + 1);

                excelItem[column.columnLabel] = time.toISOString ();
              }
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
          if (column.outputFormat === "min")
            excelItem[column.columnLabel] = this.msfContainerRef.msfTableRef.getFormatMinutes (curitem);
          else
          {
            let time: Date = new Date (curitem);

            // Advance one minute, since on time on Excel files will be one minute behind
            time.setMinutes (time.getMinutes () + 1);

            excelItem[column.columnLabel] = time.toISOString ();
          }
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

    this.excelService.exportAsExcelFile (excelData, this.globals.currentOption.label, tableColumnFormats);
  }

  exportToCSV(): void
  {
    let dialogRef = this.dialog.open (ExportCsvDialogComponent,
    {
      width: '480px',
      panelClass: 'msf-dashboard-control-variables-dialog',
      autoFocus: false
    });

    dialogRef.afterClosed ().subscribe ((result) => {
      if (!result)
        return;

      this.CSVseparator = result;
      this.globals.isLoading = true;

      this.authService.removeTokenResultTable ();
      let tokenResultTable = this.authService.getTokenResultTable () ? this.authService.getTokenResultTable () : "";

      this.appService.getDataTableSourceForCSV (this, tokenResultTable, this.msfContainerRef.msfTableRef.ListSortingColumns, this.prepareDataForCSV, this.CSVFail);
    });
  }

  prepareDataForCSV(_this, result): void
  {
    let displayedColumns = _this.msfContainerRef.msfTableRef.tableOptions.displayedColumns;
    let keys, data, response, totalRecord;
    let CSVseparator = _this.CSVseparator;
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
        CSVdata += CSVseparator;
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
                CSVdata += CSVseparator;

              continue;
            }
    
            if (column.columnType === "date" || column.columnType === "time")
            {
              if (column.columnType === "time" && column.outputFormat === "min")
                CSVdata += _this.msfContainerRef.msfTableRef.getFormatMinutes (curitem);
              else
              {
                let date: Date = new Date (curitem);

                CSVdata += new DatePipe ('en-US').transform (date, column.outputFormat);
              }
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
              CSVdata += CSVseparator;
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
            CSVdata += CSVseparator;

          continue;
        }

        if (column.columnType === "date" || column.columnType === "time")
        {
          if (column.columnType === "time" && column.outputFormat === "min")
            CSVdata += _this.msfContainerRef.msfTableRef.getFormatMinutes (curitem);
          else
          {
            let date: Date = new Date (curitem);

            CSVdata += new DatePipe ('en-US').transform (date, column.outputFormat);
          }
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
          CSVdata += CSVseparator;
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
    return (this.globals.currentOption === "dashboard" || this.globals.currentOption === "categoryAdmin" || !this.globals.currentOption);
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

    if (this.globals.isTablet ())
      return;

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
    if (this.globals.isTablet ())
      return;

    if (event.target.innerHeight == window.screen.height && event.target.innerWidth == window.screen.width)
      this.globals.isFullscreen = true;
    else
      this.globals.isFullscreen = false;
  }

  recursiveTotalDashboardCategories(categories, category): void
  {
    for (let item of category.children)
    {
      categories.push (item);
      this.recursiveTotalDashboardCategories (categories, item);
    }
  }

  getTotalDashboardCategories(): DashboardCategory[]
  {
    let categories = [];

    for (let category of this.dashboardCategories)
    {
      categories.push (category);
      this.recursiveTotalDashboardCategories (categories, category);
    }

    return categories;
  }

  editDashboard(): void
  {
    this.dialog.open (MsfEditDashboardComponent, {
      width: '480px',
      panelClass: 'msf-dashboard-control-variables-dialog',
      data: {
        currentDashboardMenu: this.globals.currentDashboardMenu,
        currentDashboardLocation: this.globals.currentDashboardLocation,
        dashboards: this.dashboards,
        sharedDashboards: this.sharedDashboards,
        dashboardCategories: this.getTotalDashboardCategories ()
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
          _this.menuService.deleteSharedDashboard (_this, _this.globals.readOnlyDashboard.id, _this.globals.currentDashboardMenu.id,
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

    this.partialSummaryValues = null;
    this.dynamicTableValues = null;
    this.dynTableFilterValues = null;
    this.dynTableData = null;
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

  backMenu()
  {
    if (!this.mobileQuery.matches && !this.ResponsiveQuery.matches)
    {
      this.changeDetectorRef.detectChanges ();
      return;
    }

    if (this.globals.showDashboard)
    {
      // return to default menu
      this.globals.currentOption = this.currentOptionBackUp;
      this.globals.showDashboard = false;
      this.globals.showIntroWelcome = true;
      return;
    }

    if (!this.globals.showMenu && this.globals.showCategoryArguments)
    {
      this.globals.showIntroWelcome = false;
      this.globals.showCategoryArguments = false;
      this.globals.showTabs = false;
      this.globals.showDashboard = false;
      this.globals.showMenu = true;
    }
    else if (!this.globals.showMenu && this.globals.showTabs)
    {
      this.globals.showMenu = false;
      this.globals.showIntroWelcome = false;
      this.globals.showTabs = false;
      this.globals.showDashboard = false;
      this.globals.showCategoryArguments = true;
    }

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
    this.globals.clearVariablesMenu();
    this.appService.getDefaultOptionId (this, this.defaultOptionSuccess, this.errorLogin);
  }

  public getServerData(event?:PageEvent){
    if (this.globals.selectedIndex == 2)
    {
      if (!this.tableLoading)
      {
        this.pageIndex = event;
        this.pageI = event.pageIndex;
        this.globals.moreResultsBtn = true;
        this.moreResults();
        return event;
      }
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

  refreshDashboardMenu(): void
  {
    this.menuService.getDashboardsByUser (this, this.handlerDashboardRefresh, this.errorHandler);
  }

  handlerDashboardRefresh(_this, data)
  {
    _this.dashboardCategories = data.children;
    _this.dashboards = data.dashboards;
    _this.sharedDashboards = data.sharedDashboards;
    _this.globals.isLoading = false;

    _this.dialog.open (MessageComponent, {
      data: { title: "Information", message: "The categories were saved successfully." }
    });
  }

  clearSort()
  {
    if (this.msfContainerRef.msfTableRef.ListSortingColumns != "")
    {
      this.msfContainerRef.msfTableRef.ListSortingColumns = "";
      this.msfContainerRef.msfTableRef.actualPageNumber = 0;
      this.msfContainerRef.msfTableRef.tableOptions.moreResultsBtn = false;
      this.msfContainerRef.msfTableRef.sort.sort({ id: '', start: 'asc', disableClear: false });
    }
  }

  setTableLoading(value): void
  {
    this.tableLoading = value;
  }

  setMapboxLoading(value): void
  {
    this.mapboxLoading = value;
  }

  setRouteLoading(value): void
  {
    this.routeLoading = value;
  }

  setDynTableLoading(value): void
  {
    this.dynTableLoading = value;
  }

  cancelLoadingFromLastService(): void
  {
    this.tableLoading = false;
    this.mapboxLoading = false;
    this.routeLoading = false;
    this.dynTableLoading = false;
  }

  summarySuccess(_this, data): void
  {
    if (!_this.tableLoading)
      return;

    _this.msfContainerRef.msfTableRef.handlerSuccess (_this.msfContainerRef.msfTableRef, data);
  }

  summaryError(_this, result): void
  {
    console.log (result);

    _this.msfContainerRef.msfTableRef.tableOptions.dataSource = false;
    _this.msfContainerRef.msfTableRef.tableOptions.template = false;

    _this.msfContainerRef.msfTableRef.resultsAvailable = "msf-no-visible";

    _this.tableLoading = false;
  }

  havingProblems(): void
  {  
  }

  keepSearchFilter(): void
  {
    event.preventDefault ();
    event.stopPropagation ();
  }

  closeSearchColumnFilter(): void
  {
    this.dynTableSearchColumnFilter = false;
    this.searchColumnFilter = false;
  }

  toggleSearchColumnFilter(event): void
  {
    event.preventDefault ();
    event.stopPropagation ();

    if (this.globals.selectedIndex == 3)
    {
      this.dynTableSearchColumnFilter = !this.dynTableSearchColumnFilter;

      if (this.dynTableSearchColumnFilter && this.dynTableData == null)
      {
        this.dynTableData = {
          dataAdapter: this.msfContainerRef.msfDynamicTableRef.dataAdapter,
          xaxis: this.dynTableXAxis,
          yaxis: this.dynTableYAxis
        };
      }

      this.changeDetectorRef.detectChanges ();
      return;
    }

    this.searchColumnFilter = !this.searchColumnFilter;
    this.changeDetectorRef.detectChanges();

    if (this.searchColumnFilter)
      this.searchFilterInput.nativeElement.focus ();
  }

  removeDynTableFilter(): void
  {
    this.dynTableLoading = true;
    this.dynTableData = null;
    this.dynTableFilterValues = null;
    this.dynTableSearchColumnFilter = false;
    this.msfContainerRef.msfDynamicTableRef.loadData (this.dynTableXAxis, this.dynTableYAxis, this.dynTableValues);
  }

  dynTableSearchWithFilter(dynTableFilterValues): void
  {
    this.dynTableFilterValues = dynTableFilterValues;
    this.dynTableLoading = true;
    this.dynTableSearchColumnFilter = false;
    this.msfContainerRef.msfDynamicTableRef.loadDataWithFilter (this.dynTableXAxis, this.dynTableYAxis, this.dynTableValues, this.dynTableFilterValues);
  }

  searchWithFilter(): void
  {
    let isMobile = false;

    if (this.searchFilter == null || this.searchFilter == "")
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "You must at least enter one letter to search for results." }
      });

      return;
    }

    this.searchColumnFilter = false;

    if (this.mobileQuery.matches)
      isMobile = true;

  	// for mobile devices
    this.globals.showCategoryArguments = false;
    this.globals.showIntroWelcome = false;
    this.globals.showTabs = true;

    // remove summary configuration
    this.partialSummaryValues = null;
    this.dynamicTableValues = null;
    this.dynTableFilterValues = null;
    this.dynTableData = null;

    if (this.globals.currentOption.metaData == 3)
    {
      this.configureCoordinates ();
      return;
    }

    this.globals.moreResults = false;
    this.globals.query = true;
    this.globals.mapsc = false;
    this.globals.tab = true;

    if (isMobile)
    {
      this.changeDetectorRef.detectChanges ();

      setTimeout (() => {
        this.startSearch ();
      }, 750);
    }
    else
      this.startSearch ();
  }

  clearSearchFilter(): void
  {
    this.search ();
  }

  setNameAirlines(data): void
  {
    this.nameAirlines = data;
  }
}
