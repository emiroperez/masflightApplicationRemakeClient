import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-msf-confirmation-dialog',
  templateUrl: './msf-confirmation-dialog.component.html'
})
export class MsfConfirmationDialogComponent {
  public confirmMessage:string;

  constructor(public dialogRef: MatDialogRef<MsfConfirmationDialogComponent>) {}
}
