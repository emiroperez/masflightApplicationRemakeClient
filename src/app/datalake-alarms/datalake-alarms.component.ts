import { Component, OnInit, ChangeDetectorRef, HostListener, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { timePicker } from 'analogue-time-picker';

import { Globals } from '../globals/Globals';
import { DatalakeService } from '../services/datalake.service';
import { ApplicationService } from '../services/application.service';
import { DatalakeAlarmEditDialogComponent } from '../datalake-alarm-edit-dialog/datalake-alarm-edit-dialog.component';

@Component({
  selector: 'app-datalake-alarms',
  templateUrl: './datalake-alarms.component.html'
})
export class DatalakeAlarmsComponent implements OnInit {
  schemas: string[] = [];
  tables: string[] = [];
  alarms: any[] = [];

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  alarmFormGroup: FormGroup;
  notifyMode: boolean = false;
  monitoringStatus: string = 'A';

  tableFilterCtrl: FormControl = new FormControl ();
  filteredTables: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  _onDestroy: Subject<void> = new Subject<void> ();

  alarmColumns: string[] = ['schemaName', 'tableName', 'cron', 'status', 'actions'];
  alarmTable: MatTableDataSource<any>;
  // alarms: any[] = [
  // {
  //   schemaName: "fr24p",
  //   tableName: "fradar24_r",
  //   cron: "**5**",
  //   monitoringStatus: 'I',
  //   notifyMode: 0
  // }
  // ];

  innerHeight: number;

  constructor(public globals: Globals, private formBuilder: FormBuilder,
    private service: DatalakeService, private changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog, private appService: ApplicationService) {
    this.alarmFormGroup = this.formBuilder.group ({
      schema: ['', Validators.required],
      table: new FormControl ({ value: '', disabled: true }, Validators.required)
    });

    this.filteredTables.next (this.tables.slice ());
    this.searchChange ();
  }

  ngOnInit()
  {
    this.innerHeight = window.innerHeight;

    this.globals.isLoading = true;
    this.service.getDatalakeAlarms (this, this.setAlarms, this.setAlarmsError);
    this.service.getDatalakeSchemas (this, this.setSchemas, this.setSchemasError);
  }

  
  setAlarms(_this, data): void
  {
    if (!data.alarms.length)
    {
      _this.globals.isLoading = false;
      return;
    }

    for (let alarm of data.alarms){
      _this.alarms.push (alarm);
    }

    
    _this.alarmTable = new MatTableDataSource (_this.alarms);
    _this.alarmTable.paginator = _this.paginator;
    _this.globals.isLoading = false;
  }

  setAlarmsError(_this, result): void
  {
    console.log (result);
    _this.globals.isLoading = false;
  }

  ngOnDestroy(): void
  {
    this._onDestroy.next ();
    this._onDestroy.complete ();
  }

  setAlarmStatus(status): void
  {
    this.monitoringStatus = status;
  }

  schemaChanged(): void
  {
    let schemaName: string = this.alarmFormGroup.get ("schema").value;

    this.globals.isLoading = true;
    this.service.getDatalakeSchemaTables (this, schemaName, this.setSchemaTables, this.setSchemaTablesError);
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

  setSchemaTables(_this, data): void
  {
    let tableSelector = _this.alarmFormGroup.get ("table");

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
    tableSelector.setValue (null);
    tableSelector.enable ();
    tableSelector.markAsUntouched ();
    _this.globals.isLoading = false;
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
    _this.globals.isLoading = false;
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
      element: document.getElementById ("time-picker"),
      time: new Date (),
      width: "100%"
    });

    clock.set12h ();
  }

  editAlarm(alarm): void
  {
    let dialogRef = this.dialog.open (DatalakeAlarmEditDialogComponent, {
      width: '600px',
      panelClass: 'datalake-edit-alarm-dialog',
      data: {
        alarm: alarm,
        schemas: this.schemas
      }
    });

    dialogRef.afterClosed ().subscribe ((result) => {
      if (result)
      {
        alarm.schemaName = result.schemaName;
        alarm.tableName = result.tableName;
        alarm.monitoringStatus = result.monitoringStatus;
        alarm.cron = result.cron;
      }
    });
  }

  removeAlarm(alarm): void
  {
    this.appService.confirmationDialog (this, "Do you want to delete this alarm?",
      function (_this)
      {
        _this.alarms.splice (_this.alarms.indexOf (alarm), 1);

        _this.alarmTable.data = _this.alarms;
        _this.alarmTable._updateChangeSubscription ();
      }
    );
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
}
