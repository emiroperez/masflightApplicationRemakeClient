import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DatalakeCreateTableComponent } from '../datalake-create-table/datalake-create-table.component';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-datalake-menu',
  templateUrl: './datalake-menu.component.html'
})
export class DatalakeMenuComponent implements OnInit {
  @Output('setOption')
  setOption = new EventEmitter();

  constructor(public globals: Globals, private dialog: MatDialog) { }

  ngOnInit() {
    this.globals.optionDatalakeSelected = 2;
  }

  createTable(): void {
    let indexp = 1;
    let index = this.globals.optionsDatalake.findIndex(od => od.option.option === "Create New Table");
    if (index != -1) {
      indexp = 0;
    }else{
      indexp = 1;
    }
    let dialogRef = this.dialog.open(DatalakeCreateTableComponent, {
      panelClass: 'datalake-create-table-dialog',
      data: { index: indexp }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.globals.isLoading = false;
    });
  }

  setOptionSelect(opcion) {
    this.globals.optionDatalakeSelected = opcion;
    let data = { schemaName: null, tableName: null }
    this.setOption.emit(data);
  }

  OptionDisable(option: any) {
      let index = this.globals.optionsDatalake.findIndex(od => od.option.option === option);
      if (index != -1) {
        return false;
      } else {
        return true;
      }
  }
}
