import { Component, Inject, NgZone, isDevMode } from '@angular/core';
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
import { DatePipe } from '@angular/common';

// AmCharts colors
const black = am4core.color ("#000000");

const raceStepInterval = 4000;

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

  ngOnDestroy(): void
  {
    if (this.chart)
    {
      this.zone.runOutsideAngular (() => {
        if (this.chart)
          this.chart.dispose ();
      });
    }
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
    let currentOptionCategories;
    let paramsGroup = [];
    let params;

    currentOptionCategories = this.data.currentOptionCategories;

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
              if (params)
              {
                if (argument.type != "singleCheckbox" && argument.type != "serviceClasses" && argument.type != "fareLower" && argument.type != "airportsRoutes" && argument.name1 != "intermediateCitiesList")
                  params += "&" + this.utils.getArguments (argument);
                else if (argument.value1 != false && argument.value1 != "" && argument.value1 != undefined && argument.value1 != null)
                  params += "&" + this.utils.getArguments (argument);
              }
              else
                params = this.utils.getArguments(argument);
            }
            else
              paramsGroup.push ({ target: argument.targetGroup, val: this.utils.getValueFormat (argument.type, argument.value1, argument) });
          }
        }        
      }
    }

    return this.utils.setTarget (paramsGroup, params);
  }

  loadChartData(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg, panelInfo;

    if (this.globals.currentApplication.name === "DataLake")
    {
      if (this.getParameters ())
        urlBase = this.data.currentOption.baseUrl + "?uName=" + this.globals.userName + "&" + this.getParameters ();
      else
        urlBase = this.data.currentOption.baseUrl + "?uName=" + this.globals.userName;
    }
    else
      urlBase = this.data.currentOption.baseUrl + "?" + this.getParameters ();

    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999&page_number=0";
    urlArg = encodeURIComponent (urlBase);

    if (isDevMode ())
      console.log (urlBase);

    url = this.service.host + "/secure/getChartData?url=" + urlArg;

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    if (this.data.chartMode === "advanced")
    {
      if (this.data.currentChartType.flags & ChartFlags.XYCHART)
        url += "&chartType=advancedbar";
      else
        url += "&chartType=simpleadvancedbar";
    }
    else
    {
      // don't use the xaxis parameter if the chart type is pie, donut or radar
      if (this.data.currentChartType.flags & ChartFlags.PIECHART || this.data.currentChartType.flags & ChartFlags.FUNNELCHART)
        url += "&chartType=pie";
      else if (this.data.currentChartType.flags & ChartFlags.BULLET)
        url += "&chartType=scatter";
      else if (this.data.currentChartType.flags & ChartFlags.MULTIRESULTS)
        url += "&chartType=barsets";
      else if (!(this.data.currentChartType.flags & ChartFlags.XYCHART))
        url += "&chartType=simplebar";
    }

    panelInfo = this.getPanelInfo ();
    this.authService.post (this, url, panelInfo, handlerSuccess, handlerError);
  }

  getPanelInfo(): any
  {
    if (this.data.chartMode === "advanced")
    {
      return {
        option: this.data.currentOption,
        advIntervalValue: this.data.intValue,
        startAtZero: null,
        limitMode: null,
        limitAmount: null,
        ordered: null,
        valueList: null,
        minValueRange: this.data.minValueRange,
        maxValueRange: this.data.maxValueRange,
        variableName: this.data.chartColumnOptions ? (this.data.variable ? this.data.variable.id : null) : null,
        valueName: this.data.chartColumnOptions ? (this.data.valueColumn ? this.data.valueColumn.id : null) : null,
        functionName: "advby" + this.data.intervalType
      };
    }
    else
    {
      return {
        option: this.data.currentOption,
        valueList: this.generateValueList (),
        minValueRange: null,
        maxValueRange: null,
        variableName: this.data.chartColumnOptions ? (this.data.variable ? this.data.variable.id : null) : null,
        xaxisName: this.data.chartColumnOptions ? (this.data.xaxis ? this.data.xaxis.id : null) : null,
        valueName: this.data.chartColumnOptions ? ((this.data.valueColumn && !this.isSimpleChart ()) ? this.data.valueColumn.id : null) : null,
        functionName: this.data.function.id,
        valueNameList: this.generateValueNameList (),
        valueListInfo: this.generateValueListInfo ()
      };
    }
  }

  generateValueList(): string
  {
    let list = "";

    if (!this.isSimpleChart () || !this.data.valueList || (this.data.valueList && !this.data.valueList.length))
      return null;

    for (let i = 0; i < this.data.valueList.length; i++)
    {
      list += this.data.valueList[i].item.id;

      if (i != this.data.valueList.length - 1)
        list += ",";
    }

    return list;
  }

  generateValueListInfo(): string
  {
    if (!this.isSimpleChart() || !this.data.valueListInfo || (this.data.valueListInfo && !this.data.valueListInfo.length) || this.isAdvChartPanel ())
      return null;

    for (let valueInfo of this.data.valueListInfo)
      valueInfo.name = undefined;

    return JSON.stringify (this.data.valueListInfo);
  }

  generateValueNameList(): string
  {
    let list = "";

    if (!this.isSimpleChart () || !this.data.valueList || (this.data.valueList && !this.data.valueList.length))
      return null;

    for (let i = 0; i < this.data.valueList.length; i++)
    {
      list += this.data.valueList[i].id;

      if (i != this.data.valueList.length - 1)
        list += ",";
    }

    return list;
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

    if (_this.data.currentChartType.flags & ChartFlags.MULTIRESULTS && data.sets.length == 0)
    {
      _this.noDataFound ();
      return;
    }

    if (!(_this.data.currentChartType.flags & ChartFlags.MULTIRESULTS) &&
      ((!(_this.data.currentChartType.flags & ChartFlags.XYCHART) && data.dataProvider == null) ||
      (_this.data.currentChartType.flags & ChartFlags.XYCHART && !data.filter)))
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

  getChartType(valueChartName: string): any
  {
    let chartName;

    if (!valueChartName)
      chartName = this.data.currentChartType.name;
    else
    {
      if (this.data.currentChartType.flags & ChartFlags.ROTATED)
      {
        valueChartName = valueChartName.split (" ")[1];

        if (valueChartName === "Lines")
          chartName = "Simple Vertical " + valueChartName;
        else
          chartName = "Simple Horizontal " + valueChartName;
      }
      else
        chartName = valueChartName;
    }

    for (let chartType of this.data.chartTypes)
    {
      if (chartName === chartType.name)
        return chartType;
    }

    if (this.data.currentChartType.flags & ChartFlags.ROTATED)
      return this.data.chartTypes[3];

    return this.data.chartTypes[2];
  }

  makeChart(chartInfo): void
  {
    let valueAxis, categoryAxis, label, animChartInterval, resultSetIndex, resultSets, nameSets, animSeries;
    let theme = this.globals.theme;
    let _this = this;

    resultSetIndex = 0;

    // functions used for the bar chart race
    function playAnimChart()
    {
      animChartInterval = setInterval (() => {
        changeResultSet ();
      }, raceStepInterval);

      changeResultSet ();
    }

    function stopAnimChart()
    {
      if (animChartInterval)
      {
        clearInterval (animChartInterval);
        animChartInterval = null;
      }
    }

    function changeResultSet()
    {
      let numNonZeroResults = 0;
      let index;

      resultSetIndex++;
      if (resultSetIndex >= resultSets.length)
        resultSetIndex = 0;

      index = resultSetIndex - 1;
      if (index == -1)
        index = resultSets.length - 1;

      for (let i = _this.chart.data.length - 1; i >= 0; i--)
      {
        let data = _this.chart.data[i];
        let name = data[_this.data.variable.id];

        for (let item of resultSets[resultSetIndex])
        {
          if (item[_this.data.variable.id] === name)
          {
            if (item[_this.data.valueColumn.id] == null)
              data[_this.data.valueColumn.id] = 0;
            else
            {
              data[_this.data.valueColumn.id] = item[_this.data.valueColumn.id];

              if (item[_this.data.valueColumn.id] != 0)
                numNonZeroResults++;
            }

            break;
          }
        }
      }

      categoryAxis.zoom ({ start: 0, end: numNonZeroResults / categoryAxis.dataItems.length });

      if (!resultSetIndex)
      {
        animSeries.interpolationDuration = raceStepInterval / 4;
        valueAxis.rangeChangeDuration = raceStepInterval / 4;
      }
      else
      {
        animSeries.interpolationDuration = raceStepInterval;
        valueAxis.rangeChangeDuration = raceStepInterval;
      }

      _this.chart.invalidateRawData ();

      if (_this.data.xaxis.item.columnType === "date")
      {
        let legendOutputFormat;

        if (_this.data.xaxis.item.outputFormat)
          legendOutputFormat = _this.data.xaxis.item.outputFormat;
        else
          legendOutputFormat = _this.data.xaxis.item.columnFormat;

        // Set predefined format if used
        if (_this.predefinedColumnFormats[legendOutputFormat])
          legendOutputFormat = this.predefinedColumnFormats[legendOutputFormat];

        label.text = new DatePipe ('en-US').transform (_this.parseDate (nameSets[index], _this.data.xaxis.item.columnFormat).toString (), legendOutputFormat);
      }
      else
        label.text = nameSets[index];
    }

    if (this.data.paletteColors && this.data.paletteColors.length)
      this.paletteColors = this.data.paletteColors;
    else
      this.paletteColors = Themes.AmCharts[theme].resultColors;

    // reset advanced chart values
    this.addUpValuesSet = false;
    this.sumValueAxis = null;
    this.sumSeriesList = [];
    this.advTableView = false;
    this.intervalTableRows = [];
    this.chartInfo = chartInfo;

    if (chartInfo.sets)
    {
      resultSets = chartInfo.sets;
      nameSets = chartInfo.names;
    }
    else
    {
      resultSets = null;
      nameSets = null;
    }

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

        if (this.data.valueColumn.item.columnType === "number")
        {
          if (this.data.valueColumn.item.outputFormat)
            chart.numberFormatter.numberFormat = this.utils.convertNumberFormat (this.data.valueColumn.item.outputFormat);
          else
            chart.numberFormatter.numberFormat = this.utils.convertNumberFormat (this.data.valueColumn.item.columnFormat);
        }
        else
          chart.numberFormatter.numberFormat = "#,###.#";

        // Set label font size
        chart.fontSize = 10;

        // Create the series
        this.data.currentChartType.createSeries (this.data, false, chart, chartInfo, null, theme, null, this.paletteColors);

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
        let valueAxes, parseDate, outputFormat, stacked, goalAxis, barChartHoverSet, numNonZeroResults;

        chart = am4core.create("msf-dashboard-child-panel-chart-display", am4charts.XYChart);
        barChartHoverSet = false;

        if (this.data.valueColumn && !this.data.valueList)
        {
          if (this.data.valueColumn.item.columnType === "number")
          {
            if (this.data.valueColumn.item.outputFormat)
              chart.numberFormatter.numberFormat = this.utils.convertNumberFormat (this.data.valueColumn.item.outputFormat);
            else
              chart.numberFormatter.numberFormat = this.utils.convertNumberFormat (this.data.valueColumn.item.columnFormat);
          }
          else
            chart.numberFormatter.numberFormat = "#,###.#";
        }
        else
          chart.numberFormatter.numberFormat = "#,###.#"; // universal number format if there are multiple values or no values set

        // Don't parse dates if the chart is a simple version
        if (this.data.currentChartType.flags & ChartFlags.XYCHART)
        {
          chart.data = JSON.parse (JSON.stringify (chartInfo.data));
          if (this.data.currentChartType.flags & ChartFlags.ADVANCED || this.data.currentChartType.flags & ChartFlags.BULLET)
            parseDate = false;
          else
            parseDate = (this.data.xaxis.item.columnType === "date") ? true : false;
        }
        else if (!(this.data.currentChartType.flags & ChartFlags.PIECHART) && !(this.data.currentChartType.flags & ChartFlags.FUNNELCHART))
        {
          if (this.data.currentChartType.flags & ChartFlags.MULTIRESULTS)
          {
            let categoryNames = [];

            chart.data = [];
            numNonZeroResults = 0;

            for (let set of chartInfo.sets)
            {
              for (let data of set)
              {
                let name = data[this.data.variable.id];

                if (categoryNames.indexOf (name) == -1)
                  categoryNames.push (name);
              }
            }

            for (let categoryName of categoryNames)
            {
              let value = {};

              value[this.data.variable.id] = categoryName;
              value[this.data.valueColumn.id] = 0;

              chart.data.push (value);
            }

            for (let data of chart.data)
            {
              let name = data[this.data.variable.id];

              for (let item of chartInfo.sets[0])
              {
                if (item[this.data.variable.id] === name)
                {
                  if (item[this.data.valueColumn.id] == null)
                    data[this.data.valueColumn.id] = 0;
                  else
                  {
                    data[this.data.valueColumn.id] = item[this.data.valueColumn.id];

                    if (item[this.data.valueColumn.id] != 0)
                      numNonZeroResults++;
                  }
                }
              }
            }
          }
          else
            chart.data = JSON.parse (JSON.stringify (chartInfo.dataProvider));

          if (this.data.currentChartType.flags & ChartFlags.ADVANCED || this.data.currentChartType.flags & ChartFlags.BULLET || this.data.currentChartType.flags & ChartFlags.MULTIRESULTS)
            parseDate = false;
          else
            parseDate = (this.data.variable.item.columnType === "date") ? true : false;
        }

        if (parseDate)
        {
          if (this.data.currentChartType.flags & ChartFlags.XYCHART)
          {
            if (this.data.xaxis.item.columnFormat)
            {
              for (let data of chart.data)
                data[this.data.xaxis.id] = this.parseDate (data[this.data.xaxis.id], this.data.xaxis.item.columnFormat);

              if (this.data.xaxis.item.outputFormat)
                outputFormat = this.data.xaxis.item.outputFormat;
              else
                outputFormat = this.data.xaxis.item.columnFormat;

              // Set predefined format if used
              if (this.predefinedColumnFormats[outputFormat])
                outputFormat = this.predefinedColumnFormats[outputFormat];
            }
            else
              parseDate = false;
          }
          else if (!(this.data.currentChartType.flags & ChartFlags.PIECHART) && !(this.data.currentChartType.flags & ChartFlags.FUNNELCHART))
          {
            if (this.data.variable.item.columnFormat)
            {
              for (let data of chart.data)
                data[this.data.variable.id] = this.parseDate (data[this.data.variable.id], this.data.variable.item.columnFormat);

              if (this.data.variable.item.outputFormat)
                outputFormat = this.data.variable.item.outputFormat;
              else
                outputFormat = this.data.variable.item.columnFormat;

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

        valueAxes = [];

        if (this.isSimpleChart () && this.data.valueListInfo.length > 1 && this.data.chartMode !== "advanced")
        {
          for (let i = 0; i < this.data.valueListInfo.length; i++)
          {
            let valueAxis;

            if (!this.data.valueListInfo[i].axis)
              continue;

            if (this.data.currentChartType.flags & ChartFlags.ROTATED)
            {
              valueAxis = chart.xAxes.push (new am4charts.ValueAxis ());

              if (chart.xAxes.indexOf (valueAxis) != 0)
              {
                valueAxis.syncWithAxis = chart.xAxes.getIndex (0);
                valueAxis.renderer.opposite = true;
              }
            }
            else
            {
              valueAxis = chart.yAxes.push (new am4charts.ValueAxis ());

              if (chart.yAxes.indexOf (valueAxis) != 0)
              {
                valueAxis.syncWithAxis = chart.yAxes.getIndex (0);
                valueAxis.renderer.opposite = true;
              }
            }

            if (!this.data.valueListInfo[i].axisName && !(this.data.valueListInfo[i].axisName && this.data.valueListInfo[i] != ""))
              valueAxis.title.text = this.data.valueList[i].name;
            else
              valueAxis.title.text = this.data.valueListInfo[i].axisName;

            valueAxis.title.fill = am4core.color (this.paletteColors[i]);

            if (this.data.startAtZero)
              valueAxis.min = 0;

            valueAxis.renderer.labels.template.fontSize = 10;
            valueAxis.renderer.labels.template.fill = Themes.AmCharts[theme].fontColor;
            valueAxis.renderer.grid.template.strokeOpacity = 1;
            valueAxis.renderer.grid.template.stroke = Themes.AmCharts[theme].stroke;
            valueAxis.renderer.grid.template.strokeWidth = 1;

            valueAxis.renderer.line.strokeOpacity = 1;
            valueAxis.renderer.line.strokeWidth = 2;
            valueAxis.renderer.line.stroke = am4core.color (this.paletteColors[i]);
            valueAxis.renderer.labels.template.fill = am4core.color (this.paletteColors[i]);

            valueAxis.tooltip.label.fill = Themes.AmCharts[theme].axisTooltipFontColor;
            valueAxis.tooltip.background.fill = Themes.AmCharts[theme].tooltipFill;

            valueAxes.push ({
              item: valueAxis,
              name: this.data.valueList[i].id
            });
          }

          if (valueAxes.length == 1)
          {
            if (this.data.currentChartType.flags & ChartFlags.ROTATED)
              chart.xAxes.removeIndex (0);
            else
              chart.yAxes.removeIndex (0);

            valueAxes = [];
          }
        }

        // Set chart axes depeding on the rotation
        if (this.data.currentChartType.flags & ChartFlags.ROTATED)
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
            if (this.data.currentChartType.flags & ChartFlags.BULLET)
            {
              categoryAxis = chart.yAxes.push (new am4charts.ValueAxis ());

              if (this.data.startAtZero)
                categoryAxis.min = 0;
            }
            else
            {
              categoryAxis = chart.yAxes.push (new am4charts.CategoryAxis ());
              categoryAxis.renderer.minGridDistance = 15;
              categoryAxis.renderer.labels.template.maxWidth = 240;
            }
          }

          if (!(this.isSimpleChart () && valueAxes.length > 1))
          {
            valueAxis = chart.xAxes.push (new am4charts.ValueAxis ());

            if (this.data.startAtZero)
              valueAxis.min = 0;

            if (this.data.currentChartType.flags & ChartFlags.MULTIRESULTS)
            {
              valueAxis.rangeChangeEasing = am4core.ease.linear;
              valueAxis.rangeChangeDuration = raceStepInterval;
              valueAxis.extraMax = 0.1;
            }
          }

          // Add scrollbar into the chart for zooming if there are multiple series
          if (!(this.data.currentChartType.flags & ChartFlags.MULTIRESULTS) && chart.data.length > 1)
          {
            if (this.data.currentChartType.flags & ChartFlags.BULLET)
            {
              chart.scrollbarX = new am4core.Scrollbar ();
              chart.scrollbarX.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
              chart.scrollbarY = new am4core.Scrollbar ();
              chart.scrollbarY.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
            }
            else
            {
              chart.scrollbarY = new am4core.Scrollbar ();
              chart.scrollbarY.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
            }
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
            if (this.data.currentChartType.flags & ChartFlags.BULLET)
            {
              categoryAxis = chart.xAxes.push (new am4charts.ValueAxis ());

              if (this.data.startAtZero)
                categoryAxis.min = 0;
            }
            else
            {
              categoryAxis = chart.xAxes.push (new am4charts.CategoryAxis ());
              categoryAxis.renderer.minGridDistance = 30;
            }
          }

          if (!(this.data.currentChartType.flags & ChartFlags.LINECHART && parseDate) && !(this.data.currentChartType.flags & ChartFlags.BULLET))
          {
            // Rotate labels if the chart is displayed vertically
            categoryAxis.renderer.labels.template.rotation = 330;
            categoryAxis.renderer.labels.template.maxWidth = 240;
          }

          if (!(this.isSimpleChart () && valueAxes.length > 1))
          {
            valueAxis = chart.yAxes.push (new am4charts.ValueAxis ());

            if (this.data.startAtZero)
              valueAxis.min = 0;

            if (this.data.currentChartType.flags & ChartFlags.MULTIRESULTS)
            {
              valueAxis.rangeChangeEasing = am4core.ease.linear;
              valueAxis.rangeChangeDuration = raceStepInterval;
              valueAxis.extraMax = 0.1;
            }
          }

          if (!(this.data.currentChartType.flags & ChartFlags.MULTIRESULTS) && chart.data.length > 1)
          {
            if (this.data.currentChartType.flags & ChartFlags.BULLET)
            {
              chart.scrollbarX = new am4core.Scrollbar ();
              chart.scrollbarX.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
              chart.scrollbarY = new am4core.Scrollbar ();
              chart.scrollbarY.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
            }
            else
            {
              chart.scrollbarX = new am4core.Scrollbar ();
              chart.scrollbarX.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
            }
          }
        }

        // Set category axis properties
        if (this.data.currentChartType.flags & ChartFlags.BULLET)
        {
          categoryAxis.renderer.labels.template.fontSize = 10;
          categoryAxis.renderer.labels.template.fill = Themes.AmCharts[theme].fontColor;
          categoryAxis.renderer.grid.template.strokeOpacity = 1;
          categoryAxis.renderer.grid.template.stroke = Themes.AmCharts[theme].stroke;
          categoryAxis.renderer.grid.template.strokeWidth = 1;
        }
        else
        {
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
        }

        // Set axis tooltip background color depending of the theme
        categoryAxis.tooltip.label.fill = Themes.AmCharts[theme].axisTooltipFontColor;
        categoryAxis.tooltip.background.fill = Themes.AmCharts[theme].tooltipFill;

        if (!(this.isSimpleChart () && valueAxes.length > 1))
        {
          // Set value axis properties
          valueAxis.renderer.labels.template.fontSize = 10;
          valueAxis.renderer.labels.template.fill = Themes.AmCharts[theme].fontColor;
          valueAxis.renderer.grid.template.strokeOpacity = 1;
          valueAxis.renderer.grid.template.stroke = Themes.AmCharts[theme].stroke;
          valueAxis.renderer.grid.template.strokeWidth = 1;

          valueAxis.tooltip.label.fill = Themes.AmCharts[theme].axisTooltipFontColor;
          valueAxis.tooltip.background.fill = Themes.AmCharts[theme].tooltipFill;
        }

        if (this.data.currentChartType.flags & ChartFlags.MULTIRESULTS)
        {
          categoryAxis.zoom ({ start: 0, end: numNonZeroResults / chart.data.length });
          chart.zoomOutButton.disabled = true;
        }

        if (this.data.currentChartType.flags & ChartFlags.XYCHART || this.data.currentChartType.flags & ChartFlags.MULTIRESULTS)
        {
          // Set axis name into the chart
          if (this.data.chartMode === "advanced")
          {
            if (!(this.data.currentChartType.flags & ChartFlags.ROTATED))
            {
              if (this.data.horizAxisName && this.data.horizAxisName != "")
                categoryAxis.title.text = this.data.horizAxisName;
              else
                categoryAxis.title.text = "Intervals";

              if (!(this.isSimpleChart () && valueAxes.length > 1))
              {
                if (this.data.vertAxisName && this.data.vertAxisName != "")
                  valueAxis.title.text = this.data.vertAxisName;
                else
                {
                  if (this.data.valueColumn)
                    valueAxis.title.text = this.data.valueColumn.name;
                  else
                    valueAxis.title.text = "Count";
                }
              }
            }
            else
            {
              if (this.data.vertAxisName && this.data.vertAxisName != "")
                categoryAxis.title.text = this.data.vertAxisName;
              else
                categoryAxis.title.text = "Intervals";

              if (!(this.isSimpleChart () && valueAxes.length > 1))
              {
                if (this.data.horizAxisName && this.data.horizAxisName != "")
                  valueAxis.title.text = this.data.horizAxisName;
                else
                {
                  if (this.data.valueColumn)
                    valueAxis.title.text = this.data.valueColumn.name;
                  else
                    valueAxis.title.text = "Count";
                }
              }
            }

            categoryAxis.dataFields.category = "Interval";
          }
          else
          {
            // Set axis name into the chart
            if (this.data.currentChartType.flags & ChartFlags.MULTIRESULTS)
            {
              if (!(this.data.currentChartType.flags & ChartFlags.ROTATED))
              {
                if (this.data.horizAxisName && this.data.horizAxisName != "")
                  categoryAxis.title.text = this.data.horizAxisName;
                else
                  categoryAxis.title.text = this.data.variable.name;

                if (this.data.vertAxisName && this.data.vertAxisName != "")
                  valueAxis.title.text = this.data.vertAxisName;
                else
                  valueAxis.title.text = this.data.valueColumn.name;
              }
              else
              {
                if (this.data.vertAxisName && this.data.vertAxisName != "")
                  categoryAxis.title.text = this.data.vertAxisName;
                else
                  categoryAxis.title.text = this.data.variable.name;

                if (this.data.horizAxisName && this.data.horizAxisName != "")
                  valueAxis.title.text = this.data.horizAxisName;
                else
                 valueAxis.title.text = this.data.valueColumn.name;
              }

              categoryAxis.dataFields.category = this.data.variable.id;
            }
            else
            {
              if (!(this.data.currentChartType.flags & ChartFlags.ROTATED))
              {
                if (this.data.horizAxisName && this.data.horizAxisName != "")
                  categoryAxis.title.text = this.data.horizAxisName;
                else
                  categoryAxis.title.text = this.data.xaxis.name;

                if (!(this.isSimpleChart () && valueAxes.length > 1))
                {
                  if (this.data.vertAxisName && this.data.vertAxisName != "")
                    valueAxis.title.text = this.data.vertAxisName;
                  else
                  {
                    if (this.data.valueColumn)
                      valueAxis.title.text = this.data.valueColumn.name;
                    else
                      valueAxis.title.text = "Count";
                  }
                }
              }
              else
              {
                if (this.data.vertAxisName && this.data.vertAxisName != "")
                  categoryAxis.title.text = this.data.vertAxisName;
                else
                  categoryAxis.title.text = this.data.xaxis.name;

                if (!(this.isSimpleChart () && valueAxes.length > 1))
                {
                  if (this.data.horizAxisName && this.data.horizAxisName != "")
                    valueAxis.title.text = this.data.horizAxisName;
                  else
                  {
                    if (this.data.valueColumn)
                      valueAxis.title.text = this.data.valueColumn.name;
                    else
                      valueAxis.title.text = "Count";
                  }
                }
              }

              // The category will be the x axis if the chart type has it
              categoryAxis.dataFields.category = this.data.xaxis.id;
            }
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

          if (this.data.ordered && this.data.chartMode !== "advanced" && !(this.data.currentChartType.flags & ChartFlags.BULLET) && !(this.data.currentChartType.flags & ChartFlags.MULTIRESULTS))
          {
            // Sort chart series from least to greatest by calculating the
            // total value of each key item to compensate for the lack of proper
            // sorting by values
            if (parseDate && this.data.currentChartType.flags & ChartFlags.LINECHART)
            {
              // Sort by date the to get the correct order on the line chart
              // if the category axis is a date type
              let axisField = this.data.xaxis.id;
  
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

          if (chartInfo.filter)
          {
            for (let object of chartInfo.filter)
            {
              if (this.data.variable.item.columnType === "date")
              {
                let date = this.parseDate (object.valueAxis, this.data.variable.item.columnFormat);
                let legendOutputFormat;

                if (this.data.variable.item.outputFormat)
                  legendOutputFormat = this.data.variable.item.outputFormat;
                else
                  legendOutputFormat = this.data.variable.item.columnFormat;

                // Set predefined format if used
                if (this.predefinedColumnFormats[legendOutputFormat])
                  legendOutputFormat = this.predefinedColumnFormats[legendOutputFormat];

                object.valueAxis = new DatePipe ('en-US').transform (date.toString (), legendOutputFormat);
              }

              this.data.currentChartType.createSeries (this.data, stacked, chart, object, parseDate, theme, outputFormat, this.paletteColors);
            }
          }
          else
          {
            let curValue = null;
            let series;

            for (let item of this.data.chartColumnOptions)
            {
              if (item.id === chartInfo.valueField)
              {
                curValue = item;
                break;
              }
            }

            series = this.data.currentChartType.createSeries (this.data, curValue, chart, chartInfo, parseDate, 0, outputFormat, this.paletteColors);

            if (this.data.currentChartType.flags & ChartFlags.MULTIRESULTS)
            {
              categoryAxis.sortBySeries = series;

              if (this.data.currentChartType.flags & ChartFlags.ROTATED)
                categoryAxis.renderer.inversed = true;

              animSeries = series;
            }
          }
        }
        else
        {
          if (this.data.chartMode === "advanced")
          {
            if (!(this.data.currentChartType.flags & ChartFlags.ROTATED))
            {
              if (this.data.horizAxisName && this.data.horizAxisName != "")
                categoryAxis.title.text = this.data.horizAxisName;
              else
                categoryAxis.title.text = "Intervals";

              if (!(this.isSimpleChart() && valueAxes.length > 1))
              {
                if (this.data.vertAxisName && this.data.vertAxisName != "")
                  valueAxis.title.text = this.data.vertAxisName;
                else
                {
                  if (this.data.valueColumn)
                    valueAxis.title.text = this.data.valueColumn.name;
                  else
                    valueAxis.title.text = "Count";
                }
              }
            }
            else
            {
              if (this.data.vertAxisName && this.data.vertAxisName != "")
                categoryAxis.title.text = this.data.vertAxisName;
              else
                categoryAxis.title.text = "Intervals";

              if (!(this.isSimpleChart () && valueAxes.length > 1))
              {
                if (this.data.horizAxisName && this.data.horizAxisName != "")
                  valueAxis.title.text = this.data.horizAxisName;
                else
                {
                  if (this.data.valueColumn)
                    valueAxis.title.text = this.data.valueColumn.name;
                  else
                    valueAxis.title.text = "Count";
                }
              }
            }
          }
          else
          {
            if (!(this.data.currentChartType.flags & ChartFlags.ROTATED))
            {
              if (this.data.horizAxisName && this.data.horizAxisName != "")
                categoryAxis.title.text = this.data.horizAxisName;
              else
                categoryAxis.title.text = this.data.variable.name;

              if (!(this.isSimpleChart () && valueAxes.length > 1))
              {
                if (this.data.vertAxisName && this.data.vertAxisName != "")
                  valueAxis.title.text = this.data.vertAxisName;
                else
                {
                  if (this.data.valueList && this.data.valueList.length == 1)
                    valueAxis.title.text = this.data.valueList[0].name;
                  else if (this.data.valueColumn && !this.data.valueList)
                    valueAxis.title.text = this.data.valueColumn.name;
                  else
                    valueAxis.title.text = this.data.function.name;
                }
              }
            }
            else
            {
              if (this.data.vertAxisName && this.data.vertAxisName != "")
                categoryAxis.title.text = this.data.vertAxisName;
              else
                categoryAxis.title.text = this.data.variable.name;

              if (!(this.isSimpleChart () && valueAxes.length > 1))
              {
                if (this.data.horizAxisName && this.data.horizAxisName != "")
                  valueAxis.title.text = this.data.horizAxisName;
                else
                {
                  if (this.data.valueList && this.data.valueList.length == 1)
                    valueAxis.title.text = this.data.valueList[0].name;
                  else if (this.data.valueColumn && !this.data.valueList)
                    valueAxis.title.text = this.data.valueColumn.name;
                  else
                    valueAxis.title.text = this.data.function.name;
                }
              }
            }

            if (this.data.ordered && this.data.chartMode !== "advanced" && !(this.data.currentChartType.flags & ChartFlags.BULLET) && !(this.data.currentChartType.flags & ChartFlags.MULTIRESULTS))
            {
              if (this.data.valueList && this.data.valueList.length > 1)
              {
                for (let data of chart.data)
                {
                  let average = 0;

                  for (let object of chartInfo.valueFields)
                  {
                    let value = data[object];
  
                    if (value != null)
                      average += value;
                  }

                  data["avg"] = average / chartInfo.valueFields.length;
                }
  
                if (parseDate)
                {
                  let axisField = this.data.variable.id;

                  // reverse order for rotated charts
                  if (this.data.currentChartType.flags & ChartFlags.ROTATED)
                    categoryAxis.renderer.inversed = true;

                  chart.events.on ("beforedatavalidated", function (event) {
                    chart.data.sort (function (e1, e2) {
                      return +(new Date(e1[axisField])) - +(new Date(e2[axisField]));
                    });
                  });
                }
                else
                {
                  chart.events.on ("beforedatavalidated", function(event) {
                    chart.data.sort (function(e1, e2) {
                      return e1["avg"] - e2["avg"];
                    });
                  });
                }
              }
              else
              {
                if (parseDate)
                {
                  let axisField = this.data.variable.id;

                  // reverse order for rotated charts
                  if (this.data.currentChartType.flags & ChartFlags.ROTATED)
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
            }
          }

          // The category will use the values if the chart type lacks an x axis
          categoryAxis.dataFields.category = chartInfo.titleField;

          // Create the series
          if (this.data.valueList && this.data.valueList.length > 1 && !(this.data.currentChartType.flags & ChartFlags.MULTIRESULTS))
          {
            let series;

            for (let i = 0; i < chartInfo.valueFields.length; i++)
            {
              let prevChartType = this.data.currentChartType;
              let curValue = chartInfo.valueFields[i];

              if (i != 0)
                this.data.currentChartType = this.getChartType (this.data.valueListInfo[i].chartType);

              // Get value name for the legend
              for (let item of this.data.chartColumnOptions)
              {
                if (item.id === chartInfo.valueFields[i])
                {
                  curValue = item;
                  break;
                }
              }

              if (this.isSimpleChart () && this.data.currentChartType.flags & ChartFlags.LINECHART)
              {
                // set line color depending of the threshold
                for (let data of chart.data)
                {
                  let lineColor = am4core.color (this.paletteColors[i]);
                  let value = data[chartInfo.valueFields[i]];

                  for (let threshold of this.data.thresholds)
                  {
                    if (curValue.item.id == threshold.column && value >= threshold.min && value <= threshold.max)
                    {
                      lineColor = am4core.color (threshold.color);
                      break;
                    }
                  }

                  data["lineColor" + chartInfo.valueFields[i]] = lineColor;
                }
              }

              series = this.data.currentChartType.createSeries (this.data, curValue, chart, chartInfo, parseDate, i, outputFormat, this.paletteColors);

              if (this.data.chartMode !== "advanced")
              {
                if (this.data.valueListInfo.length > 1 && this.data.valueListInfo[i].axis)
                {
                  let found = false;

                  for (let valueAxis of valueAxes)
                  {
                    if (valueAxis.name === this.data.valueList[i].id)
                    {
                      if (this.data.currentChartType.flags & ChartFlags.ROTATED)
                        series.xAxis = valueAxis.item;
                      else
                        series.yAxis = valueAxis.item;

                      found = true;
                      break;
                    }
                  }

                  if (!found)
                  {
                    if (this.data.currentChartType.flags & ChartFlags.ROTATED)
                    {
                      if (!series.xAxis)
                        series.xAxis = valueAxis[0].item;
                    }
                    else
                    {
                      if (!series.yAxis)
                        series.yAxis = valueAxis[0].item;
                    }
                  }
                }
              }

              if (!chart.cursor)
              {
                chart.cursor = new am4charts.XYCursor ();

                if (this.data.currentChartType.flags & ChartFlags.ROTATED)
                  chart.cursor.lineX.zIndex = 2;
                else
                  chart.cursor.lineY.zIndex = 2;
              }

              if (!(this.data.currentChartType.flags & ChartFlags.LINECHART) && !barChartHoverSet)
              {
                if (this.data.currentChartType.flags & ChartFlags.ROTATED)
                {
                  chart.cursor.fullWidthLineY = true;
                  chart.cursor.yAxis = categoryAxis;
                  chart.cursor.lineX.disabled = true;
                  chart.cursor.lineX.zIndex = 1;
                  chart.cursor.lineY.strokeOpacity = 0;
                  chart.cursor.lineY.fill = black;
                  chart.cursor.lineY.fillOpacity = Themes.AmCharts[theme].barHoverOpacity;
                }
                else
                {
                  chart.cursor.fullWidthLineX = true;
                  chart.cursor.xAxis = categoryAxis;
                  chart.cursor.lineY.disabled = true;
                  chart.cursor.lineY.zIndex = 1;
                  chart.cursor.lineX.strokeOpacity = 0;
                  chart.cursor.lineX.fill = black;
                  chart.cursor.lineX.fillOpacity = Themes.AmCharts[theme].barHoverOpacity;
                }

                barChartHoverSet = true;
              }

              if (this.data.currentChartType.flags & ChartFlags.LINECHART && barChartHoverSet)
              {
                if (this.data.currentChartType.flags & ChartFlags.ROTATED)
                  chart.cursor.lineX.disabled = false;
                else
                  chart.cursor.lineY.disabled = false;
              }

              this.data.currentChartType = prevChartType;
            }
          }
          else
          {
            let curValue = null;

            for (let item of this.data.chartColumnOptions)
            {
              if (item.id === chartInfo.valueField)
              {
                curValue = item;
                break;
              }
            }

            if (this.isSimpleChart () && this.data.currentChartType.flags & ChartFlags.LINECHART)
            {
              // set line color depending of the threshold
              for (let data of chart.data)
              {
                let lineColor = am4core.color (this.paletteColors[0]);
                let value = data[chartInfo.valueField];

                for (let threshold of this.data.thresholds)
                {
                  if (curValue && curValue.item.id == threshold.column && value >= threshold.min && value <= threshold.max)
                  {
                    lineColor = am4core.color (threshold.color);
                    break;
                  }
                }

                data["lineColor" + chartInfo.valueField] = lineColor;
              }
            }

            this.data.currentChartType.createSeries (this.data, curValue, chart, chartInfo, parseDate, 0, outputFormat, this.paletteColors);
          }
        }

        if ((this.data.currentChartType.flags & ChartFlags.LINECHART || this.data.currentChartType.flags & ChartFlags.BULLET) && !chart.cursor)
        {
          chart.cursor = new am4charts.XYCursor ();

          if (this.data.currentChartType.flags & ChartFlags.BULLET)
          {
            chart.cursor.lineX.zIndex = 2;
            chart.cursor.lineY.zIndex = 2;
            chart.cursor.behavior = "zoomXY";
          }
          else
          {
            if (this.data.currentChartType.flags & ChartFlags.ROTATED)
              chart.cursor.lineX.zIndex = 2;
            else
              chart.cursor.lineY.zIndex = 2;
          }
        }

        if (chart.cursor)
        {
          if (!(this.data.currentChartType.flags & ChartFlags.LINECHART) && !(this.data.currentChartType.flags & ChartFlags.BULLET) && !barChartHoverSet)
          {
            if (this.data.currentChartType.flags & ChartFlags.ROTATED)
            {
              chart.cursor.fullWidthLineY = true;
              chart.cursor.yAxis = categoryAxis;
              chart.cursor.lineX.disabled = true;
              chart.cursor.lineY.strokeOpacity = 0;
              chart.cursor.lineY.fill = black;
              chart.cursor.lineY.fillOpacity = Themes.AmCharts[theme].barHoverOpacity;
            }
            else
            {
              chart.cursor.fullWidthLineX = true;
              chart.cursor.xAxis = categoryAxis;
              chart.cursor.lineY.disabled = true;
              chart.cursor.lineX.strokeOpacity = 0;
              chart.cursor.lineX.fill = black;
              chart.cursor.lineX.fillOpacity = Themes.AmCharts[theme].barHoverOpacity;
            }

            barChartHoverSet = true;
          }

          if (this.data.currentChartType.flags & ChartFlags.LINECHART && barChartHoverSet)
          {
             if (this.data.currentChartType.flags & ChartFlags.ROTATED)
              chart.cursor.lineX.disabled = false;
            else
              chart.cursor.lineY.disabled = false;
          }
        }

        // Create axis ranges if available
        if (!(this.isSimpleChart() && valueAxes.length > 1))
          goalAxis = valueAxis;
        else
          goalAxis = valueAxes[0].item;

        // Create axis ranges if available
        if (this.data.goals && this.data.goals.length)
        {
          for (let goal of this.data.goals)
          {
            let range = goalAxis.axisRanges.create ();

            range.value = goal.value;
            range.grid.stroke = am4core.color(goal.color);
            range.grid.strokeWidth = 2;
            range.grid.strokeOpacity = 1;
            range.grid.above = true;
            range.label.inside = true;
            range.label.text = goal.name;
            range.label.fill = range.grid.stroke;
            range.label.verticalCenter = "bottom";
          }
        }

        // Add play button for the bar chart race
        if (this.data.currentChartType.flags & ChartFlags.MULTIRESULTS)
        {
          let playButton = chart.plotContainer.createChild(am4core.PlayButton);

          playButton.x = am4core.percent (97);
          label = chart.plotContainer.createChild (am4core.Label);
          label.x = am4core.percent (97);

          if (this.data.currentChartType.flags & ChartFlags.ROTATED)
          {
            playButton.y = am4core.percent (95);
            label.y = am4core.percent (95);
          }
          else
          {
            playButton.y = am4core.percent (5);
            label.y = am4core.percent (5);
          }

          playButton.dy = -2;
          playButton.verticalCenter = "middle";
          playButton.fill = Themes.AmCharts[theme].playButtonColor;
          playButton.events.on ("toggled", function (event) {
            if (event.target.isActive)
              playAnimChart ();
            else
              stopAnimChart ();
          });

          label.horizontalCenter = "right";
          label.verticalCenter = "middle";
          label.dx = -15;
          label.fontSize = 50;
          label.fill = Themes.AmCharts[theme].fontColor;

          if (this.data.xaxis.item.columnType === "date")
          {
            let legendOutputFormat;

            if (this.data.xaxis.item.outputFormat)
              legendOutputFormat = this.data.xaxis.item.outputFormat;
            else
              legendOutputFormat = this.data.xaxis.item.columnFormat;

            // Set predefined format if used
            if (this.predefinedColumnFormats[legendOutputFormat])
              legendOutputFormat = this.predefinedColumnFormats[legendOutputFormat];

            label.text = new DatePipe ('en-US').transform (this.parseDate (chartInfo.names[0], this.data.xaxis.item.columnFormat).toString (), legendOutputFormat);
          }
          else
            label.text = chartInfo.names[0];
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

      if (this.data.currentChartType.flags & ChartFlags.XYCHART && !(this.data.currentChartType.flags & ChartFlags.BULLET)
        || (this.isSimpleChart () && this.data.valueList && this.data.valueList.length > 1))
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

            sum += item[this.data.valueColumn.id];

            this.intervalTableRows.push ({
              key: null,
              Interval: label,
              value: item[this.data.valueColumn.id],
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
          sumSeries.fill = am4core.color (this.paletteColors[index]);
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
        sumSeries.fill = am4core.color (this.paletteColors[0]);
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

  isSimpleChart(): boolean
  {
    return !(this.data.currentChartType.flags & ChartFlags.XYCHART)
      && !(this.data.currentChartType.flags & ChartFlags.ADVANCED)
      && !(this.data.currentChartType.flags & ChartFlags.PIECHART)
      && !(this.data.currentChartType.flags & ChartFlags.FUNNELCHART)
      && !(this.data.currentChartType.flags & ChartFlags.MULTIRESULTS);
  }
}
