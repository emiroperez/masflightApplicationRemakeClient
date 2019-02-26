import { Component, OnInit } from '@angular/core';
import { Globals } from '../globals/Globals';
import { AmChart, AmChartsService } from '@amcharts/amcharts3-angular';

@Component({
  selector: 'app-msf-schedule-panel',
  templateUrl: './msf-schedule-panel.component.html',
  styleUrls: ['./msf-schedule-panel.component.css']
})

export class MsfSchedulePanelComponent implements OnInit {
  panelOpenState = false;
  
  constructor(private AmCharts: AmChartsService,public globals: Globals) { }
  aux=this.globals.scheduledata;

  expandFligth(index){
    let planeSVG = "m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47";
    let targetSVG = "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z";
    var airportsarray =this.aux[index].airports;
    var airports =[];
    var lines =[];
     var nodeair = {}
     var nodeline ={}
     var countlines =0;
      for (var i = 0; i < airportsarray.length; i += 1) {
         nodeair = { 
          "svgPath": targetSVG,
           "title": airportsarray[i].airportname,
           "latitude": airportsarray[i].airportlat,
           "longitude": airportsarray[i].airportlgt
        }
        if (i+1 < airportsarray.length){
          countlines++;
          nodeline ={
            "id" :"line"+countlines,
            "arc": -0.85,
            "alpha": 0.3,
            "latitudes": [ airportsarray[i].airportlat, airportsarray[i+1].airportlat ],
            "longitudes": [ airportsarray[i].airportlgt, airportsarray[i+1].airportlgt ]
          }
          lines.push(nodeline);

        }
        
        airports.push(nodeair);
      }
      for (var i = 0; i < lines.length; i += 1) {
        nodeair = { 
          "svgPath": planeSVG,
          "positionOnLine": 0,
          "color": "#00a3e1",
          "alpha": 0.8,
          "animateAlongLine": true,
          "lineId": lines[i].id,
          "flipDirection": true,
          "loop": true,
          "scale": 0.03,
          "positionScale": 1.3
        }
        airports.push(nodeair);
      }
      this.globals.schedulepanelinfo = this.aux[index];
      this.globals.schedulepanelinfo.TotalTime= this.globals.schedulepanelinfo.TotalTime.replace("Hours", "H").replace("Minutes","M");
      this.AmCharts.updateChart(this.globals.scheduleChart, () => {
      this.globals.scheduleChart.dataProvider.images  = airports;
      this.globals.scheduleChart.dataProvider.lines =lines;
      this.globals.scheduleChart.dataProvider.zoomLevel = 4.0;
       this.globals.scheduleChart.dataProvider.zoomLongitude=Number(airports[0].longitude);
       this.globals.scheduleChart.dataProvider.zoomLatitude=Number(airports[0].latitude);
      
      });
   }
   returnSearch(){
    this.globals.hideParametersPanels=false;
    this.globals.schedulepanelinfo =false;
    this.AmCharts.updateChart(this.globals.scheduleChart, () => {
      this.globals.scheduleChart.dataProvider.images  = [];
      this.globals.scheduleChart.dataProvider.lines =[];
      this.globals.scheduleChart.dataProvider.zoomLevel = 1;
      
      });
   }
   
  ngOnInit() {
    
  }

  
  
}
