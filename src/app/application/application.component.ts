import { Component, OnInit, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { Menu } from '../model/Menu';
import { Option } from '../model/Option';
import { CategoryArguments } from '../model/CategoryArguments';
import { Globals } from '../globals/Globals';
import { Arguments } from '../model/Arguments';
import { MatDialog} from '@angular/material';
import { MsfDynamicTableVariablesComponent } from '../msf-dynamic-table-variables/msf-dynamic-table-variables.component';
import { MsfContainerComponent } from '../msf-container/msf-container.component';
import { MenuService } from '../services/menu.service';
import { Router } from '@angular/router';
import { ExcelService } from '../services/excel.service';
import { MsfTableComponent } from '../msf-table/msf-table.component';
import { PlanAdvanceFeatures } from '../model/PlanAdvanceFeatures';
import { User } from '../model/User';
import { DashboardMenu } from '../model/DashboardMenu';
import { MsfEditDashboardComponent } from '../msf-edit-dashboard/msf-edit-dashboard.component';
import { ApplicationService } from '../services/application.service';
import { MsfColumnSelectorComponent } from '../msf-column-selector/msf-column-selector.component';
import { MsfShareDashboardComponent } from '../msf-share-dashboard/msf-share-dashboard.component';
import { length } from '@amcharts/amcharts4/.internal/core/utils/Iterator';
import { AuthService } from '../services/auth.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { AuthGuard } from '../guards/auth.guard';


@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.css']
})
export class ApplicationComponent implements OnInit {

  isFullscreen: boolean;
  animal: string;
  name: string;
  dynamicTablePlan: boolean;
  exportExcelPlan: boolean;
  dashboardPlan: boolean;
  menu: Menu;
  dashboards: Array<DashboardMenu>;
  sharedDashboards: Array<DashboardMenu>;
  planAdvanceFeatures: any[];
  status: boolean;
  user: any[];
  userName : any;

  admin: boolean = false;
  ELEMENT_DATA: any[];
  //displayedColumns: string[] = [];
  variables;

