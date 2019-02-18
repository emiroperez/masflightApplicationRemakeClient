import { Component, OnInit, ViewChild} from '@angular/core';
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


@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.css']
})
export class ApplicationComponent implements OnInit {

  animal: string;
  name: string;
  chartPlan: boolean;
  dynamicTablePlan: boolean;
  exportExcelPlan: boolean;
  dashboardPlan: boolean;
  menu: Menu;
  planAdvanceFeatures: any[];
  status: boolean;
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
    this.getAdvanceFeatures();
  }


  getAdvanceFeatures(){
    this.service.getAdvanceFeatures(this,this.handlerSuccessAF,this.handlerErrorAF)

    }

  handlerSuccessAF(_this,data){
    _this.planAdvanceFeatures = data;
    _this.planAdvanceFeatures.forEach(item => {
      item.advanceFeatureId == 1 ? _this.chartPlan = true : false;
      item.advanceFeatureId == 2 ? _this.dashboardPlan = true : false;
      item.advanceFeatureId == 3 ? _this.dynamicTablePlan = true : false;
      item.advanceFeatureId == 4 ? _this.exportExcelPlan = true : false;
    });
    _this.globals.isLoading = false;
  }

  handlerErrorAF(_this,result){
    console.log(result);
    _this.globals.isLoading = false;
  }


  getMenu(){
    this.service.getMenu(this,this.handlerSuccess,this.handlerError);
  }

  handlerSuccess(_this,data){
    _this.menu = data;
    _this.globals.isLoading = false;
  }

  handlerError(_this,result){
    console.log(result);
    _this.globals.isLoading = false;
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

  goToDashboard(): void
  {
    this.globals.currentOption = 'dashboard';
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
}
