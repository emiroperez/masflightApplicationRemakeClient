import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';

import { Globals } from '../globals/Globals';
import { MenuService } from '../services/menu.service';
import { DashboardMenu } from '../model/DashboardMenu';
import { MessageComponent } from '../message/message.component';
import { MsfDashboardBrowserComponent } from '../msf-dashboard-browser/msf-dashboard-browser.component';

@Component({
  selector: 'app-msf-add-dashboard',
  templateUrl: './msf-add-dashboard.component.html'
})
export class MsfAddDashboardComponent {

  title: string;
  selectedLocation: any = null;

  constructor(
    public dialogRef: MatDialogRef<MsfAddDashboardComponent>,
    public globals: Globals,
    public dialog: MatDialog,
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
      let dashboard = new DashboardMenu ();
      let currentApplication;

      if (this.title == null || this.title.length == 0)
      {
        this.dialog.open (MessageComponent, {
          data: { title: "Error", message: "You must specify a title." }
        });

        return;
      }

      if (this.selectedLocation == null)
      {
        this.dialog.open (MessageComponent, {
          data: { title: "Error", message: "You must select a location for the dashboard." }
        });

        return;
      }

      dashboard.title = this.title;

      if (this.selectedLocation.item.id != 0)
      {
        dashboard.parent = {
          id: this.selectedLocation.item.id
        };
      }
      else
        dashboard.parent = null;

      currentApplication = localStorage.getItem ("currentApplication");
      if(!this.globals.currentApplication)
        this.globals.currentApplication = currentApplication;

      dashboard.applicationId = this.globals.currentApplication.id;

      this.globals.isLoading = true;
      this.service.addDashboard(this, dashboard, this.successHandler, this.errorHandler);

      this.dialogRef.close ();
    }
  }

  successHandler(_this,data)
  {
    if (data.parentId == null)
    {
      _this.data.dashboards.push (data);
      _this.globals.currentDashboardMenu = _this.data.dashboards[_this.data.dashboards.length - 1];
      _this.globals.currentDashboardLocation = {
        item: null,
        fullPath: "/"
      };
    }
    else
    {
      _this.globals.currentDashboardLocation = _this.selectedLocation;

      for (let category of _this.data.dashboardCategories)
      {
        if (category.id == _this.globals.currentDashboardLocation.item.id)
        {
          _this.globals.currentDashboardLocation.item = category;
          break;
        }
      }

      _this.globals.currentDashboardLocation.item.dashboards.push (data);
      _this.globals.currentDashboardMenu = _this.globals.currentDashboardLocation.item.dashboards[_this.globals.currentDashboardLocation.item.dashboards.length - 1];
    }

    _this.globals.currentOption = 'dashboard';
    _this.globals.optionDatalakeSelected = 1;
  }

  errorHandler(_this,result)
  {
    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to add dashboard." }
    });

    _this.globals.isLoading = false;
  }

  closeDialog(_this)
  {
    _this.globals.isLoading = false;
    _this.dialogRef.close ();
  }
  
  openDashboardBrowser(): void
  {
    let dialogRef = this.dialog.open (MsfDashboardBrowserComponent, {
      panelClass: 'dashboard-config-dialog',
      autoFocus: false,
      data: {}
    });
  
    dialogRef.afterClosed ().subscribe ((selectedLocation) => {
      if (!selectedLocation)
        return;
  
      this.selectedLocation = selectedLocation;
    });
  }
}
