import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Menu } from '../model/Menu';
import { Option } from '../model/Option';
import {CategoryArguments} from '../model/CategoryArguments';
import { Globals } from '../globals/Globals';
import { Arguments } from '../model/Arguments';
import { MatDialog} from '@angular/material';
import { MsfDynamicTableVariablesComponent } from '../msf-dynamic-table-variables/msf-dynamic-table-variables.component';
import { MsfContainerComponent } from '../msf-container/msf-container.component';
import { MenuService } from '../services/menu.service';
import { Router } from '@angular/router';
import {ExcelService} from '../services/excel.service';
import { MsfTableComponent } from '../msf-table/msf-table.component';
import { PlanAdvanceFeatures } from '../model/PlanAdvanceFeatures';
import { User } from '../model/User';
import { DashboardMenu } from '../model/DashboardMenu';
import { MsfEditDashboardComponent } from '../msf-edit-dashboard/msf-edit-dashboard.component';


@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.css']
})
export class ApplicationComponent implements OnInit {

  isFullscreen: boolean;
  animal: string;
  name: string;
  chartPlan: boolean;
  dynamicTablePlan: boolean;
  exportExcelPlan: boolean;
  dashboardPlan: boolean;
  menu: Menu;
  dashboards: Array<DashboardMenu>;
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

  constructor(public dialog: MatDialog, public globals: Globals, private service: MenuService,private router: Router,private excelService:ExcelService) {
    this.status = false;
  }

  ngOnInit() {
    this.globals.clearVariables();
    this.getMenu();


  }


  validateAdmin(){
    this.service.getUserLoggedin(this, this.handleLogin, this.errorLogin);
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
    this.globals.isLoading = true;
    this.service.getDashboardsByUser(this,this.handlerDashboard, this.errorHandler);
  }

  handlerDashboard(_this, data){
    _this.dashboards = data;
    _this.getAdvanceFeatures();
  }

  errorHandler(_this,result){
    console.log(result);
    _this.globals.isLoading = false;
  }
  getAdvanceFeatures(){
    this.globals.isLoading = true;
    this.service.getAdvanceFeatures(this,this.handlerSuccessAF,this.handlerErrorAF);

    }

  handlerSuccessAF(_this,data){
    _this.planAdvanceFeatures = data;
    _this.planAdvanceFeatures.forEach(item => {
      item.advanceFeatureId == 1 ? _this.chartPlan = true : false;
      item.advanceFeatureId == 2 ? _this.dashboardPlan = true : false;
      item.advanceFeatureId == 3 ? _this.dynamicTablePlan = true : false;
      item.advanceFeatureId == 4 ? _this.exportExcelPlan = true : false;
    });

    _this.validateAdmin ();
  }

  handlerErrorAF(_this,result){
    console.log(result);
    _this.validateAdmin ();
  }


  getMenu(){
    this.service.getMenu(this,this.handlerSuccess,this.handlerError);
  }

  handlerSuccess(_this,data){
    _this.menu = data;
    _this.temporalSelectOption(_this);
  }

  handlerError(_this,result){
    console.log(result);
    _this.globals.isLoading = false;
    _this.getAdvanceFeatures();
  }


  temporalSelectOption(_this){
    _this.globals.isLoading = true;
    _this.menu.categories.forEach(category => {
      category.options.forEach(option => {
        if(option.id==100 && this.globals.currentApplication.id==3){
          _this.globals.clearVariables();
          this.globals.currentMenuCategory = category;
          _this.globals.currentOption = option;
          _this.globals.initDataSource();
          _this.globals.dataAvailabilityInit();
          _this.globals.status = true;
          _this.globals.isLoading = false;
        }else if(option.id==14 && this.globals.currentApplication.id==4){
          _this.globals.clearVariables();
          this.globals.currentMenuCategory = category;
          _this.globals.currentOption = option;
          _this.globals.initDataSource();
          _this.globals.dataAvailabilityInit();
          _this.globals.status = true;
          _this.globals.isLoading = false;
        }
      });
    });
    _this.getDashboardsUser();

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

    setTimeout(() => {
      this.search2();
  }, 3000);

  }

  search2(){
    if(this.globals.currentOption.tabType === 'map'){
      this.globals.map = true;
      this.msfContainerRef.msfMapRef.getTrackingDataSource();
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

      setTimeout(() => {
        this.moreResults2();
    }, 3000);
    }
  }

  moreResults2(){
    if(this.globals.currentOption.tabType === 'map'){
      this.globals.map = true;
      this.msfContainerRef.msfMapRef.getTrackingDataSource();
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
                    if(argument.required){
                      if(argument.value1 == null || (argument.name2 && argument.value2 == null)){
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
    window.localStorage.removeItem("token");
    this.router.navigate(['']);
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
    if (event.target.innerHeight == window.screen.height && event.target.innerWidth == window.screen.width)
      this.globals.isFullscreen = true;
    else
    this.globals.isFullscreen = false;
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
}
