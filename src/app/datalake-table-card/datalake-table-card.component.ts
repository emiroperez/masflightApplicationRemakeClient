import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Globals } from '../globals/Globals';
import { DatalakeTableCardValues } from './datalake-table-card-values';
import { DatalakeTableShowColumnsComponent } from '../datalake-table-show-columns/datalake-table-show-columns.component';
import { DatalakeTablePreviewComponent } from '../datalake-table-preview/datalake-table-preview.component';
import { DatalakeCreateTableComponent } from '../datalake-create-table/datalake-create-table.component';
import { DatalakeService } from '../services/datalake.service';

@Component({
  selector: 'app-datalake-table-card',
  templateUrl: './datalake-table-card.component.html'
})
export class DatalakeTableCardComponent implements OnInit {
  @Output('setOption')
  setOption = new EventEmitter ();
  
  selectedTabIndex: number = 0;

  // Gauge templates
  gaugeType: string = "semi";
  gaugeLastHourValue: number = 39;
  gaugeLastDayValue: number = 90;
  gaugeLastHourIngestionText: string = "Last Hour Data Ingestion";
  gaugeLastDayIngestionText: string = "Last Day Data Ingestion";
  gaugeAppendText: string = "%";
  gaugeBackgroundColor: string;

  @Input("values")
  values: DatalakeTableCardValues;

  constructor(public globals: Globals, private dialog: MatDialog, private service: DatalakeService)
  {
    if (globals.theme === "dark-theme"){
      this.gaugeBackgroundColor = "#4D4D4D";
    }else{
      this.gaugeBackgroundColor = "#CCCCCC";
    }
    if (!this.actionDisable("View table information")) {
      this.selectedTabIndex = 0
    }else if (!this.actionDisable("View table status")) {
        this.selectedTabIndex = 1
      }else if(!this.actionDisable("Show column") || !this.actionDisable("Preview table")){
        this.selectedTabIndex = 0
      }
  }

  getForegroundColorFromValue(value: number): string
  {
    if (value < 25)
      return "#FF3232";
    else if (value < 75)
      return "#FFDD27";

    return "#36C7C7";
  }

  ngOnInit()
  {
    this.gaugeLastHourValue = parseInt(this.values.lastHDI);
    this.gaugeLastDayValue= parseInt(this.values.lastDDI);

  }

  showColumns(): void
  {
    let dialogRef = this.dialog.open (DatalakeTableShowColumnsComponent, {
      panelClass: 'datalake-table-show-table-dialog',
      data: { values: this.values }
    });

    dialogRef.afterClosed ().subscribe (() => {
      this.globals.popupLoading = false;
    });
  }

  previewTable(): void
  {
    let dialogRef = this.dialog.open (DatalakeTablePreviewComponent, {
      panelClass: 'datalake-table-show-table-dialog',
      data: { values: this.values }
    });

    dialogRef.afterClosed ().subscribe (() => {
      this.globals.popupLoading = false;
    });
  }

  viewTableInformation(): void
  {
    this.selectedTabIndex = 0;
  }

  viewTableStats(): void
  {
    this.selectedTabIndex = 1;
  }

  UploadData(): void
  {
   let dialogRef =  this.dialog.open (DatalakeCreateTableComponent, {
      panelClass: 'datalake-create-table-dialog',
      data: {index: 1,
        schemaName: this.values.schemaName,
        tableName: this.values.tableName,
        createdTable: true
      }
    });
  }

  setAlarm(){
    // this.globals.optionDatalakeSelected = 5;
    let data = {
      schemaName: this.values.schemaName,
      tableName: this.values.tableName
    }
    this.globals.optionDatalakeSelected = 5;
    this.setOption.emit(data);
  }

  actionDisable(option: any) {
    let index = this.globals.optionsDatalake.findIndex(od => od.action.name === option);
    if (index != -1) {
      return false;
    } else {
      return true;
    }
  }

  tabIndexChange(event): void
  {
    this.selectedTabIndex = event;
  }

}
