import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-dashboard-color-picker',
  templateUrl: './msf-dashboard-color-picker.component.html'
})
export class MsfDashboardColorPickerComponent {

  constructor(
    public dialogRef: MatDialogRef<MsfDashboardColorPickerComponent>,
    public globals: Globals,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

    onNoClick(): void
    {
      this.dialogRef.close ();
    }

    closeDialog(): void
    {
      this.dialogRef.close ();
    }
}
