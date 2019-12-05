import { Component, ChangeDetectorRef, Inject } from '@angular/core';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { timePicker } from 'analogue-time-picker';

import { Globals } from '../globals/Globals';
import { DatalakeService } from '../services/datalake.service';
import { DatalakeAlarmAddEmailDialogComponent } from '../datalake-alarm-add-email-dialog/datalake-alarm-add-email-dialog.component';
import { MessageComponent } from '../message/message.component';

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
  listEmail: any[] = [];

  tableFilterCtrl: FormControl = new FormControl ();
  filteredTables: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  _onDestroy: Subject<void> = new Subject<void> ();
  timeh: any;
  timem: any;
  time: any;
  clock: any;

  constructor(public dialogRef: MatDialogRef<DatalakeAlarmEditDialogComponent>,
    public globals: Globals, private formBuilder: FormBuilder,
    private service: DatalakeService, private changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { alarm: any, schemas: string[] })
  {
    this.schemas = JSON.parse (JSON.stringify (this.data.schemas));
    this.monitoringStatus = this.data.alarm.monitoringStatus;
    if(this.data.alarm.emailList){
      this.listEmail = this.data.alarm.emailList;
    }

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
    mins = cronExp[0].replace("*/", ""),
    hours = cronExp[1].replace("*/", ""), 
    days = cronExp[2], 
    month = cronExp[3],
    weekDays = cronExp[4];
    const h = this.getTimeFormat(hours);
    const m = this.getTimeFormat(mins);

    if ((cronExp[1].indexOf ("/") > -1) || (cronExp[0].indexOf ("/") > -1)){
      this.notifyMode = false;
      this.time = new Date ();
      this.timeh = this.time.getHours();
      this.timem = this.time.getMinutes();
      this.minutes = cron ;
      /*if(hours != '*'){
        //convierto las horas y los minutos a minutos
        this.minutes = (parseInt(hours)*60) + parseInt(mins);
      }else {
        if(mins != '*'){
          this.minutes = m ;
        }
      }*/
    }else{
      this.notifyMode = true;
      this.timeh = h;
      this.timem = m;
    }
    // if(hours === '*'){
    //   this.notifyMode = false;
    //   this.minutes = m ;
    // }else{
    //   this.notifyMode = true;
    // }
    this.enableTimePicker(this.timeh, this.timem);

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
  // enableTimePicker(): void
  {
    // let clock;

    if (!this.notifyMode)
      return;

    this.changeDetectorRef.detectChanges ();

    this.clock = timePicker ({
      element: document.getElementById ("time-picker-edit"),
      mode: 12,
      // time: new Date (),
      // time: { hour: this.time, minute: this.time },
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
    let request;
    //armo el cron
    if (this.notifyMode){
      this.cron = this.transformCronExpression(""+this.clock.getTime().hour,""+this.clock.getTime().minute);
    }else{
      /*//notificarme cada X minutos
      //trasformo los minutos a horas si pasan de 60
      if(this.minutes>=60){
        const calc = this.minutes / 60 ;
        const h = Math.trunc(calc);
        const m = this.minutes - (h * 60) ;
        this.cron = this.transformCronExpression(""+h,""+m);
      }else{
        this.cron = this.transformCronExpression(null,""+this.minutes);
      }*/
      this.cron = this.minutes;
    }

    this.listEmail.forEach(element => {
      if(!element.remove){
        element.remove = 'F';
      }
    });

    request = {
      schemaName: this.alarmFormGroup.get ("schema").value,
      tableName: this.alarmFormGroup.get ("table").value,
      cron: this.cron,
      monitoringStatus: this.monitoringStatus,
      emailList: this.listEmail
    };
    this.globals.isLoading = true;
    this.service.saveDatalakeAlarm (this, request, this.saveAlarmHandler, this.saveAlarmError);

  }

  saveAlarmHandler(_this, data) {
    if (data.Message === "OK"){
      // _this.dialogRef.close ({
      //   schemaName: _this.alarmFormGroup.get ("schema").value,
      //   tableName: _this.alarmFormGroup.get ("table").value,
      //   monitoringStatus: _this.monitoringStatus,
      //   cron: _this.cron,
      //   listEmail: _this.listEmail
      // });
      _this.dialogRef.close();
    }else{
      _this.globals.isLoading = false;
      _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: data.Message ? data.Message : "Errors not available" }
      });

    }
    
  }

  saveAlarmError() {

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
    if(hour){
      hours = this.getTimePart('hour',hour);
    }
    // else{
    //   if(mins){
    //     mins = "*/"+mins;
    //   }
    // }
    if (!this.notifyMode){
      if(hours){
        hours = "*/"+hours;
      }else{
        if(mins){
          mins = "*/"+mins;
        }
      }
    }

    cronExpression = cronExpression.replace('mins', mins);
    cronExpression = cronExpression.replace('hours', hours);
    cronExpression = cronExpression.replace('days', days);
    cronExpression = cronExpression.replace('month', month);
    cronExpression = cronExpression.replace('weekDay', weekDays);

    return cronExpression;
}

getTimePart(type,time){
  if(time.length > 1){
    if(time.charAt(0)=='0'){        
      return time.charAt(1)
    }else{
      return time;
    }
  }else{
    return time;
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

  AddEmail(): void
  {
    let dialogRef = this.dialog.open (DatalakeAlarmAddEmailDialogComponent, {
      height: 'auto',
      width: '400px',
      panelClass: 'AddEmailSendAlarms',
      // data: this.listEmail
      data: {
        emailList: this.listEmail,
        OnlyRead: false        
      }
    });

    dialogRef.afterClosed ().subscribe ((result) => {
      if (result)
      {
        this.listEmail = result;
      }

    });
  }
}
