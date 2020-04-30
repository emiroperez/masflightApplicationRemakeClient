import { Component, Inject, NgZone, ViewChild, ChangeDetectorRef, isDevMode } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as moment from 'moment';

import { Globals } from '../globals/Globals';
import { Themes } from '../globals/Themes';
import { ApplicationService } from '../services/application.service';
import { MsfTableComponent } from '../msf-table/msf-table.component';
import { MsfDashboardPanelValues } from '../msf-dashboard-panel/msf-dashboard-panelvalues';
import { ChartFlags } from '../msf-dashboard-panel/msf-dashboard-chartflags';
import { CategoryArguments } from '../model/CategoryArguments';
import { Arguments } from '../model/Arguments';
import { Utils } from '../commons/utils';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-msf-dashboard-child-panel',
  templateUrl: './msf-dashboard-child-panel.component.html'
})
export class MsfDashboardChildPanelComponent {
  errorMessage: string;
  utils: Utils;

  values: MsfDashboardPanelValues;
  chart: any;

  chartTypes:any[] = [
    { name: 'Bars', flags: ChartFlags.XYCHART, createSeries: this.createVertColumnSeries },
    { name: 'Horizontal Bars', flags: ChartFlags.XYCHART | ChartFlags.ROTATED, createSeries: this.createHorizColumnSeries },
    { name: 'Simple Bars', flags: ChartFlags.NONE, createSeries: this.createSimpleVertColumnSeries },
    { name: 'Simple Horizontal Bars', flags: ChartFlags.ROTATED, createSeries: this.createSimpleHorizColumnSeries },
    { name: 'Stacked Bars', flags: ChartFlags.XYCHART | ChartFlags.STACKED, createSeries: this.createVertColumnSeries },
    { name: 'Horizontal Stacked Bars', flags: ChartFlags.XYCHART | ChartFlags.ROTATED | ChartFlags.STACKED, createSeries: this.createHorizColumnSeries },
    { name: 'Funnel', flags: ChartFlags.FUNNELCHART, createSeries: this.createFunnelSeries },
    { name: 'Lines', flags: ChartFlags.XYCHART | ChartFlags.LINECHART, createSeries: this.createLineSeries },                      
    { name: 'Area', flags: ChartFlags.XYCHART | ChartFlags.AREACHART, createSeries: this.createLineSeries },
    { name: 'Stacked Area', flags: ChartFlags.XYCHART | ChartFlags.STACKED | ChartFlags.AREACHART, createSeries: this.createLineSeries },
    { name: 'Pie', flags: ChartFlags.PIECHART, createSeries: this.createPieSeries },
    { name: 'Donut', flags: ChartFlags.DONUTCHART, createSeries: this.createPieSeries },
    { name: 'Table', flags: ChartFlags.TABLE },
    { name: 'Simple Lines', flags: ChartFlags.LINECHART, createSeries: this.createSimpleLineSeries },
  ];

  functions:any[] = [
    { id: 'avg' },
    { id: 'sum' },
    { id: 'max' },
    { id: 'min' },
    { id: 'count' }
  ];

  // table variables
  @ViewChild('msfTableRef', { static: false })
  msfTableRef: MsfTableComponent;

  actualPageNumber: number;
  dataSource: boolean = false;
  template: boolean = false;
  moreResults: boolean = false;
  moreResultsBtn: boolean = false;
  displayedColumns;
  selectedIndex = 0;
  totalRecord = 0;
  metadata;

  paletteColors: string[];

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

  constructor(
    public dialogRef: MatDialogRef<MsfDashboardChildPanelComponent>,
    private zone: NgZone,
    public globals: Globals,
    public changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService,
    private service: ApplicationService,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.utils = new Utils ();

    this.destroyChart ();

    // generate drill down chart
    this.globals.popupLoading = true;
    this.service.getChildPanel (this, data.parentPanelId, this.data.drillDownId, this.configureChildPanel, this.handlerChildPanelError);
  }

  ngOnDestroy()
  {
    this.destroyChart ();
  }

