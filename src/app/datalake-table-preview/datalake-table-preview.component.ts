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

  @ViewChild('paginator', { static: false })
  paginator: MatPaginator;

  edit: boolean = false;
  rowSelected: any = null;
  rowDelete: any;
  // disabledEdit: boolean = false;
  // disabledDelete: boolean = false;
  filter: string;
  RowsUpdated: any[] = [];
  RowsInserted: any[] = [];
  RowsDeleted: any[] = [];
  RowsDeletedSend : any[] = [];
  lengthpag: any;
  pageI: any = 0;
  pageSize: any = 50;
  TABLEPREVIEWLIMIT: number;
  firstTime: boolean = true;
  schemaName: any;
  tableName: any;
  tokenResult: any = "";
  insertRow: boolean = false;
  tableLocation: any;
  RowsInsertedSend: any[] = [];
  RowsUpdatedSend: any[] = [];
  // NumberRows: any;
  // callServiceData: boolean;
  pageEvent: PageEvent;
  showIcon: boolean= false;

  constructor(public dialogRef: MatDialogRef<DatalakeTablePreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private service: DatalakeService,
    public globals: Globals, private excelService: ExcelService, private appService: ApplicationService) {

    this.tableName = data.values.tableName;
    this.schemaName = data.values.schemaName;
    this.globals.popupLoading = true;
    this.edit = data.edit;
    this.TABLEPREVIEWLIMIT = TABLE_PREVIEW_LIMIT;
    if(this.edit){
      this.service.getDatalakeTableEditData(this, data.values.schemaName, data.values.tableName, this.pageI, this.pageSize, this.tokenResult,"", this.handlerSuccess, this.handlerError);
    }else{
      this.service.getDatalakeTableData(this, data.values.schemaName, data.values.tableName, this.TABLEPREVIEWLIMIT, this.pageI, this.pageSize, this.tokenResult,"", this.handlerSuccess, this.handlerError);
    }
  }

  onNoClick(): void {
    if (this.RowsInserted.length === 0 && this.RowsUpdated.length === 0 && this.RowsDeleted.length === 0) {
      this.dialogRef.close();
    } else {
      this.appService.confirmationOrCancelDialog(this, "Do you want to save the changes?",
        function (_this) {
          _this.filter="";
          _this.saveAll();
        },
        function (_this,reset) {
          _this.dialogRef.close();
        }
      );
    }
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

    _this.tokenResult = data.tokenResult;
    let cantRows = data.cantRows;

    if (_this.firstTime) {
      for (let column of data.Columns)
        _this.displayedColumns.push(column.title);


      if (_this.edit) {
        const columnId: number = _this.displayedColumns.findIndex(d => d === 'rDeltaLakeRowID');
        if (_this.displayedColumns.length > 0 && columnId != -1) {
          _this.displayedColumns.unshift("actions");
          _this.showIcon = true;
        }else{
          _this.showIcon = false;
        }
      }
    }

    if (data.Values) {
      for (let result of data.Values) {
        let item = { hoverDelete: false, hoverEdit: false, edit: false, update: false };
        for (let i = 0; i < _this.displayedColumns.length; i++) {
          if (!_this.edit) {
            item[_this.displayedColumns[i]] = result[i];
          } else if (_this.edit && i > 0) {
            item[_this.displayedColumns[i]] = result[i - 1];
          }
        }

        if (_this.edit) {
          //verifico si existen registros modificados y modifico el data que obtuve
          const index: number = _this.RowsUpdated.findIndex(d => d.rDeltaLakeRowID === item['rDeltaLakeRowID']);
          if (index != -1) {
            item = _this.RowsUpdated[index];
          }

          //verifico si existen registros eliminado, si el registro no existe lo agrego al data
          const indexDelete: number = _this.RowsDeleted.findIndex(d => d.rDeltaLakeRowID === item['rDeltaLakeRowID']);
          if (indexDelete === -1) {
            _this.dataSource.push(item);
          }
        }else{
          _this.dataSource.push(item);
        }
      }


      if (_this.edit && _this.pageI === 0) {
        //verifico si hay registros nuevos y los agrego al comienzo si estoy en la primera pagina
        _this.RowsInserted.forEach(element => {
          _this.dataSource.unshift(element);
        });
        // si estoy insertando una nueva fila
        if (_this.insertRow) {
          let newRow = { new: true, };
          _this.displayedColumns.forEach(element => {
            if (element != 'actions') {
              newRow[element] = null;
            }
          });
          // _this.addInsertToArray(newRow);
          _this.dataSource.unshift(newRow);
          _this.insertRow = false;
        }
      }

    }
    _this.lengthpag = cantRows;
    _this.dataSourceTable = new MatTableDataSource(_this.dataSource);
    // _this.dataSourceTable.paginator = _this.paginator; //(test)
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

  editRow($event, row) {
    $event.stopPropagation();
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

  getEditRowImage(element) {
    if (element.update && element != this.rowSelected) {
      if (element.hoverEdit) {
        return "../../assets/images/" + this.globals.theme + "-datalake-rowUpdate.png";
      } else {
        return "../../assets/images/datalake-rowUpdate.png";
      }
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
    return "../../assets/images/datalake-DeleteRow.png";
  }

  MarkEditAsUpdate(element,j) {
    if (!element.new) {
      element.update = true;
      this.addUpdatetoArray(element);
    } 
    else {
      if(this.RowsInserted.length==0){
        this.saveNewRows();
      }
    }
  }

  removeRow(row) {
    const index: number = this.dataSource.findIndex(d => d === row);
    if (index > -1) {
      this.appService.confirmationOrCancelDialog(this, "Do you want to delete this row?",
        function (_this) {
          if (row.rDeltaLakeRowID) {
            let rowDelete=[];
            for (let i = 0; i < _this.displayedColumns.length; i++) {
              const column = _this.displayedColumns[i];
              if (column != 'actions') {
                let columnNew = {'fieldName': column,
                          'dataType': 'String',
                          'fieldValue': row[column] }
                  rowDelete.push(columnNew);
              }
            }

            _this.RowsDeleted.push(row);
            _this.RowsDeletedSend.push(rowDelete);
            //borro si fue actualizado
            if (row['update']) {
              const index: number = _this.RowsUpdated.findIndex(d => d.rDeltaLakeRowID === row['rDeltaLakeRowID']);
              if (index != -1) {
                _this.RowsUpdated.splice(index, 1);
                _this.RowsUpdatedSend.splice(index, 1);
              }
            }
            // const indexData: number = _this.dataSource.findIndex(d => d.rDeltaLakeRowID === row['rDeltaLakeRowID']);
            //     if (index != -1) {
            //       _this.dataSource[indexData]['rDeltaLakeRowID'] = true;
            //     }
          } else {
            //borro si es nuevo
            if (row['new']) {
              const index: number = _this.RowsInserted.findIndex(d => d === row);
              if (index != -1) {
                _this.RowsInserted.splice(index, 1);
              }
            }
            // const indexData: number = _this.dataSource.findIndex(d => d === row);
            //     if (index != -1) {
            //       _this.dataSource.splice(indexData, 1);
            //     }
          }
          const indexData: number = _this.dataSource.findIndex(d => d === row);
          if (indexData != -1) {
            _this.dataSource.splice(indexData, 1);
          }
          _this.dataSourceTable = new MatTableDataSource(_this.dataSource);
        },

        function (_this,reset) {

          if (_this.rowSelected) {
            _this.rowSelected.edit = false;
          }
          row.edit = true;
          _this.rowSelected = row;
        }
      );

    }
  }

  filterDataTable(): void {
    let search, filteredResults

    // get the search keyword
    search = this.filter;
    if (search.length!=0 && search.length<3) {
      this.dataSourceTable = new MatTableDataSource(this.dataSource);
      this.dataSourceTable.paginator = this.paginator;
      return;
    }

    this.globals.popupLoading = true;
    if (search.length>=3 && (this.RowsInserted.length > 0 || this.RowsUpdated.length > 0 || this.RowsDeleted.length > 0)) {
      this.appService.confirmationOrCancelDialog(this, "Do you want to save the changes before before filtering?",
        function (_this) {
          _this.saveAll();
        },
        function (_this,reset) {
          if(reset){
            _this.globals.popupLoading = true;
            _this.resetData();
            _this.firstTime = true;
            _this.dataSource = [];
            _this.displayedColumns = [];          
            _this.pageI = 0;
            _this.tokenResult = "";
            _this.paginator.firstPage();
            _this.service.getDatalakeTableEditData(_this, _this.schemaName, _this.tableName,
              _this.pageI,_this.pageSize,_this.tokenResult, _this.filter,_this.handlerSuccess,_this.handlerError);
          }
        }
      );
    }else{
      this.firstTime = false;
      this.dataSource = [];
      this.service.getDatalakeTableEditData(this, this.schemaName, this.tableName,
        this.pageI,this.pageSize,this.tokenResult, this.filter,this.handlerSuccess,this.handlerError);

    }
/*    let size = this.displayedColumns.length;
    let columnsName = this.displayedColumns;
    filteredResults =
      this.dataSource.
        filter(function (a) {
          let index = -1;
          for (let i = 0; i < size; i++) {
            const element = columnsName[i];
            if (element != 'actions') {
              index = a[element].toLowerCase().indexOf(search);
              if (index > -1) {
                i = size;
              }
            }
          }
          return index > -1;
        });
    this.dataSourceTable = new MatTableDataSource(filteredResults);
    this.dataSourceTable.paginator = this.paginator;*/
  }

  saveAll() {
    this.globals.popupLoading = true;
    if(this.pageI === 0){
      this.saveNewRows();
    }
    let request;
    request = {
      tableName: this.tableName,
      schemaName: this.schemaName,
      tableLocation: this.tableLocation,
      // inserts: this.RowsInserted,
      inserts: this.RowsInsertedSend,
      // updates: this.RowsUpdated,
      updates: this.RowsUpdatedSend,
      deletes: this.RowsDeletedSend
    }
    //revisar si hay registros para insertar repetidos y avisarle al usuario si quiere conservalos. 
    this.service.DatalakeUpdateRows(this, request, this.saveHandler, this.saveError);
  }

  SaveRows() {
    // this.saveRowsModified();
    if (this.RowsInserted.length > 0 || this.RowsUpdated.length > 0 || this.RowsDeleted.length > 0) {
      this.appService.confirmationOrCancelDialog(this, "Do you want to save the changes?",
        function (_this) {
          this.filter="";
          _this.saveAll();
        },
        function (_this,reset) {
          if(reset){
            _this.globals.popupLoading = true;
            _this.resetData();
            _this.firstTime = true;
            _this.dataSource = [];
            _this.displayedColumns = [];          
            _this.pageI = 0;
            _this.tokenResult = "";
            _this.paginator.firstPage();
            _this.service.getDatalakeEditTableData(_this, _this.schemaName, _this.tableName, _this.TABLEPREVIEWLIMIT,
              _this.pageI,_this.pageSize,_this.tokenResult,"", _this.handlerSuccess,_this.handlerError);
          }
        }
      );
    }
  }

  saveHandler(_this, data) {
    _this.resetData();
    _this.firstTime = true;
    _this.dataSource = []; 
    _this.displayedColumns = [];
    _this.paginator.firstPage();
    _this.pageI = 0;
    if(_this.filter != ""){
      _this.tokenResult = "";
      _this.service.getDatalakeTableEditData(_this, _this.schemaName, _this.tableName,
        _this.pageI, _this.pageSize, _this.tokenResult,_this.filter, _this.handlerSuccess, _this.handlerError);
    }else{
      _this.service.getDatalakeTableEditData(_this, _this.schemaName, _this.tableName,
        _this.pageI, _this.pageSize, _this.tokenResult,_this.filter, _this.handlerSuccess, _this.handlerError);
    }
  }

  saveError(_this, result): void {
    _this.globals.popupLoading = false;
  }

  cleanSelect(row) {
    if (row !== this.rowSelected) {
      this.rowSelected = null;
      this.dataSourceTable.data.forEach(element => {
        element.edit = false;
      });
      this.rowDelete = null;
    }
  }

  public getServerData(event?: PageEvent) {
    if (!this.globals.popupLoading) {
      this.globals.popupLoading = true;
      if(this.pageI===0){
        this.saveNewRows();
      }
      this.pageI = event.pageIndex;
      this.pageSize = event.pageSize;
      // this.saveRowsModified();
      this.firstTime = false;
      this.dataSource = [];
      this.service.getDatalakeTableEditData(this, this.data.values.schemaName, this.data.values.tableName, event.pageIndex, event.pageSize, this.tokenResult, "",this.handlerSuccess, this.handlerError);
      return event;
    }
  }

  InsertRows() {
    if (this.pageI != 0) {
      this.insertRow = true;
      this.paginator.firstPage();
    } else {
      this.insertRow = false;
      let newRow = { new: true, };
      this.displayedColumns.forEach(element => {
        if (element != 'actions') {
          newRow[element] = null;
        }
      });
      this.dataSource.unshift(newRow);
      this.dataSourceTable = new MatTableDataSource(this.dataSource);

    }
  }

  addUpdatetoArray(element) {
    //adiciono los registros actualizados los que ya tenia guardados
    //si el registro existe lo borro y adiciono el actual
    let row=[];
    for (let i = 0; i < this.displayedColumns.length; i++) {
      const column = this.displayedColumns[i];
      if (column != 'actions') {
        let columnNew = {'fieldName': column,
                  'dataType': 'String',
                  'fieldValue': element[column] }
          row.push(columnNew);
      }
    }

    const index: number = this.RowsUpdated.findIndex(d => d.rDeltaLakeRowID === element['rDeltaLakeRowID']);
    if (index != -1) {
      this.RowsUpdated.splice(index, 1);
      this.RowsUpdatedSend.splice(index, 1);
    }
    this.RowsUpdatedSend.push(row);
    this.RowsUpdated.push(element);
  }

  saveNewRows() {
    //guardo localmente los registros que se insertaron antes de cambiar de pagina 
    //borro los que tenia y los vuelvo a insertar
    this.RowsInserted = [];
    this.RowsInsertedSend = [];
    this.dataSource.forEach(data => {
      if (data['new']) {
        let valido = false;
        let row = [];
        for (let i = 0; i < this.displayedColumns.length; i++) {
          const column = this.displayedColumns[i];
          if (column != 'actions' && column != 'rDeltaLakeRowID') {
            let columnNew = {
              'fieldName': column,
              'dataType': 'String',
              'fieldValue': data[column]
            }
            row.push(columnNew);
            if (data[column] && data[column].length > 0) {
              valido = true;
            }
          }
        }
        if (valido) {
          this.RowsInsertedSend.push(row);
          this.RowsInserted.push(data);
        }
      }
    });
  }

  addInsertToArray(element,RowsTable) {
    //adiciono los nuevos registros a los que ya tenia guardados
    //si el registro existe lo borro y adiciono el actual    
    //genero el row que voy a guardar      
    let row = [];
    let insert = false;
    for (let i = 0; i < this.displayedColumns.length; i++) {
      const column = this.displayedColumns[i];
      if (column != 'actions' && column != 'rDeltaLakeRowID') {
        let columnNew = {
          'fieldName': column,
          'dataType': 'String',
          'fieldValue': element[column]
        }
        row.push(columnNew);
        if (element[column] && element[column].length > 0) {
          insert = true;
        }
      }
    }

    if (insert) {
      if (this.RowsInserted.length > 0) {
        //si hay registros guardados
      if (this.RowsInserted.length < RowsTable ){
        //inserto el registro
            this.RowsInsertedSend.push(row);
            this.RowsInserted.push(element);
      }else{
        //es igual entonces actualizo
          let size = this.displayedColumns.length;
          let sizeRows = this.RowsInserted.length;
          let columnsName = this.displayedColumns;
          let cont = 0;
          let index = -1;
          let match : any[] = [];
          for (let j = 0; j < sizeRows; j++) {
              cont = 0;
              for (let i = 0; i < size; i++) {
                const column = columnsName[i];
                if (column != 'actions' && column != 'rDeltaLakeRowID') {
                  //si el la columna del elemento del array es diferente a la que se va insertar 
                  //detengo el for de las columnas, sino sigo contando las columnas que coinciden
                  //si todas las columnas coinciden ya no analizo mas rows y detengo el for de los rows
                  if (this.RowsInserted[j][column] != element[column]) {
                    i = size;
                  } else {
                    cont = cont + 1;
                    if (cont == (size - 2)) {
                      // match.push(j);
                      index = j;
                      j = sizeRows;
                    }
                  }
                }
              }
          }
          if (cont != (size - 2)) {
            // if (match.length!=0) {
            this.RowsInsertedSend.push(row);
            this.RowsInserted.push(element);
          }
          //si la cantidad de columnas que coinciden son las mismas no inserto 
          else {
            this.RowsInsertedSend[index] = row;
          }
        }
      } else {
        this.RowsInsertedSend.push(row);
        this.RowsInserted.push(element);
      }
    }
  }


  resetData() {
    this.rowSelected = null;
    this.dataSourceTable.data.forEach(element => {
      element.edit = false;
      element.update = false;
      element.new = false;
    });
    this.rowDelete = null;
    this.RowsInserted = [];
    this.RowsUpdated = [];
    this.RowsDeleted = [];
    this.RowsInsertedSend = [];
    this.RowsUpdatedSend = [];
    this.RowsDeletedSend = [];
  }

}
