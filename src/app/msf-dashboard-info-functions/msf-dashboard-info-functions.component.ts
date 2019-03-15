import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-dashboard-info-functions',
  templateUrl: './msf-dashboard-info-functions.component.html'
})
export class MsfDashboardInfoFunctionsComponent {

  constructor(
    public dialogRef: MatDialogRef<MsfDashboardInfoFunctionsComponent>,
    public globals: Globals,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

    onNoClick(): void
    {
      this.dialogRef.close ();
    }

    closeDialog(): void
    {
      this.dialogRef.close ();
    }
}
