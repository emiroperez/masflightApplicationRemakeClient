import { Component, OnInit } from '@angular/core';

import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-datalake-table-card',
  templateUrl: './datalake-table-card.component.html'
})
export class DatalakeTableCardComponent implements OnInit {

  // Gauge templates
  gaugeType: string = "semi";
  gaugeLastHourValue: number = 39;
  gaugeLastDayValue: number = 90;
  gaugeLastHourIngestionText: string = "Last Hour Data Ingestion";
  gaugeLastDayIngestionText: string = "Last Day Data Ingestion";
  gaugeAppendText: string = "%";
  gaugeLastHourForegroundColor: string = "#FFDD27";
  gaugeLastDayForegroundColor: string = "#36C7C7";
  gaugeBackgroundColor: string = "#4D4D4D";

  constructor(public globals: Globals) { }

  ngOnInit() {
  }

}
