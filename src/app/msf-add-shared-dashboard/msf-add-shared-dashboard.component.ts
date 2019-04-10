import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';

import { Globals } from '../globals/Globals';
import { MenuService } from '../services/menu.service';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-msf-add-shared-dashboard',
  templateUrl: './msf-add-shared-dashboard.component.html'
})
export class MsfAddSharedDashboardComponent implements OnInit {
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
    /*
    if (!this.isOwner)
    {
      this.globals.isLoading = true;
      this.service.addSharedReadOnlyDashboard (this, this.data.dashboardId, this.handlerReadOnlySuccess,
        this.handlerError);
      return;
    }
    */

    this.globals.isLoading = true;
    this.service.addSharedDashboard (this, this.data.dashboardId, this.handlerSuccess,
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
    _this.data.sharedDashboards.push (newDashboard);

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
    _this.data.dashboards.push (newDashboard);

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
}
