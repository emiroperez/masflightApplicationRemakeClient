import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-msf-dynamic-table-alias',
  templateUrl: './msf-dynamic-table-alias.component.html'
})
export class MsfDynamicTableAliasComponent {
  constructor(public dialogRef: MatDialogRef<MsfDynamicTableAliasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
  }

  saveAlias(): void
  {
    this.dialogRef.close (this.data.alias);
  }

  onNoClick(): void
  {
    this.dialogRef.close ();
  }
}
