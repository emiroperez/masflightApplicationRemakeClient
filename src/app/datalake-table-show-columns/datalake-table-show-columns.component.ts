import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { ApplicationService } from '../services/application.service';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-datalake-table-show-columns',
  templateUrl: './datalake-table-show-columns.component.html'
})
export class DatalakeTableShowColumnsComponent {

  displayedColumns: string[] = [
    "Column",
    "Name",
    "DataType"
  ];

  dataSource: any[] = [];

  constructor(public dialogRef: MatDialogRef<DatalakeTableShowColumnsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private service: ApplicationService,
    public globals: Globals)
  {
    this.globals.popupLoading = true;
    this.service.getDatalakeTableColumns (this, data.values.schemaName, data.values.tableName, this.handlerSuccess, this.handlerError);
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

    if (!data.sources || (data.sources && !data.sources.length))
    {
      _this.globals.popupLoading = false;
      return;
    }

    for (let i = 0; i < data.sources.length; i++)
    {
      let result = data.sources[i];

      // Set column number
      result.Column = i + 1;
      _this.dataSource.push (result);
    }

    _this.globals.popupLoading = false;
  }

  handlerError(_this, result): void
  {
    _this.globals.popupLoading = false;
    console.log (result);
  }
}
