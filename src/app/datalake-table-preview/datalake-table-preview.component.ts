import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { DatalakeService } from '../services/datalake.service';
import { Globals } from '../globals/Globals';
import { ExcelService } from '../services/excel.service';

const TABLE_PREVIEW_LIMIT: number = 10;

@Component({
  selector: 'app-datalake-table-preview',
  templateUrl: './datalake-table-preview.component.html'
})
export class DatalakeTablePreviewComponent {

  displayedColumns: string[] = [];
  dataSource: any[] = [];

  constructor(public dialogRef: MatDialogRef<DatalakeTablePreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private service: DatalakeService,
    public globals: Globals,private excelService:ExcelService)
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

    for (let column of data.Columns)
      _this.displayedColumns.push (column.title);

    if (data.Values)
    {
      for (let result of data.Values)
      {
        let item = {};

        for (let i = 0; i < _this.displayedColumns.length; i++)
          item[_this.displayedColumns[i]] = result[i];

        _this.dataSource.push (item);
      }
    }

    _this.globals.popupLoading = false;
  }

  handlerError(_this, result): void
  {
    _this.globals.popupLoading = false;
  }

  
  exportToExcel():void {
    let tableColumnFormats: any[] = [];
    let columnMaxWidth: any[] = [];
    let excelData: any[] = [];

    // prepare the column max width values
    for (let column of this.displayedColumns)
    {
      columnMaxWidth.push (column.length);
    }

    // create a new JSON for the XLSX creation
    for (let item of this.dataSource)
    {
      let excelItem: any = {};
  
      for (let i = 0; i < this.displayedColumns.length; i++)
      {
        let column = this.displayedColumns[i];
        let curitem = item[column];

        if (curitem == undefined)
        {
          excelItem[column] = "";
          continue;
        }

        // if (column.columnType === "date")
        // {
        //   let date: Date = new Date (curitem);

        //   // Advance one day, since on Excel files will be one day behind
        //   date.setDate (date.getDate () + 1);

        //   excelItem[column.columnLabel] = date.toISOString ();
        // }
        // else if (column.columnType === "time")
        // {
        //   let time: Date = new Date (curitem);

        //   // Advance one minute, since on time on Excel files will be one minute behind
        //   time.setMinutes (time.getMinutes () + 1);

        //   excelItem[column.columnLabel] = time.toISOString ();
        // }
        // else
        // {
          excelItem[column] = curitem;

          // Get the maximun width for visible results for each column
          if (curitem.toString ().length > columnMaxWidth[i])
            columnMaxWidth[i] = curitem.toString ().length;
        // }
      }

      excelData.push (excelItem);
    }

    // prepare Excel column formats
    for (let i = 0; i < this.displayedColumns.length; i++)
    {
      let column = this.displayedColumns[i];

      tableColumnFormats.push ({
        type: 'string',
        format: null,
        prefix: null,
        suffix: null,
        pos: i,
        width: columnMaxWidth[i] + 1
      });
    }

    this.excelService.exportAsExcelFile(excelData, this.data.values.longName+" - Table Data", tableColumnFormats);
  }
}
