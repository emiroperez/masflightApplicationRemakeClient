import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material";

@Component({
  selector: 'app-url-message',
  templateUrl: './url-message.component.html'
})
export class UrlMessageComponent implements OnInit {

  title: string;
  message: string;
  url: string;

  constructor(public dialogRef: MatDialogRef<UrlMessageComponent>,
    private dialog: MatDialog, @Inject(MAT_DIALOG_DATA) data)
  {
    this.title = data.title;
    this.message = data.message;
    this.url = data.url;
  }

  close()
  {
    this.dialogRef.close ();
  }

  ngOnInit()
  {
  }

  copyMessageToClipboard(): void
  {
    const messageBox = document.createElement ('textarea');

    messageBox.style.position = 'fixed';
    messageBox.style.left = '0';
    messageBox.style.top = '0';
    messageBox.style.opacity = '0';
    messageBox.value = this.url;

    document.body.appendChild (messageBox);

    messageBox.focus();
    messageBox.select();

    document.execCommand ('copy');
    document.body.removeChild (messageBox);
  }
}
