import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-msf-select-data-from',
  templateUrl: './msf-select-data-from.component.html'
})
export class MsfSelectDataFromComponent {

  constructor(public dialogRef: MatDialogRef<MsfSelectDataFromComponent>) { }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }
}
