import { Component, OnInit, Input,Output,EventEmitter, ViewChild } from '@angular/core';
import { Option } from '../model/Option';
import {Globals} from '../globals/Globals'
import { MatMenuTrigger } from '@angular/material';
import { OptionWelcomeComponent } from '../option-welcome/option-welcome.component';
import { AmChart, AmChartsService } from '@amcharts/amcharts3-angular';
@Component({
  selector: 'app-menu-option',
  templateUrl: './menu-option.component.html'
})
export class MenuOptionComponent implements OnInit {

  @Input("options") options: Option[];

  @Input("trigger") trigger: MatMenuTrigger;

  @ViewChild('childMenu') public childMenu;





  constructor(private globals: Globals,private AmCharts: AmChartsService) { }

  ngOnInit() {
  }

  makeOptions(dataProvider)
  {

   return {
    "type": "map",
    "theme": "none",
      "backgroundColor" : "#FFFFFF",
      "dataProvider": {
        "map": "worldLow",
        "zoomLevel": 1,
        "zoomLongitude": 2.3510,
        "zoomLatitude": 48.8567
       },
    
      "areasSettings": {
        "outlineColor ": "#3b3b3b",
        "unlistedAreasOutlineColor " : "#3b3b3b",
        "unlistedAreasColor": "#3b3b3b",
        "outlineColor": "#000000",
        "outlineAlpha": 0.5,
        "outlineThickness": 0.5,
        "rollOverBrightness": 30,
        "slectedBrightness": 50,
        "rollOverOutlineColor": "#3b3b3b",
        "selectedOutlineColor": "#3b3b3b",
        "unlistedAreasOutlineColor": "#000000",
        "unlistedAreasOutlineAlpha": 0.2
      },
    
      "imagesSettings": {
        "color": "#dedef7",
        "rollOverColor": "#585869",
        "selectedColor": "#585869",
        "pauseDuration": 0.5,
        "animationDuration": 10,
        "adjustAnimationSpeed": true
      },
    
      "linesSettings": {
        "color": "#00a3e1",
        "arrowSize" : 40,
        "size" :40
      },
    
      "export": {
        "enabled": true
      }  
  }

}

  optionClickHandler(option) {
    this.globals.clearVariables();
    this.globals.currentOption = option;
    this.globals.initDataSource();
    this.globals.dataAvailabilityInit();
    if(this.globals.currentOption.tabType === 'map'){
      this.globals.map = true;
      this.globals.moreResultsBtn = false;
      this.globals.selectedIndex = 1;
    }
    if(this.globals.currentOption.tabType === 'scmap'){
      this.globals.mapsc = true;
      this.globals.moreResultsBtn = false;
      this.globals.selectedIndex = 1;
      this.globals.scheduleChart = this.AmCharts.makeChart ("chartdivmap", this.makeOptions (""));
    }
    if(this.globals.currentOption.tabType === 'statistics'){
      this.globals.usageStatistics = true;
    }
    this.globals.status = true;
  }

  closeMenu() {
    //this.trigger.closeMenu();
  }
}
