import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { MatDialog, MatMenuTrigger } from '@angular/material';
import { DatalakeCreateTableComponent } from '../datalake-create-table/datalake-create-table.component';
import { Globals } from '../globals/Globals';
import { MsfAddDashboardComponent } from '../msf-add-dashboard/msf-add-dashboard.component';
import { DashboardMenu } from '../model/DashboardMenu';
import { MsfSharedDashboardItemsComponent } from '../msf-shared-dashboard-items/msf-shared-dashboard-items.component';
import { DashboardCategory } from '../model/DashboardCategory';

@Component({
  selector: 'app-datalake-menu',
  templateUrl: './datalake-menu.component.html'
})
export class DatalakeMenuComponent implements OnInit {
  @Output('setOption')
  setOption = new EventEmitter();

  @Input("dashboardCategories")
  dashboardCategories: Array<DashboardCategory>;

  @Input("dashboards")
  dashboards: Array<DashboardMenu>;

  @Input("sharedDashboards")
  sharedDashboards: Array<DashboardMenu>;

  @Output('optionChanged')
  optionChanged = new EventEmitter ();

  @Output('refreshDataExplorer')
  refreshDataExplorer = new EventEmitter();

  dashbaordTrigger: MatMenuTrigger;
  currentDashboardTrigger: MatMenuTrigger;

  constructor(public globals: Globals, private dialog: MatDialog) { }

  ngOnInit()
  {
  }

  createTable(): void {
    let indexp = 1;
    let index = this.globals.optionsDatalake.findIndex(od => od.action.name === "Data Upload");
    if (index != -1) {
      indexp = 1;
    }else{
      indexp = 0;
    }
    let dialogRef = this.dialog.open(DatalakeCreateTableComponent, {
      panelClass: 'datalake-create-table-dialog',
      data: { index: indexp,createdTable: true }
    });

    dialogRef.afterClosed().subscribe(
      () => {
        this.globals.isLoading = false;
        this.refreshDataExplorer.emit(this.globals.optionDatalakeSelected);
    });
  }



  setOptionSelect(opcion) {
    this.globals.optionDatalakeSelected = opcion;
    let data = { schemaName: null, tableName: null }
    this.setOption.emit(data);
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
      height: '210px',
      width: '480px',
      panelClass: 'msf-dashboard-control-variables-dialog',
      data: {
        dashboards: this.dashboards,
        dashboardCategories: this.getTotalDashboardCategories ()
      }
    });
  }

  OptionDisable(option: any) {
      let index = this.globals.optionsDatalake.findIndex(od => od.action.option === option);
      if (index != -1) {
        return false;
      } else {
        if(option === "Datalake Explorer"){
          if(this.OptionDisable("Query Engine")){
            return this.actionDisable("Create New Table");
          }else{
            return false;
          }
        }
        //no encontro el dato
        return true;
      }
  }

  checkSharedItems() {
    this.dialog.open (MsfSharedDashboardItemsComponent, {
      height: '340px',
      width: '400px',
      panelClass: 'msf-dashboard-child-panel-dialog',
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

    this.globals.minDate=null;
    this.globals.maxDate=null;
    this.globals.showBigLoading = true;

    if (readOnly)
      this.globals.currentDashboardMenu = dashboard.dashboardMenuId;
    else
      this.globals.currentDashboardMenu = dashboard;

    this.globals.currentDashboardLocation = this.getDashboardFullPath (dashboard, arg);
    this.globals.currentOption = 'dashboard';
    this.globals.readOnlyDashboard = readOnly ? dashboard : null;
    this.globals.optionDatalakeSelected = 1;
    this.optionChanged.emit ();
  }

  actionDisable(option: any) {
    let index = this.globals.optionsDatalake.findIndex(od => od.action.name === option);
    if (index != -1) {
      return false;
    } else {
      //no encontro el dato
      return true;
    }
  }

  openDashboardMenu(menu, trigger)
  {
    menu.openMenu ();
    this.currentDashboardTrigger = menu;
  }

  setDashboard(event): void
  {
    this.goToDashboard (event.dashboard, event.readOnly);
  }

  goToCategoryAdministrator(): void
  {
    this.globals.minDate = null;
    this.globals.maxDate = null;
    this.globals.showBigLoading = true;
    this.globals.currentOption = 'categoryAdmin';
    this.globals.optionDatalakeSelected = 1;
    this.optionChanged.emit ();
  }
}
