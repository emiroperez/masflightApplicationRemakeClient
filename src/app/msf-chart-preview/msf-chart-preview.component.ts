import { Component, Inject, NgZone } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as moment from 'moment';

import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { ChartFlags } from '../msf-dashboard-panel/msf-dashboard-chartflags';
import { AuthService } from '../services/auth.service';
import { Utils } from '../commons/utils';
import { CategoryArguments } from '../model/CategoryArguments';
import { Arguments } from '../model/Arguments';
import { Themes } from '../globals/Themes';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-msf-chart-preview',
  templateUrl: './msf-chart-preview.component.html'
})
export class MsfChartPreviewComponent {
  utils: Utils;

  isLoading: boolean;
  chart: any;
  chartInfo: any;

  addUpValuesSet: boolean = false;
  sumValueAxis: any = null;
  sumSeriesList: any[] = [];
  advTableView: boolean = false;
  intervalTableRows: any[] = [];

  predefinedColumnFormats: any = {
    "short": "M/d/yy, h:mm a",
    "medium": "MMM d, yyyy, h:mm:ss a",
    "long": "MMMM d, yyyy, h:mm:ss a z",
    "full": "EEEE, MMMM d, yyyy, h:mm:ss a zzzz",
    "shortDate": "M/d/yy",
    "mediumDate": "MMM, d, yyyy",
    "longDate": "MMMM, d, yyyy",
    "fullDate": "EEEE, MMMM, d, y",
    "shortTime": "h:mm a",
    "mediumTime": "h:mm:ss a",
    "longTime": "h:mm:ss a z",
    "fullTime": "h:mm:ss a zzzz"
  };

  constructor(public dialogRef: MatDialogRef<MsfChartPreviewComponent>,
    public globals: Globals,
    private zone: NgZone,
    private service: ApplicationService,
    private authService: AuthService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.utils = new Utils ();

    this.isLoading = true;
    this.loadChartData (this.handlerChartSuccess, this.handlerDataError);
  }

  checkVisibility(): string
  {
    if (this.isLoading)
      return "none";

    return "block";
  }

  closeWindow(): void
  {
    this.dialogRef.close ();
  }

  getParameters()
  {
    let currentOptionCategories = this.data.currentOptionCategories;
    let params;

    if (currentOptionCategories)
    {
      for (let i = 0; i < currentOptionCategories.length; i++)
      {
        let category: CategoryArguments = currentOptionCategories[i];

        if (category && category.arguments)
        {
          for (let j = 0; j < category.arguments.length; j++)
          {
            let argument: Arguments = category.arguments[j];

            if (params)
            {
              if (argument.type != "singleCheckbox" && argument.type != "serviceClasses" && argument.type != "fareLower" && argument.type != "airportsRoutes" && argument.name1 != "intermediateCitiesList")
                params += "&" + this.utils.getArguments (argument);
              else if (argument.value1 != false && argument.value1 != "" && argument.value1 != undefined && argument.value1 != null)
                params += "&" + this.utils.getArguments (argument);
            }
            else
              params = this.utils.getArguments (argument);
          }
        }        
      }
    }

    return params;
  }

  loadChartData(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg;

    urlBase = this.data.currentOption.baseUrl + "?" + this.getParameters ();
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999&page_number=0";
    urlArg = encodeURIComponent (urlBase);

    url = this.service.host + "/secure/getChartData?url=" + urlArg + "&optionId=" + this.data.currentOption.id + "&ipAddress=" + this.authService.getIpAddress () +
      "&valueColumn=" + this.data.valueColumn.columnName + "&function=";

    if (this.data.chartMode === "advanced")
    {
      url += "advby" + this.data.intervalType;

      if (this.data.currentChartType.flags & ChartFlags.XYCHART)
        url += "&variable=" + this.data.variable.columnName;
      else
        url += "&chartType=pie";

      url += "&intervalValue=" + this.data.intValue;
    }
    else
    {
      url += this.data.function.id + "&variable=" + this.data.variable.columnName;

      // don't use the xaxis parameter if the chart type is pie, donut or radar
      if (!(this.data.currentChartType.flags & ChartFlags.XYCHART))
        url += "&chartType=pie";
      else
        url += "&xaxis=" + this.data.xaxis.columnName;
    }

    this.authService.post (this, url, null, handlerSuccess, handlerError);
  }

