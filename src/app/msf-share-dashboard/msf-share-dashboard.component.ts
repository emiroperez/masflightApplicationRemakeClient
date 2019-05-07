import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { MenuService } from '../services/menu.service';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-msf-share-dashboard',
  templateUrl: './msf-share-dashboard.component.html'
})
export class MsfShareDashboardComponent implements OnInit {
  users: any[] = [];
  selectedUser: any;

  userNameList: any = [];
  selectedUserNames: any[] = [];

  dashboardItem: string;

  public userNameFilterCtrl: FormControl = new FormControl ();
  public filteredUserNames: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  private _onDestroy = new Subject<void> ();

  constructor(
    public dialogRef: MatDialogRef<MsfShareDashboardComponent>,
    public globals: Globals,
    private appService: ApplicationService,
    private menuService: MenuService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.dashboardItem = data.isPanel ? "Panel" : "Dashboard";
  }

  ngOnInit()
  {
    this.globals.popupLoading = true;

    if (this.data.isPanel)
      this.appService.getSharedContentByPanel (this, this.data.dashboardContentId, this.successHandler, this.errorHandler);
    else
      this.appService.getSharedContentByDashboard (this, this.data.dashboardContentId, this.successHandler, this.errorHandler);
  }

  ngOnDestroy()
  {
    this._onDestroy.next ();
    this._onDestroy.complete ();
  }

  private filterUserNames(): void
  {
    if (!this.userNameList)
      return;

    // get the search keyword
    let search = this.userNameFilterCtrl.value;
    if (!search)
    {
      this.filteredUserNames.next (this.userNameList.slice ());
      return;
    }

    search = search.toLowerCase ();
    this.filteredUserNames.next (
      this.userNameList.filter (a => a.email.toLowerCase ().indexOf (search) > -1)
    );
  }

  searchChange(): void
  {
    // listen for search field value changes
    this.userNameFilterCtrl.valueChanges
      .pipe (takeUntil (this._onDestroy))
      .subscribe (() => {
        this.filterUserNames ();
      });
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

    _this.menuService.getUsers (_this, _this.userSuccess, _this.errorHandler);
  }

  userSuccess(_this, data)
  {
    let users = data;

    for (let user of users)
      _this.userNameList.push (user);

    _this.filteredUserNames.next (_this.userNameList.slice ());
    _this.searchChange ();
    _this.globals.popupLoading = false;
  }

  errorHandler(_this): void
  {
    _this.globals.popupLoading = false;
    _this.dialogRef.close ();

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to get the list of users." }
    });
  }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }

  addUser(): void
  {
    let selectedUserNameEmails = [];

    for (let selectedUser of this.selectedUserNames)
      selectedUserNameEmails.push (selectedUser.email);

    this.globals.popupLoading = true;
    this.appService.getUsersByEmail (this, selectedUserNameEmails, this.foundUsers, this.addError);
    this.selectedUserNames = [];
  }

  foundUsers(_this, data): void
  {
    let skipUser, shareInfo, users, numAddedUsers;

    numAddedUsers = 0;
    shareInfo = [];
    skipUser = false;
    users = data;

    for (let user of users)
    {
      // verify if the user has been already added or not, skip if the user
      // is on the shared list
      for (let addedUser of _this.users)
      {
        if (user.email == addedUser.email)
        {
          skipUser = true;
          break;
        }
      }

      if (skipUser)
      {
        skipUser = false;
        numAddedUsers++;
        continue;
      }

      _this.users.push ({
        id: user.id,
        name: user.name,
        email: user.email
      });

      shareInfo.push ({
        userId: user.id,
        dashboardContentId: _this.data.dashboardContentId,
        isPanel: _this.data.isPanel,
        name: _this.data.dashboardContentTitle,
        applicationId: _this.globals.currentApplication.id
      });
    }

    // If all users are added into the list, show a dialog
    if (numAddedUsers == users.length)
    {
      _this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "You have already shared this " + this.dashboardItem.toLowerCase () + " with all the specified users." }
      });

      _this.globals.popupLoading = false;
      return;
    }

    _this.menuService.addSharedContent (_this, shareInfo, _this.addSuccess, _this.addError);
  }

  addSuccess(_this): void
  {
    _this.globals.popupLoading = false;
  }

  addError(_this): void
  {
    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to share with the new user." }
    });

    _this.globals.popupLoading = false;
  }

  removeUser(): void
  {
    let shareInfo = {
      dashboardContentId: this.data.dashboardContentId,
      userId: this.selectedUser.id,
      isPanel: this.data.isPanel
    };

    this.globals.popupLoading = true;
    this.appService.deleteSharedContent (this, shareInfo, this.removeSuccess, this.removeError);
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
    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to remove user." }
    });

    _this.globals.popupLoading = false;
  }
}
