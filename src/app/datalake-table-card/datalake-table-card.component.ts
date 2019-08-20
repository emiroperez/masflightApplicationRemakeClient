import { Component, OnInit, Input } from '@angular/core';

import { Globals } from '../globals/Globals';
import { DatalakeTableCardValues } from './datalake-table-card-values';

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
  gaugeBackgroundColor: string = "#4D4D4D";

  @Input("values")
  values: DatalakeTableCardValues;

  constructor(public globals: Globals) { }

  getForegroundColorFromValue(value: number): string
  {
    if (value < 25)
      return "#FF3232";
    else if (value < 75)
      return "#FFDD27";

    return "#36C7C7";
  }

  ngOnInit() {
  }

}
