import { Component, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
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
    { name: 'Lines', flags: ChartFlags.XYCHART | ChartFlags.LINECHART, image: 'line-chart.png', createSeries: this.createLineSeries, allowedInAdvancedMode: true },
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
  function: any;
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
      this.service.loadOptionCategoryArguments (this, this.currentOption, this.setCategories, this.handlerError);
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
    urlBase = this.currentOption.baseUrl + "?" + this.getParameters ();
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&&pageSize=100&page_number=" + this.actualPageNumber;
    console.log (urlBase);
    urlArg = encodeURIComponent (urlBase);
    url = this.service.host + "/secure/consumeWebServices?url=" + urlArg + "&optionId=" + this.currentOption.id + "&ipAddress=" + this.authService.getIpAddress ();

    this.authService.get (this.msfTableRef, url, handlerSuccess, handlerError);
  }

  finishLoadingTable(error): void
  {
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

          if (argument.minDate)
            argument.minDate = new Date (argument.minDate);
    
          if (argument.maxDate)
            argument.maxDate = new Date (argument.maxDate);
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

  isArray(value): boolean
  {
    return Array.isArray (value);
  }

  isDate(value): boolean
  {
    let date: Date = new Date (Date.parse (value));
    return !isNaN (date.getTime ());
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

    // Remove X Axis selection if the chart type doesn't use it
    if (!this.haveXAxis ())
      this.xAxisSelected = null;
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
    this.lastColumn = null;
    this.valueSelected = null;
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

    this.lastColumn = null;
  }

  isChartConfigured(): boolean
  {
    if (!this.haveXAxis ())
      return this.analysisSelected && this.valueSelected;

    return this.analysisSelected && this.xAxisSelected && this.valueSelected;
  }

  previewChart(): void
  {
    let i, variable, xaxis, valueColumn;

    for (i = 0; i < this.currentOption.columnOptions.length; i++)
    {
      if (this.currentOption.columnOptions[i].id == this.analysisSelected.id)
      {
        variable = this.currentOption.columnOptions[i];
        break;
      }
    }

    if (this.selectedChartType.flags & ChartFlags.XYCHART)
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

    for (i = 0; i < this.currentOption.columnOptions.length; i++)
    {
      if (this.currentOption.columnOptions[i].id == this.valueSelected.id)
      {
        valueColumn = this.currentOption.columnOptions[i];
        break;
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
        paletteColors: this.data.paletteColors
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
      series.columns.template.tooltipText = "{dateY}: {valueX}";
    }
    else
    {
      series.dataFields.categoryY = values.xaxis.columnName;
      series.columns.template.tooltipText = "{categoryY}: {valueX}";
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
      series.columns.template.tooltipText = "{dateX}: {valueY}";
    }
    else
    {
      series.dataFields.categoryX = values.xaxis.columnName;
      series.columns.template.tooltipText = "{categoryX}: {valueY}";
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

    if (parseDate)
    {
      series.dataFields.dateX = values.xaxis.columnName;
      series.dateFormatter.dateFormat = outputFormat;
      series.tooltipText = "{dateX}: {valueY}";
    }
    else
    {
      series.dataFields.categoryX = values.xaxis.columnName;
      series.tooltipText = "{categoryX}: {valueY}";
    }

    // Fill area below line for area chart types
    if (values.currentChartType.flags & ChartFlags.AREAFILL)
      series.fillOpacity = 0.3;

    series.stacked = stacked;

    return series;
  }

  // Function to create simple vertical column chart series
  createSimpleVertColumnSeries(values, stacked, chart, item, parseDate, theme, outputFormat): any
  {
    let series = chart.series.push (new am4charts.ColumnSeries ());
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

    return series;
  }

  // Function to create simple horizontal column chart series
  createSimpleHorizColumnSeries(values, stacked, chart, item, parseDate, theme, outputFormat): any
  {
    let series = chart.series.push (new am4charts.ColumnSeries ());
    series.dataFields.valueX = item.valueField;
    series.dataFields.categoryY = item.titleField;
    series.name = item.valueField;
    series.columns.template.tooltipText = "{categoryY}: {valueX}";
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

    for (let columnOption of this.data.chartColumnOptions)
    {
      if (columnOption.item.id == this.analysisSelected.id)
      {
        variable = columnOption;
        break;
      }
    }

    if (this.selectedChartType.flags & ChartFlags.XYCHART)
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

    for (let columnOption of this.data.chartColumnOptions)
    {
      if (columnOption.item.id == this.valueSelected.id)
      {
        valueColumn = columnOption;
        break;
      }
    }

    this.dialogRef.close ({
      currentChartTypeName: this.selectedChartType.name,
      currentOptionCategories: this.currentOptionCategories,
      function: this.function,
      variable: variable,
      xaxis: xaxis,
      valueColumn: valueColumn
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
    if (!this.selectedChartType.allowedInAdvancedMode && this.chartMode === "advanced")
      this.selectedChartType = this.chartTypes[0];
  }

  checkChartMode(chartType): boolean
  {
    if (!chartType.allowedInAdvancedMode && this.chartMode === "advanced")
      return false;

    return true;
  }
}