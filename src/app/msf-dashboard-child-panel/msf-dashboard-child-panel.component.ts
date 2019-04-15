import { Component, Inject, NgZone } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { ApiClient } from '../api/api-client';
import { MsfDashboardPanelValues } from '../msf-dashboard-panel/msf-dashboard-panelvalues';
import { ChartFlags } from '../msf-dashboard-panel/msf-dashboard-chartflags';
import { CategoryArguments } from '../model/CategoryArguments';
import { Arguments } from '../model/Arguments';
import { Utils } from '../commons/utils';

am4core.useTheme(am4themes_animated);
am4core.useTheme(am4themes_dark);

// Grid, scrollbar and legend label colors
const white = am4core.color ("#ffffff");
const darkBlue = am4core.color ("#30303d");
const blueJeans = am4core.color ("#67b7dc");

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
    { name: 'Table', flags: ChartFlags.TABLE }
  ];

  functions:any[] = [
    { id: 'avg' },
    { id: 'sum' },
    { id: 'max' },
    { id: 'min' },
    { id: 'count' }
  ];

  constructor(
    public dialogRef: MatDialogRef<MsfDashboardChildPanelComponent>,
    private zone: NgZone,
    public globals: Globals,
    private http: ApiClient,
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
  createHorizColumnSeries(values, stacked, chart, item, parseDate): void
  {
    // Set up series
    let series = chart.series.push (new am4charts.ColumnSeries ());
    series.name = item.valueAxis;
    series.dataFields.valueX = item.valueField;
    series.sequencedInterpolation = true;

    // Parse date if available
    if (parseDate)
    {
      series.dataFields.dateY = values.xaxis.id;
      series.dateFormatter.dateFormat = "MMM d, yyyy";
      series.columns.template.tooltipText = "{dateY}: {valueX}";
    }
    else
    {
      series.dataFields.categoryY = values.xaxis.id;
      series.columns.template.tooltipText = "{categoryY}: {valueX}";
    }

    // Configure columns
    series.stacked = stacked;
    series.columns.template.strokeWidth = 0;
    series.columns.template.width = am4core.percent (60);
  }

  // Function to create vertical column chart series
  createVertColumnSeries(values, stacked, chart, item, parseDate): void
  {
    let series = chart.series.push (new am4charts.ColumnSeries ());
    series.name = item.valueAxis;
    series.dataFields.valueY = item.valueField;
    series.sequencedInterpolation = true;

    if (parseDate)
    {
      series.dataFields.dateX = values.xaxis.id;
      series.dateFormatter.dateFormat = "MMM d, yyyy";
      series.columns.template.tooltipText = "{dateX}: {valueY}";
    }
    else
    {
      series.dataFields.categoryX = values.xaxis.id;
      series.columns.template.tooltipText = "{categoryX}: {valueY}";
    }

    series.stacked = stacked;
    series.columns.template.strokeWidth = 0;
    series.columns.template.width = am4core.percent (60);
  }

  // Function to create line chart series
  createLineSeries(values, stacked, chart, item, parseDate): void
  {
    // Set up series
    let series = chart.series.push (new am4charts.LineSeries ());
    series.name = item.valueAxis;
    series.dataFields.valueY = item.valueField;
    series.sequencedInterpolation = true;
    series.strokeWidth = 2;
    series.minBulletDistance = 10;
    series.tooltip.pointerOrientation = "horizontal";
    series.tooltip.background.cornerRadius = 20;
    series.tooltip.background.fillOpacity = 0.5;
    series.tooltip.label.padding (12, 12, 12, 12);
    series.tensionX = 0.8;

    if (parseDate)
    {
      series.dataFields.dateX = values.xaxis.id;
      series.dateFormatter.dateFormat = "MMM d, yyyy";
      series.tooltipText = "{dateX}: {valueY}";
    }
    else
    {
      series.dataFields.categoryX = values.xaxis.id;
      series.tooltipText = "{categoryX}: {valueY}";
    }

    // Fill area below line for area chart types
    if (values.currentChartType.flags & ChartFlags.AREAFILL)
      series.fillOpacity = 0.3;

    series.stacked = stacked;
  }

  // Function to create simple vertical column chart series
  createSimpleVertColumnSeries(values, stacked, chart, item, parseDate): void
  {
    let series = chart.series.push (new am4charts.ColumnSeries());
    series.dataFields.valueY = item.valueField;
    series.dataFields.categoryX = item.titleField;
    series.name = item.valueField;
    series.columns.template.tooltipText = "{categoryX}: {valueY}";
    series.columns.template.strokeWidth = 0;

    series.stacked = stacked;

    // Set colors
    series.columns.template.adapter.add ("fill", (fill, target) => {
      return am4core.color (values.paletteColors[0]);
    });
  }

  // Function to create simple horizontal column chart series
  createSimpleHorizColumnSeries(values, stacked, chart, item, parseDate): void
  {
    let series = chart.series.push (new am4charts.ColumnSeries());
    series.dataFields.valueX = item.valueField;
    series.dataFields.categoryY = item.titleField;
    series.name = item.valueField;
    series.columns.template.tooltipText = "{categoryY}: {valueX}";
    series.columns.template.strokeWidth = 0;

    series.stacked = stacked;

    series.columns.template.adapter.add ("fill", (fill, target) => {
      return am4core.color (values.paletteColors[0]);
    });
  }

  // Function to create pie chart series
  createPieSeries(values, stacked, chart, item, parseDate): void
  {
    let series, colorSet;

    // Set inner radius for donut chart
    if (values.currentChartType.flags & ChartFlags.PIEHOLE)
      chart.innerRadius = am4core.percent (60);

    // Configure Pie Chart
    series = chart.series.push (new am4charts.PieSeries ());
    series.dataFields.value = item.valueField;
    series.dataFields.category = item.titleField;

    // This creates initial animation
    series.hiddenState.properties.opacity = 1;
    series.hiddenState.properties.endAngle = -90;
    series.hiddenState.properties.startAngle = -90;

    // Set ticks color
    series.ticks.template.strokeOpacity = 1;
    series.ticks.template.stroke = darkBlue;
    series.ticks.template.strokeWidth = 1;

    // Set the color for the chart to display
    colorSet = new am4core.ColorSet ();
    colorSet.list = values.paletteColors.map (function(color) {
      return am4core.color (color);
    });
    series.colors = colorSet;
  }

  // Function to create funnel chart series
  createFunnelSeries(values, stacked, chart, item, parseDate): void
  {
    let series, colorSet;

    series = chart.series.push (new am4charts.FunnelSeries ());
    series.dataFields.value = item.valueField;
    series.dataFields.category = item.titleField;

    // Set chart apparence
    series.sliceLinks.template.fillOpacity = 0;
    series.ticks.template.strokeOpacity = 1;
    series.ticks.template.stroke = darkBlue;
    series.ticks.template.strokeWidth = 1;
    series.alignLabels = true;

    // Set the color for the chart to display
    colorSet = new am4core.ColorSet ();
    colorSet.list = values.paletteColors.map (function(color) {
      return am4core.color (color);
    });
    series.colors = colorSet;
  }

  makeChart(chartInfo): void
  {
    this.zone.runOutsideAngular (() => {
      let chart;

      // Check chart type before generating it
      if (this.values.currentChartType.flags & ChartFlags.FUNNELCHART
        || this.values.currentChartType.flags & ChartFlags.PIECHART)
      {
        if (this.values.currentChartType.flags & ChartFlags.FUNNELCHART)
          chart = am4core.create ("msf-dashboard-child-panel-chart-display", am4charts.SlicedChart);
        else
          chart = am4core.create ("msf-dashboard-child-panel-chart-display", am4charts.PieChart);

        chart.data = chartInfo.dataProvider;

        // Set label font size
        chart.fontSize = 10;

        // Create the series
        this.values.currentChartType.createSeries (this.values, false, chart, chartInfo, null);

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
        let categoryAxis, valueAxis, parseDate, stacked;

        chart = am4core.create ("msf-dashboard-child-panel-chart-display", am4charts.XYChart);

        // Don't parse dates if the chart is a simple version
        if (this.values.currentChartType.flags & ChartFlags.XYCHART)
        {
          chart.data = chartInfo.data;
          parseDate = this.values.xaxis.id.includes ('date');
        }
        else
        {
          chart.data = chartInfo.dataProvider;
          parseDate = false;
        }

        // Set chart axes depeding on the rotation
        if (this.values.currentChartType.flags & ChartFlags.ROTATED)
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
            chart.scrollbarY.background.fill = blueJeans;
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
            chart.scrollbarX.background.fill = blueJeans;
          }
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

        if (this.values.currentChartType.flags & ChartFlags.XYCHART)
        {
          // The category will be the x axis if the chart type has it
          categoryAxis.dataFields.category = this.values.xaxis.id;

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

          // Sort chart series from least to greatest by calculating the
          // average (normal) or total (stacked) value of each key item to
          // compensate for the lack of proper sorting by values
          if (stacked && !(this.values.currentChartType.flags & ChartFlags.LINECHART))
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
            if (parseDate && this.values.currentChartType.flags & ChartFlags.LINECHART)
            {
              let axisField = this.values.xaxis.id;
  
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

          for (let color of this.values.paletteColors)
            chart.colors.list.push (am4core.color (color));

          for (let object of chartInfo.filter)
            this.values.currentChartType.createSeries (this.values, stacked, chart, object, parseDate);

          // Add cursor if the chart type is line, area or stacked area
          if (this.values.currentChartType.flags & ChartFlags.LINECHART)
          {
            chart.cursor = new am4charts.XYCursor ();
            chart.cursor.xAxis = valueAxis;
            chart.cursor.snapToSeries = chart.series;
          }
        }
        else
        {
          // The category will the values if the chart type lacks an x axis
          categoryAxis.dataFields.category = chartInfo.titleField;

          // Sort values from least to greatest
          chart.events.on ("beforedatavalidated", function(event) {
            chart.data.sort (function(e1, e2) {
              return e1[chartInfo.valueField] - e2[chartInfo.valueField];
            });
          });

          // Create the series
          this.values.currentChartType.createSeries (this.values, false, chart, chartInfo, parseDate);
        }
      }

      if (this.values.currentChartType.flags & ChartFlags.XYCHART)
      {
        // Display Legend
        chart.legend = new am4charts.Legend ();
        chart.legend.markers.template.width = 15;
        chart.legend.markers.template.height = 15;
        chart.legend.labels.template.fontSize = 10;
      }

      // Add export button
      chart.exporting.menu = new am4core.ExportMenu ();
      chart.exporting.menu.verticalAlign = "bottom";

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
    for (let value of values)
    {
      if (value.columnName === categoryColumnName)
        return true;          // already in the grouping list
    }

    return false;
  }

  getParameters()
  {
    let currentOptionCategories = this.values.currentOptionCategories;
    let parentArgument = this.data.parentCategory.item.argumentsId;
    let parentCategoryId = this.data.parentCategory.id.toLowerCase ();
    let secondaryParentCategoryId = this.data.secondaryParentCategory.id.toLowerCase ();
    let filterValue = this.data.categoryFilter;
    let secondaryParentArgument = this.data.secondaryParentCategory.item.argumentsId;
    let secondaryFilterValue = this.data.secondaryCategoryFilter;
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

            if (parentArgument != null && argument.id == parentArgument.id)
            {
              if (params)
                params += "&" + this.utils.getArguments2 (parentArgument, parentCategoryId, filterValue);
              else
                params = this.utils.getArguments2 (parentArgument, parentCategoryId, filterValue);
            }
            else if (secondaryParentArgument != null && argument.id == secondaryParentArgument.id)
            {
              if (params)
                params += "&" + this.utils.getArguments2 (secondaryParentArgument, secondaryParentCategoryId, secondaryFilterValue);
              else
                params = this.utils.getArguments2 (secondaryParentArgument, secondaryParentCategoryId, secondaryFilterValue);
            }
            else
            {
              if (params)
                params += "&" + this.utils.getArguments (argument);
              else
                params = this.utils.getArguments (argument);

              // check if the argument uses grouping to add chart values that requires grouping
              // to work properly
              if (argument.name1 != null && argument.name1.toLowerCase ().includes ("grouping"))
              {
                if (this.values.variable.item.grouping && !this.checkGroupingValue (this.values.variable.item.columnName, argument.value1))
                  params += "," + this.values.variable.item.columnName;

                if (this.values.xaxis.item.grouping && !this.checkGroupingValue (this.values.xaxis.item.columnName, argument.value1))
                  params += "," + this.values.xaxis.item.columnName;

                if (this.values.valueColumn.item.grouping && !this.checkGroupingValue (this.values.valueColumn.item.columnName, argument.value1))
                  params += "," + this.values.valueColumn.item.columnName;
              }
            }
          }
        }        
      }
    }
  
    return params;
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

    _this.values = new MsfDashboardPanelValues (data.id, data.title,
      data.id, null, null, data.option, data.chartColumnOptions, data.analysis, data.xaxis,
      data.values, data.function, data.chartType, JSON.stringify (_this.data.currentOptionCategories),
      null, data.paletteColors);

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

    if (_this.values.variable != null && _this.values.variable != -1)
    {
      for (i = 0; i < _this.values.chartColumnOptions.length; i++)
      {
        if (i == _this.values.variable)
        {
          _this.values.variable = _this.values.chartColumnOptions[i];
          break;
        }
      }
    }
    else
      i = _this.values.chartColumnOptions.length;

    if (i == _this.values.chartColumnOptions.length)
      notConfigured = true;

    if (_this.values.currentChartType.flags & ChartFlags.XYCHART)
    {
      if (_this.values.xaxis != null && _this.values.xaxis != -1)
      {
        for (i = 0; i < _this.values.chartColumnOptions.length; i++)
        {
          if (i == _this.values.xaxis)
          {
            _this.values.xaxis = _this.values.chartColumnOptions[i];
            break;
          }
        }
      }
      else
        i = _this.values.chartColumnOptions.length;

      if (i == _this.values.chartColumnOptions.length)
        notConfigured = true;
    }

    if (_this.values.valueColumn != null && _this.values.valueColumn != -1)
    {
      for (i = 0; i < _this.values.chartColumnOptions.length; i++)
      {
        if (i == _this.values.valueColumn)
        {
          _this.values.valueColumn = _this.values.chartColumnOptions[i];
          break;
        }
      }
    }
    else
      i = _this.values.chartColumnOptions.length;

    if (i == _this.values.chartColumnOptions.length)
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

    if (notConfigured)
    {
      _this.panelNotConfigured ();
      return;
    }

    _this.service.loadOptionCategoryArguments (_this, _this.values.currentOption, _this.setCategories, _this.handlerCategoryError);
  }

  setCategories(_this, data)
  {
    // add category arguments not available on the parent to the child panel, so the service will work properly
    for (let optionCategory of data)
    {
      let avail = false;
      for (let currentOptionCategory of _this.values.currentOptionCategories)
      {
        if (currentOptionCategory.id == optionCategory.categoryArgumentsId.id)
        {
          avail = true;
          break;
        }
      }

      if (!avail)
        _this.values.currentOptionCategories.push (optionCategory.categoryArgumentsId);
    }

    _this.loadChartData (_this.handlerChartSuccess, _this.handlerChartError);
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

  loadChartData(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg;

    urlBase = this.values.currentOption.baseUrl + "?" + this.getParameters ();
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999&page_number=0";
    console.log (urlBase);
    urlArg = encodeURIComponent (urlBase);
    url = this.service.host + "/getChartData?url=" + urlArg + "&variable=" + this.values.variable.id +
      "&valueColumn=" + this.values.valueColumn.id + "&function=" + this.values.function.id;

    // don't use the xaxis parameter if the chart type is pie, donut or radar
    if (!(this.values.currentChartType.flags & ChartFlags.XYCHART))
      url += "&chartType=pie";
    else
      url += "&xaxis=" + this.values.xaxis.id;

    this.http.post (this, url, null, handlerSuccess, handlerError);
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

  handlerChartError(_this, result): void
  {
    console.log (result);
    _this.globals.popupLoading = false;
    _this.errorMessage = "Failed to generate chart";
  }
}