  @ViewChild('msfContainerRef')
  msfContainerRef: MsfContainerComponent;

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(public dialog: MatDialog, public globals: Globals, private menuService: MenuService,private router: Router,private excelService:ExcelService,
    private appService: ApplicationService, private authService: AuthService,changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private authGuard: AuthGuard) {
    this.status = false;

    this.mobileQuery = media.matchMedia('(max-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.globals.clearVariables();
    this.getMenu();
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }


  validateAdmin(){
    this.menuService.getUserLoggedin(this, this.handleLogin, this.errorLogin);
  }

  handleLogin(_this,data){
    _this.user = data;
    _this.globals.currentUser = data.name;
    _this.userName = data.name;
    _this.admin = data.admin;
     _this.globals.isLoading = false;
  }

  errorLogin(_this,result){
    console.log(result);
     _this.globals.isLoading = false;
  }

  getDashboardsUser(){
    this.menuService.getDashboardsByUser(this, this.handlerDashboard, this.errorHandler);
  }

  handlerDashboard(_this, data){
    _this.dashboards = data;
    _this.menuService.getSharedDashboardsByUser(_this, _this.handlerSharedDashboard, _this.errorHandler);
  }

  handlerSharedDashboard(_this, data){
    _this.sharedDashboards = data;
    _this.getAdvanceFeatures();
  }

  errorHandler(_this,result){
    console.log(result);
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

    console.log(result);
    _this.validateAdmin ();
  }


  getMenu(){
    this.globals.isLoading = true;
    this.menuService.getMenu(this,this.handlerSuccess,this.handlerError);
  }

  handlerSuccess(_this,data){
    _this.menu = data;
    _this.temporalSelectOption(_this);
  }

  handlerError(_this,result){
    console.log(result);
    _this.getAdvanceFeatures();
  }


  temporalSelectOption(_this){
    _this.menu.categories.forEach(category => {
      category.options.forEach(option => {
        if(option.children.length>0){
          _this.recursiveSearch(option.children,_this,category);
        }else{
          if(option.id==166 && _this.globals.currentApplication.id==3){
            _this.globals.clearVariables();
            _this.globals.currentMenuCategory = category;
            _this.globals.currentOption = option;
            _this.globals.initDataSource();
            _this.globals.dataAvailabilityInit();
            _this.globals.status = true;
          }else if(option.id==64 && _this.globals.currentApplication.id==4){
            _this.globals.clearVariables();
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
      if(option.children.length>0){
        _this.recursiveSearch(option.children,_this,category);
      }else{
        if(option.id==166 && _this.globals.currentApplication.id==3){
          _this.globals.clearVariables();
          _this.globals.currentMenuCategory = category;
          _this.globals.currentOption = option;
          _this.globals.initDataSource();
          _this.globals.dataAvailabilityInit();
          _this.globals.status = true;
        }else if(option.id==64 && _this.globals.currentApplication.id==4){
          _this.globals.clearVariables();
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

  search(){
    this.globals.moreResults = false;
    this.globals.query = true;
    if(this.globals.currentOption.metaData==2){
      this.globals.mapsc=true;

    }else{
      this.globals.mapsc=false;
    }
    this.globals.tab = true;

    this.globals.isLoading = true;
    if(this.globals.currentOption.tabType === 'map'){
      this.globals.map = true;
      this.globals.showBigLoading = false;
      this.msfContainerRef.msfMapRef.getTrackingDataSource();
    }else if(this.globals.currentOption.tabType === 'usageStatistics'){
      this.msfContainerRef.msfTableRef.getDataUsageStatistics();
    }else if(this.globals.currentOption.tabType === 'scmap'){

    }else{
      this.globals.showBigLoading = false;
      this.globals.selectedIndex = 2;
    }

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
      if(this.globals.currentOption.metaData==2){
        this.globals.mapsc=true;

      }else{
        this.globals.mapsc=false;
      }
      this.globals.tab = true;

      this.globals.isLoading = true;
      if(this.globals.currentOption.tabType === 'map'){
        this.globals.map = true;
        this.globals.showBigLoading = false;
        this.msfContainerRef.msfMapRef.getTrackingDataSource();
      }else if(this.globals.currentOption.tabType === 'usageStatistics'){
        this.msfContainerRef.msfTableRef.getDataUsageStatistics();
      }else if(this.globals.currentOption.tabType === 'scmap'){
  
      }else{
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
    if(option && option.menuOptionArguments){
      for( let menuOptionArguments of option.menuOptionArguments){
          if(menuOptionArguments.categoryArguments){
            if( menuOptionArguments.categoryArguments){
              for( let i = 0; i < menuOptionArguments.categoryArguments.length;i++){
                let category: CategoryArguments = menuOptionArguments.categoryArguments[i];
                if(category && category.arguments){
                  for( let j = 0; j < category.arguments.length;j++){
                    let argument: Arguments = category.arguments[j];
                    if(argument.required==1){
                      if((argument.value1 == null || argument.value1 == "") || (argument.name2 && (argument.value2 == null || argument.value2 == ""))){
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
    this.globals.generateDynamicTable = true;
    const dialogRef = this.dialog.open(MsfDynamicTableVariablesComponent, {
      width: '600px',
      data: {metadata:this.msfContainerRef.msfTableRef.metadata, variables: this.variables}
    });

    const sub = dialogRef.componentInstance.dynamicTableOpen.subscribe(() => {
      this.msfContainerRef.msfDynamicTableRef.loadData();
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.animal = result;
    });
  }

  goHome(){
    this.router.navigate(["/welcome"]);
  }

  exportToExcel():void {
    this.excelService.exportAsExcelFile(this.msfContainerRef.msfTableRef.table, this.globals.currentOption.label);
  }

  isSimpleContent(): boolean {
    return (this.globals.currentOption === "dashboard" || !this.globals.currentOption);
  }

  logOut(){
    this.authGuard.disableSessionInterval ();
    this.authService.removeToken ();
    this.router.navigate (['']);
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
  }
}
