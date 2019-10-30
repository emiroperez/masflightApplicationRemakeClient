import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-datalake-partition-execute-dialog',
  templateUrl: './datalake-partition-execute-dialog.component.html'
})
export class DatalakePartitionExecuteDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DatalakePartitionExecuteDialogComponent>,
    public globals: Globals, 
    @Inject(MAT_DIALOG_DATA) public data: any)
  { }

  ngOnInit() {
  }

  copyText(val: string){
    let selBox = document.createElement('textarea');
      selBox.style.position = 'fixed';
      selBox.style.left = '0';
      selBox.style.top = '0';
      selBox.style.opacity = '0';
      selBox.value = val;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand('copy');
      document.body.removeChild(selBox);
    }

  onNoClick(): void
  {
    this.dialogRef.close ();
  }
}
