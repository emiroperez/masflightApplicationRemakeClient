import { Component, OnInit } from '@angular/core';
import { Globals } from '../globals/Globals';
@Component({
  selector: 'app-msf-schedule-panel-info',
  templateUrl: './msf-schedule-panel-info.component.html',
  styleUrls: ['./msf-schedule-panel-info.component.css']
})
export class MsfSchedulePanelInfoComponent implements OnInit {

  constructor(public globals: Globals) { }

  ngOnInit() {

  }

}
