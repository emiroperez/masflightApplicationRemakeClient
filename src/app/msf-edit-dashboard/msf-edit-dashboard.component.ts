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

      this.data.currentDashboardMenu.title = this.currentDashboardMenuTitle;
      this.data.currentDashboardLocation.item = this.currentDashboardLocation.item;
      this.data.currentDashboardLocation.fullPath = this.currentDashboardLocation.fullPath;

      this.service.updateDashboardTitle (this, this.data.currentDashboardMenu.id,
        this.currentDashboardMenuTitle, this.closeDialog, this.closeDialog);
    }
    else
    {
      this.data.currentDashboardMenu.title = this.oldDashboardMenuTitle;
      this.data.currentDashboardLocation.item = this.oldDashboardLocation.item;
      this.data.currentDashboardLocation.fullPath = this.oldDashboardLocation.fullPath;

      this.dialogRef.close ();
    }
  }

  closeDialog(_this)
  {
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
      if (!currentDashboardLocation || currentDashboardLocation.fullPath == this.currentDashboardLocation.fullPath)
        return;

      // this.oldDashboardLocation.item.splice (, 1);
      // this.currentDashboardLocation.item.dashboards.push (data.currentDashboardMenu);
      this.currentDashboardLocation = currentDashboardLocation;
      // TODO: Find original location and delete it if changed
    });
  }
}