  noDataFound(): void
  {
    this.isLoading = false;
    this.dialog.open (MessageComponent, {
      data: { title: "Information", message: "No results were found." }
    });
    this.dialogRef.close ();
  }

  handlerChartSuccess(_this, data): void
  {
    if (_this.data.currentChartType.flags & ChartFlags.XYCHART && _this.utils.isJSONEmpty (data.data))
    {
      _this.noDataFound ();
      return;
    }

    if ((!(_this.data.currentChartType.flags & ChartFlags.XYCHART) && data.dataProvider == null) ||
      (_this.data.currentChartType.flags & ChartFlags.XYCHART && !data.filter))
    {
      _this.noDataFound ();
      return;
    }

    _this.makeChart (data);
    _this.isLoading = false;
  }

  handlerDataError(_this): void
  {
    _this.isLoading = false;
    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to generate results for the preview." }
    });
    _this.dialogRef.close ();
  }

  parseDate(date: any, format: string): Date
  {
    let momentDate: moment.Moment;
    let momentFormat: string;

    if (date == null || date == "")
      return null;

    if (format == null || format == "")
      momentFormat = "YYYYMMDD"; // fallback for date values with no column or pre-defined format set
    else if (this.predefinedColumnFormats[format])
      momentFormat = "DD/MM/YYYY";
    else
    {
      // replace lower case letters with uppercase ones for the moment date format
      momentFormat = format.replace (/m/g, "M");
      momentFormat = momentFormat.replace (/y/g, "Y");
      momentFormat = momentFormat.replace (/d/g, "D");
    }

    momentDate = moment (date, momentFormat);
    if (!momentDate.isValid ())
      return null; // invalid date value will be null

    return momentDate.toDate ();
  }

  makeChart(chartInfo): void
  {
    let theme = this.globals.theme;

    // reset advanced chart values
    this.addUpValuesSet = false;
    this.sumValueAxis = null;
    this.sumSeriesList = [];
    this.advTableView = false;
    this.intervalTableRows = [];
    this.chartInfo = chartInfo;

    this.zone.runOutsideAngular (() => {
      let chart, options;

      // Check chart type before generating it
      if (this.data.currentChartType.flags & ChartFlags.FUNNELCHART
        || this.data.currentChartType.flags & ChartFlags.PIECHART)
      {
        if (this.data.currentChartType.flags & ChartFlags.FUNNELCHART)
          chart = am4core.create ("msf-dashboard-child-panel-chart-display", am4charts.SlicedChart);
        else
          chart = am4core.create ("msf-dashboard-child-panel-chart-display", am4charts.PieChart);

        chart.data = chartInfo.dataProvider;
        chart.numberFormatter.numberFormat = "#,###.#";

        // Set label font size
        chart.fontSize = 10;

        // Create the series
        this.data.currentChartType.createSeries (this.data, false, chart, chartInfo, null, theme, null);

        if (this.data.currentChartType.flags & ChartFlags.FUNNELCHART)
        {
          // Sort values from greatest to least on funnel chart types
          chart.events.on ("beforedatavalidated", function(event) {
            chart.data.sort (function(e1, e2) {
              return e2[chartInfo.valueField] - e1[chartInfo.valueField];
            });
          });
        }
      }
      else
      {
        let categoryAxis, valueAxis, parseDate, outputFormat, stacked;

        chart = am4core.create ("msf-dashboard-child-panel-chart-display", am4charts.XYChart);
        chart.numberFormatter.numberFormat = "#,###.#";

        // Don't parse dates if the chart is a simple version
        if (this.data.currentChartType.flags & ChartFlags.XYCHART)
        {
          chart.data = JSON.parse (JSON.stringify (chartInfo.data));
          if (this.data.chartMode === "advanced")
            parseDate = false;
          else
            parseDate = (this.data.xaxis.columnType === "date" && this.data.xaxis.columnName.includes ('date')) ? true : false;
        }
        else
        {
          chart.data = JSON.parse (JSON.stringify (chartInfo.dataProvider));
          parseDate = false;
        }

        if (parseDate)
        {
          if (this.data.xaxis.columnFormat)
          {
            for (let data of chart.data)
              data[this.data.xaxis.columnName] = this.parseDate (data[this.data.xaxis.columnName], this.data.xaxis.columnFormat);

            if (this.data.xaxis.outputFormat)
              outputFormat = this.data.xaxis.outputFormat;
            else
              outputFormat = this.data.xaxis.columnFormat;

            // Set predefined format if used
            if (this.predefinedColumnFormats[outputFormat])
              outputFormat = this.predefinedColumnFormats[outputFormat];
          }
          else
            parseDate = false;
        }

        // Set chart axes depeding on the rotation
        if (this.data.currentChartType.flags & ChartFlags.ROTATED)
        {
          if (parseDate)
          {
            categoryAxis = chart.yAxes.push (new am4charts.DateAxis ());
            categoryAxis.dateFormats.setKey ("day", outputFormat);

            if (!outputFormat.includes ("y"))
              categoryAxis.periodChangeDateFormats.setKey ("day", "yyyy");
            else
              categoryAxis.periodChangeDateFormats.setKey ("day", outputFormat);
          }
          else
          {
            categoryAxis = chart.yAxes.push (new am4charts.CategoryAxis ());
            categoryAxis.renderer.minGridDistance = 15;
            categoryAxis.renderer.labels.template.maxWidth = 240;
          }

          valueAxis = chart.xAxes.push (new am4charts.ValueAxis ());

          // Add scrollbar into the chart for zooming if there are multiple series
          if (chart.data.length > 1)
          {
            chart.scrollbarY = new am4core.Scrollbar ();
            chart.scrollbarY.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
          }
        }
        else
        {
          if (parseDate)
          {
            categoryAxis = chart.xAxes.push (new am4charts.DateAxis ());
            categoryAxis.dateFormats.setKey ("day", outputFormat);

            if (!outputFormat.includes ("y"))
              categoryAxis.periodChangeDateFormats.setKey ("day", "yyyy");
            else
              categoryAxis.periodChangeDateFormats.setKey ("day", outputFormat);
          }
          else
          {
            categoryAxis = chart.xAxes.push (new am4charts.CategoryAxis ());
            categoryAxis.renderer.minGridDistance = 30;
          }

          if (!(this.data.currentChartType.flags & ChartFlags.LINECHART && parseDate))
          {
            // Rotate labels if the chart is displayed vertically
            categoryAxis.renderer.labels.template.rotation = 330;
            categoryAxis.renderer.labels.template.maxWidth = 240;
          }

          valueAxis = chart.yAxes.push (new am4charts.ValueAxis ());

          if (chart.data.length > 1)
          {
            chart.scrollbarX = new am4core.Scrollbar ();
            chart.scrollbarX.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
          }
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

        if (this.data.currentChartType.flags & ChartFlags.LINECHART)
        {
          // Set axis tooltip background color depending of the theme
          valueAxis.tooltip.label.fill = Themes.AmCharts[theme].axisTooltipFontColor;
          valueAxis.tooltip.background.fill = Themes.AmCharts[theme].tooltipFill;
          categoryAxis.tooltip.label.fill = Themes.AmCharts[theme].axisTooltipFontColor;
          categoryAxis.tooltip.background.fill = Themes.AmCharts[theme].tooltipFill;
        }
        else
          valueAxis.min = 0;

        if (this.data.currentChartType.flags & ChartFlags.XYCHART)
        {
          // Set axis name into the chart
          if (this.data.chartMode === "advanced")
          {
            if (!(this.data.currentChartType.flags & ChartFlags.ROTATED))
            {
              categoryAxis.title.text = "Intervals";    
              valueAxis.title.text = this.data.valueColumn.columnLabel;
            }
            else
            {
              categoryAxis.title.text = "Intervals";   
              valueAxis.title.text = this.data.valueColumn.columnLabel;
            }

            // The category will be the x axis if the chart type has it
            categoryAxis.dataFields.category = "Interval";
          }
          else
          {
            if (!(this.data.currentChartType.flags & ChartFlags.ROTATED))
            {
              categoryAxis.title.text = this.data.xaxis.columnLabel;    
              valueAxis.title.text = this.data.valueColumn.columnLabel;
            }
            else
            {
              categoryAxis.title.text = this.data.xaxis.columnLabel;   
              valueAxis.title.text = this.data.valueColumn.columnLabel;
            }
  
            // The category will be the x axis if the chart type has it
            categoryAxis.dataFields.category = this.data.xaxis.columnName;
          }

          stacked = (this.data.currentChartType.flags & ChartFlags.STACKED) ? true : false;
          if (this.data.currentChartType.flags & ChartFlags.LINECHART && stacked)
          {
            // Avoid negative values on the stacked area chart
            for (let object of chartInfo.filter)
            {
              for (let data of chartInfo.data)
              {
                if (data[object.valueField] == null)
                  continue;

                if (data[object.valueField] < 0)
                  data[object.valueField] = 0;
              }
            }
          }

          // Sort chart series from least to greatest by calculating the
          // average (normal) or total (stacked) value of each key item to
          // compensate for the lack of proper sorting by values
          if (stacked && !(this.data.currentChartType.flags & ChartFlags.LINECHART))
          {
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
          }
          else
          {
            for (let object of chartInfo.filter)
            {
              let average = 0;

              for (let data of chartInfo.data)
              {
                let value = data[object.valueField];

                if (value != null)
                  average += value;
              }

              object["avg"] = average / chartInfo.data.length;
            }

            // Also sort the data by date the to get the correct order on the line chart
            // if the category axis is a date type
            if (parseDate && this.data.currentChartType.flags & ChartFlags.LINECHART)
            {
              let axisField = this.data.xaxis.columnName;

              chart.events.on ("beforedatavalidated", function(event) {
                chart.data.sort (function(e1, e2) {
                  return +(new Date(e1[axisField])) - +(new Date(e2[axisField]));
                });
              });
            }

            chartInfo.filter.sort (function(e1, e2) {
              return e1.avg - e2.avg;
            });
          }

          // Create the series and set colors
          chart.colors.list = [];

          for (let color of this.data.paletteColors)
            chart.colors.list.push (am4core.color (color));

          for (let object of chartInfo.filter)
            this.data.currentChartType.createSeries (this.data, stacked, chart, object, parseDate, theme, outputFormat);

          // Add cursor if the chart type is line, area or stacked area
          if (this.data.currentChartType.flags & ChartFlags.LINECHART)
            chart.cursor = new am4charts.XYCursor ();
        }
        else
        {
          if (this.data.chartMode === "advanced")
          {
            if (!(this.data.currentChartType.flags & ChartFlags.ROTATED))
            {
              categoryAxis.title.text = "Intervals"; 
              valueAxis.title.text = this.data.valueColumn.columnLabel;
            }
            else
            {
              categoryAxis.title.text = "Intervals"; 
              valueAxis.title.text = this.data.valueColumn.columnLabel;
            }
          }
          else
          {
            if (!(this.data.currentChartType.flags & ChartFlags.ROTATED))
            {
              categoryAxis.title.text = this.data.variable.columnLabel; 
              valueAxis.title.text = this.data.valueColumn.columnLabel;
            }
            else
            {
              categoryAxis.title.text = this.data.variable.columnLabel; 
              valueAxis.title.text = this.data.valueColumn.columnLabel;
            }

            // Sort values from least to greatest
            chart.events.on ("beforedatavalidated", function(event) {
              chart.data.sort (function(e1, e2) {
                return e1[chartInfo.valueField] - e2[chartInfo.valueField];
              });
            });
          }

          // The category will the values if the chart type lacks an x axis
          categoryAxis.dataFields.category = chartInfo.titleField;

          // Create the series
          this.data.currentChartType.createSeries (this.data, false, chart, chartInfo, parseDate, theme, outputFormat);
        }
      }

      // Add export menu
      chart.exporting.menu = new am4core.ExportMenu ();
      chart.exporting.menu.align = "left";
      chart.exporting.menu.verticalAlign = "bottom";
      chart.exporting.title = "Chart Preview";
      chart.exporting.filePrefix = "Chart Preview";
      chart.exporting.useWebFonts = false;

      // Remove "Saved from..." message on PDF files
      options = chart.exporting.getFormatOptions ("pdf");
      options.addURL = false;
      chart.exporting.setFormatOptions ("pdf", options);

      if (this.data.currentChartType.flags & ChartFlags.XYCHART)
      {
        // Display Legend
        chart.legend = new am4charts.Legend ();
        chart.legend.markers.template.width = 15;
        chart.legend.markers.template.height = 15;
        chart.legend.labels.template.fontSize = 10;
        chart.legend.labels.template.fill = Themes.AmCharts[theme].fontColor;
      }

      this.chart = chart;

      // build interval table for advanced charts
      if (this.data.chartMode === "advanced")
      {
        let sum = 0;

        if (this.data.currentChartType.flags & ChartFlags.XYCHART)
        {
          let self = this;
          let keys = [];

          // add keys first
          for (let item of this.chart.data)
          {
            Object.keys (item).forEach (function(key)
            {
              if (key === "Interval")
                return;

              if (keys.indexOf (key) == -1)
                keys.push (key);
            });
          }

          for (let key of keys)
          {
            let firstItem: boolean = true;

            for (let item of self.chart.data)
            {
              let value;

              if (item[key])
                value = item[key];
              else
                value = 0;

              sum += value;

              self.intervalTableRows.push ({
                key: firstItem ? key : " ",
                Interval: item["Interval"],
                value: value,
                sum: sum
              });

              firstItem = false;
            }
          };
        }
        else
        {
          for (let item of this.chart.data)
          {
            let label = item["Interval"];

            sum += item[this.data.valueColumn.columnName];

            this.intervalTableRows.push ({
              key: null,
              Interval: label,
              value: item[this.data.valueColumn.columnName],
              sum: sum
            });
          }
        }
      }
    });
  }

  isAdvChartPanel(): boolean
  {
    return this.data.chartMode === "advanced";
  }

  addUpIntervals(): void
  {
    let theme = this.globals.theme;
    let maxValue: number;
    let self = this;

    if (this.sumSeriesList.length)
    {
      this.removeSumOfIntervals ();
      return;
    }

    this.zone.runOutsideAngular (() => {
      // prepare sum of the intervals for a line chart, if not set
      if (this.data.currentChartType.flags & ChartFlags.XYCHART)
      {
        let keys = [];

        maxValue = null;

        // add keys first
        for (let item of this.chart.data)
        {
          Object.keys (item).forEach (function(key)
          {
            if (key === "Interval" || key.startsWith ("sum"))
              return;

            if (keys.indexOf (key) == -1)
              keys.push (key);
          });
        }

        for (let key of keys)
        {
          let sum = 0;

          for (let item of this.chart.data)
          {
            let value = 0;

            if (item[key])
              value = item[key];

            sum += value;
            item["sum" + key] = sum;
          }

          if (maxValue == null || sum > maxValue)
            maxValue = sum;
        };
      }
      else
      {
        let sum: number = 0;

        for (let item of this.chart.data)
        {
          Object.keys (item).forEach (function(key)
          {
            if (key === "Interval" || key === "sum")
              return;

            sum += item[key];
          });

          if (!this.addUpValuesSet)
            item["sum"] = sum;
        }

        maxValue = sum;
      }

      this.addUpValuesSet = true;

      // add a line chart on top of the existing chart that displays the sum
      if (this.data.currentChartType.flags & ChartFlags.ROTATED)
        this.sumValueAxis = this.chart.xAxes.push (new am4charts.ValueAxis ());
      else
        this.sumValueAxis = this.chart.yAxes.push (new am4charts.ValueAxis ());

      this.sumValueAxis.min = 0;
      this.sumValueAxis.max = maxValue + 1;
      this.sumValueAxis.strictMinMax = true;
      this.sumValueAxis.cursorTooltipEnabled = true;
      this.sumValueAxis.title.text = "Sum";

      // Set value axis properties
      this.sumValueAxis.renderer.labels.template.fontSize = 10;
      this.sumValueAxis.renderer.labels.template.fill = Themes.AmCharts[theme].fontColor;
      this.sumValueAxis.renderer.grid.template.strokeOpacity = 1;
      this.sumValueAxis.renderer.grid.template.stroke = Themes.AmCharts[theme].stroke;
      this.sumValueAxis.renderer.grid.template.strokeWidth = 1;

      // Set axis tooltip background color depending of the theme
      this.sumValueAxis.tooltip.label.fill = Themes.AmCharts[theme].axisTooltipFontColor;
      this.sumValueAxis.tooltip.background.fill = Themes.AmCharts[theme].tooltipFill;

      if (this.data.currentChartType.flags & ChartFlags.XYCHART)
      {
        let index = 0;

        for (let object of this.chartInfo.filter)
        {
          let sumSeries = this.chart.series.push (new am4charts.LineSeries ());

          if (this.data.currentChartType.flags & ChartFlags.ROTATED)
          {
            sumSeries.dataFields.valueX = "sum" + object.valueField;
            sumSeries.dataFields.categoryY = "Interval";
            sumSeries.xAxis = this.sumValueAxis;
          }
          else
          {
            sumSeries.dataFields.valueY = "sum" + object.valueField;
            sumSeries.dataFields.categoryX = "Interval";
            sumSeries.yAxis = this.sumValueAxis;
          }
  
          sumSeries.bullets.push (new am4charts.CircleBullet ());
  
          sumSeries.strokeWidth = 2;
          sumSeries.fill = am4core.color (this.data.paletteColors[index]);
          sumSeries.stroke = Themes.AmCharts[theme].sumStroke;
          sumSeries.strokeOpacity = 0.5;
          sumSeries.name = object.valueAxis;

          if (this.data.currentChartType.flags & ChartFlags.ROTATED)
            sumSeries.tooltipText = object.valueAxis + ": {valueX}";
          else
            sumSeries.tooltipText = object.valueAxis + ": {valueY}";
  
          sumSeries.tooltip.pointerOrientation = "horizontal";
          sumSeries.tooltip.background.cornerRadius = 20;
          sumSeries.tooltip.background.fillOpacity = 0.5;
          sumSeries.tooltip.label.padding (12, 12, 12, 12);

          this.sumSeriesList.push (sumSeries);
          index++;
        }
      }
      else
      {
        let sumSeries = this.chart.series.push (new am4charts.LineSeries ());

        if (this.data.currentChartType.flags & ChartFlags.ROTATED)
        {
          sumSeries.dataFields.valueX = "sum";
          sumSeries.dataFields.categoryY = "Interval";
          sumSeries.xAxis = this.sumValueAxis;
        }
        else
        {
          sumSeries.dataFields.valueY = "sum";
          sumSeries.dataFields.categoryX = "Interval";
          sumSeries.yAxis = this.sumValueAxis;
        }

        sumSeries.bullets.push (new am4charts.CircleBullet ());

        sumSeries.strokeWidth = 2;
        sumSeries.fill = am4core.color (this.data.paletteColors[0]);
        sumSeries.stroke = Themes.AmCharts[theme].sumStroke;
        sumSeries.strokeOpacity = 0.5;
        sumSeries.name = "Sum";

        if (this.data.currentChartType.flags & ChartFlags.ROTATED)
          sumSeries.tooltipText = "{valueX}";
        else
          sumSeries.tooltipText = "{valueY}";

        sumSeries.tooltip.pointerOrientation = "horizontal";
        sumSeries.tooltip.background.cornerRadius = 20;
        sumSeries.tooltip.background.fillOpacity = 0.5;
        sumSeries.tooltip.label.padding (12, 12, 12, 12);

        this.sumSeriesList.push (sumSeries);
      }

      this.chart.cursor = new am4charts.XYCursor ();

      // also hide the normal category axis value labels
      if (this.data.currentChartType.flags & ChartFlags.ROTATED)
      {
        for (let i = 0; i < this.chart.xAxes.length; i++)
        {
          let xaxis = this.chart.xAxes.getIndex (i);

          if (xaxis == this.sumValueAxis)
            continue;

          xaxis.renderer.grid.template.disabled = true;
          xaxis.renderer.labels.template.disabled = true;
          xaxis.renderer.tooltip.disabled = true;
          xaxis.hide ();
        }
      }
      else
      {
        for (let i = 0; i < this.chart.yAxes.length; i++)
        {
          let yaxis = this.chart.yAxes.getIndex (i);

          if (yaxis == this.sumValueAxis)
            continue;

          yaxis.renderer.grid.template.disabled = true;
          yaxis.renderer.labels.template.disabled = true;
          yaxis.renderer.tooltip.disabled = true;
          yaxis.hide ();
        }
      }

      // hide every chart series except the sum ones
      this.chart.events.once ("dataitemsvalidated", function (event) {
        for (let i = 0; i < self.chart.series.length; i++)
        {
          let series = self.chart.series.getIndex (i);
          let skipSeries: boolean = false;

          for (let sumSeries of self.sumSeriesList)
          {
            if (series == sumSeries)
            {
              skipSeries = true;
              break;
            }
          }

          if (skipSeries)
            continue;

          series.hide ();
          series.hiddenInLegend = true;
        }
      });

      // invalidate data in order to display the line chart
      this.chart.invalidateData ();
    });
  }

  removeSumOfIntervals(): void
  {
    this.zone.runOutsideAngular (() => {
      let self = this;

      for (let sumSeries of this.sumSeriesList)
        this.chart.series.removeIndex (this.chart.series.indexOf (sumSeries));

      this.sumSeriesList = [];

      if (this.data.currentChartType.flags & ChartFlags.ROTATED)
        this.chart.xAxes.removeIndex (this.chart.xAxes.indexOf (this.sumValueAxis));
      else
        this.chart.yAxes.removeIndex (this.chart.yAxes.indexOf (this.sumValueAxis));

      this.sumValueAxis = null;

      // display the normal category axis value labels
      if (this.data.currentChartType.flags & ChartFlags.ROTATED)
      {
        for (let i = 0; i < this.chart.xAxes.length; i++)
        {
          let xaxis = this.chart.xAxes.getIndex (i);

          xaxis.show ();
          xaxis.renderer.grid.template.disabled = false;
          xaxis.renderer.labels.template.disabled = false;
          xaxis.renderer.tooltip.disabled = false;
        }
      }
      else
      {
        for (let i = 0; i < this.chart.yAxes.length; i++)
        {
          let yaxis = this.chart.yAxes.getIndex (i);

          yaxis.show ();
          yaxis.renderer.grid.template.disabled = false;
          yaxis.renderer.labels.template.disabled = false;
          yaxis.renderer.tooltip.disabled = false;
        }
      }

      // display every chart series except the sum ones
      this.chart.events.once ("dataitemsvalidated", function (event) {
        for (let i = 0; i < self.chart.series.values.length; i++)
        {
          let series = self.chart.series.getIndex (i);

          series.show ();
          series.hiddenInLegend = false;
        }
      });

      if (this.data.currentChartType.flags & ChartFlags.LINECHART)
        this.chart.cursor = new am4charts.XYCursor ();
      else
        this.chart.cursor = null;

      // invalidate data in order to remove the line chart
      this.chart.invalidateData ();
    });
  }

  toggleIntervalTable(): void
  {
    this.advTableView = !this.advTableView;
  }
}
