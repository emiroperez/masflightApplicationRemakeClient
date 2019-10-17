import { Component, OnInit, ViewChild, Input, HostListener } from '@angular/core';
import { MatTableDataSource, MatPaginator } from '@angular/material';

@Component({
  selector: 'app-datalake-execution-partition-view-detail',
  templateUrl: './datalake-execution-partition-view-detail.component.html'
})
export class DatalakeExecutionPartitionViewDetailComponent implements OnInit {
  @Input("partitions")
  partitions
  
  innerHeight: number;
  PartitionTable: MatTableDataSource<any>;
  @ViewChild(MatPaginator)
  paginator: MatPaginator;
  partitionsColumns: string[] = ['schemaName', 'tableName', 'type', 'timestamp', 'cron','actions'];

  constructor() { }

  ngOnInit() {
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

  seeMore(partition): void{

  }
}
