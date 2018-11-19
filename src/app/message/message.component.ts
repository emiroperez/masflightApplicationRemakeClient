import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material";

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html'
})
export class MessageComponent implements OnInit {

  title: string;
  message: string;

  constructor(private dialog: MatDialog, @Inject(MAT_DIALOG_DATA) data) { 
    this.title = data.title;
    this.message = data.message
  }

  close() {
    this.dialog.closeAll();
  }

  ngOnInit() {
  }

}
