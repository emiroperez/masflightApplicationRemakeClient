import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Globals } from '../globals/Globals';
import { Themes } from '../globals/Themes';
import * as moment from 'moment';

@Component({
  selector: 'app-msf-schedule-panel-info',
  templateUrl: './msf-schedule-panel-info.component.html',
  styleUrls: ['./msf-schedule-panel-info.component.css']
})
export class MsfSchedulePanelInfoComponent implements OnInit {

  @Output("rebuildMapRoutes")
  rebuildMapRoutes = new EventEmitter ();

  constructor(public globals: Globals) { }

  ngOnInit() {

  }

  getMapLineColor(index: number): string
  {
    return Themes.AmCharts[this.globals.theme].mapLineColor[index].rgba;
  }

  getFormat(name: string): string
  {
    if (this.globals.currentOption.metaData == 5)
    {
      let momentValue = moment (name, "YYYYMMDD");

      if (!momentValue.isValid())
        return name;

      return new DatePipe ('en-US').transform (momentValue.toDate (), "MM/dd/yyyy");
    }

    return name;
  }
}
