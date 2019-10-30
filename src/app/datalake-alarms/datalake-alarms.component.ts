import { Component, OnInit, ChangeDetectorRef, HostListener, ViewChild, Input, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { timePicker } from 'analogue-time-picker';

import { Globals } from '../globals/Globals';
import { DatalakeService } from '../services/datalake.service';
import { ApplicationService } from '../services/application.service';
import { DatalakeAlarmEditDialogComponent } from '../datalake-alarm-edit-dialog/datalake-alarm-edit-dialog.component';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-datalake-alarms',
  templateUrl: './datalake-alarms.component.html'
})
export class DatalakeAlarmsComponent implements OnInit {
  @Input("currentOption")
  currentOption: any;

  schemas: string[] = [];
  tables: string[] = [];
  alarms: any[] = [];
  schemaName: any = "";
  tableName: any= "";
  cron: any= "";
  minutes: any= "";
  // time: any;

  filter: string;

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
  clock: any;
  request: { schemaName: any; tableName: any; cron: any; monitoringStatus: string; };
  search: any;

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
    // this.time = new Date ();
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
    this.schemaName = this.alarmFormGroup.get ("schema").value;

    this.globals.isLoading = true;
    this.service.getDatalakeSchemaTables (this, this.schemaName, this.setSchemaTables, this.setSchemaTablesError);
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

      _this.setschema();
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

    if(_this.currentOption.tableName){
      var index = _this.tables.findIndex (aux => aux == _this.currentOption.tableName);
      if(index != -1){
        tableSelector.setValue (_this.tables[index]);
        tableSelector.disable ();
      }
    }
    
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

  // enableTimePicker(pHour, pMin): void
  enableTimePicker(): void
  {
    // let clock;

    if (!this.notifyMode)
      return;

    this.changeDetectorRef.detectChanges ();

    this.clock = timePicker ({
      element: document.getElementById ("time-picker"),
      mode: 12,
      time: new Date (),
      // time: { hour: pHour, minute: pMin },
      width: "100%"
    });
    this.clock.set12h ();
    // this.time = clock.getTime();
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

  addAlarm() {
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

    this.request = {
      schemaName: this.schemaName,
      tableName: this.tableName,
      cron: this.cron,
      monitoringStatus: this.monitoringStatus
    }

    this.globals.isLoading = true;
    this.service.saveDatalakeAlarm (this, this.request, this.saveAlarmHandler, this.saveAlarmError);
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
    console.log(cronExpression);
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

saveAlarmHandler(_this, data) {
  if (data.Message === "OK"){

    _this.alarms.unshift(_this.request);
    _this.request = {
      schemaName: "",
      tableName: "",
      cron: "",
      monitoringStatus: ""
    }
    _this.alarmTable.data = _this.alarms;
    _this.alarmTable._updateChangeSubscription ();    
    _this.alarmFormGroup.reset()
    // _this.alarmFormGroup.get ("schema").setValue ("");
    // _this.alarmFormGroup.get ("table").setValue ("");
    _this.globals.isLoading = false;
  }else{
    _this.globals.isLoading = false;
    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: data.Message }
    });
  }
  
}

tableChanged(): void
{
  this.tableName = this.alarmFormGroup.get ("table").value;
}

saveAlarmError() {
}

filterAlarm(): void
{
  let search, filteredResults;

  if (!this.alarms.length)
    return;

  // get the search keyword
  search = this.filter;
  if (!search)
  {
    this.alarmTable = new MatTableDataSource (this.alarms);
    this.alarmTable.paginator = this.paginator;
    return;
  }

  search = search.toLowerCase ();
  filteredResults = this.alarms.filter (a => (a.schemaName.toLowerCase ().indexOf (search) > -1
    || a.tableName.toLowerCase ().indexOf (search) > -1));

  this.alarmTable = new MatTableDataSource (filteredResults);
  this.alarmTable.paginator = this.paginator;
}

setschema()
{
  if(this.currentOption.schemaName){
    var index = this.schemas.findIndex (aux => aux == this.currentOption.schemaName);
    if(index != -1){
      this.alarmFormGroup.get ("schema").setValue (this.schemas[index]);
      this.schemaChanged();
    }
  }
}

// ngOnChanges(changes: SimpleChanges): void
// {
//   if (changes['currentOption']){
//     // this.globals.isLoading = false;
//     this.setschema();
//   }
// }

}
