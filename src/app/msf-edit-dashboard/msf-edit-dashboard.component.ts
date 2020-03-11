import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';

import { Globals } from '../globals/Globals';
import { MenuService } from '../services/menu.service';
import { MsfDashboardBrowserComponent } from '../msf-dashboard-browser/msf-dashboard-browser.component';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-msf-edit-dashboard',
  templateUrl: './msf-edit-dashboard.component.html'
})
export class MsfEditDashboardComponent {
  oldDashboardMenuTitle: string;
  currentDashboardMenuTitle: string;

  oldDashboardLocation: any;
  currentDashboardLocation: any;

  constructor(
    public dialogRef: MatDialogRef<MsfEditDashboardComponent>,
    public globals: Globals,
    private service: MenuService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.oldDashboardMenuTitle = data.currentDashboardMenu.title;
    this.currentDashboardMenuTitle = data.currentDashboardMenu.title;

    if (data.currentDashboardLocation.item)
    {
      this.oldDashboardLocation = {
        item: data.currentDashboardLocation.item,
        fullPath: data.currentDashboardLocation.fullPath
      };

      this.currentDashboardLocation = {
        item: data.currentDashboardLocation.item,
        fullPath: data.currentDashboardLocation.fullPath
      };
    }
    else
    {
      this.oldDashboardLocation = {
        item: null,
        fullPath: data.currentDashboardLocation.fullPath
      };

      this.currentDashboardLocation = {
        item: null,
        fullPath: data.currentDashboardLocation.fullPath
      };
    }
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
      let data;

      if (this.currentDashboardMenuTitle == null || this.currentDashboardMenuTitle.length == 0)
      {
        this.dialog.open (MessageComponent, {
          data: { title: "Error", message: "You must specify a title." }
        });

        return;
      }

      if (this.currentDashboardLocation == null)
      {
        this.dialog.open (MessageComponent, {
          data: { title: "Error", message: "You must select a location for the dashboard." }
        });

        return;
      }

      data = {
        dashboardId: this.data.currentDashboardMenu.id,
        title: this.currentDashboardMenuTitle,
        parentId: this.currentDashboardLocation.item != null ? this.currentDashboardLocation.item.id : 0
      };

      this.globals.isLoading = true;
      this.service.updateDashboard (this, data, this.changeHierarchy, this.closeDialog);
    }
    else
    {
      this.data.currentDashboardMenu.title = this.oldDashboardMenuTitle;
      this.data.currentDashboardLocation.item = this.oldDashboardLocation.item;
      this.data.currentDashboardLocation.fullPath = this.oldDashboardLocation.fullPath;

      this.dialogRef.close ();
    }
  }

  changeHierarchy(_this): void
  {
    if (_this.currentDashboardLocation.fullPath === _this.oldDashboardLocation.fullPath)
    {
      _this.dialogRef.close ();
      return;
    }

    _this.data.currentDashboardMenu.title = _this.currentDashboardMenuTitle;
    _this.data.currentDashboardLocation.item = _this.currentDashboardLocation.item;
    _this.data.currentDashboardLocation.fullPath = _this.currentDashboardLocation.fullPath;

    // remove dashboard from previous category
    for (let i = 0; i < _this.oldDashboardLocation.item.dashboards.length; i++)
    {
      let dashboard = _this.oldDashboardLocation.item.dashboards[i];

      if (_this.data.currentDashboardMenu.id == dashboard.id)
      {
        _this.oldDashboardLocation.item.dashboards.splice (i, 1);
        break;
      }
    }

    // add dashboard into new category
    for (let category of _this.data.dashboardCategories)
    {
      if (category.id == _this.data.currentDashboardLocation.item.id)
      {
        _this.data.currentDashboardLocation.item = category;
        break;
      }
    }

    _this.data.currentDashboardLocation.item.dashboards.push (_this.data.currentDashboardMenu);

    _this.globals.isLoading = false;
    _this.dialogRef.close ();
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

    dialogRef.afterClosed ().subscribe ((currentDashboardLocation) => {
      if (!currentDashboardLocation)
        return;

      this.currentDashboardLocation = currentDashboardLocation;
    });
  }
}
