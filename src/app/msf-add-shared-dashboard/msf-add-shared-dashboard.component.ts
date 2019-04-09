import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';

import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-msf-add-shared-dashboard',
  templateUrl: './msf-add-shared-dashboard.component.html'
})
export class MsfAddSharedDashboardComponent implements OnInit {
  selectedOption: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<MsfAddSharedDashboardComponent>,
    public globals: Globals,
    public dialog: MatDialog,
    private service: ApplicationService,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
  }

  ngOnInit()
  {
  }

  addDashboard(): void
  {

  }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }
}
