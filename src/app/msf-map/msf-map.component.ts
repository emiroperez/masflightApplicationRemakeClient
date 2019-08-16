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
  finishLoading = new EventEmitter();

  mapReady: boolean = false;

  zoom = [1];

  center = [-73.968285, 40.785091];

  data = [];

  coordinates = [];

  paletteColors: string[] = [
    "#B42222",
    "#2222B4",
    "#22B422",
    "#B4B422",
    "#B422B4",
    "#22B4B4",
    "#E18000",
    "#FF0080",
    "#72C048",
    "#65009F",
    "#B4A6FF",
    "#229AF4",
    "#FF726D",
    "#00CCBE",
    "#E3480E",
    "#4263B9",
    "#FFC918",
    "#778C6D",
    "#EA223B",
    "#0080FF",

    // Generic colors for the dark and light themes when the there are more than 20 routes
    "#FFFFFF",
    "#4D4D4D"
  ];

  layout = {
    "icon-image": "{icon}-15",
    "text-field": "{title}",
    "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
    "text-offset": [0, 0.6],
    "text-anchor": "top"
  };

  mapTypes: any[] = [
    { id: 'line', name: 'Lines' },
    { id: 'point', name: 'Dots' }
  ];

  legendTypes: any[] = [
    { id: 'tailno', name: 'Tail Number' },
    { id: 'flightno', name: 'Flight Number' }
  ];

  mapStyles: any[] = [
    { id: "mapbox://styles/mapbox/dark-v9", name: 'Dark' },
    { id: "mapbox://styles/mapbox/light-v10", name: 'Light' }
  ];

  @Input('currentMapType')
  currentMapType = this.mapTypes[1];

  currentMapStyle = this.mapStyles[this.globals.theme === 'light-theme' ? 1 : 0];
  currentLegendType = this.legendTypes[0];

  resizeInterval: any;
  resizeTimeout: any;

  @Input("displayOptionPanel")
  displayOptionPanel: boolean;

  @Input("displayMapMenu")
  displayMapMenu: number = 1;

  @Input("legendOffset")
  legendOffset: number = 0;

  mapRefresh: boolean = false;

  constructor(private zone: NgZone, private services: ApplicationService, public globals: Globals) { }


  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['displayMapMenu'] && this.displayMapMenu) {
      // use dots and current theme as the default map type and style respectively
      this.mapReady = false;
      this.zoom = [1];
      this.center = [-73.968285, 40.785091];
      this.data = [];
      this.coordinates = [];
      this.currentMapStyle = this.mapStyles[this.globals.theme === 'light-theme' ? 1 : 0];
      this.currentMapType = this.mapTypes[1];
      this.currentLegendType = this.legendTypes[0];
      this.refreshMap();
    }

    if (changes['displayOptionPanel']) {
      if (this.resizeTimeout) {
        clearInterval(this.resizeTimeout);
        this.resizeTimeout = null;
      }

      if (this.resizeInterval) {
        clearInterval(this.resizeInterval);
        this.resizeInterval = null;
      }

      // poll every 50 ms to keep the mapbox with proper size during
      // the interval
      this.resizeInterval = setInterval(() => {
        this.zone.runOutsideAngular(() => {
          if (this.map && this.currentMapType.id == 'point')
            this.map.resize();

          if (this.map2 && this.currentMapType.id == 'line')
            this.map2.resize();
        });
      }, 50);

      this.resizeTimeout = setInterval(() => {
        if (this.resizeInterval) {
          clearInterval(this.resizeTimeout);
          clearInterval(this.resizeInterval);
          this.resizeInterval = null;
          this.resizeTimeout = null;
        }
      }, 2000);
    }
  }

  refreshMap() {
    this.mapRefresh = true;

    setTimeout(() => {
      this.mapRefresh = false;
    }, 10);
  }

  getTrackingDataSource() {
    this.zoom = [1];
    this.globals.startTimestamp = new Date();
    this.data = [];
    this.coordinates = [];
    // this.isLoading = true;
    this.services.getMapBoxTracking(this, this.successHandler, this.errorHandler);
  }

  successHandler(_this, features) {
    let index = 0;

    if (_this.isLoading) {
      _this.globals.endTimestamp = new Date();
      _this.data = features;
      _this.setCoordinates(features);
      if (features.length > 0) {
        let size = Math.round(features[0].features.length / 2);
        _this.center = features[0].features[size].geometry.coordinates;
        _this.zoom = [4];

        for (let feature of features)
        {
          feature.features[0].colorIndex = index++;
          feature.features[0].shown = false;
          if (index >= _this.paletteColors.length - 2)
            index = (_this.globals.theme === "light-theme" ? _this.paletteColors.length - 1 : _this.paletteColors.length - 2);
        }
      }

      _this.refreshMap();

      _this.finishLoading.emit(false);
      if (!_this.globals.isLoading) {
        _this.globals.showBigLoading = true;
      }
    }

  }

  generateCoordinates(coordinates) {
    this.globals.endTimestamp = new Date();
    this.data = coordinates;
    this.setCoordinates(coordinates);

    if (coordinates.length > 0) {
      let size = Math.round(coordinates[0].features.length / 2);
      this.center = coordinates[0].features[size].geometry.coordinates;
      this.zoom = [4];

      coordinates[0].features[0].colorIndex = 0;
      coordinates[0].features[0].shown = true;    // always display the coordinates
    }

    if (this.data)
      this.refreshMap();
  }

  errorHandler(_this, data) {
    _this.finishLoading.emit(true);
    if (!_this.globals.isLoading) {
      _this.globals.showBigLoading = true;
    }
  }

  getHeight(): string {
    if (!this.displayMapMenu || this.globals.currentOption.metaData == 3)
      return "100%";

    return "calc(100% - 40px)";
  }

  mapTypeChange(type) {
    switch (type.id) {
      case 'line':
        if (this.map2)
          this.map2.resize();
        break;
      case 'point':
        if (this.map)
          this.map.resize();
        break;
    }
  }

  mapStyleChange(style) {
    switch (style.name) {
      case 'light':
        if (this.map2) {
          this.map2.resize();
        } else if (this.map) {
          this.map.resize();
        }
        break;
      case 'dark':
        if (this.map2) {
          this.map2.resize();
        } else if (this.map) {
          this.map.resize();
        }
        break;
    }
  }

  setCoordinates(data) {
    for (let features of data) {
      let airlineCoordinates = [];

      for (let feature of features.features)
        airlineCoordinates.push(feature.geometry.coordinates);

      this.coordinates.push(airlineCoordinates);
    }
  }

  cancelLoading() {
    this.isLoading = false;
    this.globals.showBigLoading = true;
  }

  getRouteInfo(feature): string {
    if (this.currentLegendType === this.legendTypes[0])
      return feature.features[0].airline + " - " + feature.features[0].tailNumber;

    return feature.features[0].airline + " - " + feature.features[0].flightNumber;
  }

  resizeMap(): void {
    if (this.map && this.currentMapType.id == 'point')
      this.map.resize();

    if (this.map2 && this.currentMapType.id == 'line')
      this.map2.resize();
  }

  @HostListener('window:resize', ['$event'])
  checkScreen(event): void {
    this.resizeMap();
  }
}
