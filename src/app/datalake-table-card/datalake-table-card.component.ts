import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Globals } from '../globals/Globals';
import { DatalakeTableCardValues } from './datalake-table-card-values';
import { DatalakeTableShowColumnsComponent } from '../datalake-table-show-columns/datalake-table-show-columns.component';
import { DatalakeTablePreviewComponent } from '../datalake-table-preview/datalake-table-preview.component';

@Component({
  selector: 'app-datalake-table-card',
  templateUrl: './datalake-table-card.component.html'
})
export class DatalakeTableCardComponent implements OnInit {
  selectedTabIndex: number = 0;

  // Gauge templates
  gaugeType: string = "semi";
  gaugeLastHourValue: number = 39;
  gaugeLastDayValue: number = 90;
  gaugeLastHourIngestionText: string = "Last Hour Data Ingestion";
  gaugeLastDayIngestionText: string = "Last Day Data Ingestion";
  gaugeAppendText: string = "%";
  gaugeBackgroundColor: string = "#4D4D4D";

  @Input("values")
  values: DatalakeTableCardValues;

  constructor(public globals: Globals, private dialog: MatDialog) { }

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
}
