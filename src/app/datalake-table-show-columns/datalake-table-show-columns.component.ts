import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-datalake-table-show-columns',
  templateUrl: './datalake-table-show-columns.component.html'
})
export class DatalakeTableShowColumnsComponent {

  displayedColumns: string[] = [
    "column",
    "name",
    "datatype"
  ];

  dataSource: any = [
    {
      column: "Column #1",
      name: "Aircraft_id",
      datatype: "String"
    },
    {
      column: "Column #2",
      name: "latitude",
      datatype: "String"
    },
    {
      column: "Column #3",
      name: "longitude",
      datatype: "String"
    },
    {
      column: "Column #4",
      name: "track",
      datatype: "String"
    },
    {
      column: "Column #5",
      name: "altitude",
      datatype: "String"
    },
    {
      column: "Column #6",
      name: "track 2",
      datatype: "String"
    },
    {
      column: "Column #7",
      name: "track 3",
      datatype: "String"
    },
    {
      column: "Column #8",
      name: "altitude",
      datatype: "String"
    },
    {
      column: "Column #9",
      name: "track 2",
      datatype: "String"
    },
    {
      column: "Column #10",
      name: "track 3",
      datatype: "String"
    },
    {
      column: "Column #11",
      name: "altitude",
      datatype: "String"
    },
    {
      column: "Column #12",
      name: "track 2",
      datatype: "String"
    },
    {
      column: "Column #13",
      name: "track 3",
      datatype: "String"
    }
  ];

  constructor(public dialogRef: MatDialogRef<DatalakeTableShowColumnsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void
  {
    this.dialogRef.close ();
  }
}
