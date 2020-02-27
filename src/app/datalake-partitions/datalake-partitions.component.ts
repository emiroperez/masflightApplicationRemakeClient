import { Component, OnInit, HostListener, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { DatalakeService } from '../services/datalake.service';
import { Globals } from '../globals/Globals';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageComponent } from '../message/message.component';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-datalake-partitions',
  templateUrl: './datalake-partitions.component.html'
})
export class DatalakePartitionsComponent implements OnInit {
  @ViewChild(MatPaginator, { static: false })
  paginator: MatPaginator;

  innerHeight: number;
  PartitionTable: MatTableDataSource<any>;
  partitionsColumns: string[] = ['schemaName', 'tableName', 'type', 'cron', 'status', 'actions'];


  partitions: any[] = [];
  partitionFormGroup: FormGroup;
  schemas: string[] = [];
  schemaName: any = "";
  tables: any[] = [];
  tableName: any = null;
  filteredTables: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredRunTypes: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  runTypes: any[] = [{ value: 'M', viewValue: "Manually" }, { value: 'A', viewValue: "Automatically" }];
  tableFilterCtrl: FormControl = new FormControl();
  _onDestroy: Subject<void> = new Subject<void>();
  request: { tableName: any; schemaName: any; cron: any; type: any; status: any; };
  Status: string = 'A';
  edit: boolean = false;
  createAction: boolean = false;
  optionSelected;

  filter: string;
  ShowPartition: boolean;


  constructor(public globals: Globals, private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef, private service: DatalakeService,
    private dialog: MatDialog, private appService: ApplicationService) {

    if (!this.actionDisable('Create Partition') ||
      !this.actionDisable('List Partitions') || !this.actionDisable('Edit Partition') ||
      !this.actionDisable('Delete Partition') || !this.actionDisable('Run Partition')) {
      this.ShowPartition = true;
    } else {
      this.ShowPartition = false;
    }

    this.partitionFormGroup = this.formBuilder.group({
      schema: ['', Validators.required],
      table: new FormControl({ value: '', disabled: true }, Validators.required),
      runType: ['', Validators.required],
      cron: new FormControl({ value: '', disabled: true }, Validators.required)
    });

    let index = this.globals.optionsDatalake.findIndex(od => od.action.name === "Create Partition");
    if (index != -1) {
      this.createAction = true;
    } else {
      this.createAction = false;
      this.partitionFormGroup.disable();
    }
    this.filteredTables.next(this.tables.slice());
    this.filteredRunTypes.next(this.runTypes.slice());
    this.searchChange();
  }

  ngOnInit() {
    this.innerHeight = window.innerHeight;
    this.globals.isLoading = true;
    this.service.getDatalakePartitions(this, this.setPartitions, this.setPartitionsError);    
  }
  setPartitions(_this, data): void {
    // data.partitions = [{"schemaName":"internal_gts_information","tableName":"contracts_application","type":"M","cron":"","status":"A"}];
    if (!data.partitions.length) {
      // _this.globals.isLoading = false;
      _this.service.getDatalakeSchemas(_this, _this.setSchemas, _this.setSchemasError);
      return;
    }
    
    for (let partition of data.partitions) {
      // partition.highlighted = false;
      // partition.hovered = false;
      _this.partitions.push(partition);
    }


    _this.PartitionTable = new MatTableDataSource(_this.partitions);
    _this.PartitionTable.paginator = _this.paginator;
    _this.service.getDatalakeSchemas(_this, _this.setSchemas, _this.setSchemasError);
  }

  setPartitionsError(_this, result): void {
    _this.service.getDatalakeSchemas(this, this.setSchemas, this.setSchemasError);
    // _this.globals.isLoading = false;
  }

  setSchemas(_this, data): void {
    if (!data.Schemas.length) {
      _this.globals.isLoading = false;
      return;
    }

    for (let schema of data.Schemas)
      _this.schemas.push(schema);

    _this.globals.isLoading = false;
  }

  setSchemasError(_this, result): void {
    _this.globals.isLoading = false;
  }


  getTableHeight(): string {
    return "calc(" + this.innerHeight + "px - 18.5em - 20px)";
  }

  getTableHeightRight(): string {
    return "calc(" + this.innerHeight + "px - 18.5em - 86px)";
    // return "calc(" + this.innerHeight + "px - 18.5em - 116px)";
  }


  @HostListener('window:resize', ['$event'])
  checkScreen(event): void {
    this.innerHeight = event.target.innerHeight;
  }

