import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Globals } from '../globals/Globals';
import { MenuService } from '../services/menu.service';
import { DashboardMenu } from '../model/DashboardMenu';

@Component({
  selector: 'app-msf-add-dashboard',
  templateUrl: './msf-add-dashboard.component.html'
})
export class MsfAddDashboardComponent {

  title: string;

  constructor(
    public dialogRef: MatDialogRef<MsfAddDashboardComponent>,
    public globals: Globals,
    private service: MenuService,
    @Inject(MAT_DIALOG_DATA) public data: any)
    {
    }

    onNoClick(): void
    {
      this.dialogRef.close ();
    }

    confirmChanges(confirm: boolean): void
    {
      // update database if confirmed, otherwise discard the title change
      if (confirm)
      {
        let dashboard = new DashboardMenu();
        dashboard.title = this.title;
        dashboard.applicationId = this.globals.currentApplication.id;
        console.log(dashboard);
        this.globals.isLoading = true;
        this.service.addDashboard(this, dashboard, this.successHandler, this.errorHandler);

        this.dialogRef.close ();
      }
    }

    successHandler(_this,data){
      _this.data.dashboards.push (data);
      _this.globals.currentDashboardMenu = _this.data.dashboards[_this.data.dashboards.length - 1];
      _this.globals.currentOption = 'dashboard';
    }

    errorHandler(_this,result){
      console.log(result);
      _this.globals.isLoading = false;
    }
    closeDialog(_this)
    {
      _this.globals.isLoading = false;
      _this.dialogRef.close ();
    }
}
