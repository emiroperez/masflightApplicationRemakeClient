import { Component, OnInit, NgZone } from '@angular/core';
import { Globals } from '../globals/Globals';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";

am4core.useTheme(am4themes_animated);
am4core.useTheme(am4themes_dark);

// AmChart colors
const black = am4core.color ("#000000");
const darkGray = am4core.color ("#3b3b3b");

@Component({
  selector: 'app-msf-schedule-maps',
  templateUrl: './msf-schedule-maps.component.html',
  styleUrls: ['./msf-schedule-maps.component.css']
})
export class MsfScheduleMapsComponent implements OnInit {

  constructor(private zone: NgZone, public globals: Globals) { }


  ngOnInit() {
  }

  destroyScheduleChart()
  {
    if (this.globals.scheduleChart)
    {
      this.zone.runOutsideAngular (() => {
        if (this.globals.scheduleImageSeries != null)
        {
          this.globals.scheduleChart.series.removeIndex (this.globals.scheduleChart.series.indexOf (this.globals.scheduleImageSeries));
          this.globals.scheduleImageSeries = null;
        }
  
        if (this.globals.scheduleLineSeries != null)
        {
          this.globals.scheduleChart.series.removeIndex (this.globals.scheduleChart.series.indexOf (this.globals.scheduleLineSeries));
          this.globals.scheduleLineSeries = null;
        }
  
        if (this.globals.scheduleShadowLineSeries != null)
        {
          this.globals.scheduleChart.series.removeIndex (this.globals.scheduleChart.series.indexOf (this.globals.scheduleShadowLineSeries));
          this.globals.scheduleShadowLineSeries = null;
        }

        this.globals.scheduleChart.dispose ();
      });
    }
  }

  makeScheduleChart()
  {
    let prepareChart, chart, continentSeries, zoomControl, home;

    this.destroyScheduleChart ();

    prepareChart = setInterval (() =>
    {
      this.zone.runOutsideAngular (() => {
        chart = am4core.create ("chartdivmap", am4maps.MapChart);

        // Create map instance
        chart.geodata = am4geodata_worldLow;
        chart.projection = new am4maps.projections.Miller ();

        // Add map polygons and exclude Antartica
        continentSeries = chart.series.push (new am4maps.MapPolygonSeries ());
        continentSeries.useGeodata = true;
        continentSeries.exclude = ["AQ"];
        continentSeries.mapPolygons.template.fill = darkGray;
        continentSeries.mapPolygons.template.stroke = black;
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
        zoomControl.marginTop = 35;
        zoomControl.marginLeft = 10;

        // Add home buttom to zoom out
        home = chart.chartContainer.createChild (am4core.Button);
        home.label.text = "Home";
        home.align = "left";
        home.marginLeft = 15;
        home.width = 70;
        home.events.on ("hit", function (ev) {
          chart.goHome ();
        });

        // Add export button
        chart.exporting.menu = new am4core.ExportMenu ();
        chart.exporting.menu.verticalAlign = "top";
        chart.exporting.menu.align = "right";

        this.globals.scheduleChart = chart;
      });

      clearInterval (prepareChart);
    }, 50);
  }

  ngAfterViewInit() {
    this.makeScheduleChart ();
  }

}