  schemaChanged(): void {
    this.schemaName = this.partitionFormGroup.get("schema").value;

    this.globals.isLoading = true;
    this.service.getDatalakeSchemaTables(this, this.schemaName, this.setSchemaTables, this.setSchemaTablesError);
  }

  setSchemaTables(_this, data): void {
    let tableSelector = _this.partitionFormGroup.get("table");

    if (!data.Tables.length) {
      _this.globals.isLoading = false;

      tableSelector.setValue(null);
      tableSelector.disable();
      tableSelector.markAsUntouched();
      return;
    }

    _this.tables = [];

    for (let tableName of data.Tables)
      _this.tables.push(tableName);

    _this.filteredTables.next(_this.tables.slice());
    if (_this.tableName) {
      let index = _this.tables.findIndex(a => a.TableName === _this.tableName);
      if(index!=-1){
        tableSelector.setValue(_this.tables[index]);
      }else{
        tableSelector.setValue(null);
      }
    } else {
      tableSelector.setValue(null);
    }
    tableSelector.enable();
    tableSelector.markAsUntouched();
    _this.tableName = null;
    if (!_this.createAction || _this.edit) {
      tableSelector.disable();
    }
    _this.globals.isLoading = false;


  }

  setSchemaTablesError(_this, result): void {
    let tableSelector = _this.partitionFormGroup.get("table");

    // TODO: Show dialog
    _this.tables = [];
    _this.filteredTables.next(_this.tables.slice());
    tableSelector.setValue(null);
    tableSelector.disable();
    tableSelector.markAsUntouched();
    _this.globals.isLoading = false;
  }

  // tableChanged(): void
  // {
  //   this.tableName = this.partitionFormGroup.get ("table").value;
  // }

