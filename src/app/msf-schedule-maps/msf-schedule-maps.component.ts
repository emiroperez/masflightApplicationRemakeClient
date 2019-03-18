import { Component, OnInit } from '@angular/core';
import { AmChart, AmChartsService } from '@amcharts/amcharts3-angular';
import { Globals } from '../globals/Globals';
@Component({
  selector: 'app-msf-schedule-maps',
  templateUrl: './msf-schedule-maps.component.html',
  styleUrls: ['./msf-schedule-maps.component.css']
})
export class MsfScheduleMapsComponent implements OnInit {

  constructor(private AmCharts: AmChartsService, public globals: Globals) { }


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
  ngAfterViewInit() {
       this.globals.scheduleChart = this.AmCharts.makeChart ("chartdivmap", this.makeOptions (""));
  }

}
