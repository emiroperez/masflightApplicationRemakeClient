import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-msf-confirmation-dialog-datalake',
  templateUrl: './msf-confirmation-dialog-datalake.component.html'
})

export class MsfConfirmationDialogDatalakeComponent {
  public confirmMessage:string;
  constructor(public dialogRef: MatDialogRef<MsfConfirmationDialogDatalakeComponent>) { }

}