  searchChange(): void {
    // listen for search field value changes
    this.tableFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.filterSchema();
    });
  }

  filterSchema(): void {
    let search, filteredResults;

    if (!this.tables.length)
      return;

    // get the search keyword
    search = this.tableFilterCtrl.value;
    if (!search) {
      this.filteredTables.next(this.tables.slice());
      return;
    }

    search = search.toLowerCase();
    filteredResults = this.tables.filter(a => (a.TableName.toLowerCase().indexOf(search) > -1));

    this.filteredTables.next(
      filteredResults.filter(function (elem, index, self) {
        return index === self.indexOf(elem);
      })
    );
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  addPartition() {
    // validate form before going forward
    Object.keys (this.partitionFormGroup.controls).forEach (field =>
      {
        this.partitionFormGroup.get (field).markAsTouched ({ onlySelf: true });
      });

      if (this.partitionFormGroup.invalid)
      {
        this.dialog.open (MessageComponent, {
          data: { title: "Error", message: "The required information is incomplete, please complete them and try again." }
        });
  
        return;
      }
      
    this.request = {
      tableName: this.partitionFormGroup.get("table").value.TableName,
      schemaName: this.partitionFormGroup.get("schema").value,
      cron: this.partitionFormGroup.get("cron").value,
      type: this.partitionFormGroup.get("runType").value,
      status: this.Status
    };

    this.globals.isLoading = true;
    if (this.edit) {
      this.service.updateDatalakePartition(this, this.request, this.savePartitionHandler, this.savePartitionError);
    } else {
      this.service.saveDatalakePartition(this, this.request, this.savePartitionHandler, this.savePartitionError);
    }
  }

  savePartitionHandler(_this, data) {
    if (data.Message === "OK") {
      // _this.request = {
      //   tableName: "",
      //   schemaName: "",
      //   cron: "",
      //   type: "",
      //   status: ""
      // }
      // _this.partitionFormGroup.reset();
      // _this.edit = false;
      // _this.Status = 'A';
      // _this.refreshPartition();
      _this.Clean2();
    } else {
      _this.globals.isLoading = false;
      _this.dialog.open(MessageComponent, {
        data: { title: "Error", message: data.Message }
      });
    }

  }

  savePartitionError() {
  }

  refreshPartition() {
    this.globals.isLoading = true;
    this.partitions = [];
    this.service.getDatalakePartitions(this, this.setRefreshPartitions, this.refreshPartitionsError);
  }

  setRefreshPartitions(_this, data): void {
    if (!data.partitions.length) {
      _this.globals.isLoading = false;
      return;
    }

    for (let partition of data.partitions) {
      _this.partitions.push(partition);
    }


    _this.PartitionTable = new MatTableDataSource(_this.partitions);
    _this.PartitionTable.paginator = _this.paginator;
    _this.globals.isLoading = false;
  }

  refreshPartitionsError(_this, result): void {
    _this.globals.isLoading = false;
  }

  runTypeChanged() {
    if (this.partitionFormGroup.get("runType").value === "A") {
      this.partitionFormGroup.get("cron").enable();
      this.partitionFormGroup.get("cron").setValue(null);
      this.partitionFormGroup.get("cron").markAsUntouched();
    } else {
      this.partitionFormGroup.get("cron").setValue(null);
      this.partitionFormGroup.get("cron").disable();
      this.partitionFormGroup.get("cron").markAsUntouched();
    }
  }

  setPartitionStatus(status): void {
    this.Status = status;
  }

  editPartition(partition): void {
    if(this.optionSelected == partition){
      this.Clean();
      partition.hovered = true;
    }else{
    this.optionSelected = partition ;
    // partition.highlighted = !partition.highlighted;
    this.edit = true;
    this.partitionFormGroup.get("runType").enable();
    this.partitionFormGroup.patchValue({
      schema: partition.schemaName,
      table: partition.tableName,
      runType: partition.type,
      cron: partition.cron
    });
    this.runTypeChanged();
    this.partitionFormGroup.get("schema").disable();
    this.Status = partition.status;
    this.tableName = partition.tableName;
    if(partition.cron){
      this.partitionFormGroup.get("cron").setValue(partition.cron);
    }
    this.service.getDatalakeSchemaTables(this, partition.schemaName, this.setSchemaTables, this.setSchemaTablesError);
  }
  }

  Clean2() {
    this.Clean();
    this.refreshPartition();
  }

  Clean() {
    this.optionSelected = null;
    this.request = {
      tableName: "",
      schemaName: "",
      cron: "",
      type: "",
      status: ""
    }
    this.partitionFormGroup.reset();
    if (!this.createAction) {
      this.partitionFormGroup.disable();
    }else{
      this.partitionFormGroup.enable();
      this.partitionFormGroup.get("table").disable();
    }
    this.edit = false;
    this.Status = 'A';
    this.globals.isLoading = false;
  }

  removePartition(partition): void {
    this.appService.confirmationDialog(this, "Do you want to delete this alarm?",
      function (_this) {
        _this.request = {
          schemaName: partition.schemaName,
          tableName: partition.tableName,
          cron: partition.cron,
          type: partition.type,
          status: partition.status
        };
        _this.globals.isLoading = true;
        _this.service.deleteDatalakePartition(_this, _this.request, _this.savePartitionHandler, _this.savePartitionError);
      }
    );
  }

  executePartition(partition): void {
    let request = {
      schemaName: partition.schemaName,
      tableName: partition.tableName
    };
    this.globals.isLoading = true;
    this.service.getDatalakeLoadPartition(this, request, this.executionPartitionHandler, this.savePartitionError);
  }

  executionPartitionHandler(_this, data) {
    if (data.execution === "OK") {
      _this.globals.isLoading = false;
      _this.dialog.open(MessageComponent, {
        data: { title: "Result", message: data.result }
      });
    } else {
      _this.globals.isLoading = false;
      _this.dialog.open(MessageComponent, {
        data: { title: "Error", message: data.Message }
      });
    }

  }

  filterPartition(): void {
    let search, filteredResults;

    if (!this.partitions.length)
      return;

    // get the search keyword
    search = this.filter;
    if (!search) {
      this.PartitionTable = new MatTableDataSource(this.partitions);
      this.PartitionTable.paginator = this.paginator;
      return;
    }

    search = search.toLowerCase();
    filteredResults = this.partitions.filter(a => (a.schemaName.toLowerCase().indexOf(search) > -1
      || a.tableName.toLowerCase().indexOf(search) > -1));

    this.PartitionTable = new MatTableDataSource(filteredResults);
    this.PartitionTable.paginator = this.paginator;
  }

  actionDisable(option: any) {
    let index = this.globals.optionsDatalake.findIndex(od => od.action.name === option);
    if (index != -1) {
      return false;
    } else {
      return true;
    }
  }

  actionDisableBtn() {
    if (!this.createAction && !this.edit) {
      return true;
    } else {
      return false;
    }
  }

  getQueryImageAcces(): string {
    return "../../assets/images/" + this.globals.theme + "-requestAccess.png";
  }
}
