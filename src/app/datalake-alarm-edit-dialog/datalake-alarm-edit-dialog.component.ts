import { Component, ChangeDetectorRef, Inject } from '@angular/core';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { timePicker } from 'analogue-time-picker';

import { Globals } from '../globals/Globals';
import { DatalakeService } from '../services/datalake.service';

@Component({
  selector: 'app-datalake-alarm-edit-dialog',
  templateUrl: './datalake-alarm-edit-dialog.component.html'
})
export class DatalakeAlarmEditDialogComponent {
  schemas: string[] = [];
  tables: string[] = [];

  alarmFormGroup: FormGroup;
  notifyMode: boolean = false;
  selectedStatus: boolean = false;
  isLoading: boolean = false;

  tableFilterCtrl: FormControl = new FormControl ();
  filteredTables: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  _onDestroy: Subject<void> = new Subject<void> ();

  constructor(public dialogRef: MatDialogRef<DatalakeAlarmEditDialogComponent>,
    public globals: Globals, private formBuilder: FormBuilder,
    private service: DatalakeService, private changeDetectorRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { alarm: any, schemas: string[] })
  {
    this.schemas = JSON.parse (JSON.stringify (this.data.schemas));
    this.selectedStatus = this.data.alarm.selectedStatus;

    this.alarmFormGroup = this.formBuilder.group ({
      schema: [this.data.alarm.schemaName, Validators.required],
      table: [this.data.alarm.tableName, Validators.required]
    });

    this.isLoading = true;
    this.service.getDatalakeSchemaTables (this, this.data.alarm.schemaName, this.setSchemaTablesAfterOpening, this.setSchemaTablesError);
  }

  ngOnDestroy(): void
  {
    this._onDestroy.next ();
    this._onDestroy.complete ();
  }

  setAlarmStatus(status): void
  {
    this.selectedStatus = status;
  }

  schemaChanged(): void
  {
    let schemaName: string = this.alarmFormGroup.get ("schema").value;

    this.isLoading = true;
    this.service.getDatalakeSchemaTables (this, schemaName, this.setSchemaTables, this.setSchemaTablesError);
  }

  setSchemasError(_this, result): void
  {
    console.log (result);
    _this.isLoading = false;
  }

  setSchemaTables(_this, data): void
  {
    let tableSelector = _this.alarmFormGroup.get ("table");

    if (!data.Tables.length)
    {
      _this.isLoading = false;

      tableSelector.setValue (null);
      tableSelector.disable ();
      tableSelector.markAsUntouched ();
      return;
    }

    _this.tables = [];

    for (let tableName of data.Tables)
      _this.tables.push (tableName);

    _this.filteredTables.next (_this.tables.slice ());
    tableSelector.setValue (null);
    tableSelector.enable ();
    tableSelector.markAsUntouched ();
    _this.isLoading = false;
  }

  setSchemaTablesAfterOpening(_this, data): void
  {
    let tableSelector = _this.alarmFormGroup.get ("table");

    if (!data.Tables.length)
    {
      _this.isLoading = false;

      tableSelector.setValue (null);
      tableSelector.disable ();
      tableSelector.markAsUntouched ();
      return;
    }

    _this.tables = [];

    for (let tableName of data.Tables)
      _this.tables.push (tableName);

    _this.filteredTables.next (_this.tables.slice ());
    _this.isLoading = false;
  }

  setSchemaTablesError(_this, result): void
  {
    let tableSelector = _this.alarmFormGroup.get ("table");

    // TODO: Show dialog
    console.log (result);
    _this.tables = [];
    _this.filteredTables.next (_this.tables.slice ());
    tableSelector.setValue (null);
    tableSelector.disable ();
    tableSelector.markAsUntouched ();
    _this.isLoading = false;
  }

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

  enableTimePicker(): void
  {
    let clock;

    if (!this.notifyMode)
      return;

    this.changeDetectorRef.detectChanges ();

    clock = timePicker ({
      element: document.getElementById ("time-picker-edit"),
      time: new Date (),
      width: "100%"
    });

    clock.set12h ();
  }

  onNoClick(): void
  {
    this.dialogRef.close ();
  }

  saveAlarm(): void
  {
    this.dialogRef.close ({
      schemaName: this.alarmFormGroup.get ("schema").value,
      tableName: this.alarmFormGroup.get ("table").value,
      selectedStatus: this.selectedStatus
    });
  }

  getHeaderDisplayStatus(): string
  {
    if (this.isLoading)
      return "none";

    return "flex";
  }

  getFormDisplayStatus(): string
  {
    if (this.isLoading)
      return "none";

    return "block";
  }
}
