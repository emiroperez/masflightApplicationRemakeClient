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
  monitoringStatus: string = 'A';
  cron: string ;
  minutes: any;
  isLoading: boolean = false;

  tableFilterCtrl: FormControl = new FormControl ();
  filteredTables: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  _onDestroy: Subject<void> = new Subject<void> ();
  time: any;
  clock: any;

  constructor(public dialogRef: MatDialogRef<DatalakeAlarmEditDialogComponent>,
    public globals: Globals, private formBuilder: FormBuilder,
    private service: DatalakeService, private changeDetectorRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { alarm: any, schemas: string[] })
  {
    this.schemas = JSON.parse (JSON.stringify (this.data.schemas));
    this.monitoringStatus = this.data.alarm.monitoringStatus;

    this.alarmFormGroup = this.formBuilder.group ({
      schema: [this.data.alarm.schemaName, Validators.required],
      table: [this.data.alarm.tableName, Validators.required]
    });

    // this.transformManualExpression(this.data.alarm.cron);
    this.cron = this.data.alarm.cron;
    this.isLoading = true;
    this.service.getDatalakeSchemaTables (this, this.data.alarm.schemaName, this.setSchemaTablesAfterOpening, this.setSchemaTablesError);
  }

  transformManualExpression(cron: any){
    let cronExp =cron.split(" "),
    i = 0, 
    mins = cronExp[0], 
    hours = cronExp[1], 
    days = cronExp[2], 
    month = cronExp[3],
    weekDays = cronExp[4];
    const h = this.getTimeFormat(hours);
    const m = this.getTimeFormat(mins);
    if(hours === '*'){
      this.notifyMode = false;
      this.minutes = m ;
    }else{
      this.notifyMode = true;
    }
    this.enableTimePicker(h, m);

}

getTimeFormat(value){
  if(value.length==1){
      return '0'+value;
  }
      return value;
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
    _this.transformManualExpression(_this.cron);
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

  enableTimePicker(pHour, pMin): void
  {
    // let clock;

    if (!this.notifyMode)
      return;

    this.changeDetectorRef.detectChanges ();

    this.clock = timePicker ({
      element: document.getElementById ("time-picker-edit"),
      mode: 12,
      // time: new Date (),
      time: { hour: pHour, minute: pMin },
      width: "100%"
    });
    this.clock.set12h ();
    // this.time = clock.getTime();
  }

  onNoClick(): void
  {
    this.dialogRef.close ();
  }

  saveAlarm(): void
  {
    //armo el cron
    if (this.notifyMode){
      // this.time = this.clock.getTime();
      this.cron = this.transformCronExpression(this.clock.getTime().hour,this.clock.getTime().minute);
    }else{
      this.cron = this.transformCronExpression(null,this.minutes);
    }
    this.dialogRef.close ({
      schemaName: this.alarmFormGroup.get ("schema").value,
      tableName: this.alarmFormGroup.get ("table").value,
      monitoringStatus: this.monitoringStatus,
      cron: this.cron
    });
  }

  transformCronExpression(hour: any, minute: any) {
      let cronExpression = "mins hours days month weekDay",
      i = 0, 
      mins = '*', 
      hours = '*', 
      days = '*', 
      month = '*',
      weekDays = '*';
      if(minute){
        mins = this.getTimePart('min', minute);
      }
      if(){
        hours = this.getTimePart('hour',hour);
      }

      cronExpression = cronExpression.replace('mins', mins);
      cronExpression = cronExpression.replace('hours', hours);
      cronExpression = cronExpression.replace('days', days);
      cronExpression = cronExpression.replace('month', month);
      cronExpression = cronExpression.replace('weekDay', weekDays);
      console.log(cronExpression);
      return cronExpression;
  }

  getTimePart(type,time){
    if(type=='min'){
      let aux = time.split(":")[1]
      if(aux.charAt(0)=='0'){
        return aux.charAt(1)
      }
        return aux;
    }else{
      let aux = time.split(":")[0]
      if(aux.charAt(0)=='0'){
        return aux.charAt(1)
      }
        return aux;
    }
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
