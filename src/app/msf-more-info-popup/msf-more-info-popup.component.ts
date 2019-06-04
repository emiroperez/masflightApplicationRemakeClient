import { Component, OnInit, Inject, NgZone } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Globals } from '../globals/Globals';
import { ApiClient } from '../api/api-client';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import { Subject } from 'rxjs';
import { MessageComponent } from '../message/message.component';

am4core.useTheme(am4themes_animated);
am4core.useTheme(am4themes_dark);

// Grid, scrollbar and legend label colors
const white = am4core.color ("#ffffff");
const darkBlue = am4core.color ("#30303d");
const blueJeans = am4core.color ("#67b7dc");

@Component({
  selector: 'app-msf-more-info-popup',
  templateUrl: './msf-more-info-popup.component.html',
  styleUrls: ['./msf-more-info-popup.component.css']
})
export class MsfMoreInfoPopupComponent{

  response;
  mainElement;
  xaxis = "category";
  valueColumn = "total";
  variable = "language";
    
  chart: any;
  private _onDestroy = new Subject<void> ();
  functions:any[] = [
    { id: 'avg', name: 'Average' },
    { id: 'sum', name: 'Sum' },
    { id: 'max', name: 'Max' },
    { id: 'min', name: 'Min' },
    { id: 'count', name: 'Count' }
  ]; 
  paletteColors: string[] = [
    "#01b0a1",
    "#9b5e8e",
    "#fa5751",
    "#fd8b5a",
    "#80cfea",
    "#ff5900",
    "#005eff",
    "#ffff00",
    "#fc636b",
    "#ff7e00",
    "#3d67ce",
      "#fffefe"
  ];
  constructor(
    public dialogRef: MatDialogRef<MsfMoreInfoPopupComponent>,
    public globals: Globals,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: ApiClient,
    private zone: NgZone) {}

    onNoClick(): void
    {
      this.dialogRef.close ();
    }

    closeDialog(): void
    {
      this.dialogRef.close ();
    }

    getFormatMinutes(value:any){
      if(value=="0"){
        return "0h 0m";
      }else{
        var aux ="";
        var result = value/60;
        var resultString = String(result);
        if(resultString.split(".")[0]!="0"){
          aux = resultString.split(".")[0] + "h " + resultString.split(".")[1].substr(0, 1)+ "m";
        }else{
          aux = value + "m";
        }
        return aux;
      }
    }

    getBackground(){
      var titulo = this.globals.popupMainElement[0].title;
      var passenger = this.globals.popupMainElement[0].passenger_name;
      if(titulo!=null){
        titulo = titulo.replace(/ /g, '_');
        return "../../assets/images/Top_Ten_Movie_Posters/"+titulo+".png";
      }else if(passenger!=null){
        passenger = passenger.replace(/ /g, '_');
        return "../../assets/images/"+passenger+".png";
      }else{
        return "";
      }


    }

    loadChartData(handlerSuccess, handlerError) {
      this.globals.popupLoading2 = true;
      this.chart = null;
      let urlBase = this.globals.popupUrl + "/CategoryInfoPax";
      // urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999&page_number=0";
      console.log(urlBase);
      let urlArg = encodeURIComponent(urlBase);
      let url = this.globals.baseUrl + "/getChartData?url=" + urlArg 
      + "&variable=" + this.variable + "&xaxis=" + this.xaxis 
      + "&valueColumn=" + this.valueColumn + "&function=" + this.functions[1].id
      this.http.post(this, url, null, handlerSuccess, handlerError);
    }

    handlerChartSuccess(_this, data): void
    {
      _this.makeChart (data);

    }

    createHorizColumnSeries(values, chart, item, parseDate): void
  {
    // Set up series
    let series = chart.series.push (new am4charts.ColumnSeries ());
    series.name = item.valueAxis;
    series.dataFields.valueX = item.valueField;
    series.sequencedInterpolation = true;

    // Parse date if available
    if (parseDate)
    {
      series.dataFields.dateY = values;
      series.dateFormatter.dateFormat = "MMM d, yyyy";
      series.columns.template.tooltipText = "{dateY}: {valueX}";
    }
    else
    {
      series.dataFields.categoryY = values;
      series.columns.template.tooltipText = "{categoryY}: {valueX}";
    }

    // Configure columns
    series.stacked = true;
    series.columns.template.strokeWidth = 0;
    series.columns.template.width = am4core.percent (60);
  }

