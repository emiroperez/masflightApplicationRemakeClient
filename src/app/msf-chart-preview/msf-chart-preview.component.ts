import { Component, Inject, NgZone } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

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
    console.log (urlBase);
    urlArg = encodeURIComponent (urlBase);
    url = this.service.host + "/secure/getChartData?url=" + urlArg + "&optionId=" + this.data.currentOption.id + "&ipAddress=" + this.authService.getIpAddress () +
      "&variable=" + this.data.variable.columnName + "&valueColumn=" + this.data.valueColumn.columnName + "&function=" + this.data.function.id;

    // don't use the xaxis parameter if the chart type is pie, donut or radar
    if (!(this.data.currentChartType.flags & ChartFlags.XYCHART))
      url += "&chartType=pie";
    else
      url += "&xaxis=" + this.data.xaxis.columnName;

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

  makeChart(chartInfo): void
  {
    let theme = this.globals.theme;

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
        this.data.currentChartType.createSeries (this.data, false, chart, chartInfo, null, theme);

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
        let categoryAxis, valueAxis, parseDate, stacked;

        chart = am4core.create ("msf-dashboard-child-panel-chart-display", am4charts.XYChart);
        chart.numberFormatter.numberFormat = "#,###.#";

        // Don't parse dates if the chart is a simple version
        if (this.data.currentChartType.flags & ChartFlags.XYCHART)
        {
          chart.data = chartInfo.data;
          parseDate = this.data.xaxis.columnName.includes ('date');
        }
        else
        {
          chart.data = chartInfo.dataProvider;
          parseDate = false;
        }

        // Set chart axes depeding on the rotation
        if (this.data.currentChartType.flags & ChartFlags.ROTATED)
        {
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
            categoryAxis.dateFormats.setKey ("day", "MMM d");
            categoryAxis.periodChangeDateFormats.setKey ("day", "yyyy");
          }
          else
          {
            categoryAxis = chart.xAxes.push (new am4charts.CategoryAxis ());
            categoryAxis.renderer.minGridDistance = 30;

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
            this.data.currentChartType.createSeries (this.data, stacked, chart, object, parseDate, theme);

          // Add cursor if the chart type is line, area or stacked area
          if (this.data.currentChartType.flags & ChartFlags.LINECHART)
          {
            chart.cursor = new am4charts.XYCursor ();
            chart.cursor.xAxis = valueAxis;
            chart.cursor.snapToSeries = chart.series;
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

          // The category will the values if the chart type lacks an x axis
          categoryAxis.dataFields.category = chartInfo.titleField;

          // Sort values from least to greatest
          chart.events.on ("beforedatavalidated", function(event) {
            chart.data.sort (function(e1, e2) {
              return e1[chartInfo.valueField] - e2[chartInfo.valueField];
            });
          });

          // Create the series
          this.data.currentChartType.createSeries (this.data, false, chart, chartInfo, parseDate, theme);
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
    });
  }
}
