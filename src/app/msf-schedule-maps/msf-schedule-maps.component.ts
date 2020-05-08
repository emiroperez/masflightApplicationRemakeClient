import { Component, OnInit, NgZone, SimpleChanges, Input, isDevMode, Output, EventEmitter } from '@angular/core';
import { Globals } from '../globals/Globals';
import { Themes } from '../globals/Themes';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import { MatDialog } from '@angular/material';
import { Utils } from '../commons/utils';
import { MessageComponent } from '../message/message.component';

// AmChart colors
const comet = am4core.color ("#585869");

// SVG used for the map chart
const targetSVG = "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z";
const homeSVG = "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8";

@Component({
  selector: 'app-msf-schedule-maps',
  templateUrl: './msf-schedule-maps.component.html',
  styleUrls: ['./msf-schedule-maps.component.css']
})
export class MsfScheduleMapsComponent implements OnInit {

  @Input("currentOption")
  currentOption: any;

  @Input("buildScheduleMapChart")
  buildScheduleMapChart: boolean;

  @Input("isLoading")
  isLoading: boolean;

  @Output("setRouteLoading")
  setRouteLoading = new EventEmitter ();

  utils: Utils;

  constructor(private zone: NgZone, public globals: Globals, private dialog: MatDialog)
  {
    this.utils = new Utils ();
  }

  ngOnInit()
  {
    this.globals.scheduleChart = null;
  }

  ngOnChanges(changes: SimpleChanges)
  {
    if (changes['currentOption'])
      this.destroyScheduleChart ();
    else if (changes['buildScheduleMapChart'] && this.globals.buildScheduleMapChart)
    {
      this.destroyScheduleChart ();

      setTimeout (() => {
        this.makeScheduleChart ();
        this.globals.buildScheduleMapChart = false;
      }, 50);
    }
  }

  ngOnDestroy()
  {
    this.destroyScheduleChart ();
  }

  destroyScheduleChart()
  {
    if (this.globals.scheduleChart)
    {
      this.zone.runOutsideAngular (() => {
        this.globals.scheduleImageSeries = null;
        this.globals.scheduleLineSeries = null;
        this.globals.scheduleShadowLineSeries = null;
        this.globals.scheduleChart.dispose ();
        this.globals.scheduleChart = null;
      });
    }
  }

  makeScheduleChart()
  {
    let theme, chart, continentSeries, zoomControl, home;

    theme = this.globals.theme;

    this.zone.runOutsideAngular (() => {
      chart = am4core.create ("chartdivmap", am4maps.MapChart);

      // Create map instance
      chart.geodata = am4geodata_worldLow;
      chart.projection = new am4maps.projections.Miller ();

      // Add map polygons and exclude Antartica
      continentSeries = chart.series.push (new am4maps.MapPolygonSeries ());
      continentSeries.useGeodata = true;
      continentSeries.exclude = ["AQ"];
      continentSeries.mapPolygons.template.fill = Themes.AmCharts[theme].mapPolygonColor;
      continentSeries.mapPolygons.template.stroke = Themes.AmCharts[theme].mapPolygonStroke;
      continentSeries.mapPolygons.template.strokeOpacity = 0.25;
      continentSeries.mapPolygons.template.strokeWidth = 0.5;

      // Set default location and zoom level
      chart.homeGeoPoint = {
        latitude: 24.8567,
        longitude: 2.3510
      };

      chart.homeZoomLevel = 1;
      chart.deltaLongitude = 0;

      // Add zoom control buttons
      zoomControl = new am4maps.ZoomControl ();
      chart.zoomControl = zoomControl;
      zoomControl.slider.height = 100;
      zoomControl.valign = "top";
      zoomControl.align = "left";
      zoomControl.marginTop = 40;
      zoomControl.marginLeft = 10;
      zoomControl.plusButton.height = 26;
      zoomControl.minusButton.height = 26;

      // Add home buttom to zoom out
      home = chart.chartContainer.createChild (am4core.Button);
      home.icon = new am4core.Sprite ();
      home.icon.dx -= 9;
      home.icon.dy -= 9;
      home.width = 30;
      home.height = 30;
      home.icon.path = homeSVG;
      home.align = "left";
      home.marginLeft = 15;
      home.dy += 10;
      home.events.on ("hit", function (ev) {
        chart.goHome ();
      });

      this.globals.scheduleChart = chart;
    });
  }

