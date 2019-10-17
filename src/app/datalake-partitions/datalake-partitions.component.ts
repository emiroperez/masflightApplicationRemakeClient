import { Component, OnInit, HostListener, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { DatalakeService } from '../services/datalake.service';
import { Globals } from '../globals/Globals';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-datalake-partitions',
  templateUrl: './datalake-partitions.component.html'
})
export class DatalakePartitionsComponent implements OnInit {
  @ViewChild(MatPaginator)
  paginator: MatPaginator;
  
  innerHeight: number;
  PartitionTable: MatTableDataSource<any>;
  partitionsColumns: string[] = ['schemaName', 'tableName', 'type', 'cron', 'status','actions'];
  
  partitions: any[] = [];
  partitionFormGroup: FormGroup;
  schemas: string[] = [];
  schemaName: any = "";
  tables: string[] = [];
  tableName: any= null ;
  filteredTables: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  filteredRunTypes: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  runTypes: any[] = [{value: 'M', viewValue: "Manually"},{value: 'A', viewValue: "Automatically"}];
  tableFilterCtrl: FormControl = new FormControl ();
  _onDestroy: Subject<void> = new Subject<void> ();
  request: { tableName: any; schemaName: any; cron: any; type: any; status: any; };
  Status: string = 'A';
  edit: boolean;
 

  constructor(public globals: Globals,private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef, private service: DatalakeService,
    private dialog: MatDialog) { 
      this.partitionFormGroup = this.formBuilder.group ({
        schema: ['', Validators.required],
        table: new FormControl ({ value: '', disabled: true }, Validators.required),
        runType: ['M', Validators.required],
        cron: new FormControl ({ value: '', disabled: true }, Validators.required)
      });
      this.filteredTables.next (this.tables.slice ());
      this.filteredRunTypes.next (this.runTypes.slice ());
      this.searchChange ();
    }

  ngOnInit() {
    this.innerHeight = window.innerHeight;
    this.globals.isLoading = true;
    this.service.getDatalakePartitions (this, this.setPartitions, this.setPartitionsError);
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

    
    _this.PartitionTable = new MatTableDataSource (_this.partitions);
    _this.PartitionTable.paginator = _this.paginator;
    _this.service.getDatalakeSchemas (_this, _this.setSchemas, _this.setSchemasError);
  }

  setPartitionsError(_this, result): void
  {
    console.log (result);
    _this.service.getDatalakeSchemas (this, this.setSchemas, this.setSchemasError);
    // _this.globals.isLoading = false;
  }

  setSchemas(_this, data): void
  {
    if (!data.Schemas.length)
    {
      _this.globals.isLoading = false;
      return;
    }

    for (let schema of data.Schemas)
      _this.schemas.push (schema);

    _this.globals.isLoading = false;
  }

  setSchemasError(_this, result): void
  {
    console.log (result);
    _this.globals.isLoading = false;
  }


  getTableHeight(): string
  {
    return "calc(" + this.innerHeight + "px - 18.5em)";
  }

  getTableHeightRight(): string
  {
    return "calc(" + this.innerHeight + "px - 18.5em - 96px)";
  }


  @HostListener('window:resize', ['$event'])
  checkScreen(event): void
  {
    this.innerHeight = event.target.innerHeight;
  }

  schemaChanged(): void
  {
    this.schemaName = this.partitionFormGroup.get ("schema").value;

    this.globals.isLoading = true;
    this.service.getDatalakeSchemaTables (this, this.schemaName, this.setSchemaTables, this.setSchemaTablesError);
  }
  setSchemaTables(_this, data): void
  {
    let tableSelector = _this.partitionFormGroup.get ("table");

    if (!data.Tables.length)
    {
      _this.globals.isLoading = false;

      tableSelector.setValue (null);
      tableSelector.disable ();
      tableSelector.markAsUntouched ();
      return;
    }

    _this.tables = [];

    for (let tableName of data.Tables)
      _this.tables.push (tableName);

    _this.filteredTables.next (_this.tables.slice ());
    if(_this.tableName){
      tableSelector.setValue (_this.tableName);
    }else{
      tableSelector.setValue (null);
    }
    tableSelector.enable ();
    tableSelector.markAsUntouched ();
    _this.tableName = null;
    _this.globals.isLoading = false;
  }

  setSchemaTablesError(_this, result): void
  {
    let tableSelector = _this.partitionFormGroup.get ("table");

    // TODO: Show dialog
    console.log (result);
    _this.tables = [];
    _this.filteredTables.next (_this.tables.slice ());
    tableSelector.setValue (null);
    tableSelector.disable ();
    tableSelector.markAsUntouched ();
    _this.globals.isLoading = false;
  }

