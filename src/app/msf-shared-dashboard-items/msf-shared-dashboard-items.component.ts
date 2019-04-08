import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Globals } from '../globals/Globals';
import { MenuService } from '../services/menu.service';

@Component({
  selector: 'app-msf-shared-dashboard-items',
  templateUrl: './msf-shared-dashboard-items.component.html'
})
export class MsfSharedDashboardItemsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<MsfSharedDashboardItemsComponent>,
    public globals: Globals,
    private service: MenuService,
    @Inject(MAT_DIALOG_DATA) public data: any)
    {
    }

  ngOnInit() {
  }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }
}
