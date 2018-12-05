import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Globals } from '../globals/Globals';
import { MatTab, MatTabGroup } from '@angular/material';
import { MsfTableComponent } from '../msf-table/msf-table.component';
import { MsfChartOnTimeDelayComponent } from '../msf-chart-on-time-delay/msf-chart-on-time-delay.component';
import { MsfDynamicTableComponent } from '../msf-dynamic-table/msf-dynamic-table.component';
import { MsfMapComponent } from '../msf-map/msf-map.component';

@Component({
  selector: 'app-msf-container',
  templateUrl: './msf-container.component.html',
  styleUrls: ['./msf-container.component.css']
})
export class MsfContainerComponent implements OnInit {


  @ViewChild('msfTableRef')
  msfTableRef: MsfTableComponent;

  @ViewChild('msfChartRef')
  msfChartRef: MsfChartOnTimeDelayComponent;

  @ViewChild('msfMapRef')
  msfMapRef: MsfMapComponent;

  @ViewChild('msfDynamicTableRef')
  msfDynamicTableRef: MsfDynamicTableComponent;

  @ViewChild('msfDynamicTableTabRef')
  msfDynamicTableTabRef: MatTab;
  
  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;

  constructor(public globals: Globals) { }

  ngOnInit() {
    
  }

  ngAfterViewInit(){
    
  }

}