  // tableChanged(): void
  // {
  //   this.tableName = this.partitionFormGroup.get ("table").value;
  // }
  
  searchChange(): void
  {
    // listen for search field value changes
    this.tableFilterCtrl.valueChanges.pipe (takeUntil (this._onDestroy)).subscribe (() => {
      this.filterSchema ();
    });
  }

  filterSchema(): void
  {
    let search, filteredResults;

    if (!this.tables.length)
      return;

    // get the search keyword
    search = this.tableFilterCtrl.value;
    if (!search)
    {
      this.filteredTables.next (this.tables.slice ());
      return;
    }

    search = search.toLowerCase ();
    filteredResults = this.tables.filter (a => (a.toLowerCase ().indexOf (search) > -1));

    this.filteredTables.next (
      filteredResults.filter (function (elem, index, self)
      {
        return index === self.indexOf(elem);
      })
    );
  }

  ngOnDestroy(): void
  {
    this._onDestroy.next ();
    this._onDestroy.complete ();
  }

  addPartition(){    
    this.request = {
      tableName: this.partitionFormGroup.get ("table").value,
      schemaName: this.partitionFormGroup.get ("schema").value,
      cron: this.partitionFormGroup.get ("cron").value,
      type: this.partitionFormGroup.get ("runType").value,
      status: this.Status
    };
  this.globals.isLoading = true;
  if(this.edit){  
    this.service.updateDatalakePartition(this, this.request, this.savePartitionHandler, this.savePartitionError);
  }else{
    this.service.saveDatalakePartition(this, this.request, this.savePartitionHandler, this.savePartitionError);
  }
}

  savePartitionHandler(_this, data) {
    if (data.Message === "OK"){  
      _this.request = {
        tableName: "",
        schemaName: "",
        cron: "",
        type: "",
        status: ""
      }    
      _this.partitionFormGroup.reset();
      _this.edit=false;
      _this.Status='A';
      _this.refreshPartition();
    }else{
      _this.globals.isLoading = false;
      _this.dialog.open (MessageComponent, {
        data: { title: "Error", message: data.Message }
      });
    }
    
  }

  savePartitionError() {
  }

  refreshPartition(){
    this.partitions = [];
    this.service.getDatalakePartitions (this, this.setRefreshPartitions, this.refreshPartitionsError);
  }
  
  setRefreshPartitions(_this, data): void
  {
    if (!data.partitions.length)
    {
      _this.globals.isLoading = false;
      return;
    }

    for (let partition of data.partitions){
      _this.partitions.push (partition);
    }

    
    _this.PartitionTable = new MatTableDataSource (_this.partitions);
    _this.PartitionTable.paginator = _this.paginator;
    _this.globals.isLoading = false;
  }

  refreshPartitionsError(_this, result): void
  {
    console.log (result);
    _this.globals.isLoading = false;
  }

  runTypeChanged(){    
    if(this.partitionFormGroup.get ("runType").value === "A"){
      this.partitionFormGroup.get ("cron").enable ();
      this.partitionFormGroup.get ("cron").setValue (null);
      this.partitionFormGroup.get ("cron").markAsUntouched ();
    }else{
      this.partitionFormGroup.get ("cron").setValue (null);
      this.partitionFormGroup.get ("cron").disable ();
      this.partitionFormGroup.get ("cron").markAsUntouched ();
    }
  }

  setPartitionStatus(status): void
  {
    this.Status = status;
  }

  editPartition(partition): void{   
    this.edit = true; 
    this.partitionFormGroup.patchValue({
      schema: partition.schemaName,
      table: partition.tableName,
      runType: partition.type,
      cron: partition.cron
    });
    this.Status = partition.status;
    this.tableName = partition.tableName;
    this.service.getDatalakeSchemaTables (this, partition.schemaName, this.setSchemaTables, this.setSchemaTablesError);  
  }

  Clean(){
    this.request = {
      tableName: "",
      schemaName: "",
      cron: "",
      type: "",
      status: ""
    }    
    this.partitionFormGroup.reset();
    this.edit=false;
    this.Status='A';
  }  

  removePartition(partition): void{
    this.request = {
      schemaName: partition.schemaName,
      tableName: partition.tableName,
      cron: partition.cron,
      type: partition.type,
      status: partition.status
    };
  this.globals.isLoading = true;
  this.service.deleteDatalakePartition(this, this.request, this.savePartitionHandler, this.savePartitionError);
  }

}
