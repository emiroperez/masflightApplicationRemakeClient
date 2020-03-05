import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatPaginator, PageEvent } from '@angular/material';

import { DatalakeService } from '../services/datalake.service';
import { Globals } from '../globals/Globals';
import { ExcelService } from '../services/excel.service';
import { ApplicationService } from '../services/application.service';

const TABLE_PREVIEW_LIMIT: number = 10;

@Component({
  selector: 'app-datalake-table-preview',
  templateUrl: './datalake-table-preview.component.html'
})
export class DatalakeTablePreviewComponent {

  displayedColumns: string[] = [];
  dataSource: any[] = [];
  dataSourceTable: MatTableDataSource<any>;

  @ViewChild('paginator')
  paginator: MatPaginator;

  edit: boolean = false;
  rowSelected: any = null;
  rowDelete: any;
  disabledEdit: boolean = false;
  disabledDelete: boolean = false;
  filter: string;
  RowsUpdated: any[] = [];
  lengthpag: any;
  pageI: any = 0;
  pageSize: any;
  paginatorData: PageEvent;
  TABLEPREVIEWLIMIT: number;
  firstTime: boolean = true;

  constructor(public dialogRef: MatDialogRef<DatalakeTablePreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private service: DatalakeService,
    public globals: Globals, private excelService: ExcelService, private appService: ApplicationService) {

    this.globals.popupLoading = true;
    this.edit = data.edit;
    this.TABLEPREVIEWLIMIT = this.edit ? -1 : TABLE_PREVIEW_LIMIT;
    this.service.getDatalakeTableData(this, data.values.schemaName, data.values.tableName, this.TABLEPREVIEWLIMIT, this.handlerSuccess, this.handlerError);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  handlerSuccess(_this, data): void {
    
    if (!data) {
      _this.globals.popupLoading = false;
      return;
    }

    if (!data.Columns || (data.Columns && !data.Columns.length)) {
      _this.globals.popupLoading = false;
      return;
    }

    if (_this.firstTime) {
      for (let column of data.Columns)
        _this.displayedColumns.push(column.title);

      if (_this.edit) {
        if (_this.displayedColumns.length > 0) {
          _this.displayedColumns.unshift("actions");
        }
      }
    }
    if (data.Values) {
      for (let result of data.Values) {
        let item = {};
        for (let i = 0; i < _this.displayedColumns.length; i++) {
          if (!_this.edit) {
            item[_this.displayedColumns[i]] = result[i];
          } else if (_this.edit && i > 0) {
            item[_this.displayedColumns[i]] = result[i - 1];
          }
        }
        _this.dataSource.push(item);
      }
    }

    // this.lengthpag = data.Rows;
    _this.lengthpag = 20;
    _this.pageSize = 10;

    _this.dataSourceTable = new MatTableDataSource(_this.dataSource);
    // _this.dataSourceTable.paginator = _this.paginator;
    _this.globals.popupLoading = false;
  }

  handlerError(_this, result): void {
    _this.globals.popupLoading = false;
  }


  exportToExcel(): void {
    let tableColumnFormats: any[] = [];
    let columnMaxWidth: any[] = [];
    let excelData: any[] = [];

    // prepare the column max width values
    for (let column of this.displayedColumns) {
      columnMaxWidth.push(column.length);
    }

    // create a new JSON for the XLSX creation
    for (let item of this.dataSource) {
      let excelItem: any = {};

      for (let i = 0; i < this.displayedColumns.length; i++) {
        let column = this.displayedColumns[i];
        let curitem = item[column];

        if (curitem == undefined) {
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
        if (curitem.toString().length > columnMaxWidth[i])
          columnMaxWidth[i] = curitem.toString().length;
        // }
      }

      excelData.push(excelItem);
    }

    // prepare Excel column formats
    for (let i = 0; i < this.displayedColumns.length; i++) {
      let column = this.displayedColumns[i];

      tableColumnFormats.push({
        type: 'string',
        format: null,
        prefix: null,
        suffix: null,
        pos: i,
        width: columnMaxWidth[i] + 1
      });
    }

    this.excelService.exportAsExcelFile(excelData, this.data.values.longName + " - Table Data", tableColumnFormats);
  }

  editRow(row) {
    if (this.rowSelected === row) {
      this.rowSelected = null;
      row.edit = false;
    } else {
      if (this.rowSelected) {
        this.rowSelected.edit = false;
      }
      row.edit = true;
      this.rowSelected = row;
      this.rowDelete = null;
    }
  }

  removeRow(row) {
    if (this.rowDelete === row) {
      this.rowDelete = null;
    } else {
      this.rowDelete = row;
      this.rowSelected = null;
    }
  }

  getEditRowImage(element) {
    if (element.update && element != this.rowSelected) {
      return "../../assets/images/datalake-rowUpdate.png";
    }
    if (element === this.rowSelected) {
      return "../../assets/images/" + this.globals.theme + "-datalake-EditRow-active.png";
    }
    if (element.hoverEdit) {
      return "../../assets/images/" + this.globals.theme + "-datalake-EditRow-active.png";
    }
    return "../../assets/images/datalake-EditRow.png";
  }

  getDeleteRowImage(element) {
    if (element === this.rowDelete) {
      return "../../assets/images/" + this.globals.theme + "-datalake-DeleteRow-active.png";
    }
    if (element.hoverDelete) {
      return "../../assets/images/" + this.globals.theme + "-datalake-DeleteRow-active.png";
    }
    return "../../assets/images/" + this.globals.theme + "-datalake-DeleteRow.png";
  }

  MarkEditAsUpdate(element) {
    element.update = true
  }

  filterDataTable(): void {
    let search, filteredResults
    // let filteredResults = [];

    if (!this.dataSource.length)
      return;

    // get the search keyword
    search = this.filter;
    if (!search) {
      this.dataSourceTable = new MatTableDataSource(this.dataSource);
      this.dataSourceTable.paginator = this.paginator;
      return;
    }

    search = search.toLowerCase();
    let size = this.displayedColumns.length;
    for (let i = 0; i < size; i++) {
      const element = this.displayedColumns[i];
      let index = -1;
      filteredResults =
        this.dataSource.
          filter(function (a) {
            if (element != 'actions') {
              index = a[element].toLowerCase().indexOf(search);
              if (index > -1) {
                i = size;
              }
              return index > -1;
            }
          });
    }

    this.dataSourceTable = new MatTableDataSource(filteredResults);
    this.dataSourceTable.paginator = this.paginator;
  }

  SaveRows() {

    this.appService.confirmationDialog(this, "Do you want to save the changes?",
      function (_this) {
        //registros actualizados en la pagina actual
        let RowsUpdatePage = this.dataSource.filter(a => (a['update'] === true));

        for (let i = 0; i < RowsUpdatePage.length; i++) {
          const element = this.RowsUpdatePage[i];
          if (element['update']) {
            //adiciono los nuevos registros a los que ya tenia guardados
            this.RowsUpdated.push(element);
          }
        }
        //llamar al servicio que envia los datos
        // _this.globals.isLoading = true;
        // _this.service.Datalake_updateRows(_this, RowsUpdated, _this.saveHandler, _this.saveError);
      }
    );
  }

  saveHandler(_this, data) {
    _this.RowsUpdated = [];
  }

  saveError() {
  }

  public getServerData(event?: PageEvent) {
    if (!this.globals.popupLoading) {
      this.paginatorData = event;
      this.firstTime = false;
      this.dataSource = [];
      this.service.getDatalakeTableData(this, this.data.values.schemaName, this.data.values.tableName, this.TABLEPREVIEWLIMIT, this.handlerSuccess, this.handlerError);
      return event;
    }
  }

}
