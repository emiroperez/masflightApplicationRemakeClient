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
    if (!data)
    {
      _this.globals.popupLoading = false;
      return;
    }

    if (!data.Columns || (data.Columns && !data.Columns.length))
    {
      _this.globals.popupLoading = false;
      return;
    }

    if (!data.Values || (data.Values && !data.Values.length))
    {
      _this.globals.popupLoading = false;
      return;
    }

    for (let column of data.Columns)
      _this.displayedColumns.push (column.title);

    for (let result of data.Values)
    {
      let item = {};

      for (let i = 0; i < _this.displayedColumns.length; i++)
        item[_this.displayedColumns[i]] = result[i];

      _this.dataSource.push (item);
    }

    _this.globals.popupLoading = false;
  }

  handlerError(_this, result): void
  {
    _this.globals.popupLoading = false;
    console.log (result);
  }
}
