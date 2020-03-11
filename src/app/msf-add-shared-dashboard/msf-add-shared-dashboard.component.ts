import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';

import { Globals } from '../globals/Globals';
import { MenuService } from '../services/menu.service';
import { MessageComponent } from '../message/message.component';
import { MsfDashboardBrowserComponent } from '../msf-dashboard-browser/msf-dashboard-browser.component';
import { DashboardCategory } from '../model/DashboardCategory';

@Component({
  selector: 'app-msf-add-shared-dashboard',
  templateUrl: './msf-add-shared-dashboard.component.html'
})
export class MsfAddSharedDashboardComponent implements OnInit {
  selectedLocation: any = null;
  isOwner: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<MsfAddSharedDashboardComponent>,
    public globals: Globals,
    public dialog: MatDialog,
    private service: MenuService,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
  }

  ngOnInit()
  {
  }

  addDashboard(): void
  {
    let data = {
      dashboardId: this.data.dashboardId,
      parentId: this.selectedLocation.item != null ? this.selectedLocation.item.id : 0
    };

    if (this.selectedLocation == null)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "You must select a location for the dashboard." }
      });

      return;
    }

    if (!this.isOwner)
    {
      this.globals.isLoading = true;
      this.service.addSharedReadOnlyDashboard (this, data, this.handlerReadOnlySuccess,
        this.handlerError);
      return;
    }

    this.globals.isLoading = true;
    this.service.addSharedDashboard (this, data, this.handlerSuccess,
      this.handlerError);
  }

  handlerReadOnlySuccess(_this, data): void
  {
    let newDashboard = data;

    if (!newDashboard)
    {
      _this.handlerError (_this);
      return;
    }

    // add read-only dashboard into the menu
    if (_this.selectedLocation.item == null)
      _this.data.sharedDashboards.push (newDashboard);
    else
    {
      for (let category of _this.data.dashboardCategories)
      {
        if (category.id == _this.selectedLocation.item.id)
        {
          _this.selectedLocation.item = category;
          break;
        }
      }

      _this.selectedLocation.item.sharedDashboards.push (newDashboard);
    }

    _this.globals.isLoading = false;
    _this.dialog.closeAll ();

    _this.dialog.open (MessageComponent, {
      data: { title: "Success", message: "Shared dashboard has been added into the menu." }
    });
  }

  handlerSuccess(_this, data): void
  {
    let newDashboard = data;

    if (!newDashboard)
    {
      _this.handlerError (_this);
      return;
    }

    // add dashboard into the menu
    if (_this.selectedLocation.item == null)
      _this.data.dashboards.push (newDashboard);
    else
    {
      for (let category of _this.data.dashboardCategories)
      {
        if (category.id == _this.selectedLocation.item.id)
        {
          _this.selectedLocation.item = category;
          break;
        }
      }

      _this.selectedLocation.item.dashboards.push (newDashboard);
    }

    _this.globals.isLoading = false;
    _this.dialog.closeAll ();

    _this.dialog.open (MessageComponent, {
      data: { title: "Success", message: "Shared dashboard has been added into the menu." }
    });
  }

  handlerError(_this): void
  {
    _this.dialog.closeAll ();

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to add shared dashboard." }
    });

    _this.globals.isLoading = false;
  }

  closeDialog(): void
  {
    this.dialogRef.close ();
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
