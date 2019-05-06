import { Component, OnInit, Input,Output,EventEmitter, ViewChild, NgZone } from '@angular/core';
import { Option } from '../model/Option';
import {Globals} from '../globals/Globals'
import { MatMenuTrigger } from '@angular/material';
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
  selector: 'app-menu-option',
  templateUrl: './menu-option.component.html'
})
export class MenuOptionComponent implements OnInit {

  @Input("options") options: Option[];

  @Input("trigger") trigger: MatMenuTrigger;

  @ViewChild('childMenu') public childMenu;





  constructor(private zone: NgZone, private globals: Globals) { }

  ngOnInit() {
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
      this.makeScheduleChart ();
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
