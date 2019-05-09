import { Component, OnInit, NgZone, SimpleChanges, Input } from '@angular/core';
import { Globals } from '../globals/Globals';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";

am4core.useTheme(am4themes_animated);
am4core.useTheme(am4themes_dark);

// Home button SVG
const homeSVG = "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8";

// AmChart colors
const black = am4core.color ("#000000");
const darkGray = am4core.color ("#3b3b3b");

@Component({
  selector: 'app-msf-schedule-maps',
  templateUrl: './msf-schedule-maps.component.html',
  styleUrls: ['./msf-schedule-maps.component.css']
})
export class MsfScheduleMapsComponent implements OnInit {

  @Input("currentOption")
  currentOption: any;

  constructor(private zone: NgZone, public globals: Globals) { }

  ngOnInit() {
    this.globals.scheduleChart = null;
  }

  ngOnChanges(changes: SimpleChanges)
  {
    // Rebuild schedule chart if the option has changed and still related to
    // the schedule maps
    if (changes['currentOption'] && this.globals.scheduleChart)
      this.makeScheduleChart ();
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
    let chart, continentSeries, zoomControl, home;

    this.destroyScheduleChart ();

    setTimeout (() =>
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
        zoomControl.marginTop = 40;
        zoomControl.marginLeft = 10;

        // Add home buttom to zoom out
        home = chart.chartContainer.createChild (am4core.Button);
        home.icon = new am4core.Sprite ();
        home.icon.dx -= 9;
        home.width = 30;
        home.icon.path = homeSVG;
        home.align = "left";
        home.marginLeft = 15;
        home.events.on ("hit", function (ev) {
          chart.goHome ();
        });

        // Add export button
        chart.exporting.menu = new am4core.ExportMenu ();
        chart.exporting.menu.verticalAlign = "top";
        chart.exporting.menu.align = "right";

        this.globals.scheduleChart = chart;
      });
    }, 50);
  }

  ngAfterViewInit() {
    this.makeScheduleChart ();
  }

}