  setRoutesToScMap(records): void
  {
    let theme, imageSeriesTemplate, mapLinesTemplate, circle, hoverState, label, zoomLevel, lastOrigin, numorigincities;
    let cities = [];
    let routes = [];

    this.makeScheduleChart ();
    theme = this.globals.theme;

    if (!records)
      return; // Don't set routes if there are no records

    this.zone.runOutsideAngular (() => {
      // Create image container for the circles and city labels
      this.globals.scheduleImageSeries = this.globals.scheduleChart.series.push (new am4maps.MapImageSeries ());
      imageSeriesTemplate = this.globals.scheduleImageSeries.mapImages.template;

      // Set property fields for the cities
      imageSeriesTemplate.propertyFields.latitude = "latitude";
      imageSeriesTemplate.propertyFields.longitude = "longitude";
      imageSeriesTemplate.horizontalCenter = "middle";
      imageSeriesTemplate.verticalCenter = "middle";
      imageSeriesTemplate.width = 8;
      imageSeriesTemplate.height = 8;
      imageSeriesTemplate.scale = 1;
      imageSeriesTemplate.fill = Themes.AmCharts[theme].tooltipFill;
      imageSeriesTemplate.background.fillOpacity = 0;
      imageSeriesTemplate.background.fill = Themes.AmCharts[theme].mapCityColor;
      imageSeriesTemplate.setStateOnChildren = true;

      // Configure circle and city labels
      circle = imageSeriesTemplate.createChild (am4core.Sprite);
      circle.defaultState.properties.fillOpacity = 1;
      circle.path = targetSVG;
      circle.scale = 0.75;
      circle.fill = Themes.AmCharts[theme].mapCityColor;
      circle.dx -= 2.5;
      circle.dy -= 2.5;
      hoverState = circle.states.create ("hover");
      hoverState.properties.fill = comet;

      label = imageSeriesTemplate.createChild (am4core.Label);
      label.text = "{tooltipText}";
      label.scale = 1;
      label.horizontalCenter = "left";
      label.verticalCenter = "middle";
      label.dx += 17.5;
      label.dy += 5.5;
      label.fill = Themes.AmCharts[theme].mapCityColor;
      hoverState = label.states.create ("hover");
      hoverState.properties.fill = Themes.AmCharts[theme].mapCityLabelHoverColor;
      hoverState.properties.fillOpacity = 1;

      imageSeriesTemplate.events.on ("over", function (event) {
        event.target.setState ("hover");
      });

      imageSeriesTemplate.events.on ("out", function (event) {
        event.target.setState ("default");
      });

      let tempLatCos, tempLat, tempLng;
      var sumX = 0;
      var sumY = 0;
      var sumZ = 0;

      // Sort the results by origin
      records.sort (function (e1, e2) {
        return e2.origin - e1.origin;
      });

      lastOrigin = null;
      numorigincities = 0;

      // Add cities and routes
      for (let record of records)
      {
        let city, latOrigin, lonOrigin, latDest, lonDest;

        latOrigin = parseFloat (record.latOrigin);
        lonOrigin = parseFloat (record.lonOrigin);
        latDest = parseFloat (record.latDest);
        lonDest = parseFloat (record.lonDest);

        if (latOrigin === "NULL" || lonOrigin === "NULL")
        {
          console.warn (record.origin + " have invalid coordinates! (lat: " + latOrigin + ", lon: " + lonOrigin + ")");
          continue;
        }
  
        if (latDest === "NULL" || lonDest === "NULL")
        {
          console.warn (record.origin + " have invalid coordinates! (lat: " + latDest + ", lon: " + lonDest + ")");
          continue;
        }

        if (cities.indexOf (record.origin) == -1)
        {
          // Add origin city
          city = this.globals.scheduleImageSeries.mapImages.create ();
    
          if (latOrigin < -90 || latOrigin > 90 || lonOrigin < -180 || lonOrigin > 180)
          {
            console.warn (record.origin + " have invalid coordinates! (lat: " + latOrigin + ", lon: " + lonOrigin + ")");

            if (latOrigin < -90 || latOrigin > 90)
              latOrigin /= 1000000;

            if (lonOrigin < -180 || lonOrigin > 180)
              lonOrigin /= 1000000;
          }
    
          city.latitude = latOrigin;
          city.longitude = lonOrigin;
          city.nonScaling = true;
          city.tooltipText = record.origin;

          cities.push (record.origin);

          tempLat = this.utils.degr2rad (city.latitude);
          tempLng = this.utils.degr2rad (city.longitude);
          tempLatCos = Math.cos (tempLat);
          sumX += tempLatCos * Math.cos (tempLng);
          sumY += tempLatCos * Math.sin (tempLng);
          sumZ += Math.sin (tempLat);
        }
        else
        {
          if (latOrigin < -90 || latOrigin > 90)
            latOrigin /= 1000000;

          if (lonOrigin < -180 || lonOrigin > 180)
            lonOrigin /= 1000000;
        }

        // Add destination city
        if (cities.indexOf (record.dest) == -1)
        {
          city = this.globals.scheduleImageSeries.mapImages.create ();
    
          if (latDest < -90 || latDest > 90 || lonDest < -180 || lonDest > 180)
          {
            console.warn (record.dest + " have invalid coordinates! (lat: " + latDest + ", lon: " + lonDest + ")");

            if (latDest < -90 || latDest > 90)
              latDest /= 1000000;

            if (lonDest < -180 || lonDest > 180)
              lonDest /= 1000000;
          }
    
          city.latitude = latDest;
          city.longitude = lonDest;
          city.nonScaling = true;
          city.tooltipText = record.dest;

          cities.push (record.dest);

          tempLat = this.utils.degr2rad (city.latitude);
          tempLng = this.utils.degr2rad (city.longitude);
          tempLatCos = Math.cos (tempLat);
          sumX += tempLatCos * Math.cos (tempLng);
          sumY += tempLatCos * Math.sin (tempLng);
          sumZ += Math.sin (tempLat);
        }
        else
        {
          if (latDest < -90 || latDest > 90)
            latDest /= 1000000;

          if (lonDest < -180 || lonDest > 180)
            lonDest /= 1000000;
        }

        if (record.origin == lastOrigin)
        {
          // Add route
          routes.push ([
            { "latitude": latOrigin, "longitude": lonOrigin },
            { "latitude": latDest, "longitude": lonDest }
          ]);
        }
        else
        {
          if (lastOrigin != null)
          {
            // Create map line series and connect the origin city to the desination cities
            this.globals.scheduleLineSeries = this.globals.scheduleChart.series.push (new am4maps.MapLineSeries ());
            this.globals.scheduleLineSeries.zIndex = 10;
            this.globals.scheduleLineSeries.data = [{
              "multiGeoLine": routes
            }];

            // Set map line template
            mapLinesTemplate = this.globals.scheduleLineSeries.mapLines.template;
            mapLinesTemplate.opacity = 0.6;
            mapLinesTemplate.stroke = Themes.AmCharts[theme].mapLineColor[numorigincities];
            mapLinesTemplate.horizontalCenter = "middle";
            mapLinesTemplate.verticalCenter = "middle";

            routes = [];
            numorigincities++;
            if (numorigincities > 12)
              numorigincities = 12;
          }
          else
          {
            routes.push ([
              { "latitude": latOrigin, "longitude": lonOrigin },
              { "latitude": latDest, "longitude": lonDest }
            ]);
          }

          lastOrigin = record.origin;
        }
      }

      // Create map line series and connect the origin city to the desination cities
      this.globals.scheduleLineSeries = this.globals.scheduleChart.series.push (new am4maps.MapLineSeries ());
      this.globals.scheduleLineSeries.zIndex = 10;
      this.globals.scheduleLineSeries.data = [{
        "multiGeoLine": routes
      }];

      // Set map line template
      mapLinesTemplate = this.globals.scheduleLineSeries.mapLines.template;
      mapLinesTemplate.opacity = 0.6;
      mapLinesTemplate.stroke = Themes.AmCharts[theme].mapLineColor[numorigincities];
      mapLinesTemplate.horizontalCenter = "middle";
      mapLinesTemplate.verticalCenter = "middle";

      var avgX = sumX / cities.length;
      var avgY = sumY / cities.length;
      var avgZ = sumZ / cities.length;

      // convert average x, y, z coordinate to latitude and longtitude
      var lng = Math.atan2 (avgY, avgX);
      var hyp = Math.sqrt (avgX * avgX + avgY * avgY);
      var lat = Math.atan2 (avgZ, hyp);
      var zoomlat =  this.utils.rad2degr (lat);
      var zoomlong = this.utils.rad2degr (lng);

      if (!cities.length)
      {
        zoomLevel = 1;
        zoomlat = 24.8567;
        zoomlong = 2.3510;
      }
      else
        zoomLevel = 4;

      this.globals.scheduleChart.deltaLongitude = Math.trunc (360 - Number (zoomlong)); // truncate value to avoid invisible maps
      this.globals.scheduleChart.homeGeoPoint.longitude = Number (zoomlong);
      this.globals.scheduleChart.homeGeoPoint.latitude = Number (zoomlat);
      this.globals.scheduleChart.homeZoomLevel = zoomLevel;
      this.globals.scheduleChart.zoomToGeoPoint ({ latitude: zoomlat, longitude: zoomlong }, zoomLevel);
    });
  }

  cancelLoading(): void
  {
    this.setRouteLoading.emit (false);

    this.globals.mapsc = false;
    this.globals.query = false;
    this.globals.tab = false;
  }
}