  makeChart(chartInfo): void
  {
    this.zone.runOutsideAngular (() => {
      let chart;

      let categoryAxis, valueAxis, parseDate, stacked;
      chart = am4core.create ("msf-dashboard-chart-display", am4charts.XYChart);

      // Don't parse dates if the chart is a simple version
      chart.data = chartInfo.data;
      parseDate = this.xaxis.includes ('date');

      // Set chart axes depeding on the rotation
      if (parseDate)
      {
        categoryAxis = chart.yAxes.push (new am4charts.DateAxis ());
        categoryAxis.dateFormats.setKey ("day", "MMM d");
        categoryAxis.periodChangeDateFormats.setKey ("day", "yyyy");
      }
      else
      {
        categoryAxis = chart.yAxes.push (new am4charts.CategoryAxis ());
        categoryAxis.renderer.minGridDistance = 15;
        categoryAxis.renderer.labels.template.maxWidth = 160;
      }

      valueAxis = chart.xAxes.push (new am4charts.ValueAxis ());

      // Add scrollbar into the chart for zooming if there are multiple series
      if (chart.data.length > 1)
      {
        chart.scrollbarY = new am4core.Scrollbar ();
        chart.scrollbarY.background.fill = blueJeans;
      }

      // Set category axis properties
      categoryAxis.renderer.labels.template.fontSize = 10;
      categoryAxis.renderer.labels.template.wrap = true;
      categoryAxis.renderer.labels.template.horizontalCenter  = "right";
      categoryAxis.renderer.labels.template.textAlign  = "end";
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.grid.template.strokeOpacity = 1;
      categoryAxis.renderer.line.strokeOpacity = 1;
      categoryAxis.renderer.grid.template.stroke = darkBlue;
      categoryAxis.renderer.line.stroke = darkBlue;
      categoryAxis.renderer.grid.template.strokeWidth = 1;
      categoryAxis.renderer.line.strokeWidth = 1;

      // Set value axis properties
      valueAxis.renderer.labels.template.fontSize = 10;
      valueAxis.renderer.grid.template.strokeOpacity = 1;
      valueAxis.renderer.grid.template.stroke = darkBlue;
      valueAxis.renderer.grid.template.strokeWidth = 1;

      // The category will be the x axis if the chart type has it
      categoryAxis.dataFields.category = this.xaxis;

      // Sort chart series from least to greatest by calculating the
      // total value of each key item to compensate for the lack of
      // proper sorting by values
      for (let item of chart.data)
      {
        let total = 0;

        for (let object of chartInfo.filter)
        {
          let value = item[object.valueField];

          if (value != null)
            total += value;
        }

        item["sum"] = total;
      }

      chart.events.on ("beforedatavalidated", function(event) {
        chart.data.sort (function(e1, e2) {
          return e1.sum - e2.sum;
        });
      });

      // Create the series and set colors
      chart.colors.list = [];

      for (let color of this.paletteColors)
        chart.colors.list.push (am4core.color (color));

      for (let object of chartInfo.filter)
	this.createHorizColumnSeries (this.xaxis, chart, object, parseDate);

      // Display Legend
      chart.legend = new am4charts.Legend ();
      chart.legend.markers.template.width = 15;
      chart.legend.markers.template.height = 15;
      chart.legend.labels.template.fontSize = 10;

      // Add export button
      chart.exporting.menu = new am4core.ExportMenu ();
      chart.exporting.menu.verticalAlign = "bottom";

      this.chart = chart;
      this.globals.popupLoading2 = false;
    });
  }
  handlerChartError(_this, result): void
  {
    this.globals.popupLoading2 = false;
    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to generate chart." }
    });
  }

    // ngOnDestroy()
    // {
    //   this._onDestroy.next ();
    //   this._onDestroy.complete ();
  
    //   clearInterval (this.timer);
  
    //   this.destroyChart ();
    // }

    ngAfterViewInit(): void {
      if(this.globals.currentDrillDown.title=="More Info Passenger"){
        this.loadChartData(this.handlerChartSuccess,this.handlerChartSuccess)
      }
    }
    
    getFormatCell(value:any){
      var aux = String(value);
      if(value==undefined){
        return "";
      }
      aux = aux.replace("%","");
      aux = aux.replace("$","");
      aux = aux.replace("ï¿½","0");
      return aux;
    }

  }
