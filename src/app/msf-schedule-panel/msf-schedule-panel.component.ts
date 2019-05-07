import { Component, OnInit, NgZone } from '@angular/core';
import { Globals } from '../globals/Globals';
import { Utils } from '../commons/utils';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";

// AmChart colors
const black = am4core.color ("#000000");
const white = am4core.color ("#ffffff");
const cyan = am4core.color ("#00a3e1");
const darkGreen = am4core.color ("#00be11");
const comet = am4core.color ("#585869");

// SVG used for maps
const planeSVG = "m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47";
const targetSVG = "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z";

@Component({
  selector: 'app-msf-schedule-panel',
  templateUrl: './msf-schedule-panel.component.html',
  styleUrls: ['./msf-schedule-panel.component.css']
})

export class MsfSchedulePanelComponent implements OnInit {
  utils: Utils;

  panelOpenState = false;
  private mapairports : any[];
  private maproutes : any[];

  constructor(private zone: NgZone, public globals: Globals) {
    this.utils = new Utils ();
  }

  aux=this.globals.scheduledata;
  checkarray(aux2){
    return Array.isArray(aux2);
  }
 getPropshtml(json){
   var html="";
  for (var key in json) {
    html +='<tr><td>' + key + '</td><td  style="font-weight: bold;  padding-left: 22px;">' + json[key]+'</td></tr>';
  }
 return html;
 }

 ngOnDestroy(): void {
  this.globals.schedulepanelinfo=false;
 }

