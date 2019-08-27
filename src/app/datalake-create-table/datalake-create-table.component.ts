import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-datalake-create-table',
  templateUrl: './datalake-create-table.component.html'
})
export class DatalakeCreateTableComponent {

  constructor(public dialogRef: MatDialogRef<DatalakeCreateTableComponent>) { }

  onNoClick(): void
  {
    this.dialogRef.close ();
  }
}
