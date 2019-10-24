import { Component, OnInit, Inject } from '@angular/core';
import { Globals } from '../globals/Globals';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Utils } from '../commons/utils';

@Component({
  selector: 'app-dialog-argument-preview',
  templateUrl: './dialog-argument-preview.component.html',
  styleUrls: ['./dialog-argument-preview.component.css']
})
export class DialogArgumentPreviewComponent implements OnInit {
  item: any;

  constructor(public dialogRef: MatDialogRef<DialogArgumentPreviewComponent>,
    public globals: Globals,
    public utils: Utils,
    @Inject(MAT_DIALOG_DATA) public data: any,)
  {
    this.item = JSON.parse (JSON.stringify (data));
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
