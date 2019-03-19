import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Globals } from '../globals/Globals';
import { MenuService } from '../services/menu.service';

@Component({
  selector: 'app-msf-edit-dashboard',
  templateUrl: './msf-edit-dashboard.component.html'
})
export class MsfEditDashboardComponent {
  oldDashboardMenuTitle: string;
  currentDashboardMenuTitle: string;

  constructor(
    public dialogRef: MatDialogRef<MsfEditDashboardComponent>,
    public globals: Globals,
    private service: MenuService,
    @Inject(MAT_DIALOG_DATA) public data: any)
    {
      this.oldDashboardMenuTitle = data.currentDashboardMenu.title;
      this.currentDashboardMenuTitle = data.currentDashboardMenu.title;
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
        this.data.currentDashboardMenu.title = this.currentDashboardMenuTitle;
        this.service.updateDashboardTitle (this, this.data.currentDashboardMenu.id,
          this.currentDashboardMenuTitle, this.closeDialog, this.closeDialog);
      }
      else
      {
        this.data.currentDashboardMenu.title = this.oldDashboardMenuTitle;
        this.dialogRef.close ();
      }
    }

    closeDialog(_this)
    {
      _this.dialogRef.close ();
    }
}
