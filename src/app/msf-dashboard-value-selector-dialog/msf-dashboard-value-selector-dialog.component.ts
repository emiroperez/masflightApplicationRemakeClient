import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-msf-dashboard-value-selector-dialog',
  templateUrl: './msf-dashboard-value-selector-dialog.component.html'
})
export class MsfDashboardValueSelectorDialogComponent
{
  constructor(public dialogRef: MatDialogRef<MsfDashboardValueSelectorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void
  {
    this.dialogRef.close ();
  }
}
