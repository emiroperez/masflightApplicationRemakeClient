import { Component, OnInit, ViewChild, Input, HostListener } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { DatalakePartitionExecuteDialogComponent } from '../datalake-partition-execute-dialog/datalake-partition-execute-dialog.component';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-datalake-execution-partition-view-detail',
  templateUrl: './datalake-execution-partition-view-detail.component.html'
})
export class DatalakeExecutionPartitionViewDetailComponent implements OnInit {
  // @Input("partitions")
  // partitions
  
  innerHeight: number;
  PartitionTable: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: false })
  paginator: MatPaginator;
  partitionsColumns: string[] = ['schemaName', 'tableName', 'type', 'timestamp', 'cron','actions'];

  constructor(public globals: Globals,private dialog: MatDialog) { }

  ngOnInit() {
    // this.globals.optionDatalakeSelected = 6;
    this.innerHeight = window.innerHeight;
    // this.PartitionTable = new MatTableDataSource (this.partitions);
    // this.PartitionTable.paginator = this.paginator;
  }

  getTableHeight(): string
  {
    return "calc(" + this.innerHeight + "px - 18.5em)";
  }

    
  @HostListener('window:resize', ['$event'])
  checkScreen(event): void
  {
    this.innerHeight = event.target.innerHeight;
  }

  seeMore(element): void
  {
    let dialogRef = this.dialog.open (DatalakePartitionExecuteDialogComponent, {
      width: '700px',
      panelClass: 'datalake-partition-dialog',
      data: {
        command: element.cron
      }
    });
  }
}
