import { Component, OnInit, NgZone, SimpleChanges, Input } from '@angular/core';
import { Globals } from '../globals/Globals';
import { Themes } from '../globals/Themes';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

// Home button SVG
const homeSVG = "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8";

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

  ngAfterViewInit()
  {
    this.makeScheduleChart ();
  }

  ngOnChanges(changes: SimpleChanges)
  {
    // Remove cities and routes if the option has changed but still related to
    // the schedule maps
    if (changes['currentOption'] && this.globals.scheduleChart && this.globals.mapsc)
    {
      this.zone.runOutsideAngular (() => {
        if (this.globals.scheduleImageSeries)
        {
          this.globals.scheduleChart.series.removeIndex (this.globals.scheduleChart.series.indexOf (this.globals.scheduleImageSeries));
          this.globals.scheduleImageSeries = null;
        }

        if (this.globals.scheduleLineSeries)
        {
          this.globals.scheduleChart.series.removeIndex (this.globals.scheduleChart.series.indexOf (this.globals.scheduleLineSeries));
          this.globals.scheduleLineSeries = null;
        }

        if (this.globals.scheduleShadowLineSeries)
        {
          this.globals.scheduleChart.series.removeIndex (this.globals.scheduleChart.series.indexOf (this.globals.scheduleShadowLineSeries));
          this.globals.scheduleShadowLineSeries = null;
        }

        // Set it back to the default location and zoom level
        this.globals.scheduleChart.homeGeoPoint = {
          latitude: 24.8567,
          longitude: 2.3510
        };

        this.globals.scheduleChart.homeZoomLevel = 1;
        this.globals.scheduleChart.deltaLongitude = 0;
        this.globals.scheduleChart.goHome ();
      });
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
    am4core.useTheme (Themes.AmCharts[theme].mainTheme);

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

      // Add export button
      chart.exporting.menu = new am4core.ExportMenu ();
      chart.exporting.menu.verticalAlign = "top";
      chart.exporting.menu.align = "right";

      this.globals.scheduleChart = chart;
    });
  }
}
