import { Component, Inject, ViewChild, ChangeDetectorRef, isDevMode } from '@angular/core';
import { MatDialogRef, MatStepper, MAT_DIALOG_DATA, MatTabGroup, MatDialog } from '@angular/material';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

import { ApplicationService } from '../services/application.service';
import { CategoryArguments } from '../model/CategoryArguments';
import { MsfTableComponent } from '../msf-table/msf-table.component';
import { AuthService } from '../services/auth.service';
import { Arguments } from '../model/Arguments';
import { Utils } from '../commons/utils';
import { Globals } from '../globals/Globals';
import { ComponentType } from '../commons/ComponentType';
import { ChartFlags } from '../msf-dashboard-panel/msf-dashboard-chartflags';
import { MsfChartPreviewComponent } from '../msf-chart-preview/msf-chart-preview.component';
import { Themes } from '../globals/Themes';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-msf-dashboard-assistant',
  templateUrl: './msf-dashboard-assistant.component.html'
})
export class MsfDashboardAssistantComponent {
  utils: Utils;
  isLoading: boolean;

  chartTypes: any[] = [
    { name: 'Bars', flags: ChartFlags.XYCHART, image: 'vert-bar-chart.png', createSeries: this.createVertColumnSeries, allowedInAdvancedMode: true },
    { name: 'Horizontal Bars', flags: ChartFlags.XYCHART | ChartFlags.ROTATED, image: 'horiz-bar-chart.png', createSeries: this.createHorizColumnSeries, allowedInAdvancedMode: true },
    { name: 'Simple Bars', flags: ChartFlags.NONE, image: 'simple-vert-bar-chart.png', createSeries: this.createSimpleVertColumnSeries, allowedInAdvancedMode: true },
    { name: 'Simple Horizontal Bars', flags: ChartFlags.ROTATED, image: 'simple-horiz-bar-chart.png', createSeries: this.createSimpleHorizColumnSeries, allowedInAdvancedMode: true },
    { name: 'Stacked Bars', flags: ChartFlags.XYCHART | ChartFlags.STACKED, image: 'stacked-vert-column-chart.png', createSeries: this.createVertColumnSeries, allowedInAdvancedMode: true },
    { name: 'Horizontal Stacked Bars', flags: ChartFlags.XYCHART | ChartFlags.ROTATED | ChartFlags.STACKED, image: 'stacked-horiz-column-chart.png', createSeries: this.createHorizColumnSeries, allowedInAdvancedMode: true },
    { name: 'Funnel', flags: ChartFlags.FUNNELCHART, image: 'funnel-chart.png', createSeries: this.createFunnelSeries, allowedInAdvancedMode: false },
    { name: 'Lines', flags: ChartFlags.XYCHART | ChartFlags.LINECHART, image: 'normal-line-chart.png', createSeries: this.createLineSeries, allowedInAdvancedMode: true },
    { name: 'Simple Lines', flags: ChartFlags.LINECHART, image: 'line-chart.png', createSeries: this.createSimpleLineSeries, allowedInAdvancedMode: true },
    { name: 'Scatter', flags: ChartFlags.XYCHART | ChartFlags.LINECHART | ChartFlags.BULLET, image: 'scatter-chart.png', createSeries: this.createLineSeries, allowedInAdvancedMode: true },
    { name: 'Simple Scatter', flags: ChartFlags.LINECHART | ChartFlags.BULLET, image: 'simple-scatter-chart.png', createSeries: this.createLineSeries, allowedInAdvancedMode: true },
    { name: 'Area', flags: ChartFlags.XYCHART | ChartFlags.AREACHART, image: 'area-chart.png', createSeries: this.createLineSeries, allowedInAdvancedMode: false },
    { name: 'Stacked Area', flags: ChartFlags.XYCHART | ChartFlags.STACKED | ChartFlags.AREACHART, image: 'stacked-area-chart.png', createSeries: this.createLineSeries, allowedInAdvancedMode: false },
    { name: 'Pie', flags: ChartFlags.PIECHART, image: 'pie-chart.png', createSeries: this.createPieSeries, allowedInAdvancedMode: false },
    { name: 'Donut', flags: ChartFlags.DONUTCHART, image: 'donut-chart.png', createSeries: this.createPieSeries, allowedInAdvancedMode: false },
  ];

