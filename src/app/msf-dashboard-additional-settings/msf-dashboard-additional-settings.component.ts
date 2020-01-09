import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-dashboard-additional-settings',
  templateUrl: './msf-dashboard-additional-settings.component.html'
})
export class MsfDashboardAdditionalSettingsComponent {
  advSettingsOpen: number = 0;

  constructor(
    public dialogRef: MatDialogRef<MsfDashboardAdditionalSettingsComponent>,
    public globals: Globals,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    if (!data.limitConfig)
      this.advSettingsOpen = 2; // open color picker by default if there is no limit configuration for now

    if (data.values.limitMode == null)
      data.values.limitMode = 0;

    if (data.values.limitAmount == null)
      data.values.limitAmount = 10;
  }

  trackColor(index): number
  {
    return index;
  }

  addThreshold(): void
  {
    this.data.values.thresholds.push ({
      min: 0,
      max: 0,
      color: "#000000"
    });
  }

  removeThreshold(): void
  {
    if (this.data.values.thresholds.length)
      this.data.values.thresholds.pop ();
  }

  onNoClick(): void
  {
    this.dialogRef.close ();
  }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }

  componentClickHandler(index: number)
  {
    if (this.advSettingsOpen == index)
      this.advSettingsOpen = 0; // close if open
    else
      this.advSettingsOpen = index;
  }
}
