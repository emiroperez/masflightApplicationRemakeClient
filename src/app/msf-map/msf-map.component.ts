import { Component, OnInit, ViewChild } from '@angular/core';
import { ApplicationService } from '../services/application.service';
import { Globals } from '../globals/Globals';
import { AgmMap } from '@agm/core';
import { AmChartsService, AmChart } from "@amcharts/amcharts3-angular";

@Component({
  selector: 'app-msf-map',
  templateUrl: './msf-map.component.html',
  styleUrls: ['./msf-map.component.css']
})
export class MsfMapComponent implements OnInit {

  lat: number = 40.74093;
  lng: number = -74.38954;

  @ViewChild('AgmMap')
  agmMap: AgmMap;

  mapReady: boolean=false;

  styles: any[] = [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#212121"
        }
      ]
    },
    {
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#212121"
        }
      ]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "administrative.country",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#bdbdbd"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#181818"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#1b1b1b"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#2c2c2c"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#8a8a8a"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#373737"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#3c3c3c"
        }
      ]
    },
    {
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#4e4e4e"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#000000"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#3d3d3d"
        }
      ]
    }
  ];

  iconMarker = {
    url: '../../assets/images/ovni.png',
    scaledSize: {
      width: 5,
      height: 5
    }
 }

 iconHost = {
  url: '../../assets/images/AirportDate&Time.png',
  scaledSize: {
    width: 25,
    height: 25
  }
  }


  polylines = [];

  origin: any
  destination: any

  constructor( private services: ApplicationService, public globals: Globals, private AmCharts: AmChartsService) { }


  private chart: AmChart;

  ngOnInit() {
    
  }

  ngAfterViewInit(){
    
  }


  getTrackingDataSource(){
    this.globals.isLoading = true;
    this.services.getTracking(this,this.successHandler, this.errorHandler);    
  }
  
   
  onMarkerMouseOver(infoWindow, gm) {
      if (gm.lastOpen != null) {
          gm.lastOpen.close();
      }
      gm.lastOpen = infoWindow;
      infoWindow.open();
  }

  index = 0;
  paintMarker(i, points: any[]){
    if(i === 0){
      this.index = 0;
      return true;
    }
    if(i === points.length -1){
      this.index = points.length - 1;
      return true;
    }
    if(i > (this.index + 500)){
      this.index = i + 500;
      return true;
    }
    return false;
  }

  successHandler(_this,data){
    if(data.length > 0){
      _this.polylines = data;
      _this.lat = data[0].path[0].latitude;
      _this.lng = data[0].path[0].longitude;
      _this.getChart(_this);      
    }
    _this.globals.isLoading = false;
    
	}

  errorHandler(_this,data){
    _this.globals.isLoading = false;
  }

  getHeight(){
    if(this.polylines != null && this.polylines.length == 1 ){
      return 60;
    }
    return 100;
  }

  getChart(_this){
      /* chart */
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
    if(this.polylines != null && this.polylines.length == 1 ){
      chartData = this.polylines[0].path;
    }
    return chartData;
}

zoomChart(){
  let lastIndex =  Math.round(this.chart.dataProvider.length);
  this.chart.zoomToIndexes(0, lastIndex);  
}

}