  chartMode: string = "basic";

  selectedChartType: any = this.chartTypes[0];
  analysisSelected: any = null;
  selectingAnalysis: boolean = false;
  xAxisSelected: any = null;
  selectingXAxis: boolean = false;
  valueSelected: any = null;
  selectingValue: boolean = false;
  chartPreviewHover: boolean = false;
  aggregationValueSelected: any = null;
  selectingAggregationValue: boolean = false;
  function: any;
  intervalType: string = "ncile";
  ncile: number = 5;
  intValue: string;
  lastColumn: any;

  currentOption: any;
  currentOptionCategories: any[];
  chartColumnOptions: any[];
  tempOptionCategories: any[];

  actualPageNumber: number;
  moreResults: boolean = false;
  moreResultsBtn: boolean = false;
  displayedColumns;

  tablePreview: boolean = true;
  selectDataPreview: boolean = false;

  @ViewChild('msfTableRef')
  msfTableRef: MsfTableComponent;

  @ViewChild("tabs")
  tabs: MatTabGroup;

  configuredControlVariables: boolean = false;
  startAtZero: boolean = false;
  ordered: boolean = true;

  constructor(public dialogRef: MatDialogRef<MsfDashboardAssistantComponent>,
    public globals: Globals,
    private service: ApplicationService,
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.utils = new Utils ();

    this.isLoading = true;
    this.currentOption = data.currentOption;
    this.currentOptionCategories = data.currentOptionCategories;
    this.chartColumnOptions = data.chartColumnOptions;
    this.function = data.functions[0];
    this.selectDataPreview = data.selectDataPreview;

    this.configureControlVariables ();
  }

  ngAfterViewInit(): void
  {
    this.msfTableRef.tableOptions = this;

    if (!this.currentOptionCategories)
      this.service.loadOptionCategoryArguments (this, this.currentOption.id, this.setCategories, this.handlerError);
    else
      this.loadTableData (false, this.msfTableRef.handlerSuccess, this.msfTableRef.handlerError);

    this.changeDetectorRef.detectChanges ();
  }

  closeWindow(): void
  {
    this.dialogRef.close ();
  }

  checkVisibility(): string
  {
    if (this.isLoading)
      return "none";

    return "block";
  }

  checkStep1Visibility(stepper: MatStepper): string
  {
    if (!stepper.selectedIndex)
      return "block";

    return "none";
  }

  checkAssistantVisibility(): string
  {
    if (this.selectDataPreview)
      return "none";

    return "block";
  }

  goBack(stepper: MatStepper): void
  {
    stepper.previous ();
  }

  goForward(stepper: MatStepper): void
  {
    stepper.next ();
  }

  isArray(item): boolean
  {
    return Array.isArray (item);
  }

  getParameters()
  {
    let currentOptionCategories = this.currentOptionCategories;
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

  loadTableData(moreResults, handlerSuccess, handlerError): void
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

    this.isLoading = true;
    if (this.globals.currentApplication.name === "DataLake")
    {
      if (this.getParameters ())
        urlBase = this.currentOption.baseUrl + "?uName=" + this.globals.userName + "&" + this.getParameters ();
      else
        urlBase = this.currentOption.baseUrl + "?uName=" + this.globals.userName;
    }
    else
      urlBase = this.currentOption.baseUrl + "?" + this.getParameters ();

    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&&pageSize=100&page_number=" + this.actualPageNumber;
    urlArg = encodeURIComponent (urlBase);
    url = this.service.host + "/secure/consumeWebServices?url=" + urlArg + "&optionId=" + this.currentOption.id;

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    if (isDevMode ())
      console.log (urlBase);

    this.authService.get (this.msfTableRef, url, handlerSuccess, handlerError);
  }

