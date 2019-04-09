import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material";

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html'
})
export class MessageComponent implements OnInit {

  title: string;
  message: string;

  constructor(public dialogRef: MatDialogRef<MessageComponent>,
    private dialog: MatDialog, @Inject(MAT_DIALOG_DATA) data) { 
    this.title = data.title;
    this.message = data.message;
  }

  close() {
    this.dialogRef.close ();
  }

  ngOnInit() {
  }

}
