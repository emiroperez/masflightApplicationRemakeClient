import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Globals } from '../globals/Globals';
import { MatTab, MatTabGroup, MatTabChangeEvent } from '@angular/material';
import { MsfTableComponent } from '../msf-table/msf-table.component';
import { MsfChartOnTimeDelayComponent } from '../msf-chart-on-time-delay/msf-chart-on-time-delay.component';
import { MsfDynamicTableComponent } from '../msf-dynamic-table/msf-dynamic-table.component';
import { MsfMapComponent } from '../msf-map/msf-map.component';
import { MsfDashboardComponent } from '../msf-dashboard/msf-dashboard.component';

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

  @ViewChild('msfScMapRef')
  msfScMapRef: MatTab;
  
  @ViewChild('msfWelcomeTab')
  msfWelcomeTab: MatTab;

  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;

  constructor(public globals: Globals) { }

  ngOnInit() {
  }

  ngAfterViewInit(){
  }

  closeTab(tab : any){
    if(tab==1){
      this.globals.query = false;
    }else if(tab==2){
      this.globals.tab = false;
    }else if(tab==3){
      this.globals.generateDynamicTable = false;
    }else if(tab==4){
      this.globals.chart = false;
    }else if(tab==5){
      this.globals.map = false;
    }
    else if(tab==6){
      this.globals.mapsc = false;
    }
  }

  getCategoryArguments()
  {
    var menuOptionArguments = this.globals.currentOption.menuOptionArguments;
    var categoryArguments = null;
    if(menuOptionArguments[menuOptionArguments.length-1]!=null){
       categoryArguments = menuOptionArguments[menuOptionArguments.length-1].categoryArguments;
    }

    return categoryArguments;
  }

  finishLoadingTable(error)
  {
    this.msfTableRef.isLoading = false;
  }

  onLinkClick(event: any) {
    this.globals.selectedIndex = event;
  
  }
}
