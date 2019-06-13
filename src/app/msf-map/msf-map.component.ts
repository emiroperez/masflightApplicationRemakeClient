import { Component, OnInit, Input, Output, EventEmitter, NgZone, SimpleChanges, HostListener } from '@angular/core';
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

  @Input('useCancelButton')
  useCancelButton: boolean;

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

  mapStyles:any[] = [                  
    {id:"mapbox://styles/mapbox/dark-v9",name:'Dark'},
    {id:"mapbox://styles/mapbox/light-v10",name:'Light'}
  ]; 

  @Input('currentMapType')
  currentMapType = this.mapTypes[1];

  @Input('currentMapStyle')
  currentMapStyle = this.mapStyles[1];

  resizeInterval: any;
  resizeTimeout: any;

  @Input("displayOptionPanel")
  displayOptionPanel: boolean;

  @Input("displayMapMenu")
  displayMapMenu: boolean = true;

  constructor( private zone: NgZone, private services: ApplicationService, public globals: Globals) { }


  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if (changes['displayOptionPanel'])
    {
      if (this.resizeTimeout)
      {
        clearInterval (this.resizeTimeout);
        this.resizeTimeout = null;
      }

      if (this.resizeInterval)
      {
        clearInterval (this.resizeInterval);
        this.resizeInterval = null;
      }

      // poll every 50 ms to keep the mapbox with proper size during
      // the interval
      this.resizeInterval = setInterval (() => {
        this.zone.runOutsideAngular (() => {
          if (this.map && this.currentMapType.id == 'point')
            this.map.resize ();

          if (this.map2 && this.currentMapType.id == 'line')
            this.map2.resize ();
        });
      }, 50);

      this.resizeTimeout = setTimeout (() => {
        if (this.resizeInterval)
        {
          clearInterval (this.resizeTimeout);
          clearInterval (this.resizeInterval);
          this.resizeInterval = null;
          this.resizeTimeout = null;
        }
      }, 2000);
    }
  }

  getTrackingDataSource(){
    this.zoom = [1];
    this.globals.startTimestamp = new Date();
    this.data = [];
    this.coordinates = [];
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

  generateCoordinates(coordinates)
  {
    this.globals.endTimestamp = new Date();
    this.data = coordinates;
    this.setCoordinates (coordinates);

    if (coordinates.length > 0)
    {  
      let size =  Math.round (coordinates[0].features.length / 2);
      this.center = coordinates[0].features[size].geometry.coordinates;       
      this.zoom = [4];    
    }
  }

  errorHandler(_this,data){
    _this.finishLoading.emit (true);
    if(!_this.globals.isLoading){
      _this.globals.showBigLoading = true;
    }
  }

  getHeight(): string {
    // if(this.data != null && this.data.length == 1 ){
    //   return 60;
    // }
    return "100%";
  }

  mapTypeChange(type){
    switch (type.id) {
      case 'line':
        if (this.map2)
          this.map2.resize ();
        break;
      case 'point':
        if (this.map)
          this.map.resize ();
        break;
    }
  }

  mapStyleChange(style){
    switch (style.name) {
      case 'light':
        if (this.map2) {
          this.map2.resize ();
        }else if (this.map) {
          this.map.resize ();
        }
        break;
      case 'dark':        
        if (this.map2) {
          this.map2.resize ();
       }else if (this.map) {
          this.map.resize ();
        }
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

  resizeMap(): void
  {
    if (this.map && this.currentMapType.id == 'point')
      this.map.resize ();

    if (this.map2 && this.currentMapType.id == 'line')
      this.map2.resize ();
  }

  @HostListener('window:resize', ['$event'])
  checkScreen(event): void
  {
    this.resizeMap ();
  }
}
