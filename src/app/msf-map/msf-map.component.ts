import { Component, OnInit, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { ApplicationService } from '../services/application.service';
import { Globals } from '../globals/Globals';
// import { AgmMap } from '@agm/core';
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

  map: mapboxgl.Map;
  map2: mapboxgl.Map;

  @Input('isLoading')
  isLoading: any;

  @Output('finishLoading')
  finishLoading = new EventEmitter ();

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
  resizeInterval: any;

  constructor( private zone: NgZone, private services: ApplicationService, public globals: Globals) { }


  ngOnInit() {
    this.currentMapType = this.mapTypes[1];

    // poll every 350 ms to keep the mapbox with proper size
    this.resizeInterval = setInterval (() => {
      this.zone.runOutsideAngular (() => {
        if (this.map && this.currentMapType.id == 'point')
          this.map.resize ();

        if (this.map2 && this.currentMapType.id == 'line')
          this.map2.resize ();
      });
    }, 350);
  }

  ngOnDestroy(): void {
    clearInterval (this.resizeInterval);
  }

  getTrackingDataSource(){
    this.zoom = [1];
    this.globals.startTimestamp = new Date();
    this.data = [];
    // this.isLoading = true;
    this.services.getMapBoxTracking(this,this.successHandler, this.errorHandler);    
  }

  successHandler(_this,features){
    if(_this.isLoading){
      _this.globals.endTimestamp = new Date();
      _this.data = features;
      _this.setCoordinates(features);
      if(features.length > 0){  
        let size =  Math.round(features[0].features.length/2);
        _this.center = features[0].features[size].geometry.coordinates;       
        _this.zoom = [4];    
      }
      _this.finishLoading.emit (false);
      if(!_this.globals.isLoading){
        _this.globals.showBigLoading = true;
      }
    }

}

  errorHandler(_this,data){
    _this.finishLoading.emit (true);
    if(!_this.globals.isLoading){
      _this.globals.showBigLoading = true;
    }
  }

  getHeight(){
    // if(this.data != null && this.data.length == 1 ){
    //   return 60;
    // }
    return 100;
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

  cancelLoading(){
    this.isLoading = false;
  }
}
