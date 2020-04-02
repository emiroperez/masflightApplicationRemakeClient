import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Menu } from '../model/Menu';
import { MatMenuTrigger } from '@angular/material';
import { MatDialog} from '@angular/material';
import { Globals } from '../globals/Globals';
import { OptionWelcomeComponent } from '../option-welcome/option-welcome.component';
import { DashboardMenu } from '../model/DashboardMenu';
import { MsfAddDashboardComponent } from '../msf-add-dashboard/msf-add-dashboard.component';
import { MsfSharedDashboardItemsComponent } from '../msf-shared-dashboard-items/msf-shared-dashboard-items.component';
import { DashboardCategory } from '../model/DashboardCategory';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  @Input("menu")
  menu: Menu;

  @Input("dashboardCategories")
  dashboardCategories: Array<DashboardCategory>;

  @Input("dashboards")
  dashboards: Array<DashboardMenu>;

  @Input("sharedDashboards")
  sharedDashboards: Array<DashboardMenu>;

  @Input('optionWelcomeComponent')
  optionWelcomeComponent: OptionWelcomeComponent;

  @Output('optionChanged')
  optionChanged = new EventEmitter ();

  @Output('cancelLoadingFromLastService')
  cancelLoadingFromLastService = new EventEmitter ();

  trigger: MatMenuTrigger;
  currentTrigger: MatMenuTrigger;

  dashbaordTrigger: MatMenuTrigger;
  currentDashboardTrigger: MatMenuTrigger;

  constructor(public dialog: MatDialog, private globals : Globals) {

  }

  ngOnInit() {
  }

  openMenu(menu, trigger)
  {
    menu.openMenu();
    this.currentTrigger = menu;
  }

  openDashboardMenu(menu, trigger)
  {
    menu.openMenu ();
    this.currentDashboardTrigger = menu;
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

  addDashboard()
  {
    this.dialog.open (MsfAddDashboardComponent, {
      height: '300px',
      width: '480px',
      panelClass: 'msf-dashboard-control-variables-dialog',
      data: {
        dashboards: this.dashboards,
        dashboardCategories: this.getTotalDashboardCategories ()
      }
    });
  }

  checkSharedItems() {
    this.dialog.open (MsfSharedDashboardItemsComponent, {
      height: '340px',
      width: '400px',
      panelClass: 'msf-shared-dashboard-dialog',
      data: {
        dashboards: this.dashboards,
        sharedDashboards: this.sharedDashboards,
        dashboardCategories: this.getTotalDashboardCategories ()
      }
    });
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

  goToDashboard(dashboard, readOnly): void
  {
    let arg = {
      item: null,
      fullPath: "/"
    };

    this.cancelLoadingFromLastService.emit ();

    // this is for the mobile version
    this.globals.showCategoryArguments = false;
    this.globals.showMenu = false;
    this.globals.showIntroWelcome = false;
    this.globals.showDashboard = true;

    this.globals.minDate=null;
    this.globals.maxDate=null;

    if (readOnly)
      this.globals.currentDashboardMenu = dashboard.dashboardMenuId;
    else
      this.globals.currentDashboardMenu = dashboard;

    this.globals.currentDashboardLocation = this.getDashboardFullPath (dashboard, arg);
    this.globals.currentOption = 'dashboard';
    this.globals.readOnlyDashboard = readOnly ? dashboard : null;
    this.optionChanged.emit ();
  }

  setMenuCategory(category: any){
    if(this.globals.currentMenuCategory!=null){
      if(category.id!=this.globals.currentMenuCategory.id){
        this.globals.currentMenuCategory = category;
        this.globals.welcomeMessage = this.globals.currentMenuCategory.welcome.description;
      }
    }else{
      this.globals.currentMenuCategory = category;
      this.globals.welcomeMessage = this.globals.currentMenuCategory.welcome.description;
    }
  }

  setDashboardMenuCategory(category: any)
  {
    this.globals.currentMenuCategory = null;
  }

  closeMenu(menu, trigger) {
    if(menu === this.currentTrigger)  {
      //if(menu.menu.menuOpen()){
        menu.closeMenu();
      //}
    }else{
        menu.closeMenu();
    }

  }

  optionChangedFromChildren()
  {
    this.optionChanged.emit ();
  }

  setDashboard(event): void
  {
    this.goToDashboard (event.dashboard, event.readOnly);
  }

  goToCategoryManager(): void
  {
    this.cancelLoadingFromLastService.emit ();

    // this is for the mobile version
    this.globals.showCategoryArguments = false;
    this.globals.showMenu = false;
    this.globals.showIntroWelcome = false;
    this.globals.showDashboard = true;

    this.globals.minDate = null;
    this.globals.maxDate = null;
    this.globals.currentOption = 'categoryAdmin';
    this.optionChanged.emit ();
  }
}
