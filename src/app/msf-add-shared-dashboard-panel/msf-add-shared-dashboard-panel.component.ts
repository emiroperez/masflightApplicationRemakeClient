import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';

import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-msf-add-shared-dashboard-panel',
  templateUrl: './msf-add-shared-dashboard-panel.component.html'
})
export class MsfAddSharedDashboardPanelComponent implements OnInit {
  selectedDashboard: any;

  constructor(
    public dialogRef: MatDialogRef<MsfAddSharedDashboardPanelComponent>,
    public globals: Globals,
    public dialog: MatDialog,
    private service: ApplicationService,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
  }

  ngOnInit()
  {
  }

  addPanel(): void
  {
    this.globals.isLoading = true;
    this.service.addSharedPanel (this, this.selectedDashboard.id, this.data.panelId, this.handlerSuccess, this.handlerError);
  }

  handlerSuccess(_this): void
  {
    _this.globals.isLoading = false;
    _this.dialog.closeAll ();
  }

  handlerError(_this): void
  {

  }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }
}
