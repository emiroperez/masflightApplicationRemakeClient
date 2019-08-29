import { Component } from '@angular/core';
import { MatDialogRef, MatStepper, MatDialog } from '@angular/material';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-datalake-create-table',
  templateUrl: './datalake-create-table.component.html'
})
export class DatalakeCreateTableComponent {
  constructor(public dialogRef: MatDialogRef<DatalakeCreateTableComponent>)
  { }

  onNoClick(): void
  {
    this.dialogRef.close ();
  }
}
