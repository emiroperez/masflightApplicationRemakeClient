import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';

import { Globals } from '../globals/Globals';
import { MenuService } from '../services/menu.service';
import { ApplicationService } from '../services/application.service';
import { MessageComponent } from '../message/message.component';
import { MsfAddSharedDashboardPanelComponent } from '../msf-add-shared-dashboard-panel/msf-add-shared-dashboard-panel.component';
import { MsfAddSharedDashboardComponent } from '../msf-add-shared-dashboard/msf-add-shared-dashboard.component';

@Component({
  selector: 'app-msf-shared-dashboard-items',
  templateUrl: './msf-shared-dashboard-items.component.html'
})
export class MsfSharedDashboardItemsComponent implements OnInit {
  dashboardItems: any[] = [];
  selectedDashboardItem: any;

  constructor(
    public dialogRef: MatDialogRef<MsfSharedDashboardItemsComponent>,
    public globals: Globals,
    private menuService: MenuService,
    private appService: ApplicationService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
  }

  ngOnInit()
  {
    this.globals.popupLoading = true;
    this.menuService.getSharedContentByUser (this, this.contentSuccess, this.contentError);
  }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }

  contentSuccess(_this, data): void
  {
    let userIds = [];
    let items = data;

    for (let item of items)
    {
      let i;

      _this.dashboardItems.push ({
        id: item.dashboardContentId,
        name: item.name + " (" + (item.isPanel ? "Panel" : "Dashboard") + ", from ",
        isPanel: item.isPanel,
        userId: item.userId             // just to make things simpler
      });

      // add user ids just to get the email
      for (i = 0; i < userIds.length; i++)
      {
        if (userIds[i] == item.userId)
          break;
      }

      if (i == userIds.length)
        userIds.push (item.userId);
    }

    _this.appService.getUsersById (_this, userIds, _this.contentUsersSuccess, _this.contentError);
  }

  contentUsersSuccess(_this, data): void
  {
    let users = data;

    // add user name for each dashoard item
    for (let item of _this.dashboardItems)
    {
      for (let user of users)
      {
        if (item.userId == user.id)
        {
          item.name += user.name + ")";
          break;
        }
      }
    }

    _this.globals.popupLoading = false;
  }

  contentError(_this): void
  {
    _this.globals.popupLoading = false;
    _this.dialogRef.close ();

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to get the list of shared dashboard items." }
    });
  }

  addItem(): void
  {
    if (this.selectedDashboardItem.isPanel)
    {
      this.dialog.open (MsfAddSharedDashboardPanelComponent, {
        height: '340px',
        width: '400px',
        panelClass: 'msf-dashboard-control-variables-dialog',
        data: {
          panelId: this.selectedDashboardItem.id,
          dashboards: this.data.dashboards
        }
      });
    }
    else
    {
      this.dialog.open (MsfAddSharedDashboardComponent, {
        height: '183px',
        width: '400px',
        panelClass: 'msf-dashboard-control-variables-dialog',
        data: {
          dashboardId: this.selectedDashboardItem.id,
          dashboards: this.data.dashboards,
          sharedDashboards: this.data.sharedDashboards
        }
      });
    }
  }

  removeItem(): void
  {
    let shareInfo = {
      dashboardContentId: this.selectedDashboardItem.id,
      isPanel: this.selectedDashboardItem.isPanel,
      userId: this.selectedDashboardItem.userId
    };

    this.globals.popupLoading = true;
    this.appService.deleteSharedContent (this, shareInfo, this.removeSuccess, this.removeError);
  }

  removeSuccess(_this): void
  {
    for (let i = 0; i < _this.dashboardItems.length; i++)
    {
      if (_this.selectedDashboardItem == _this.dashboardItems[i])
      {
        _this.dashboardItems.splice (i, 1);
        break;
      }
    }

    _this.selectedDashboardItem = null;
    _this.globals.popupLoading = false;
  }

  removeError(_this): void
  {
    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to remove dashboard item." }
    });

    _this.globals.popupLoading = false;
  }
}
