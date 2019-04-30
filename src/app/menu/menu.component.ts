import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Menu } from '../model/Menu';
import { MatMenuTrigger } from '@angular/material';
import { MatDialog} from '@angular/material';
import { Globals } from '../globals/Globals';
import { OptionWelcomeComponent } from '../option-welcome/option-welcome.component';
import { DashboardMenu } from '../model/DashboardMenu';
import { MsfAddDashboardComponent } from '../msf-add-dashboard/msf-add-dashboard.component';
import { MsfSharedDashboardItemsComponent } from '../msf-shared-dashboard-items/msf-shared-dashboard-items.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  @Input("menu")
  menu: Menu;

  @Input("dashboards")
  dashboards: Array<DashboardMenu>;

  @Input("sharedDashboards")
  sharedDashboards: Array<DashboardMenu>;

  @Input('optionWelcomeComponent')
  optionWelcomeComponent: OptionWelcomeComponent;

  trigger: MatMenuTrigger;

  currentTrigger:MatMenuTrigger;

  constructor(public dialog: MatDialog, private globals : Globals) {

  }

  ngOnInit() {
  }

  openMenu(menu,trigger) {
    if(menu === this.currentTrigger)  {
      //if(!menu.menu.menuOpen()){
        menu.openMenu();
        this.currentTrigger = menu;
        console.log('mouseover');
      //}
    }else{
      menu.openMenu();
      this.currentTrigger = menu;
    }
    //this.trigger = menu;

  }

  addDashboard(){
    this.dialog.open (MsfAddDashboardComponent, {
      height: '160px',
      width: '400px',
      panelClass: 'msf-dashboard-control-variables-dialog',
      data: {
        dashboards: this.dashboards
      }
    });
  }

  checkSharedItems() {
    this.dialog.open (MsfSharedDashboardItemsComponent, {
      height: '340px',
      width: '400px',
      panelClass: 'msf-dashboard-child-panel-dialog',
      data: {
        dashboards: this.dashboards,
        sharedDashboards: this.sharedDashboards
      }
    });
  }

  goToDashboard(dashboard, readOnly): void
  {
    this.globals.minDate=null;
    this.globals.maxDate=null;
    this.globals.showBigLoading = true;
    this.globals.currentDashboardMenu = dashboard;
    this.globals.currentOption = 'dashboard';
    this.globals.readOnlyDashboard = readOnly;
  }

  setMenuCategory(category: any){
    if(this.globals.currentMenuCategory!=null){
      if(category.id!=this.globals.currentMenuCategory.id){
        this.globals.currentMenuCategory = category;
      }
    }else{
      this.globals.currentMenuCategory = category;
    }
  }

  closeMenu(menu, trigger) {
    if(menu === this.currentTrigger)  {
      //if(menu.menu.menuOpen()){
        menu.closeMenu();
        console.log('mouseout');
      //}
    }else{
        menu.closeMenu();
        console.log('mouseout');
    }

  }


}
