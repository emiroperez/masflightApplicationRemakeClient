import { Component, OnInit, Inject } from '@angular/core';
import { Globals } from '../globals/Globals';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Utils } from '../commons/utils';

@Component({
  selector: 'app-dialog-argument-preview',
  templateUrl: './dialog-argument-preview.component.html'
})
export class DialogArgumentPreviewComponent implements OnInit {
  argList: any[];

  constructor(public dialogRef: MatDialogRef<DialogArgumentPreviewComponent>,
    public globals: Globals,
    public utils: Utils,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.argList = JSON.parse (JSON.stringify (data.arguments));
  }

  ngOnInit() {
  }

  onNoClick(): void
  {
    this.dialogRef.close ();
  }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }

}
