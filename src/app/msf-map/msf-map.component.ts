import { Component, OnInit, ViewChild } from '@angular/core';
import { ApplicationService } from '../services/application.service';
import { Globals } from '../globals/Globals';
// import { AgmMap } from '@agm/core';
import { AmChartsService, AmChart } from "@amcharts/amcharts3-angular";
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-msf-map',
  templateUrl: './msf-map.component.html',
  styles: [`
    mgl-map {
      height: 100%;
      width: 100%;
    }
  `]
})
export class MsfMapComponent implements OnInit {

  @ViewChild('map')
  map: mapboxgl.Map;

  mapReady: boolean=false;

  zoom = [1];
  
  center = [-73.968285, 40.785091];

  data = [];

  coordinates = [];

  paint = {        
            'circle-radius': 2,
            'circle-color': '#B42222'
          };

  layout = {
              "icon-image": "{icon}-15",
              "text-field": "{title}",
              "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
              "text-offset": [0, 0.6],
              "text-anchor": "top"
          };

  mapTypes:any[] = [
    {id:'line',name:'Lines'},                      
    {id:'point',name:'Dots'}
  ]; 

  currentMapType;

  private chart: AmChart;

  constructor( private services: ApplicationService, public globals: Globals, private AmCharts: AmChartsService) { }


  ngOnInit() {
    this.currentMapType = this.mapTypes[1];
  }

  getTrackingDataSource(){
    this.zoom = [1];
    this.globals.startTimestamp = new Date();
    this.data = [];
    this.globals.isLoading = true;
    this.services.getMapBoxTracking(this,this.successHandler, this.errorHandler);    
  }

  successHandler(_this,features){
    _this.globals.endTimestamp = new Date();
    _this.data = features;
    _this.setCoordinates(features);
    if(features.length > 0){  
      let size =  Math.round(features[0].features.length/2);
      _this.center = features[0].features[size].geometry.coordinates;       
      _this.getChart(_this);  
      _this.zoom = [4];    
    }
    _this.globals.isLoading = false;
    
	}

  errorHandler(_this,data){
    _this.globals.isLoading = false;
  }

  getHeight(){
    if(this.data != null && this.data.length == 1 ){
      return 60;
    }
    return 100;
  }

  getChart(_this){
    _this.mapReady = true;
    let chartData = _this.generateChartData();

    _this.chart = _this.AmCharts.makeChart("chartdiv", {
        "type": "serial",
        "theme": "black",
        "legend": {
            "useGraphSettings": true
        },
        "dataProvider": chartData,
        "synchronizeGrid":true,
        "valueAxes": [{
            "id":"v1",
            "axisColor": "#FF6600",
            "axisThickness": 2,
            "axisAlpha": 1,
            "position": "left"
        }, {
            "id":"v2",
            "axisColor": "#FCD202",
            "axisThickness": 2,
            "axisAlpha": 1,
            "position": "right"
        }],
        "graphs": [{
            "valueAxis": "v1",
            "lineColor": "#FF6600",
            "hideBulletsCount": 0,
            "title": "Altitude",
            "valueField": "altitude",
        "fillAlphas": 0
        }, {
            "valueAxis": "v2",
            "lineColor": "#FCD202",
            "hideBulletsCount": 0,
            "title": "Speed",
            "valueField": "groundSpeed",
        "fillAlphas": 0
        }],
        "chartScrollbar": {},
        "chartCursor": {
            "cursorPosition": "mouse"
        },
        "categoryField": "pointInTime",
        "categoryAxis": {
            "parseDates": false,
            "axisColor": "#DADADA",
            "minorGridEnabled": true,
            "labelsEnabled": false
        },
        "export": {
          "enabled": false
        }
    });

    _this.chart.addListener("dataUpdated", _this.zoomChart);
    _this.zoomChart();
  }
  

  generateChartData() {
      var chartData = [];
      if(this.data != null && this.data.length == 1 ){
        chartData = this.data[0].features;      
      }
      return chartData;
  }

  zoomChart(){
    let lastIndex =  Math.round(this.chart.dataProvider.length);
    this.chart.zoomToIndexes(0, lastIndex);  
  }

  mapTypeChange(type){
    switch (type.id) {
      case 'line':

        break;
      case 'point':
        
        break;
    }
  }

  setCoordinates(data){
    for(let features of data){
      for(let feature of features.features){
        this.coordinates.push(feature.geometry.coordinates);
      }
    }    
  }

}
