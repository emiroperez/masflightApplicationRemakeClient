import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { ApplicationService } from '../services/application.service';
import { Globals } from '../globals/Globals';

const TABLE_PREVIEW_LIMIT: number = 10;

@Component({
  selector: 'app-datalake-table-preview',
  templateUrl: './datalake-table-preview.component.html'
})
export class DatalakeTablePreviewComponent {

  displayedColumns: string[] = [];
  dataSource: any[] = [];

  constructor(public dialogRef: MatDialogRef<DatalakeTablePreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private service: ApplicationService,
    public globals: Globals)
  {
    this.globals.popupLoading = true;
    this.service.getDatalakeTableData (this, data.values.schemaName, data.values.tableName, TABLE_PREVIEW_LIMIT, this.handlerSuccess, this.handlerError);
  }

  onNoClick(): void
  {
    this.dialogRef.close ();
  }

  handlerSuccess(_this, data): void
  {
    _this.globals.popupLoading = false;

    if (!data)
      return;

    if (!data.Columns || (data.Columns && !data.Columns.length))
      return;

    if (!data.Values || (data.Values && !data.Values.length))
      return;

    for (let column of data.Columns)
      _this.displayedColumns.push (column.title);

    for (let result of data.Values)
      _this.dataSource.push (result);
  }

  handlerError(_this, result): void
  {
    _this.globals.popupLoading = false;
    console.log (result);
  }
}