  finishLoadingTable(error): void
  {
    if (this.currentOptionCategories)
      this.tabs.realignInkBar ();

    this.isLoading = false;

    if (error)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "Failed to generate results." }
      });

      return;
    }

    if (!this.msfTableRef.tableOptions.dataSource && !this.msfTableRef.tableOptions.template)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Information", message: "Results not available." }
      });

      return;
    }

    this.configuredControlVariables = true;
    this.tablePreview = true;
    this.analysisSelected = null;
    this.xAxisSelected = null;
    this.valueSelected = null;
  }

  setCategories(_this, data): void
  {
    let optionCategories = [];

    if (!data.length)
    {
      // load table when there are no control variables
      _this.loadTableData (false, _this.msfTableRef.handlerSuccess, _this.msfTableRef.handlerError);
      return;
    }

    if (_this.tabs)
      _this.tabs.realignInkBar ();
    _this.tablePreview = false;

    data = data.sort ((a, b) => a["position"] > b["position"] ? 1 : a["position"] === b["position"] ? 0 : -1);

    for (let optionCategory of data)
    {
      for (let category of optionCategory.categoryArgumentsId)
      {
        for (let argument of category.arguments)
        {
          if (argument.value1)
            argument.value1 = JSON.parse (argument.value1);

          if (argument.value2)
            argument.value2 = JSON.parse (argument.value2);

          if (argument.value3)
            argument.value3 = JSON.parse (argument.value3);

          if (argument.value4)
            argument.value4 = JSON.parse (argument.value4);

          if (argument.dateLoaded)
            argument.dateLoaded = JSON.parse (argument.dateLoaded);

          if (argument.currentDateRangeValue)
            argument.currentDateRangeValue = JSON.parse (argument.currentDateRangeValue);

          if (argument.minDate)
            argument.minDate = new Date (argument.minDate);
    
          if (argument.maxDate)
            argument.maxDate = new Date (argument.maxDate);

          if (argument.filters)
          {
            argument.filters = JSON.parse (argument.filters);

            for (let i = argument.filters.length - 1; i >= 0; i--)
            {
              let filter = argument.filters[i];
              let argExists = false;
      
              for (let option of data)
              {
                for (let item of option.categoryArgumentsId)
                {
                  if (filter.argument == item.id)
                  {
                    argument.filters[i].argument = item;        
                    argExists = true;
                    break;
                  }
                }

                if (argExists)
                  break;
              }

              if (!argExists)
                argument.filters.splice (i, 1);
            }
          }
        }

        optionCategories.push (category);
      }
    }

    _this.currentOptionCategories = optionCategories;

    _this.configureControlVariables ();
    _this.isLoading = false;
    _this.changeDetectorRef.detectChanges ();
  }

  handlerError(_this): void
  {
    _this.isLoading = false;
  }

  isMatIcon(icon): boolean
  {
    return !icon.endsWith (".png");
  }

  getImageIcon(controlVariable, hover): string
  {
    let newurl, filename: string;
    let path: string[];
    let url;

    url = controlVariable.icon;
    path = url.split ('/');
    filename = path.pop ().split ('?')[0];
    newurl = "";

    // recreate the url with the theme selected
    for (let dir of path)
      newurl += dir + "/";

    if (hover)
      newurl += this.globals.theme + "-hover-" + filename;
    else
      newurl += this.globals.theme + "-" + filename;

    return newurl;
  }

  indexChanged(): void
  {
    // cancel changes in the control variables if they are
    // currently being edited
    if (!this.tablePreview)
      this.cancelEdit ();
  }

  checkTablePreviewVisibility(): string
  {
    if (this.tablePreview)
      return "block";

    return "none";
  }

  checkEditVisibility(): string
  {
    if (!this.tablePreview)
      return "block";

    return "none";
  }

  cancelEdit(): void
  {
    this.currentOptionCategories = JSON.parse (JSON.stringify (this.tempOptionCategories));
    this.tablePreview = true;
  }

  refreshTable(): void
  {
    this.isLoading = true;
    this.loadTableData (false, this.msfTableRef.handlerSuccess, this.msfTableRef.handlerError);
    this.changeDetectorRef.detectChanges ();
  }

  goToEditor(): void
  {
    this.tempOptionCategories = JSON.parse (JSON.stringify (this.currentOptionCategories));
    this.tablePreview = false;
  }

  getArgumentLabel1(argument: Arguments)
  {
    let value: String;

    value = argument.label1;
    if (!value)
      value = argument.title;
    if (!value)
      value = argument.name1;

    if (!value.endsWith (':'))
      return value + ": ";

    if (!value.endsWith (" "))
      return value + " ";

    return value;
  }

  getArgumentLabel2(argument: Arguments)
  {
    let value: String;

    value = argument.label2;
    if (!value)
      value = argument.title;
    if (!value)
      value = argument.name2;

    if (!value.endsWith (':'))
      return value + ": ";

    if (!value.endsWith (" "))
      return value + " ";

    return value;
  }

  getArgumentLabel3(argument: Arguments)
  {
    let value: String;

    value = argument.label3;
    if (!value)
      value = argument.title;
    if (!value)
      value = argument.name3;

    if (!value.endsWith (':'))
      return value + ": ";

    if (!value.endsWith (" "))
      return value + " ";

    return value;
  }

  getArgumentLabel4(argument: Arguments)
  {
    let value: String;

    value = argument.name4;

    if (!value.endsWith (':'))
      return value + ": ";

    if (!value.endsWith (" "))
      return value + " ";

    return value;
  }

  valueIsEmpty(value)
  {
    if (value)
    {
      if (Array.isArray (value) || value === typeof String)
      {
        if (value.length)
          return false;
      }
      else
        return false;
    }

    return true;
  }

  parseDate(date): string
  {
    let day, month;
    let d: Date;

    if (date == null)
      return "";

    d = new Date (date);
    if (Object.prototype.toString.call (d) === "[object Date]")
    {
      if (isNaN (d.getTime()))
        return "";
    }
    else
      return "";

    month = (d.getMonth () + 1);
    if (month < 10)
      month = "0" + month;

    day = d.getDate ();
    if (day < 10)
      day = "0" + day;

    return month + "/" + day + "/" + d.getFullYear ();
  }

  configureControlVariables(): void
  {
    if (!this.currentOptionCategories)
      return;

    for (let controlVariable of this.currentOptionCategories)
    {
      if (controlVariable.arguments)
      {
        for (let i = 0; i < controlVariable.arguments.length; i++)
        {
          let controlVariableArgument = controlVariable.arguments[i];
          let args: any[];

          controlVariableArgument.checkboxes = [];

          if (this.isTaxiTimesCheckbox (controlVariable.arguments[i]) && !controlVariable.taxiTimesCheckbox)
          {
            // Make sure that this specific checkbox is always the last argument in a control variable
            controlVariable.taxiTimesCheckbox = controlVariable.arguments[i];
          }
          else if (i + 1 < controlVariable.arguments.length
            && (this.isSingleCheckbox (controlVariable.arguments[i + 1])))
          {
            // Count the number of checkboxes for a special case
            args = controlVariable.arguments.slice (i + 1, controlVariable.arguments.length);

            for (let argument of args)
            {
              if (!this.isSingleCheckbox(argument))
                break;

              controlVariableArgument.checkboxes.push (argument);
            }
          }
        }
      }
    }
  }

  selectChartType(chartType): void
  {
    this.selectedChartType = chartType;
    this.selectingXAxis = null;
    this.selectingAnalysis = null;
    this.selectingValue = null;
    this.selectingAggregationValue = null;

    // Remove X Axis selection if the chart type doesn't use it
    if (!this.haveXAxis ())
      this.xAxisSelected = null;

    // Remove analysis selection if the simple chart uses intervals
    if (this.chartMode === "advanced" && !(this.selectedChartType.flags & ChartFlags.XYCHART))
      this.analysisSelected = null;
  }

  isTitleOnly(argument: Arguments): boolean
  {
    return ComponentType.title == argument.type;
  }

  isSingleCheckbox(argument: Arguments): boolean
  {
    return ComponentType.singleCheckbox == argument.type;
  }

  isTaxiTimesCheckbox(argument: Arguments): boolean
  {
    return ComponentType.taxiTimesCheckbox == argument.type;
  }

  isDateRange(argument: Arguments): boolean
  {
    return ComponentType.dateRange == argument.type;
  }

  haveXAxis(): boolean
  {
    if (this.selectedChartType.flags & ChartFlags.XYCHART)
      return true;

    return false;
  }

  selectAnalysis(): void
  {
    if (this.selectingAnalysis)
    {
      this.lastColumn = null;
      this.selectingAnalysis = false;
    }

    this.selectingAnalysis = true;
    this.selectingXAxis = false;
    this.selectingValue = false;
    this.selectingAggregationValue = false;
    this.lastColumn = null;
    this.analysisSelected = null;
  }

  selectXAxis(): void
  {
    if (this.selectingXAxis)
    {
      this.lastColumn = null;
      this.selectingXAxis = false;
    }

    this.selectingAnalysis = false;
    this.selectingXAxis = true;
    this.selectingValue = false;
    this.selectingAggregationValue = false;
    this.lastColumn = null;
    this.xAxisSelected = null;
  }

  selectValue(): void
  {
    if (this.selectingValue)
    {
      this.lastColumn = null;
      this.selectingValue = false;
    }

    this.selectingAnalysis = false;
    this.selectingXAxis = false;
    this.selectingValue = true;
    this.selectingAggregationValue = false;
    this.lastColumn = null;
    this.valueSelected = null;
  }

  selectAggregationValue(): void
  {
    if (this.selectingAggregationValue)
    {
      this.lastColumn = false;
      this.selectingAggregationValue = false;
    }

    this.selectingAnalysis = false;
    this.selectingXAxis = false;
    this.selectingValue = false;
    this.selectingAggregationValue = true;
    this.lastColumn = null;
    this.aggregationValueSelected = null;
  }

  hoverTableColumn(index): void
  {
    if (this.lastColumn !== index)
      this.lastColumn = index;
  }

  setChartValue(): void
  {
    if (this.selectingAnalysis)
    {
      this.analysisSelected = this.lastColumn;
      this.selectingAnalysis = false;
    }

    if (this.selectingXAxis)
    {
      this.xAxisSelected = this.lastColumn;
      this.selectingXAxis = false;
    }

    if (this.selectingValue)
    {
      this.valueSelected = this.lastColumn;
      this.selectingValue = false;
    }

    if (this.selectingAggregationValue)
    {
      this.aggregationValueSelected = this.lastColumn;
      this.selectingAggregationValue = false;
    }

    this.lastColumn = null;
  }

  isChartConfigured(): boolean
  {
    if (this.chartMode === "advanced")
    {
      if (this.intervalType === "value")
      {
        if (!(this.selectedChartType.flags & ChartFlags.XYCHART))
          return this.aggregationValueSelected && this.intValue != null && this.intValue != "";

        return this.analysisSelected && this.aggregationValueSelected && this.intValue != null && this.intValue != "";
      }

      if (!(this.selectedChartType.flags & ChartFlags.XYCHART))
        return this.aggregationValueSelected;

      return this.analysisSelected && this.aggregationValueSelected;
    }

    if (!this.haveXAxis ())
    {
      if (this.function.id === "count")
        return this.analysisSelected;

      return this.analysisSelected && this.valueSelected;
    }

    if (this.function.id === "count")
      return this.analysisSelected && this.xAxisSelected;

    return this.analysisSelected && this.xAxisSelected && this.valueSelected;
  }

  previewChart(): void
  {
    let i, variable, xaxis, valueColumn;

    if (this.chartMode === "advanced")
    {
      if (this.aggregationValueSelected.columnType !== "number")
      {
        this.dialog.open (MessageComponent, {
          data: { title: "Error", message: "Only numeric value types are allowed for aggregation value." }
        });

        return;
      }
    }

    if ((this.chartMode === "advanced" && this.selectedChartType.flags & ChartFlags.XYCHART
      || this.chartMode === "basic")
      && this.analysisSelected)
    {
      for (i = 0; i < this.currentOption.columnOptions.length; i++)
      {
        if (this.currentOption.columnOptions[i].id == this.analysisSelected.id)
        {
          variable = this.currentOption.columnOptions[i];
          break;
        }
      }
    }
    else
      variable = null;

    if (this.selectedChartType.flags & ChartFlags.XYCHART && this.xAxisSelected)
    {
      for (i = 0; i < this.currentOption.columnOptions.length; i++)
      {
        if (this.currentOption.columnOptions[i].id == this.xAxisSelected.id)
        {
          xaxis = this.currentOption.columnOptions[i];
          break;
        }
      }
    }
    else
      xaxis = null;

    if (this.chartMode === "advanced")
    {
      for (i = 0; i < this.currentOption.columnOptions.length; i++)
      {
        if (this.currentOption.columnOptions[i].id == this.aggregationValueSelected.id)
        {
          valueColumn = this.currentOption.columnOptions[i];
          break;
        }
      }
    }
    else if (this.valueSelected)
    {
      for (i = 0; i < this.currentOption.columnOptions.length; i++)
      {
        if (this.currentOption.columnOptions[i].id == this.valueSelected.id)
        {
          valueColumn = this.currentOption.columnOptions[i];
          break;
        }
      }
    }

    this.dialog.open (MsfChartPreviewComponent, {
      panelClass: 'msf-dashboard-assistant-dialog',
      autoFocus: false,
      data: {
        currentChartType: this.selectedChartType,
        currentOption: this.currentOption,
        currentOptionCategories: this.currentOptionCategories,
        function: this.function,
        variable: variable,
        xaxis: xaxis,
        valueColumn: valueColumn,
        paletteColors: this.data.paletteColors,
        chartMode: this.chartMode,
        intervalType: this.intervalType,
        intValue: (this.intervalType === "ncile" ? this.ncile : this.intValue),
        startAtZero: this.startAtZero,
        ordered: this.ordered
      }
    });
  }

  // Function to create horizontal column chart series
  createHorizColumnSeries(values, stacked, chart, item, parseDate, theme, outputFormat): void
  {
    // Set up series
    let series = chart.series.push (new am4charts.ColumnSeries ());
    series.name = item.valueAxis;
    series.dataFields.valueX = item.valueField;
    series.sequencedInterpolation = true;

    // Parse date if available
    if (parseDate)
    {
      series.dataFields.dateY = values.xaxis.columnName;
      series.dateFormatter.dateFormat = outputFormat;

      if (values.valueColumn.columnType === "number")
        series.columns.template.tooltipText = "{dateY}: " + (values.valueColumn.item.prefix ? values.valueColumn.prefix : "") + "{valueX}" + (values.valueColumn.suffix ? values.valueColumn.suffix : "");
      else
        series.columns.template.tooltipText = "{dateY}: {valueX}";
    }
    else
    {
      if (values.chartMode === "advanced")
      {
        series.dataFields.categoryY = "Interval";
        series.columns.template.tooltipText = item.valueAxis + ": {valueX}";
      }
      else
      {
        series.dataFields.categoryY = values.xaxis.columnName;

        if (values.valueColumn.columnType === "number")
          series.columns.template.tooltipText = "{categoryY}: " + (values.valueColumn.item.prefix ? values.valueColumn.prefix : "") + "{valueX}" + (values.valueColumn.suffix ? values.valueColumn.suffix : "");
        else
          series.columns.template.tooltipText = "{categoryY}: {valueX}";
      }
    }

    // Configure columns
    series.stacked = stacked;
    series.columns.template.strokeWidth = 0;
    series.columns.template.width = am4core.percent (60);

    return series;
  }

  // Function to create vertical column chart series
  createVertColumnSeries(values, stacked, chart, item, parseDate, theme, outputFormat): any
  {
    let series = chart.series.push (new am4charts.ColumnSeries ());
    series.name = item.valueAxis;
    series.dataFields.valueY = item.valueField;
    series.sequencedInterpolation = true;

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
      if (values.chartMode === "advanced")
      {
        series.dataFields.categoryX = "Interval";
        series.columns.template.tooltipText = item.valueAxis + ": {valueY}";
      }
      else
      {
        series.dataFields.categoryX = values.xaxis.columnName;

        if (values.valueColumn.columnType === "number")
          series.columns.template.tooltipText = "{categoryX}: " + (values.valueColumn.prefix ? values.valueColumn.prefix : "") + "{valueY}" + (values.valueColumn.suffix ? values.valueColumn.suffix : "");
        else
          series.columns.template.tooltipText = "{categoryX}: {valueY}";
      }
    }

    series.stacked = stacked;
    series.columns.template.strokeWidth = 0;
    series.columns.template.width = am4core.percent (60);

    return series;
  }

  // Function to create line chart series
  createLineSeries(values, stacked, chart, item, parseDate, theme, outputFormat): any
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
      if (values.chartMode === "advanced")
      {
        series.dataFields.categoryX = "Interval";
        series.tooltipText = item.valueAxis + ": {valueY}";
      }
      else
      {
        series.dataFields.categoryX = values.xaxis.columnName;

        if (values.valueColumn.columnType === "number")
          series.tooltipText = "{categoryX}: " + (values.valueColumn.prefix ? values.valueColumn.prefix : "") + "{valueY}" + (values.valueColumn.suffix ? values.valueColumn.suffix : "");
        else
          series.tooltipText = "{categoryX}: {valueY}";
      }
    }

    // Fill area below line for area chart types
    if (values.currentChartType.flags & ChartFlags.AREAFILL)
      series.fillOpacity = 0.3;

    series.stacked = stacked;

    return series;
  }

  // Function to create simple line chart series
  createSimpleLineSeries(values, stacked, chart, item, parseDate, theme, outputFormat): any
  {
    // Set up series
    let series = chart.series.push (new am4charts.LineSeries ());
    series.name = item.valueField;
    series.dataFields.valueY = item.valueField;
    series.sequencedInterpolation = true;
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
      if (values.chartMode === "advanced")
      {
        series.dataFields.categoryX = item.titleField;
        series.tooltipText = item.valueField + ": {valueY}";
      }
      else
      {
        series.dataFields.categoryX = item.titleField;

        if (values.valueColumn && values.valueColumn.columnType === "number")
          series.tooltipText = "{categoryX}: " + (values.valueColumn.prefix ? values.valueColumn.prefix : "") + "{valueY}" + (values.valueColumn.suffix ? values.valueColumn.suffix : "");
        else
          series.tooltipText = "{categoryX}: {valueY}";
      }
    }

    series.stacked = stacked;

    // Set color
    series.segments.template.adapter.add ("fill", (fill, target) => {
      return am4core.color (values.paletteColors[0]);
    });

    series.adapter.add ("stroke", (stroke, target) => {
      return am4core.color (values.paletteColors[0]);
    });

    return series;
  }

  // Function to create simple vertical column chart series
  createSimpleVertColumnSeries(values, stacked, chart, item, parseDate, theme, outputFormat): any
  {
    let series = chart.series.push (new am4charts.ColumnSeries ());
    series.dataFields.valueY = item.valueField;
    series.name = item.valueField;

    if (values.chartMode === "advanced")
    {
      series.dataFields.categoryX = item.titleField;
      series.columns.template.tooltipText = "{valueY}";
    }
    else
    {
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
    }

    series.columns.template.strokeWidth = 0;

    series.stacked = stacked;

    // Set colors
    series.columns.template.adapter.add ("fill", (fill, target) => {
      return am4core.color (values.paletteColors[0]);
    });

    return series;
  }

  // Function to create simple horizontal column chart series
  createSimpleHorizColumnSeries(values, stacked, chart, item, parseDate, theme, outputFormat): any
  {
    let series = chart.series.push (new am4charts.ColumnSeries ());
    series.dataFields.valueX = item.valueField;
    series.name = item.valueField;

    if (values.chartMode === "advanced")
    {
      series.dataFields.categoryY = item.titleField;
      series.columns.template.tooltipText = "{valueX}";
    }
    else
    {
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
    }

    series.columns.template.strokeWidth = 0;

    series.stacked = stacked;

    series.columns.template.adapter.add ("fill", (fill, target) => {
      return am4core.color (values.paletteColors[0]);
    });

    return series;
  }

  // Function to create pie chart series
  createPieSeries(values, stacked, chart, item, parseDate, theme, outputFormat): any
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
      series.slices.template.tooltipText = "{category}: " + (values.valueColumn.item.prefix ? values.valueColumn.item.prefix : "") + "{value.value}" + (values.valueColumn.item.suffix ? values.valueColumn.item.suffix : "");
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
    colorSet.list = values.paletteColors.map (function (color) {
      return am4core.color (color);
    });
    series.colors = colorSet;

    return series;
  }

  // Function to create funnel chart series
  createFunnelSeries(values, stacked, chart, item, parseDate, theme, outputFormat): any
  {
    let series, colorSet;

    series = chart.series.push (new am4charts.FunnelSeries ());
    series.dataFields.value = item.valueField;
    series.dataFields.category = item.titleField;

    if (values.valueColumn.columnType === "number")
      series.slices.template.tooltipText = "{category}: " + (values.valueColumn.item.prefix ? values.valueColumn.item.prefix : "") + "{value.value}" + (values.valueColumn.item.suffix ? values.valueColumn.item.suffix : "");
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
    colorSet.list = values.paletteColors.map (function (color) {
      return am4core.color (color);
    });
    series.colors = colorSet;

    return series;
  }

  done(): void
  {
    let variable, xaxis, valueColumn;

    if ((this.chartMode === "advanced" && this.selectedChartType.flags & ChartFlags.XYCHART)
      || this.chartMode !== "advanced")
    {
      for (let columnOption of this.data.chartColumnOptions)
      {
        if (columnOption.item.id == this.analysisSelected.id)
        {
          variable = columnOption;
          break;
        }
      }
    }
    else
      variable = null;

    if (this.chartMode !== "advanced" && this.selectedChartType.flags & ChartFlags.XYCHART)
    {
      for (let columnOption of this.data.chartColumnOptions)
      {
        if (columnOption.item.id == this.xAxisSelected.id)
        {
          xaxis = columnOption;
          break;
        }
      }
    }
    else
      xaxis = null;

    if (this.chartMode === "advanced")
    {
      for (let columnOption of this.data.chartColumnOptions)
      {
        if (columnOption.item.id == this.aggregationValueSelected.id)
        {
          valueColumn = columnOption;
          break;
        }
      }
    }
    else
    {
      for (let columnOption of this.data.chartColumnOptions)
      {
        if (columnOption.item.id == this.valueSelected.id)
        {
          valueColumn = columnOption;
          break;
        }
      }
    }

    this.dialogRef.close ({
      currentChartTypeName: this.selectedChartType.name,
      currentOptionCategories: this.currentOptionCategories,
      function: this.function,
      variable: variable,
      xaxis: xaxis,
      valueColumn: valueColumn,
      chartMode: this.chartMode,
      intervalType: this.intervalType,
      intValue: (this.intervalType === "ncile" ? this.ncile : this.intValue),
      startAtZero: this.startAtZero,
      ordered: this.ordered
    });
  }

  getConfigWidth(): number
  {
    if (this.selectDataPreview)
      return 1015;

    return 730;
  }

  checkChartTypeSelection(): void
  {
    this.selectingAnalysis = null;
    this.analysisSelected = null;

    if (this.chartMode === "advanced")
    {
      if (!this.selectedChartType.allowedInAdvancedMode)
        this.selectedChartType = this.chartTypes[0];

      this.selectingXAxis = null;
      this.xAxisSelected = null;
      this.selectingValue = null;
      this.valueSelected = null;
      this.startAtZero = false;
    }
    else
    {
      this.selectingAggregationValue = null;
      this.aggregationValueSelected = null;

      if (!this.isLineOrBarChart ())
        this.startAtZero = false;
    }
  }

  checkChartMode(chartType): boolean
  {
    if (!chartType.allowedInAdvancedMode && this.chartMode === "advanced")
      return false;

    return true;
  }

  calcMargin(): number
  {
    if (this.chartMode === "advanced")
      return 143;

    return 0;
  }

  getAdvancedValueWidth(): string
  {
    if (this.isChartConfigured ())
      return "calc(100% - 580px)";

    return "calc(100% - 267px)";
  }

  hasAnalysisByValue(): boolean
  {
    if (this.chartMode === "advanced")
    {
      if (this.selectedChartType.flags & ChartFlags.XYCHART)
        return true;

      return false;
    }

    return true;
  }

  isLineOrBarChart(): boolean
  {
    if (!(this.selectedChartType.flags & ChartFlags.PIECHART) && !(this.selectedChartType.flags & ChartFlags.FUNNELCHART))
      return true;

    return false;
  }

  setLoading(value: boolean): void
  {
    this.isLoading = value;
  }
}