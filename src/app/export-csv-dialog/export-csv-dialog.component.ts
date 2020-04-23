import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-export-csv-dialog',
  templateUrl: './export-csv-dialog.component.html'
})
export class ExportCsvDialogComponent {
  customSeparator: boolean = false;
  separator: string = "\t";

  constructor(private dialogRef: MatDialogRef<ExportCsvDialogComponent>)
  {
  }

  exportToCSV(value?: boolean): void
  {
    if (value)
      this.dialogRef.close (this.separator);
    else
      this.dialogRef.close ();
  }

  setSeparator(value: boolean): void
  {
    if (value)
      this.separator = ",";
    else
      this.separator = "\t";
  }
}
