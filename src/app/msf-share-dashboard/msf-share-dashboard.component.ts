import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-msf-share-dashboard',
  templateUrl: './msf-share-dashboard.component.html'
})
export class MsfShareDashboardComponent implements OnInit {
  users: any[] = [];
  userName: string = "";
  selectedUser: any;

  dashboardItem: string;

  constructor(
    public dialogRef: MatDialogRef<MsfShareDashboardComponent>,
    public globals: Globals,
    private service: ApplicationService,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.dashboardItem = data.isPanel ? "Panel" : "Dashboard";
  }

  ngOnInit()
  {
    this.globals.popupLoading = true;

    if (this.data.isPanel)
      this.service.getSharedContentByPanel (this, this.data.dashboardContentId, this.successHandler, this.errorHandler);
    else
      this.service.getSharedContentByDashboard (this, this.data.dashboardContentId, this.successHandler, this.errorHandler);
  }

  successHandler(_this, data): void
  {
    let users = data;

    for (let user of users)
    {
      _this.users.push ({
        id: user.id,
        name: user.name,
        email: user.email
      });
    }

    _this.globals.popupLoading = false;
  }

  errorHandler(_this): void
  {
    _this.globals.popupLoading = false;
    // _this.dialogRef.close ();
  }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }

  addUser(): void
  {
    for (let user of this.users)
    {
      if (user.email === this.userName)
      {
        // already shared with this user
        this.userName = "";
        return;
      }
    }

    this.globals.popupLoading = true;
    this.service.getUserByEmail (this, this.userName, this.foundUser, this.addError);
    this.userName = "";
  }

  foundUser(_this, data): void
  {
    let shareInfo;

    // the specified user name must not be as the user
    if (data.name === _this.globals.currentUser)
    {
      // TODO: Show dialog
      _this.globals.popupLoading = false;
      return;
    }

    _this.users.push ({
      id: data.id,
      name: data.name,
      email: data.email
    });

    shareInfo = {
      userId: data.id,
      dashboardContentId: _this.data.dashboardContentId,
      isPanel: _this.data.isPanel
    };

    _this.service.addSharedContent (_this, shareInfo, _this.addSuccess, _this.addError);
  }

  addSuccess(_this): void
  {
    _this.globals.popupLoading = false;
  }

  addError(_this): void
  {
    // TODO: Display error dialog
    _this.globals.popupLoading = false;
  }

  removeUser(): void
  {
    let shareInfo = {
      userId: this.selectedUser.id,
      isPanel: this.data.isPanel
    };

    this.globals.popupLoading = true;
    this.service.deleteSharedContent (this, shareInfo, this.removeSuccess, this.removeError);
  }

  removeSuccess(_this): void
  {
    for (let i = 0; i < _this.users.length; i++)
    {
      if (_this.selectedUser == _this.users[i])
      {
        _this.users.splice (i, 1);
        break;
      }
    }

    _this.selectedUser = null;
    _this.globals.popupLoading = false;
  }

  removeError(_this): void
  {
    // TODO: Display error dialog
    _this.globals.popupLoading = false;
  }
}