  onNoClick(): void
  {
    this.dialogRef.close ();
  }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }

  // Function to create horizontal column chart series
  createHorizColumnSeries(values, stacked, chart, item, parseDate, theme, outputFormat, paletteColors): void
  {
    // Set up series
    let series = chart.series.push (new am4charts.ColumnSeries ());
    series.name = item.valueAxis;
    series.dataFields.valueX = item.valueField;

    // Parse date if available
    if (parseDate)
    {
      series.dataFields.dateY = values.xaxis.columnName;
      series.dateFormatter.dateFormat = outputFormat;

      if (values.valueColumn.columnType === "number")
        series.columns.template.tooltipText = "{dateY}: " + (values.valueColumn.prefix ? values.valueColumn.prefix : "") + "{valueX}" + (values.valueColumn.suffix ? values.valueColumn.suffix : "");
      else
        series.columns.template.tooltipText = "{dateY}: {valueX}";
    }
    else
    {
      series.dataFields.categoryY = values.xaxis.columnName;

      if (values.valueColumn.columnType === "number")
        series.columns.template.tooltipText = "{categoryY}: " + (values.valueColumn.prefix ? values.valueColumn.prefix : "") + "{valueX}" + (values.valueColumn.suffix ? values.valueColumn.suffix : "");
      else
        series.columns.template.tooltipText = "{categoryY}: {valueX}";
    }

    // Configure columns
    series.stacked = stacked;
    series.columns.template.strokeWidth = 0;
    series.columns.template.width = am4core.percent (60);
  }

  // Function to create vertical column chart series
  createVertColumnSeries(values, stacked, chart, item, parseDate, theme, outputFormat, paletteColors): void
  {
    let series = chart.series.push (new am4charts.ColumnSeries ());
    series.name = item.valueAxis;
    series.dataFields.valueY = item.valueField;

    if (parseDate)
    {
      series.dataFields.dateX = values.xaxis.columnName;
      series.dateFormatter.dateFormat = outputFormat;

      if (values.valueColumn.columnType === "number")
        series.columns.template.tooltipText = "{dateX}: " + (values.valueColumn.prefix ? values.valueColumn.prefix : "") + "{valueY}" + (values.valueColumn.suffix ? values.valueColumn.suffix : "");
      else
        series.columns.template.tooltipText = "{dateX}: {valueY}";
    }
    else
    {
      series.dataFields.categoryX = values.xaxis.columnName;

      if (values.valueColumn.columnType === "number")
        series.columns.template.tooltipText = "{categoryX}: " + (values.valueColumn.prefix ? values.valueColumn.prefix : "") + "{valueY}" + (values.valueColumn.suffix ? values.valueColumn.suffix : "");
      else
        series.columns.template.tooltipText = "{categoryX}: {valueY}";
    }

    series.stacked = stacked;
    series.columns.template.strokeWidth = 0;
    series.columns.template.width = am4core.percent (60);
  }

  // Function to create line chart series
  createLineSeries(values, stacked, chart, item, parseDate, theme, outputFormat, paletteColors): void
  {
    // Set up series
    let series = chart.series.push (new am4charts.LineSeries ());
    series.name = item.valueAxis;
    series.dataFields.valueY = item.valueField;
    series.strokeWidth = 2;
    series.minBulletDistance = 10;
    series.tooltip.pointerOrientation = "horizontal";
    series.tooltip.background.cornerRadius = 20;
    series.tooltip.background.fillOpacity = 0.5;
    series.tooltip.label.padding (12, 12, 12, 12);
    series.tensionX = 0.8;

    if (values.currentChartType.flags & ChartFlags.BULLET)
    {
      let bullet, circle;

      series.strokeOpacity = 0;

      // add circle bullet for scatter chart
      bullet = series.bullets.push (new am4charts.Bullet ());

      circle = bullet.createChild (am4core.Circle);
      circle.horizontalCenter = "middle";
      circle.verticalCenter = "middle";
      circle.strokeWidth = 0;
      circle.width = 12;
      circle.height = 12;
    }

    if (parseDate)
    {
      series.dataFields.dateX = values.xaxis.columnName;
      series.dateFormatter.dateFormat = outputFormat;

      if (values.valueColumn.columnType === "number")
        series.tooltipText = "{dateX}: " + (values.valueColumn.prefix ? values.valueColumn.prefix : "") + "{valueY}" + (values.valueColumn.suffix ? values.valueColumn.suffix : "");
      else
        series.tooltipText = "{dateX}: {valueY}";
    }
    else
    {
      series.dataFields.categoryX = values.xaxis.columnName;

      if (values.valueColumn.columnType === "number")
        series.tooltipText = "{categoryX}: " + (values.valueColumn.prefix ? values.valueColumn.prefix : "") + "{valueY}" + (values.valueColumn.suffix ? values.valueColumn.suffix : "");
      else
        series.tooltipText = "{categoryX}: {valueY}";
    }

    // Fill area below line for area chart types
    if (values.currentChartType.flags & ChartFlags.AREAFILL)
      series.fillOpacity = 0.3;

    series.stacked = stacked;
  }

  // Function to create simple line chart series
  createSimpleLineSeries(values, stacked, chart, item, parseDate, theme, outputFormat, paletteColors): any
  {
    // Set up series
    let series = chart.series.push (new am4charts.LineSeries ());
    series.name = item.valueField;
    series.dataFields.valueY = item.valueField;
    series.strokeWidth = 2;
    series.minBulletDistance = 10;
    series.tooltip.pointerOrientation = "horizontal";
    series.tooltip.background.cornerRadius = 20;
    series.tooltip.background.fillOpacity = 0.5;
    series.tooltip.label.padding (12, 12, 12, 12);
    series.tensionX = 0.8;

    if (values.currentChartType.flags & ChartFlags.BULLET)
    {
      let bullet, circle;

      series.strokeOpacity = 0;

      // add circle bullet for scatter chart
      bullet = series.bullets.push (new am4charts.Bullet ());

      circle = bullet.createChild (am4core.Circle);
      circle.horizontalCenter = "middle";
      circle.verticalCenter = "middle";
      circle.strokeWidth = 0;
      circle.width = 12;
      circle.height = 12;
    }

    if (parseDate)
    {
      series.dataFields.dateX = item.titleField;
      series.dateFormatter.dateFormat = outputFormat;

      if (values.valueColumn && values.valueColumn.columnType === "number")
        series.tooltipText = "{dateX}: " + (values.valueColumn.prefix ? values.valueColumn.prefix : "") + "{valueY}" + (values.valueColumn.suffix ? values.valueColumn.suffix : "");
      else
        series.tooltipText = "{dateX}: {valueY}";
    }
    else
    {
      series.dataFields.categoryX = item.titleField;

      if (values.valueColumn && values.valueColumn.columnType === "number")
        series.tooltipText = "{categoryX}: " + (values.valueColumn.prefix ? values.valueColumn.prefix : "") + "{valueY}" + (values.valueColumn.suffix ? values.valueColumn.suffix : "");
      else
        series.tooltipText = "{categoryX}: {valueY}";
    }

    series.stacked = stacked;

    // Set thresholds
    series.segments.template.adapter.add ("fill", (fill, target) => {
      if (target.dataItem)
      {
        for (let threshold of values.thresholds)
        {
          if (target.dataItem.values.valueY.average >= threshold.min && target.dataItem.values.valueY.average <= threshold.max)
            return am4core.color (threshold.color);
        }
      }

      return am4core.color (paletteColors[0]);
    });

    series.adapter.add ("stroke", (stroke, target) => {
      if (target.dataItem)
      {
        for (let threshold of values.thresholds)
        {
          if (target.dataItem.values.valueY.average >= threshold.min && target.dataItem.values.valueY.average <= threshold.max)
            return am4core.color (threshold.color);
        }
      }

      return am4core.color (paletteColors[0]);
    });

    if (!(values.currentChartType.flags & ChartFlags.ADVANCED))
    {
      // Display a special context menu when a chart line segment is right clicked
      series.segments.template.interactionsEnabled = true;
      series.segments.template.events.on ("rightclick", function (event) {
        if (!values.currentOption.drillDownOptions.length)
          return;

        values.chartClicked = true;
        values.chartObjectSelected = event.target.dataItem.component.tooltipDataItem.dataContext[values.variable.id];
        values.chartSecondaryObjectSelected = series.dataFields.valueY;
      });
    }

    return series;
  }

  // Function to create simple vertical column chart series
  createSimpleVertColumnSeries(values, stacked, chart, item, parseDate, theme, outputFormat, paletteColors): void
  {
    let series = chart.series.push (new am4charts.ColumnSeries());
    series.dataFields.valueY = item.valueField;
    series.name = item.valueField;

    if (parseDate)
    {
      series.dataFields.dateX = item.titleField;
      series.dateFormatter.dateFormat = outputFormat;

      if (values.valueColumn && values.valueColumn.columnType === "number")
        series.columns.template.tooltipText = "{dateX}: " + (values.valueColumn.prefix ? values.valueColumn.prefix : "") + "{valueY}" + (values.valueColumn.suffix ? values.valueColumn.suffix : "");
      else
        series.columns.template.tooltipText = "{dateX}: {valueY}";
    }
    else
    {
      series.dataFields.categoryX = item.titleField;

      if (values.valueColumn && values.valueColumn.columnType === "number")
        series.columns.template.tooltipText = "{categoryX}: " + (values.valueColumn.prefix ? values.valueColumn.prefix : "") + "{valueY}" + (values.valueColumn.suffix ? values.valueColumn.suffix : "");
      else
        series.columns.template.tooltipText = "{categoryX}: {valueY}";
    }

    series.columns.template.strokeWidth = 0;
    series.sequencedInterpolation = true;

    series.stacked = stacked;

    // Set colors
    series.columns.template.adapter.add ("fill", (fill, target) => {
      return am4core.color (paletteColors[0]);
    });
  }

  // Function to create simple horizontal column chart series
  createSimpleHorizColumnSeries(values, stacked, chart, item, parseDate, theme, outputFormat, paletteColors): void
  {
    let series = chart.series.push (new am4charts.ColumnSeries());
    series.dataFields.valueX = item.valueField;
    series.name = item.valueField;

    if (parseDate)
    {
      series.dataFields.dateY = item.titleField;
      series.dateFormatter.dateFormat = outputFormat;

      if (values.valueColumn && values.valueColumn.columnType === "number")
        series.columns.template.tooltipText = "{dateY}: " + (values.valueColumn.prefix ? values.valueColumn.prefix : "") + "{valueX}" + (values.valueColumn.suffix ? values.valueColumn.suffix : "");
      else
        series.columns.template.tooltipText = "{dateY}: {valueX}";
    }
    else
    {
      series.dataFields.categoryY = item.titleField;

      if (values.valueColumn && values.valueColumn.columnType === "number")
        series.columns.template.tooltipText = "{categoryY}: " + (values.valueColumn.prefix ? values.valueColumn.prefix : "") + "{valueX}" + (values.valueColumn.suffix ? values.valueColumn.suffix : "");
      else
        series.columns.template.tooltipText = "{categoryY}: {valueX}";
    }

    series.columns.template.strokeWidth = 0;
    series.sequencedInterpolation = true;

    series.stacked = stacked;

    series.columns.template.adapter.add ("fill", (fill, target) => {
      return am4core.color (paletteColors[0]);
    });
  }

  // Function to create pie chart series
  createPieSeries(values, stacked, chart, item, parseDate, theme, outputFormat, paletteColors): void
  {
    let series, colorSet;

    // Set inner radius for donut chart
    if (values.currentChartType.flags & ChartFlags.PIEHOLE)
      chart.innerRadius = am4core.percent (60);

    // Configure Pie Chart
    series = chart.series.push (new am4charts.PieSeries ());
    series.dataFields.value = item.valueField;
    series.dataFields.category = item.titleField;

    if (values.valueColumn.columnType === "number")
      series.slices.template.tooltipText = "{category}: " + (values.valueColumn.prefix ? values.valueColumn.prefix : "") + "{value.value}" + (values.valueColumn.suffix ? values.valueColumn.suffix : "");
    else
      series.slices.template.tooltipText = "{category}: {value.value}";

    // This creates initial animation
    series.hiddenState.properties.opacity = 1;
    series.hiddenState.properties.endAngle = -90;
    series.hiddenState.properties.startAngle = -90;

    // Set ticks color
    series.labels.template.fill = Themes.AmCharts[theme].fontColor;
    series.ticks.template.strokeOpacity = 1;
    series.ticks.template.stroke = Themes.AmCharts[theme].ticks;
    series.ticks.template.strokeWidth = 1;

    // Set the color for the chart to display
    colorSet = new am4core.ColorSet ();
    colorSet.list = paletteColors.map (function(color) {
      return am4core.color (color);
    });
    series.colors = colorSet;
  }

  // Function to create funnel chart series
  createFunnelSeries(values, stacked, chart, item, parseDate, theme, outputFormat, paletteColors): void
  {
    let series, colorSet;

    series = chart.series.push (new am4charts.FunnelSeries ());
    series.dataFields.value = item.valueField;
    series.dataFields.category = item.titleField;

    if (values.valueColumn.columnType === "number")
      series.slices.template.tooltipText = "{category}: " + (values.valueColumn.prefix ? values.valueColumn.prefix : "") + "{value.value}" + (values.valueColumn.suffix ? values.valueColumn.suffix : "");
    else
      series.slices.template.tooltipText = "{category}: {value.value}";

    // Set chart apparence
    series.sliceLinks.template.fillOpacity = 0;
    series.labels.template.fill = Themes.AmCharts[theme].fontColor;
    series.ticks.template.strokeOpacity = 1;
    series.ticks.template.stroke = Themes.AmCharts[theme].ticks;
    series.ticks.template.strokeWidth = 1;
    series.alignLabels = true;

    // Set the color for the chart to display
    colorSet = new am4core.ColorSet ();
    colorSet.list = paletteColors.map (function(color) {
      return am4core.color (color);
    });
    series.colors = colorSet;
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

    if (this.values.paletteColors && this.values.paletteColors.length)
      this.paletteColors = this.values.paletteColors;
    else
      this.paletteColors = Themes.AmCharts[theme].resultColors;

    this.zone.runOutsideAngular (() => {
      let chart, options;

      // Check chart type before generating it
      if (this.values.currentChartType.flags & ChartFlags.FUNNELCHART
        || this.values.currentChartType.flags & ChartFlags.PIECHART)
      {
        if (this.values.currentChartType.flags & ChartFlags.FUNNELCHART)
          chart = am4core.create ("msf-dashboard-child-panel-chart-display", am4charts.SlicedChart);
        else
          chart = am4core.create ("msf-dashboard-child-panel-chart-display", am4charts.PieChart);

        chart.data = chartInfo.dataProvider;

        if (this.values.valueColumn.columnType === "number")
        {
          if (this.values.valueColumn.outputFormat)
            chart.numberFormatter.numberFormat = this.utils.convertNumberFormat (this.values.valueColumn.outputFormat);
          else
            chart.numberFormatter.numberFormat = this.utils.convertNumberFormat (this.values.valueColumn.columnFormat);
        }
        else
          chart.numberFormatter.numberFormat = "#,###.#";

        // Set label font size
        chart.fontSize = 10;

        // Create the series
        this.values.currentChartType.createSeries (this.values, false, chart, chartInfo, null, theme, null, this.paletteColors);

        if (this.values.currentChartType.flags & ChartFlags.FUNNELCHART)
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

        if (this.values.valueColumn && this.values.valueColumn.columnType === "number")
        {
          if (this.values.valueColumn.outputFormat)
            chart.numberFormatter.numberFormat = this.utils.convertNumberFormat (this.values.valueColumn.outputFormat);
          else
            chart.numberFormatter.numberFormat = this.utils.convertNumberFormat (this.values.valueColumn.columnFormat);
        }
        else
          chart.numberFormatter.numberFormat = "#,###.#";

        // Don't parse dates if the chart is a simple version
        if (this.values.currentChartType.flags & ChartFlags.XYCHART)
        {
          chart.data = JSON.parse (JSON.stringify (chartInfo.data));
          if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
            parseDate = false;
          else
            parseDate = (this.values.xaxis.columnType === "date") ? true : false;
        }
        else if (!(this.values.currentChartType.flags & ChartFlags.ADVANCED) && !(this.values.currentChartType.flags & ChartFlags.PIECHART) && !(this.values.currentChartType.flags & ChartFlags.FUNNELCHART))
        {
          chart.data = JSON.parse (JSON.stringify (chartInfo.dataProvider));
          if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
            parseDate = false;
          else
            parseDate = (this.values.variable.columnType === "date") ? true : false;
        }

        if (parseDate)
        {
          if (this.values.currentChartType.flags & ChartFlags.XYCHART)
          {
            if (this.values.xaxis.columnFormat)
            {
              for (let data of chart.data)
                data[this.values.xaxis.id] = this.parseDate (data[this.values.xaxis.id], this.values.xaxis.columnFormat);

              outputFormat = this.values.xaxis.columnFormat;

              // Set predefined format if used
              if (this.predefinedColumnFormats[outputFormat])
                outputFormat = this.predefinedColumnFormats[outputFormat];
            }
            else
              parseDate = false;
          }
          else if (!(this.values.currentChartType.flags & ChartFlags.ADVANCED) && !(this.values.currentChartType.flags & ChartFlags.PIECHART) && !(this.values.currentChartType.flags & ChartFlags.FUNNELCHART))
          {
            if (this.values.variable.columnFormat)
            {
              for (let data of chart.data)
                data[this.values.variable.id] = this.parseDate (data[this.values.variable.id], this.values.variable.columnFormat);

              outputFormat = this.values.variable.columnFormat;

              // Set predefined format if used
              if (this.predefinedColumnFormats[outputFormat])
                outputFormat = this.predefinedColumnFormats[outputFormat];
            }
            else
              parseDate = false;
          }
          else
            parseDate = false;
        }

        // Set chart axes depeding on the rotation
        if (this.values.currentChartType.flags & ChartFlags.ROTATED)
        {
          if (parseDate)
          {
            categoryAxis = chart.yAxes.push (new am4charts.DateAxis ());
            categoryAxis.dateFormats.setKey ("day", outputFormat);
            categoryAxis.dateFormats.setKey ("week", outputFormat);
            categoryAxis.dateFormats.setKey ("month", outputFormat);
            categoryAxis.dateFormats.setKey ("year", outputFormat);

            if (!outputFormat.includes ("d") && !outputFormat.includes ("D"))
            {
              if (!outputFormat.includes ("m") && !outputFormat.includes ("M"))
              {
                categoryAxis.baseInterval.timeunit = "year";
                categoryAxis.baseInterval.count = 1;
              }
              else
              {
                categoryAxis.baseInterval.timeunit = "month";
                categoryAxis.baseInterval.count = 1;
              }
            }
            else
            {
              categoryAxis.baseInterval.timeunit = "day";
              categoryAxis.baseInterval.count = 1;
            }

            if (!outputFormat.includes ("y") && !outputFormat.includes ("Y"))
              categoryAxis.periodChangeDateFormats.setKey ("month", "yyyy");
            else
              categoryAxis.periodChangeDateFormats.setKey ("month", outputFormat);

            categoryAxis.periodChangeDateFormats.setKey ("day", outputFormat);
            categoryAxis.periodChangeDateFormats.setKey ("week", outputFormat);
            categoryAxis.periodChangeDateFormats.setKey ("year", outputFormat);
          }
          else
          {
            categoryAxis = chart.yAxes.push (new am4charts.CategoryAxis ());
            categoryAxis.renderer.minGridDistance = 15;
            categoryAxis.renderer.labels.template.maxWidth = 240;
          }

          valueAxis = chart.xAxes.push (new am4charts.ValueAxis ());

          if (this.values.startAtZero)
            valueAxis.min = 0;

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
            categoryAxis.dateFormats.setKey ("week", outputFormat);
            categoryAxis.dateFormats.setKey ("month", outputFormat);
            categoryAxis.dateFormats.setKey ("year", outputFormat);

            if (!outputFormat.includes ("d") && !outputFormat.includes ("D"))
            {
              if (!outputFormat.includes ("m") && !outputFormat.includes ("M"))
              {
                categoryAxis.baseInterval.timeunit = "year";
                categoryAxis.baseInterval.count = 1;
              }
              else
              {
                categoryAxis.baseInterval.timeunit = "month";
                categoryAxis.baseInterval.count = 1;
              }
            }
            else
            {
              categoryAxis.baseInterval.timeunit = "day";
              categoryAxis.baseInterval.count = 1;
            }

            if (!outputFormat.includes ("y") && !outputFormat.includes ("Y"))
              categoryAxis.periodChangeDateFormats.setKey ("month", "yyyy");
            else
              categoryAxis.periodChangeDateFormats.setKey ("month", outputFormat);

            categoryAxis.periodChangeDateFormats.setKey ("day", outputFormat);
            categoryAxis.periodChangeDateFormats.setKey ("week", outputFormat);
            categoryAxis.periodChangeDateFormats.setKey ("year", outputFormat);
          }
          else
          {
            categoryAxis = chart.xAxes.push (new am4charts.CategoryAxis ());
            categoryAxis.renderer.minGridDistance = 30;
          }

          if (!(this.values.currentChartType.flags & ChartFlags.LINECHART && parseDate))
          {
            // Rotate labels if the chart is displayed vertically
            categoryAxis.renderer.labels.template.rotation = 330;
            categoryAxis.renderer.labels.template.maxWidth = 240;
          }

          valueAxis = chart.yAxes.push (new am4charts.ValueAxis ());

          if (this.values.startAtZero)
            valueAxis.min = 0;

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

        if (this.values.currentChartType.flags & ChartFlags.LINECHART)
        {
          // Set axis tooltip background color depending of the theme
          valueAxis.tooltip.label.fill = Themes.AmCharts[theme].axisTooltipFontColor;
          valueAxis.tooltip.background.fill = Themes.AmCharts[theme].tooltipFill;
          categoryAxis.tooltip.label.fill = Themes.AmCharts[theme].axisTooltipFontColor;
          categoryAxis.tooltip.background.fill = Themes.AmCharts[theme].tooltipFill;
        }

        if (this.values.currentChartType.flags & ChartFlags.XYCHART)
        {
          // Set axis name into the chart
          if (!(this.values.currentChartType.flags & ChartFlags.ROTATED))
          {
            if (this.values.horizAxisName && this.values.horizAxisName != "")
              categoryAxis.title.text = this.values.horizAxisName;
            else
              categoryAxis.title.text = this.values.xaxis.columnLabel;
    
            if (this.values.vertAxisName && this.values.vertAxisName != "")
              valueAxis.title.text = this.values.vertAxisName;
            else
            {
              if (this.values.valueColumn)
                valueAxis.title.text = this.values.valueColumn.columnLabel;
              else
                valueAxis.title.text = "Count";
            }
          }
          else
          {
            if (this.values.vertAxisName && this.values.vertAxisName != "")
              categoryAxis.title.text = this.values.vertAxisName;
            else
              categoryAxis.title.text = this.values.xaxis.columnLabel;
    
            if (this.values.horizAxisName && this.values.horizAxisName != "")
              valueAxis.title.text = this.values.horizAxisName;
            else
            {
              if (this.values.valueColumn)
                valueAxis.title.text = this.values.valueColumn.columnLabel;
              else
                valueAxis.title.text = "Count";
            }
          }

          // The category will be the x axis if the chart type has it
          categoryAxis.dataFields.category = this.values.xaxis.columnName;

          stacked = (this.values.currentChartType.flags & ChartFlags.STACKED) ? true : false;
          if (this.values.currentChartType.flags & ChartFlags.LINECHART && stacked)
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

          if (this.values.ordered)
          {
            // Sort chart series from least to greatest by calculating the
            // total value of each key item to compensate for the lack of proper
            // sorting by values
            if (parseDate && this.values.currentChartType.flags & ChartFlags.LINECHART)
            {
              // Sort by date the to get the correct order on the line chart
              // if the category axis is a date type
              let axisField = this.values.xaxis.id;
  
              chart.events.on ("beforedatavalidated", function (event) {
                chart.data.sort (function (e1, e2) {
                  return +(new Date(e1[axisField])) - +(new Date(e2[axisField]));
                });
              });
            }
            else
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

              chart.events.on ("beforedatavalidated", function (event) {
                chart.data.sort (function (e1, e2) {
                  return e1.sum - e2.sum;
                });
              });
            }
          }

          // Create the series and set colors
          chart.colors.list = [];

          for (let color of this.paletteColors)
            chart.colors.list.push (am4core.color (color));

          for (let object of chartInfo.filter)
          {
            if (this.values.variable.columnType === "date")
            {
              let date = this.parseDate (object.valueAxis, this.values.variable.columnFormat);
              let legendOutputFormat = this.values.variable.columnFormat;

              // Set predefined format if used
              if (this.predefinedColumnFormats[legendOutputFormat])
                legendOutputFormat = this.predefinedColumnFormats[legendOutputFormat];

              object.valueAxis = new DatePipe ('en-US').transform (date.toString (), legendOutputFormat);
            }

            this.values.currentChartType.createSeries (this.values, stacked, chart, object, parseDate, theme, outputFormat, this.paletteColors);
          }
        }
        else
        {
          if (!(this.values.currentChartType.flags & ChartFlags.ROTATED))
          {
            if (this.values.horizAxisName && this.values.horizAxisName != "")
              categoryAxis.title.text = this.values.horizAxisName;
            else
              categoryAxis.title.text = this.values.variable.columnLabel;
  
            if (this.values.vertAxisName && this.values.vertAxisName != "")
              valueAxis.title.text = this.values.vertAxisName;
            else
            {
              if (this.values.valueColumn)
                valueAxis.title.text = this.values.valueColumn.columnLabel;
              else
                valueAxis.title.text = "Count";
            }
          }
          else
          {
            if (this.values.vertAxisName && this.values.vertAxisName != "")
              categoryAxis.title.text = this.values.vertAxisName;
            else
              categoryAxis.title.text = this.values.variable.columnLabel;
  
            if (this.values.horizAxisName && this.values.horizAxisName != "")
              valueAxis.title.text = this.values.horizAxisName;
            else
            {
              if (this.values.valueColumn)
                valueAxis.title.text = this.values.valueColumn.columnLabel;
              else
                valueAxis.title.text = "Count";
            }
          }

          // The category will the values if the chart type lacks an x axis
          categoryAxis.dataFields.category = chartInfo.titleField;

          if (this.values.ordered)
          {
            if (parseDate)
            {
              let axisField = this.values.variable.id;

              // reverse order for rotated charts
              if (this.values.currentChartType.flags & ChartFlags.ROTATED)
                categoryAxis.renderer.inversed = true;

              chart.events.on ("beforedatavalidated", function (event) {
                chart.data.sort (function (e1, e2) {
                  return +(new Date(e1[axisField])) - +(new Date(e2[axisField]));
                });
              });
            }
            else
            {
              // Sort values from least to greatest
              chart.events.on ("beforedatavalidated", function(event) {
                chart.data.sort (function(e1, e2) {
                  return e1[chartInfo.valueField] - e2[chartInfo.valueField];
                });
              });
            }
          }

          // Create the series
          this.values.currentChartType.createSeries (this.values, false, chart, chartInfo, parseDate, theme, outputFormat, this.paletteColors);
        }

        // Add cursor if the chart type is line, area or stacked area
        if (this.values.currentChartType.flags & ChartFlags.LINECHART)
          chart.cursor = new am4charts.XYCursor ();
      }

      // Add export menu
      chart.exporting.menu = new am4core.ExportMenu ();
      chart.exporting.menu.align = "left";
      chart.exporting.menu.verticalAlign = "bottom";
      chart.exporting.title = this.values.chartName;
      chart.exporting.description = this.values.chartDescription;
      chart.exporting.filePrefix = this.values.chartName;
      chart.exporting.useWebFonts = false;

      // Remove "Saved from..." message on PDF files
      options = chart.exporting.getFormatOptions ("pdf");
      options.addURL = false;
      chart.exporting.setFormatOptions ("pdf", options);

      if (this.values.currentChartType.flags & ChartFlags.XYCHART)
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

  destroyChart(): void
  {
    if (this.chart)
    {
      this.zone.runOutsideAngular (() => {
        if (this.chart)
          this.chart.dispose ();
      });
    }
  }

  checkGroupingValue(categoryColumnName, values): boolean
  {
    if (values == null)
      return false;

    for (let value of values)
    {
      if (value.columnName === categoryColumnName)
        return true;          // already in the grouping list
    }

    return false;
  }

  checkGroupingCategory(argument): boolean
  {
    if (argument.name1 != null && argument.name1.toLowerCase ().includes ("grouping"))
    {
      if (this.values.currentChartType.flags & ChartFlags.TABLE)
        return true; // tables must not check this!
      else if (!(this.values.currentChartType.flags & ChartFlags.INFO))
      {
        if (this.values.variable.grouping && !this.checkGroupingValue (this.values.variable.columnName, argument.value1))
          return false;

        if (this.values.currentChartType.flags & ChartFlags.XYCHART)
        {
          if (this.values.xaxis.grouping && !this.checkGroupingValue (this.values.xaxis.columnName, argument.value1))
            return false;
        }

        if (this.values.valueColumn.grouping && !this.checkGroupingValue (this.values.valueColumn.columnName, argument.value1))
          return false;
      }
    }

    return true;
  }

  checkPanelVariables(): boolean
  {
    let currentOptionCategories = this.values.currentOptionCategories;

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

            if (!this.checkGroupingCategory (argument))
              return false;
          }
        }
      }
    }

    return true;
  }

  getParameters()
  {
    let currentOptionCategories = this.values.currentOptionCategories;
    let parentArgument = this.data.parentCategory.item.argumentsId;
    let parentCategoryId = this.data.parentCategory.id.toLowerCase ();
    let filterValue = this.data.categoryFilter;
    let secondaryParentCategoryId = null;
    let secondaryParentArgument = null;
    let secondaryFilterValue = this.data.secondaryCategoryFilter;
    let paramsGroup = [];
    let params;

    if (this.data.secondaryParentCategory != null)
    {
      secondaryParentCategoryId = this.data.secondaryParentCategory.id.toLowerCase ();
      secondaryParentArgument = this.data.secondaryParentCategory.item.argumentsId;
    }

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

            if (argument.type != "AAA_Group")
            {
              if (parentArgument != null && argument.id == parentArgument.argumentId.id)
              {
                if (parentCategoryId.toLowerCase () === "yyyymmdd")
                {
                  filterValue = moment (filterValue, "YYYYMMDD").toDate ().toString ();
                  filterValue = new DatePipe ('en-US').transform (filterValue, 'yyyy/MM/dd');
                }

                if (params)
                  params += "&" + this.utils.getArguments2 (argument, parentCategoryId, filterValue);
                else
                  params = this.utils.getArguments2 (argument, parentCategoryId, filterValue);
              }
              else if (secondaryParentArgument != null && argument.id == secondaryParentArgument.argumentId.id)
              {
                if (secondaryParentCategoryId.toLowerCase () === "yyyymmdd")
                {
                  secondaryFilterValue = moment (secondaryFilterValue, "YYYYMMDD").toDate ().toString ();
                  secondaryFilterValue = new DatePipe ('en-US').transform (secondaryFilterValue, 'yyyy/MM/dd');
                }

                if (params)
                  params += "&" + this.utils.getArguments2 (argument, secondaryParentCategoryId, secondaryFilterValue);
                else
                  params = this.utils.getArguments2 (argument, secondaryParentCategoryId, secondaryFilterValue);
              }
              else
              {
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
            else
              paramsGroup.push ({ target: argument.targetGroup, val: this.utils.getValueFormat (argument.type, argument.value1, argument) });
          }
        }        
      }
    }

    return this.utils.setTarget (paramsGroup, params);
  }

  getOption(dashboardPanelOption)
  {
    if (dashboardPanelOption != null)
    {
      for (let option of this.data.options)
      {
        if (option.id == dashboardPanelOption.id)
          return option;
      }
    }

    return null;
  }

  configureChildPanel(_this, data)
  {
    let i, notConfigured;

    notConfigured = false;

    if (data == null)
    {
      _this.noPanelFound (_this);
      return;
    }

    _this.values = new MsfDashboardPanelValues (_this.data.options, data.title,
      data.description, data.id, null, null, null, null, null, _this.getOption (data.option), data.analysis, data.xaxis,
      data.values, data.function, data.chartType, JSON.stringify (_this.data.currentOptionCategories),
      data.lastestResponse, data.paletteColors);

    _this.values.limitAmount = data.limitAmount;
    _this.values.limitMode = data.limitMode;
    _this.values.startAtZero = data.startAtZero;
    _this.values.ordered = data.ordered;

    _this.values.tableVariables = [];

    for (let columnConfig of _this.values.currentOption.columnOptions)
      _this.values.tableVariables.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel, itemId: columnConfig.id, grouping: columnConfig.grouping, checked: true } );

    // init child panel settings
    if (_this.values.currentChartType != null && _this.values.currentChartType != -1)
    {
      for (i = 0; i < _this.chartTypes.length; i++)
      {
        if (i == _this.values.currentChartType)
        {
          _this.values.currentChartType = _this.chartTypes[i];
          break;
        }
      }
    }
    else
      i = _this.chartTypes.length;

    if (i == _this.chartTypes.length)
      notConfigured = true;

    if (_this.values.currentChartType.flags & ChartFlags.XYCHART)
    {
      if (_this.values.xaxis != null && _this.values.xaxis != -1)
      {
        for (i = 0; i < _this.values.currentOption.columnOptions.length; i++)
        {
          if (_this.values.currentOption.columnOptions[i].id == _this.values.xaxis)
          {
            _this.values.xaxis = _this.values.currentOption.columnOptions[i];
            break;
          }
        }
      }
      else
        i = _this.values.currentOption.columnOptions.length;

      if (i == _this.values.currentOption.columnOptions.length)
        notConfigured = true;
    }

    if (_this.values.currentChartType.flags & ChartFlags.TABLE)
    {
      for (i = 0; i < _this.values.lastestResponse.length; i++)
      {
        let tableColumn = _this.values.lastestResponse[i];

        if (tableColumn.id == null)
          continue;
  
        for (let j = 0; j < _this.values.tableVariables.length; j++)
        {
          let curVariable = _this.values.tableVariables[j];
  
          if (curVariable.itemId == tableColumn.id)
          {
            curVariable.checked = tableColumn.checked;
            break;
          }
        }
      }
    }
    else
    {
      if (_this.values.variable != null && _this.values.variable != -1)
      {
        for (i = 0; i < _this.values.currentOption.columnOptions.length; i++)
        {
          if (_this.values.currentOption.columnOptions[i].id == _this.values.variable)
          {
            _this.values.variable = _this.values.currentOption.columnOptions[i];
            break;
          }
        }
      }
      else
        i = _this.values.currentOption.columnOptions.length;
  
      if (i == _this.values.currentOption.columnOptions.length)
        notConfigured = true;

      if (_this.values.valueColumn != null && _this.values.valueColumn != -1)
      {
        for (i = 0; i < _this.values.currentOption.columnOptions.length; i++)
        {
          if (_this.values.currentOption.columnOptions[i].id == _this.values.valueColumn)
          {
            _this.values.valueColumn = _this.values.currentOption.columnOptions[i];
            break;
          }
        }
      }
      else
        i = _this.values.currentOption.columnOptions.length;

      if (i == _this.values.currentOption.columnOptions.length)
        notConfigured = true;

      if (_this.values.function != null && _this.values.function != -1)
      {
        for (i = 0; i < _this.functions.length; i++)
        {
          if (i == _this.values.function)
          {
            _this.values.function = _this.functions[i];
            break;
          }
        }
      }
      else
        i = _this.functions.length;

      if (i == _this.functions.length)
        notConfigured = true;
    }

    if (notConfigured)
    {
      _this.panelNotConfigured ();
      return;
    }

    if (_this.isTablePanel ())
    {
      _this.changeDetectorRef.detectChanges ();
      _this.msfTableRef.tableOptions = _this;
    }

    _this.service.loadOptionCategoryArguments (_this, _this.values.currentOption.id, _this.setCategories, _this.handlerCategoryError);
  }

  setCategories(_this, data)
  {
    // check if any variable that requires grouping are in configure properly
    /*if (!_this.checkPanelVariables ())
    {
      _this.globals.popupLoading = false;
      _this.errorMessage = "Some variables used to get the results must be added in the grouping inside the parent control variables";
      return;
    }*/

    // add category arguments not available on the parent to the child panel, so the service will work properly
    for (let optionCategory of data)
    {
      for (let category of optionCategory.categoryArgumentsId)
      {
        let avail = false;

        for (let curCategory of _this.values.currentOptionCategories)
        {
          if (curCategory.id == category.id)
          {
            avail = true;

            // use child panel argument name
            for (let i = 0; i < curCategory.arguments.length; i++)
            {
              if (curCategory.arguments[i].name1 != null)
                curCategory.arguments[i].name1 = category.arguments[i].name1;

              if (curCategory.arguments[i].name2 != null)
                curCategory.arguments[i].name2 = category.arguments[i].name2;

              if (curCategory.arguments[i].name3 != null)
                curCategory.arguments[i].name3 = category.arguments[i].name3;
            }

            break;
          }
        }
  
        if (!avail)
          _this.values.currentOptionCategories.push (category);
      }
    }

    if (_this.values.currentChartType.flags & ChartFlags.TABLE)
      _this.loadDataTable (false, _this.msfTableRef.handlerSuccess, _this.msfTableRef.handlerError);
    else
      _this.loadChartData (_this.handlerChartSuccess, _this.handlerDataError);
  }

  noPanelFound(_this)
  {
    _this.globals.popupLoading = false;
    _this.errorMessage = "This drill down option has not been configured for this panel";
  }

  panelNotConfigured()
  {
    this.globals.popupLoading = false;
    this.errorMessage = "This drill down option is not configured properly";
  }

  handlerChildPanelError(_this)
  {
    _this.globals.popupLoading = false;
    _this.errorMessage = "Unable to get child panel";
  }

  handlerCategoryError(_this)
  {
    _this.globals.popupLoading = false;
    _this.errorMessage = "Failed to generate chart";
  }

  noDataFound(): void
  {
    this.globals.popupLoading = false;
    this.errorMessage = "No data available for chart generation";
  }

  loadDataTable(moreResults, handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg;

    this.msfTableRef.displayedColumns = [];
  
    if (moreResults)
    {
      this.actualPageNumber++;
      this.moreResults = true;
    }
    else
      this.actualPageNumber = 0;

    if (!this.actualPageNumber)
      this.msfTableRef.dataSource = null;

    urlBase = this.values.currentOption.baseUrl + "?" + this.getParameters ();
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&&pageSize=100&page_number=" + this.actualPageNumber;
    urlArg = encodeURIComponent(urlBase);

    if (this.data.public)
      url = this.service.host + "/consumeWebServices?url=" + urlArg + "&optionId=" + this.values.currentOption.argumentsId;
    else
      url = this.service.host + "/secure/consumeWebServices?url=" + urlArg + "&optionId=" + this.values.currentOption.argumentsId;

    for (let tableVariable of this.values.tableVariables)
    {
      if (tableVariable.checked)
        url += "&metaDataIds=" + tableVariable.itemId;
    }

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    if (isDevMode ())
      console.log (urlBase);

    this.authService.get (this.msfTableRef, url, handlerSuccess, handlerError);
  }

  loadChartData(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg, haveXaxis, panelInfo;

    haveXaxis = false;

    if (this.globals.currentApplication.name === "DataLake")
    {
      if (this.getParameters ())
        urlBase = this.values.currentOption.baseUrl + "?uName=" + this.globals.userName + "&" + this.getParameters ();
      else
        urlBase = this.values.currentOption.baseUrl + "?uName=" + this.globals.userName;
    }
    else
      urlBase = this.values.currentOption.baseUrl + "?" + this.getParameters ();

    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999&page_number=0";
    urlArg = encodeURIComponent (urlBase);

    if (isDevMode ())
      console.log (urlBase);

    if (this.data.public)
      url = this.service.host + "/getChartData?url=" + urlArg;
    else
      url = this.service.host + "/secure/getChartData?url=" + urlArg;

    // don't use the xaxis parameter if the chart type is pie, donut or radar
    if (this.values.currentChartType.flags & ChartFlags.PIECHART || this.values.currentChartType.flags & ChartFlags.FUNNELCHART)
      url += "&chartType=pie";
    else if (!(this.values.currentChartType.flags & ChartFlags.XYCHART))
      url += "&chartType=simplebar";
    else
      haveXaxis = true;

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    panelInfo = {
      option: this.values.currentOption,
      variableName: this.values.variable.columnName,
      xaxisName: haveXaxis ? this.values.xaxis.columnName : null,
      valueName: (this.values.valueColumn && !this.isSimpleChart ()) ? this.values.valueColumn.columnName : null,
      valueList: (this.values.valueColumn && this.isSimpleChart ()) ? this.values.valueColumn.columnName : null,
      functionName: this.values.function.id
    };

    this.authService.post (this, url, panelInfo, handlerSuccess, handlerError);
  }

  handlerChartSuccess(_this, data): void
  {
    if (_this.values.currentChartType.flags & ChartFlags.XYCHART && _this.utils.isJSONEmpty (data.data))
    {
      _this.noDataFound ();
      return;
    }

    if ((!(_this.values.currentChartType.flags & ChartFlags.XYCHART) && data.dataProvider == null) ||
      (_this.values.currentChartType.flags & ChartFlags.XYCHART && !data.filter))
    {
      _this.noDataFound ();
      return;
    }

    _this.makeChart (data);
    _this.globals.popupLoading = false;
  }

  handlerDataError(_this, result): void
  {
    _this.globals.popupLoading = false;
    _this.errorMessage = "Failed to generate child panel information";
  }

  isTablePanel(): boolean
  {
    return (this.values != null && this.values.currentChartType.flags & ChartFlags.TABLE) ? true : false;
  }

  finishLoadingTable(error)
  {
    this.globals.popupLoading = false;
  }

  moreTableResults()
  {
    if (this.moreResultsBtn)
    {
      this.moreResults = false;

      this.globals.popupLoading = true;

      setTimeout (() => {
        this.loadDataTable (true, this.msfTableRef.handlerSuccess, this.msfTableRef.handlerError);
      }, 3000);
    }
  }

  isSimpleChart(): boolean
  {
    return !(this.values.currentChartType.flags & ChartFlags.XYCHART)
      && !(this.values.currentChartType.flags & ChartFlags.ADVANCED)
      && !(this.values.currentChartType.flags & ChartFlags.PIECHART)
      && !(this.values.currentChartType.flags & ChartFlags.FUNNELCHART);
  }
}
