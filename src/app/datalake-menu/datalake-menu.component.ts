import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DatalakeCreateTableComponent } from '../datalake-create-table/datalake-create-table.component';
import { Globals } from '../globals/Globals';
import { MsfAddDashboardComponent } from '../msf-add-dashboard/msf-add-dashboard.component';
import { DashboardMenu } from '../model/DashboardMenu';

@Component({
  selector: 'app-datalake-menu',
  templateUrl: './datalake-menu.component.html'
})
export class DatalakeMenuComponent implements OnInit {
  @Output('setOption')
  setOption = new EventEmitter();

  @Input("dashboards")
  dashboards: Array<DashboardMenu>;

  @Input("sharedDashboards")
  sharedDashboards: Array<DashboardMenu>;

  @Output('optionChanged')
  optionChanged = new EventEmitter ();

  constructor(public globals: Globals, private dialog: MatDialog) { }

  ngOnInit() {
    this.globals.optionDatalakeSelected = 2;
  }

  createTable(): void {
    let indexp = 1;
    let index = this.globals.optionsDatalake.findIndex(od => od.action.name === "Create New Table");
    if (index != -1) {
      indexp = 0;
    }else{
      indexp = 1;
    }
    let dialogRef = this.dialog.open(DatalakeCreateTableComponent, {
      panelClass: 'datalake-create-table-dialog',
      data: { index: indexp }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.globals.isLoading = false;
    });
  }

  setOptionSelect(opcion) {
    this.globals.optionDatalakeSelected = opcion;
    let data = { schemaName: null, tableName: null }
    this.setOption.emit(data);
  }

  addDashboard(){
    this.dialog.open (MsfAddDashboardComponent, {
      height: '160px',
      width: '400px',
      panelClass: 'msf-dashboard-control-variables-dialog',
      data: {
        // dashboards: this.dashboards
        dashboards: null
      }
    });
  }

  OptionDisable(option: any) {
      let index = this.globals.optionsDatalake.findIndex(od => od.action.option === option);
      if (index != -1) {
        return false;
      } else {
        return true;
      }
  }
  
  goToDashboard(dashboard, readOnly): void
  {
    this.globals.minDate=null;
    this.globals.maxDate=null;
    this.globals.showBigLoading = true;
    this.globals.currentDashboardMenu = dashboard;
    this.globals.currentOption = 'dashboard';
    this.globals.readOnlyDashboard = readOnly;
    this.globals.optionDatalakeSelected = 1
    this.optionChanged.emit ();
  }
}
