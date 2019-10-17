import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { Globals } from '../globals/Globals';
import { DatalakeService } from '../services/datalake.service';
import { DatalakeExecutionPartitionViewDetailComponent } from '../datalake-execution-partition-view-detail/datalake-execution-partition-view-detail.component';

@Component({
  selector: 'app-datalake-execution-partition',
  templateUrl: './datalake-execution-partition.component.html'
})
export class DatalakeExecutionPartitionComponent implements OnInit {
  partitions: any[] = [];
  // partitions: any[] = [
  // {
  //   schemaName: "fr24p",
  //   tableName: "fradar24_r",
  //   type: "Manually",
  //   timestamp: "2019-04-30 09:15:21",
  //   commands: 'Alter table'
  // }
  // ];
  @ViewChild('partitionDetail')
  partitionDetail : DatalakeExecutionPartitionViewDetailComponent;

  detailView: boolean = true;
  constructor(public globals: Globals, private service: DatalakeService) { }

  ngOnInit() {
    this.globals.isLoading = true;
    this.service.getDatalakePartitionLogs (this, this.setPartitions, this.setPartitionsError);
  } 
  
  setPartitions(_this, data): void
  {
    if (!data.partitions.length)
    {
      _this.globals.isLoading = false;
      return;
    }

    for (let partition of data.partitions){
      _this.partitions.push (partition);
    }
    _this.partitionDetail.PartitionTable = new MatTableDataSource (_this.partitions);
    _this.partitionDetail.PartitionTable.paginator = _this.partitionDetail.paginator;
    _this.globals.isLoading = false;
  }

  setPartitionsError(_this, result): void
  {
    console.log (result);
    _this.globals.isLoading = false;
  }

  changeView(){
    if(this.detailView){
      this.detailView = false
    }else{
      this.detailView = true
    }
  }

}
