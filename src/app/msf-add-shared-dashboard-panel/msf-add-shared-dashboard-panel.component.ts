import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';

import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { MessageComponent } from '../message/message.component';

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
    // refresh dashboard if the shared panel is to be added on a dashboard the user is watching
    if (_this.globals.currentDashboardMenu != null && _this.globals.currentDashboardMenu.id == _this.selectedDashboard.id)
    {
      _this.globals.currentDashboardMenu = null;
      _this.globals.currentDashboardLocation = null;

      setTimeout(() => {
        _this.globals.currentDashboardMenu = _this.selectedDashboard;
        // TODO: Set full path
      }, 100);
    }
    else
      _this.globals.isLoading = false;

    _this.dialog.closeAll ();
  }

  handlerError(_this): void
  {
    _this.dialog.closeAll ();

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to add shared dashboard panel." }
    });

    _this.globals.isLoading = false;
  }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }
}