  expandFlight(index,$event){
    let imageSeriesTemplate, circle, hoverState, label, zoomLevel;
    var route = this.aux[index];
    let newCities = [];
    let self = this;
    let curcity;

    function goForward(plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute)
    {
      let animation;

      if (curRoute == -1 && plane.rotation)
      {
        shadowPlane.rotation = 0;
        shadowPlane.opacity = 0;

        plane.animate ({
          to: 0,
          property: "rotation"
        }, 1000).events.on ("animationended",
          function() {
            curRoute = 0;

            planeContainer.mapLine = routes[curRoute].normal;
            planeContainer.parent = self.globals.scheduleLineSeries;
            shadowPlaneContainer.mapLine = routes[curRoute].shadow;
            shadowPlaneContainer.parent = self.globals.scheduleShadowLineSeries;

            goForward (plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute);
          }
        );

        return;
      }
      else
        shadowPlane.opacity = 0.75;

      animation = planeContainer.animate ({
        property: "position",
        from: 0,
        to: 1
      }, 6000).delay (300);

      shadowPlaneContainer.animate ({
        property: "position",
        from: 0,
        to: 1
      }, 6000).delay (300);

      animation.events.on ("animationended",
        function() {
          curRoute++;
          if (curRoute == routes.length)
            goBack (plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute);
          else
          {
            planeContainer.mapLine = routes[curRoute].normal;
            planeContainer.parent = self.globals.scheduleLineSeries;
            shadowPlaneContainer.mapLine = routes[curRoute].shadow;
            shadowPlaneContainer.parent = self.globals.scheduleShadowLineSeries;

            goForward (plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute);
          }
        }
      );
    }

    function goBack(plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute)
    {
      let animation;

      if (curRoute == routes.length && plane.rotation != 180)
      {
        shadowPlane.rotation = 180;
        shadowPlane.opacity = 0;

        plane.animate ({
          to: 180,
          property: "rotation"
        }, 1000).events.on ("animationended",
          function() {
            curRoute = routes.length - 1;

            planeContainer.mapLine = routes[curRoute].normal;
            planeContainer.parent = self.globals.scheduleLineSeries;
            shadowPlaneContainer.mapLine = routes[curRoute].shadow;
            shadowPlaneContainer.parent = self.globals.scheduleShadowLineSeries;

            goBack (plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute);
          }
        );

        return;
      }
      else
        shadowPlane.opacity = 0.75;

      animation = planeContainer.animate ({
        property: "position",
        from: 1,
        to: 0
      }, 6000).delay (300);
  
      shadowPlaneContainer.animate ({
        property: "position",
        from: 1,
        to: 0
      }, 6000).delay (300);

      animation.events.on ("animationended",
        function() {
          curRoute--;
          if (curRoute == -1)
            goForward (plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute);
          else
          {
            planeContainer.mapLine = routes[curRoute].normal;
            planeContainer.parent = self.globals.scheduleLineSeries;
            shadowPlaneContainer.mapLine = routes[curRoute].shadow;
            shadowPlaneContainer.parent = self.globals.scheduleShadowLineSeries;

            goBack (plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute);
          }
        }
      );
    }

     this.zone.runOutsideAngular (() => {
      // Remove any existing image and lines series from the map
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
      imageSeriesTemplate.fill = black;
      imageSeriesTemplate.background.fillOpacity = 0;
      imageSeriesTemplate.background.fill = white;
      imageSeriesTemplate.setStateOnChildren = true;

      // Configure circle and city labels
      circle = imageSeriesTemplate.createChild (am4core.Sprite);
      circle.defaultState.properties.fillOpacity = 1;
      circle.path = targetSVG;
      circle.scale = 0.75;
      circle.fill = white;
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
      hoverState = label.states.create ("hover");
      hoverState.properties.fill = darkGreen;
      hoverState.properties.fillOpacity = 1;

      imageSeriesTemplate.events.on ("over", function (event) {
        event.target.setState ("hover");
      });

      imageSeriesTemplate.events.on ("out", function (event) {
        event.target.setState ("default");
      });

      if (!$event.checked)
      {
        for (let airport of route.airports)
        {
          curcity = null;
  
          // Check if the cities city before removing it
          for (let city of this.mapairports)
          {
            if (city.title === airport.title)
              curcity = city;
          }
  
          if (curcity)
          {
            curcity.numRoutes--;
            if (!curcity.numRoutes)
              this.mapairports.splice (this.mapairports.indexOf (curcity), 1);
          }
        }
  
        for (let maproute of this.maproutes)
        {
          if (route === maproute)
          {
            this.maproutes.splice (this.maproutes.indexOf (maproute), 1);
            break;
          }
        }
      }
      else
      {
        for (let airport of route.airports)
        {
          curcity = null;
  
          // Check if the city exists before adding it
          for (let city of this.mapairports)
          {
            if (city.title === airport.title)
              curcity = city;
          }
  
          if (curcity)
            curcity.numRoutes++;
          else
          {
            this.mapairports.push (airport);
            this.mapairports[this.mapairports.length - 1].numRoutes = 1;
          }
        }

        this.maproutes.push (route);
      }
 
      var sumX = 0;
      var sumY = 0;
      var sumZ = 0;
  
      for (let city of this.mapairports)
      {
        let newCity, newCityInfo, tempLatCos, tempLat, tempLng;

        newCity = this.globals.scheduleImageSeries.mapImages.create ();
        newCityInfo = city;
        newCity.latitude = newCityInfo.latitude;
        newCity.longitude = newCityInfo.longitude;
        newCity.nonScaling = true;
        newCity.tooltipText = newCityInfo.title;

        newCities.push (newCity);

        tempLat = this.utils.degr2rad (newCity.latitude);
        tempLng = this.utils.degr2rad (newCity.longitude);
        tempLatCos = Math.cos (tempLat);
        sumX += tempLatCos * Math.cos (tempLng);
        sumY += tempLatCos * Math.sin (tempLng);
        sumZ += Math.sin (tempLat);
      }

      console.log(sumX+"-"+sumY+"-"+sumZ);
      var avgX = sumX / newCities.length;
      var avgY = sumY / newCities.length;
      var avgZ = sumZ / newCities.length;
  
      // convert average x, y, z coordinate to latitude and longtitude
      var lng = Math.atan2(avgY, avgX);
      var hyp = Math.sqrt(avgX * avgX + avgY * avgY);
      var lat = Math.atan2(avgZ, hyp);
      var zoomlat =  this.utils.rad2degr(lat);
      var zoomlong =this.utils.rad2degr(lng);

      // Create map line series and connect to the cities
      this.globals.scheduleLineSeries = this.globals.scheduleChart.series.push (new am4maps.MapLineSeries ());
      this.globals.scheduleLineSeries.zIndex = 10;

      this.globals.scheduleShadowLineSeries = this.globals.scheduleChart.series.push (new am4maps.MapLineSeries ());
      this.globals.scheduleShadowLineSeries.mapLines.template.line.strokeOpacity = 0;
      this.globals.scheduleShadowLineSeries.mapLines.template.line.nonScalingStroke = true;
      this.globals.scheduleShadowLineSeries.mapLines.template.shortestDistance = false;
      this.globals.scheduleShadowLineSeries.zIndex = 5;

      // Add the selected routes into the map
      for (let maproute of this.maproutes)
      {
        let planeContainer, shadowPlaneContainer, plane, shadowPlane;
        let curRoute, numRoutes, routes, mapLine, shadowMapLine;
        let city1, city2;

        routes = [];
        curRoute = 0;
        numRoutes = 1;
        if (maproute.airports.length > 2)
          numRoutes += maproute.airports.length - 2;

        for (let i = 0; i < numRoutes; i++)
        {
          // Get the cities connected to the route
          for (let city of newCities)
          {
            if (city.tooltipText === maproute.airports[i].title)
              city1 = city;
    
            if (city.tooltipText === maproute.airports[i + 1].title)
              city2 = city;
          }

          mapLine = this.globals.scheduleLineSeries.mapLines.create ();
          mapLine.imagesToConnect = [city1, city2];
          mapLine.line.strokeOpacity = 0.3;
          mapLine.line.stroke = cyan;
          mapLine.line.horizontalCenter = "middle";
          mapLine.line.verticalCenter = "middle";

          shadowMapLine = this.globals.scheduleShadowLineSeries.mapLines.create ();
          shadowMapLine.imagesToConnect = [city1, city2];
          shadowMapLine.line.horizontalCenter = "middle";
          shadowMapLine.line.verticalCenter = "middle";

          routes.push ({
            normal: mapLine,
            shadow: shadowMapLine
          });
        }

        // Add plane sprite
        planeContainer = mapLine.lineObjects.create ();
        planeContainer.position = 0;
        shadowPlaneContainer = shadowMapLine.lineObjects.create ();
        shadowPlaneContainer.position = 0;

        plane = planeContainer.createChild (am4core.Sprite);
        plane.path = planeSVG;
        plane.fill = cyan;
        plane.scale = 0.75;
        plane.horizontalCenter = "middle";
        plane.verticalCenter = "middle";

        shadowPlane = shadowPlaneContainer.createChild (am4core.Sprite);
        shadowPlane.path = planeSVG;
        shadowPlane.scale = 0.0275;
        shadowPlane.opacity = 0;
        shadowPlane.horizontalCenter = "middle";
        shadowPlane.verticalCenter = "middle";

        // Set first route for the plane
        planeContainer.mapLine = routes[0].normal;
        planeContainer.parent = this.globals.scheduleLineSeries;
        shadowPlaneContainer.mapLine = routes[0].shadow;
        shadowPlaneContainer.parent = this.globals.scheduleShadowLineSeries;

        // Make the plane bigger in the middle of the line
        planeContainer.adapter.add ("scale", function (scale, target) {
          return 0.02 * (1 - (Math.abs (0.5 - target.position)));
        });

        // Make the shadow of the plane smaller and more visible in the middle of the line
        shadowPlaneContainer.adapter.add ("scale", function (scale, target) {
          target.opacity = (0.6 - (Math.abs (0.5 - target.position)));
          return 0.5 - 0.3 * (1 - (Math.abs (0.5 - target.position)));
        });

        // Start flying the plane
        goForward (plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute);
      }
      
      if (!newCities.length)
      {
        zoomLevel = 1;
        zoomlat = 24.8567;
        zoomlong = 2.3510;
      }
      else
        zoomLevel = 4;

      if(this.maproutes.length != 1){
        this.globals.schedulepanelinfo=false;
      }else{
        this.globals.schedulepanelinfo = this.aux[index];
        this.globals.schedulepanelinfo.TotalTime= this.globals.schedulepanelinfo.TotalTime.replace("Hours", "H").replace("Minutes","M");
      }

      this.globals.scheduleChart.deltaLongitude = 360 - Number (zoomlong);
      this.globals.scheduleChart.homeGeoPoint.longitude = Number (zoomlong);
      this.globals.scheduleChart.homeGeoPoint.latitude = Number (zoomlat);
      this.globals.scheduleChart.homeZoomLevel = zoomLevel - 0.1;
      this.globals.scheduleChart.goHome ();

      // Workaround to avoid double lines
      setTimeout (() =>
      {
        this.globals.scheduleChart.homeZoomLevel = zoomLevel;
        this.globals.scheduleChart.goHome ();
      }, 50);
    });
   }
   returnSearch(){
    this.globals.hideParametersPanels=false;
    this.globals.schedulepanelinfo =false;

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

      this.globals.scheduleChart.homeZoomLevel = 1;
      this.globals.scheduleChart.homeGeoPoint.longitude = 2.3510;
      this.globals.scheduleChart.homeGeoPoint.latitude = 24.8567;
      this.globals.scheduleChart.deltaLongitude = 0;
      this.globals.scheduleChart.goHome ();
    });
  }
   
  ngOnInit() {
    this.mapairports = [];
    this.maproutes = [];
    }

    showTable(state:boolean){
      this.globals.mapsc = state;
      if(state==false){
        setTimeout(() => {
          this.globals.selectedIndex = 2;
      }, 2000);
      }
    }

  
  
}
