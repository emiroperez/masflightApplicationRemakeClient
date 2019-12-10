import { Component, OnInit, Inject, NgZone, HostListener, isDevMode } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Globals } from '../globals/Globals';
import { ApiClient } from '../api/api-client';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { Subject } from 'rxjs';
import { MessageComponent } from '../message/message.component';
import { AuthService } from '../services/auth.service';
import { Themes } from '../globals/Themes';

// date intervals
const dateIntervals = [
  { timeUnit: "day", count: 1 },
  { timeUnit: "day", count: 2 },
  { timeUnit: "day", count: 3 },
  { timeUnit: "day", count: 4 },
  { timeUnit: "day", count: 5 },
  { timeUnit: "day", count: 6 },
  { timeUnit: "day", count: 7 },
  { timeUnit: "day", count: 8 },
  { timeUnit: "day", count: 9 },
  { timeUnit: "day", count: 10 }
];

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

  imgwidth: number = 0;
  backgroundImage: any = new Image ();
    
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

  pdfViewerHeight: number;

  constructor(
    public dialogRef: MatDialogRef<MsfMoreInfoPopupComponent>,
    public globals: Globals,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: ApiClient,
    private authService: AuthService,
    private zone: NgZone)
    {
      this.pdfViewerHeight = window.innerHeight - 10;
    }

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

    getBackground(): string
    {
      let self, title, passenger;

      self = this;
      title = this.globals.popupMainElement[0].title;
      passenger = this.globals.popupMainElement[0].passenger_name;

      if (title)
      {
        title = title.replace (/ /g, '_');

        if (!this.backgroundImage.src)
        {
          this.backgroundImage.src = "../../assets/images/Top_Ten_Movie_Posters/" + title + ".png";
          this.backgroundImage.onload = function ()
          {
            let aspect = self.backgroundImage.width / self.backgroundImage.height;
            self.imgWidth = Math.ceil (500 * aspect);
          }
        }

       return this.backgroundImage.src;    
      }
      else if (passenger)
      {
        passenger = passenger.replace (/ /g, '_');

        if (!this.backgroundImage.src)
        {
          this.backgroundImage.src = "../../assets/images/" + passenger + ".png";
          this.backgroundImage.onload = function ()
          {
            let aspect = self.backgroundImage.width / self.backgroundImage.height;
            self.imgWidth = Math.ceil (500 * aspect);
          }
        }

        return this.backgroundImage.src;
      }
      else
        return "";
    }

    loadChartData(handlerSuccess, handlerError) {
      this.globals.popupLoading2 = true;
      this.chart = null;
      let urlBase = this.globals.popupUrl + "/CategoryInfoPax";
      // urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999&page_number=0";
      let urlArg = encodeURIComponent (urlBase);

      if (isDevMode ())
        console.log (urlBase);

      let url = this.globals.baseUrl + "/secure/getChartData?url=" + urlArg 
      + "&optionId=" + this.globals.currentOption.id
      + "&ipAddress=" + this.authService.getIpAddress ()
      + "&variable=" + this.variable + "&xaxis=" + this.xaxis 
      + "&valueColumn=" + this.valueColumn + "&function=" + this.functions[1].id;

      this.authService.post(this, url, null, handlerSuccess, handlerError);
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
      let theme;

      theme = this.globals.theme;

      this.zone.runOutsideAngular (() => {
        let chart;

        let categoryAxis, valueAxis, parseDate;
        chart = am4core.create ("msf-dashboard-chart-display", am4charts.XYChart);

        // Don't parse dates if the chart is a simple version
        chart.data = chartInfo.data;
        chart.numberFormatter.numberFormat = "#,###.#";
        parseDate = this.xaxis.includes ('date');

        // Set chart axes depeding on the rotation
        if (parseDate)
        {
          categoryAxis = chart.yAxes.push (new am4charts.DateAxis ());
          categoryAxis.gridIntervals.setAll (dateIntervals);
          categoryAxis.dateFormats.setKey ("day", "MMM d");
          categoryAxis.periodChangeDateFormats.setKey ("month", "yyyy");
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
          chart.scrollbarY.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
        }

        // Set category axis properties
        categoryAxis.renderer.labels.template.fontSize = 10;
        categoryAxis.renderer.labels.template.wrap = true;
        categoryAxis.renderer.labels.template.horizontalCenter  = "right";
        categoryAxis.renderer.labels.template.textAlign  = "end";
        categoryAxis.renderer.labels.template.fill = Themes.AmCharts[theme].fontColor;
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.grid.template.strokeOpacity = 1;
        categoryAxis.renderer.line.strokeOpacity = 1;
        categoryAxis.renderer.grid.template.stroke = Themes.AmCharts[theme].stroke;
        categoryAxis.renderer.line.stroke = Themes.AmCharts[theme].stroke;
        categoryAxis.renderer.grid.template.strokeWidth = 1;
        categoryAxis.renderer.line.strokeWidth = 1;

        // Set value axis properties
        valueAxis.renderer.labels.template.fontSize = 10;
        valueAxis.renderer.labels.template.fill = Themes.AmCharts[theme].fontColor;
        valueAxis.renderer.grid.template.strokeOpacity = 1;
        valueAxis.renderer.grid.template.stroke = Themes.AmCharts[theme].stroke;
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
        chart.legend.labels.template.fill = Themes.AmCharts[theme].fontColor;

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

    getFlexDirection(): string
    {
      if (this.globals.currentDrillDown.title !== 'More Info Passenger')
        return "row";
      else
        return "row-reverse";
    }

    @HostListener('window:resize', ['$event'])
    checkScreen(event): void {
      this.pdfViewerHeight = event.target.innerHeight - 10;
    }
  }
