import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-dashboard-child-panel',
  templateUrl: './msf-dashboard-child-panel.component.html'
})
export class MsfDashboardChildPanelComponent {

  constructor(
    public dialogRef: MatDialogRef<MsfDashboardChildPanelComponent>,
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
