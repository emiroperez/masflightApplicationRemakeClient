import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Globals } from '../globals/Globals';
import { MenuService } from '../services/menu.service';

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
    private service: MenuService,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.dashboardItem = data.isPanel ? "Panel" : "Dashboard";
  }

  ngOnInit() {
  }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }

  addUser(): void
  {
    this.users.push ({
      name: this.userName
    });

    this.userName = "";
  }

  removeUser(): void
  {
    for (let i = 0; i < this.users.length; i++)
    {
      if (this.selectedUser == this.users[i])
      {
        this.users.splice (i, 1);
        break;
      }
    }

    this.selectedUser = null;
  }
}
