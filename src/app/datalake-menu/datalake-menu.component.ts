import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DatalakeCreateTableComponent } from '../datalake-create-table/datalake-create-table.component';

@Component({
  selector: 'app-datalake-menu',
  templateUrl: './datalake-menu.component.html'
})
export class DatalakeMenuComponent implements OnInit {
  @Output('setOption')
  setOption = new EventEmitter ();

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
  }

  createTable(): void
  {
   let dialogRef =  this.dialog.open (DatalakeCreateTableComponent, {
      panelClass: 'datalake-create-table-dialog',
      data: { }
    });
  }
}
