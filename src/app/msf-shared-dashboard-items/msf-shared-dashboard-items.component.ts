import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Globals } from '../globals/Globals';
import { MenuService } from '../services/menu.service';
import { ApplicationService } from '../services/application.service';

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
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
  }

  ngOnInit()
  {
    this.globals.popupLoading = true;
    this.menuService.getSharedContentByUser (this, this.successHandler, this.errorHandler);
  }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }

  successHandler(_this, data): void
  {
    let items = data;

    for (let item of items)
    {
      _this.dashboardItems.push ({
        id: item.dashboardContentId,
        name: item.name + " (" + (item.isPanel ? "Panel" : "Dashboard" + ")"),
        isPanel: item.isPanel,
        userId: item.userId             // just to make things simpler
      });
    }

    _this.globals.popupLoading = false;
  }

  errorHandler(_this): void
  {
    _this.globals.popupLoading = false;
    // _this.dialogRef.close ();
  }

  addItem(): void
  {

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
    _this.globals.popupLoading = false;
  }
}
