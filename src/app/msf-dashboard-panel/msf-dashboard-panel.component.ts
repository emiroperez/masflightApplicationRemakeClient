import { Component, OnInit, ViewChild, Input, NgZone, SimpleChanges, Output, EventEmitter, isDevMode, ChangeDetectorRef, Injector } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { FlatTreeControl } from '@angular/cdk/tree';
import { DatePipe } from '@angular/common';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import am4geodata_northAmericaLow from "@amcharts/amcharts4-geodata/region/world/northAmericaLow";
import am4geodata_centralAmericaLow from "@amcharts/amcharts4-geodata/region/world/centralAmericaLow";
import am4geodata_southAmericaLow from "@amcharts/amcharts4-geodata/region/world/southAmericaLow";
import am4geodata_asiaLow from "@amcharts/amcharts4-geodata/region/world/asiaLow";
import am4geodata_africaLow from "@amcharts/amcharts4-geodata/region/world/africaLow";
import am4geodata_europeLow from "@amcharts/amcharts4-geodata/region/world/europeLow";
import am4geodata_oceaniaLow from "@amcharts/amcharts4-geodata/region/world/oceaniaLow";
import am4geodata_usaLow from "@amcharts/amcharts4-geodata/usaLow";
import am4geodata_colombiaLow from "@amcharts/amcharts4-geodata/colombiaLow";
import am4geodata_colombiaMuniLow from "@amcharts/amcharts4-geodata/colombiaMuniLow";
import { CategoryArguments } from '../model/CategoryArguments';
import { Globals } from '../globals/Globals';
import { Themes } from '../globals/Themes';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { MatDialog, PageEvent, MatPaginator, MAT_DIALOG_DATA, MatDialogRef, MatTreeFlatDataSource, MatTreeFlattener, MatTabGroup } from '@angular/material';
import { takeUntil, take } from 'rxjs/operators';
import * as moment from 'moment';

import { ApiClient } from '../api/api-client';
import { Arguments } from '../model/Arguments';
import { Utils } from '../commons/utils';
import { ApplicationService } from '../services/application.service';
import { MsfDashboardControlVariablesComponent } from '../msf-dashboard-control-variables/msf-dashboard-control-variables.component';
import { MsfDashboardInfoFunctionsComponent } from '../msf-dashboard-info-functions/msf-dashboard-info-functions.component';
import { MsfDashboardAdditionalSettingsComponent } from '../msf-dashboard-additional-settings/msf-dashboard-additional-settings.component';
import { MsfDashboardDrillDownComponent } from  '../msf-dashboard-drill-down/msf-dashboard-drill-down.component';
import { MsfShareDashboardComponent } from '../msf-share-dashboard/msf-share-dashboard.component';
import { MsfTableComponent } from '../msf-table/msf-table.component';
import { MsfDashboardPanelValues } from '../msf-dashboard-panel/msf-dashboard-panelvalues';
import { MessageComponent } from '../message/message.component';
import { ChartFlags } from '../msf-dashboard-panel/msf-dashboard-chartflags';
import { AuthService } from '../services/auth.service';
import { MsfMapComponent } from '../msf-map/msf-map.component';
import { MsfDashboardAssistantComponent } from '../msf-dashboard-assistant/msf-dashboard-assistant.component';
import { MsfDynamicTableAliasComponent } from '../msf-dynamic-table-alias/msf-dynamic-table-alias.component';
import { MsfSelectDataFromComponent } from '../msf-select-data-from/msf-select-data-from.component';
import { ConfigFlags } from './msf-dashboard-configflags';
import { MsfDynamicTableVariablesComponent } from '../msf-dynamic-table-variables/msf-dynamic-table-variables.component';
import { ExampleFlatNode } from '../admin-menu/admin-menu.component';
import { ComponentType } from '../commons/ComponentType';
import { MsfDashboardPanelValueSelectorComponent } from '../msf-dashboard-panel-value-selector/msf-dashboard-panel-value-selector.component';

// AmCharts colors
const black = am4core.color ("#000000");
const comet = am4core.color ("#585869");

// SVG used for maps
const homeSVG = "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8";
const planeSVG = "m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47";
const targetSVG = "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z";

// TODO: Make the panels responsive (600px)

@Component({
  selector: 'app-msf-dashboard-panel',
  templateUrl: './msf-dashboard-panel.component.html',
  styleUrls: ['./msf-dashboard-panel.component.css']
})
export class MsfDashboardPanelComponent implements OnInit {
  utils: Utils;

  vertAxisDisabled: boolean = false;
  horizAxisDisabled: boolean = false;

  variableCtrlBtnEnabled: boolean = false;
  generateBtnEnabled: boolean = false;

  valueAxis: any;
  panelForm: FormGroup;

  chart: any;
  chartInfo: any;

  paletteColors: string[];

  panelTypes: any[] = [
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
    { name: 'Table', flags: ChartFlags.TABLE, image: 'table.png', allowedInAdvancedMode: false },
    { name: 'Dynamic Table', flags: ChartFlags.DYNTABLE, image: 'dyn-table.png', allowedInAdvancedMode: false },

    { name: 'Information', flags: ChartFlags.INFO, image: 'info.png', allowedInAdvancedMode: false },
    { name: 'Simple Form', flags: ChartFlags.INFO | ChartFlags.FORM, image: 'simple-form.png', allowedInAdvancedMode: false },
    { name: 'Link Image', flags: ChartFlags.INFO | ChartFlags.PICTURE, image: 'link-image.png', allowedInAdvancedMode: false },
    { name: 'Map', flags: ChartFlags.MAP, image: 'map.png', allowedInAdvancedMode: false },
    { name: 'Heat Map', flags: ChartFlags.HEATMAP, image: 'heatmap.png', allowedInAdvancedMode: false },
    { name: 'Map Tracker', flags: ChartFlags.MAP | ChartFlags.MAPBOX, image: 'mapbox.png', allowedInAdvancedMode: false }
  ];

  chartTypes: any[] = [
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
    { name: 'Information', flags: ChartFlags.INFO },
    { name: 'Simple Form', flags: ChartFlags.INFO | ChartFlags.FORM },
    { name: 'Table', flags: ChartFlags.TABLE },
    { name: 'Map', flags: ChartFlags.MAP },
    { name: 'Heat Map', flags: ChartFlags.HEATMAP },
    { name: 'Map Tracker', flags: ChartFlags.MAP | ChartFlags.MAPBOX },
    { name: 'Dynamic Table', flags: ChartFlags.DYNTABLE },
    { name: 'Advanced Bars', flags: ChartFlags.XYCHART | ChartFlags.ADVANCED, createSeries: this.createVertColumnSeries },
    { name: 'Advanced Horizontal Bars', flags: ChartFlags.XYCHART | ChartFlags.ROTATED | ChartFlags.ADVANCED, createSeries: this.createHorizColumnSeries },
    { name: 'Advanced Simple Bars', flags: ChartFlags.ADVANCED, createSeries: this.createSimpleVertColumnSeries },
    { name: 'Advanced Simple Horizontal Bars', flags: ChartFlags.ROTATED | ChartFlags.ADVANCED, createSeries: this.createSimpleHorizColumnSeries },
    { name: 'Advanced Stacked Bars', flags: ChartFlags.XYCHART | ChartFlags.STACKED | ChartFlags.ADVANCED, createSeries: this.createVertColumnSeries },
    { name: 'Advanced Horizontal Stacked Bars', flags: ChartFlags.XYCHART | ChartFlags.ROTATED | ChartFlags.STACKED | ChartFlags.ADVANCED, createSeries: this.createHorizColumnSeries },
    { name: 'Advanced Lines', flags: ChartFlags.XYCHART | ChartFlags.LINECHART | ChartFlags.ADVANCED, createSeries: this.createLineSeries },
    { name: 'Simple Lines', flags: ChartFlags.LINECHART, createSeries: this.createSimpleLineSeries },
    { name: 'Advanced Simple Lines', flags: ChartFlags.LINECHART | ChartFlags.ADVANCED, createSeries: this.createSimpleLineSeries },
    { name: 'Scatter', flags: ChartFlags.XYCHART | ChartFlags.LINECHART | ChartFlags.BULLET, createSeries: this.createLineSeries },
    { name: 'Advanced Scatter', flags: ChartFlags.XYCHART | ChartFlags.LINECHART | ChartFlags.BULLET | ChartFlags.ADVANCED, createSeries: this.createLineSeries },
    { name: 'Simple Scatter', flags: ChartFlags.LINECHART | ChartFlags.BULLET, createSeries: this.createSimpleLineSeries },
    { name: 'Advanced Simple Scatter', flags: ChartFlags.LINECHART | ChartFlags.BULLET | ChartFlags.ADVANCED, createSeries: this.createSimpleLineSeries },
    { name: 'Link Image', flags: ChartFlags.INFO | ChartFlags.PICTURE }
  ];

  functions: any[] = [
    { id: 'avg', name: 'Average' },
    { id: 'sum', name: 'Sum' },
    { id: 'max', name: 'Max' },
    { id: 'min', name: 'Min' },
    { id: 'count', name: 'Count' }
  ];

  nciles: number[] = [1, 2, 5, 10, 20, 25];

  fontSizes: any[] = [
    { name: 'Small', value: 12 },
    { name: 'Medium', value: 18 },
    { name: 'Large', value: 30 }
  ];

  orientations: any[] = [
    { name: 'Horizontal', value: false },
    { name: 'Vertical', value: true }
  ];

  geodatas: any[] = [
    { name: 'U.S. States', value: am4geodata_usaLow },
    { name: 'North America', value: am4geodata_northAmericaLow },
    { name: 'Central America', value: am4geodata_centralAmericaLow },
    { name: 'South America', value: am4geodata_southAmericaLow },
    { name: 'Asia', value: am4geodata_asiaLow },
    { name: 'Africa', value: am4geodata_africaLow },
    { name: 'Europe', value: am4geodata_europeLow },
    { name: 'Oceania', value: am4geodata_oceaniaLow },
    { name: 'World', value: am4geodata_worldLow },
    { name: 'Colombia Departments', value: am4geodata_colombiaLow },
    { name: 'Colombia Municipals', value: am4geodata_colombiaMuniLow }
  ];

  @Input("values")
  values: MsfDashboardPanelValues;
  temp: MsfDashboardPanelValues;

  @Input("panelWidth")
  panelWidth: number;

  @Input("panelHeight")
  panelHeight: number;
  displayLabel: boolean = true;

  @Input("controlPanelVariables")
  controlPanelVariables: CategoryArguments[];

  @Input("currentHiddenCategories")
  currentHiddenCategories: any;

  @Input("numPanelsInColumn")
  numPanelsInColumn: number;

  @Input("addingOrRemovingPanels")
  addingOrRemovingPanels: number;

  @Output("removeDeadVariablesAndCategories")
  removeDeadVariablesAndCategories = new EventEmitter ();

  @Output("addNewVariablesAndCategories")
  addNewVariablesAndCategories = new EventEmitter ();

  @Output("toggleControlVariableDialogOpen")
  toggleControlVariableDialogOpen  = new EventEmitter ();

  @Output("removePanel")
  removePanel = new EventEmitter ();

  @Output("enablePanelContextMenu")
  enablePanelContextMenu = new EventEmitter ();

  @Input("controlPanelInterval")
  controlPanelInterval: number;

  @Input("public")
  public: boolean = false;

  @Input("isMobile")
  isMobile: boolean = false;

  childPanelValues: any[] = [];
  childPanelsConfigured: boolean[] = [];

  oldChartType: any;
  oldVariableName: string = "";
  oldOptionCategories: any;

  updateTimeLeft: number = 60;
  updateInterval: any;

  // table variables
  @ViewChild('msfTableRef', { static: false })
  msfTableRef: MsfTableComponent;

  // map variables
  imageSeries: any;
  lineSeries: any;
  shadowLineSeries: any;
  checkedCities: any[] = [];
  checkedRoutes: any[] = [];

  // dynamic table variables
  dynTableData: any;
  dynTableOrder: number = 0;
  dynTableOrderValue: number = 0;

  actualPageNumber: number;
  dataSource: boolean = false;
  template: boolean = false;
  moreResults: boolean = false;
  moreResultsBtn: boolean = false;
  displayedColumns;
  selectedIndex = 0;
  totalRecord = 0;
  metadata;

  lastChartName: String;
  yAxisColSpan: number = 0;

  public dataFormFilterCtrl: FormControl = new FormControl ();
  public variableFilterCtrl: FormControl = new FormControl ();
  public xaxisFilterCtrl: FormControl = new FormControl ();
  public valueFilterCtrl: FormControl = new FormControl ();

  public infoVar1FilterCtrl: FormControl = new FormControl ();
  public infoVar2FilterCtrl: FormControl = new FormControl ();
  public infoVar3FilterCtrl: FormControl = new FormControl ();

  public columnFilterCtrl: FormControl = new FormControl ();

  public filteredVariables: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  public filteredOptions: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);

  private _onDestroy = new Subject<void> ();

  // mapbox variables
  @ViewChild('msfMapRef', { static: true })
  msfMapRef: MsfMapComponent;
  mapboxInterval: any;
  lastWidth: number;

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

  addUpValuesSet: boolean = false;
  sumValueAxis: any = null;
  sumSeriesList: any[] = [];
  advTableView: boolean = false;
  intervalTableRows: any[] = [];
  
  //paginator
  @ViewChild('paginator', { static: false })
  paginator: MatPaginator;

  pageIndex: any;

  pageEvent: PageEvent;

  lengthpag: any;
  pageI: any;
  pageSize: any;

  anchoredArguments: any[] = [];
  savedAnchoredArguments: any[] = [];
  displayAnchoredArguments: boolean = false;
  updateURLResults: boolean = false;

  // variables for the dialog version
  dialogRef: any;
  dialogData: any;

  // dashboard interface values
  selectedPanelType: any = this.panelTypes[0];
  controlVariablesSet: boolean = false;
  selectedStep: number = 1;
  stepLoading: number = 0;

  menuCategories: any[] = [];
  selectedItem: any = null;

  hasChild = (_: number, node: any) => (node.expandable);

  configTableLoading: boolean = false;
  configuredControlVariables: boolean = false;
  tempOptionCategories: any = null;
  panelMode: string = "basic";
  panelConfigRefresh: boolean = false;

  @ViewChild("configTabs", { static: false })
  configTabs: MatTabGroup;

  @ViewChild("editTabs", { static: false })
  editTabs: MatTabGroup;

  @ViewChild('msfConfigTableRef', { static: false })
  msfConfigTableRef: MsfTableComponent;

  @ViewChild('autosize', { static: false })
  autosize: CdkTextareaAutosize;

  constructor(private zone: NgZone, public globals: Globals,
    private service: ApplicationService, private http: ApiClient, private authService: AuthService, public dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef, private formBuilder: FormBuilder, private injector: Injector)
  {
    this.utils = new Utils ();

    this.dialogRef = this.injector.get (MatDialogRef, null);
    this.dialogData = this.injector.get (MAT_DIALOG_DATA, null);

    this.panelForm = this.formBuilder.group ({
      dataFormCtrl: new FormControl (),
      variableCtrl: new FormControl ({ value: '', disabled: true }),
      xaxisCtrl: new FormControl ({ value: '', disabled: true }),
      valueCtrl: new FormControl ({ value: '', disabled: true }),
      valueListCtrl: new FormControl ({ value: '', disabled: true }),
      columnCtrl: new FormControl ({ value: '', disabled: true }),
      fontSizeCtrl: new FormControl ({ value: this.fontSizes[1], disabled: true }),
      valueFontSizeCtrl: new FormControl ({ value: this.fontSizes[1], disabled: true }),
      valueOrientationCtrl: new FormControl ({ value: this.orientations[0], disabled: true }),
      functionCtrl: new FormControl ({ value: this.functions[0], disabled: true }),
      geodataValueCtrl: new FormControl ({ value: '', disabled: true }),
      geodataKeyCtrl: new FormControl ({ value: '', disabled: true })
    });

    if (this.dialogData)
    {
      // This is for the dialog version
      this.values = this.dialogData.values;
      this.panelWidth = this.dialogData.panelWidth;
      this.panelHeight = this.dialogData.panelHeight;
      this.toggleControlVariableDialogOpen = this.dialogData.toggleControlVariableDialogOpen;
      this.functions = this.dialogData.functions;
      this.chartTypes = this.dialogData.chartTypes;
      this.nciles = this.dialogData.nciles;
      this.fontSizes = this.dialogData.fontSizes;
      this.orientations = this.dialogData.orientations;
      this.geodatas = this.dialogData.geodatas;
      this.childPanelValues = this.dialogData.childPanelValues;
      this.childPanelsConfigured = this.dialogData.childPanelsConfigured;

      this.panelForm = this.dialogData.panelForm;
      this.dataFormFilterCtrl = this.dialogData.dataFormFilterCtrl;
      this.variableFilterCtrl = this.dialogData.variableFilterCtrl;
      this.xaxisFilterCtrl = this.dialogData.xaxisFilterCtrl;
      this.valueFilterCtrl = this.dialogData.valueFilterCtrl;
      this.infoVar1FilterCtrl = this.dialogData.infoVar1FilterCtrl;
      this.infoVar2FilterCtrl = this.dialogData.infoVar2FilterCtrl;
      this.infoVar3FilterCtrl = this.dialogData.infoVar3FilterCtrl;
      this.columnFilterCtrl = this.dialogData.columnFilterCtrl;
      this.filteredVariables = this.dialogData.filteredVariables;
      this.filteredOptions = this.dialogData.filteredOptions;

      this.variableCtrlBtnEnabled = this.dialogData.variableCtrlBtnEnabled;
      this.generateBtnEnabled = this.dialogData.generateBtnEnabled;
    }
  }

  triggerResize()
  {
    // Wait for changes to be applied, then trigger textarea resize.
    this.zone.onStable.pipe (take (1)).subscribe (() => this.autosize.resizeToFitContent (true));
  }

  ngOnInit()
  {
    this.displayLabel = this.panelWidth >= 5 ? true : false;

    // prepare the data form combo box
    this.optionSearchChange (this.dataFormFilterCtrl);

    // copy function list for use with the information panel
    this.values.infoFunc1 = JSON.parse (JSON.stringify (this.functions));
    this.values.infoFunc2 = JSON.parse (JSON.stringify (this.functions));
    this.values.infoFunc3 = JSON.parse (JSON.stringify (this.functions));

    this.values.style = this.msfMapRef.mapTypes[1];
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if (this.addingOrRemovingPanels || this.dialogData)
      return;

    if (changes['controlPanelVariables'] && this.controlPanelVariables)
    {
      // validate the panel configuration before updating
      if (!this.checkPanelConfiguration ())
        return;

      // copy the dashboard control panel variables into the dashboard panel
      for (let categoryOption of this.values.currentOptionCategories)
      {
        for (let categoryOptionArgument of categoryOption.arguments)
        {
          for (let controlVariable of this.controlPanelVariables)
          {
            let found: boolean = false;

            for (let controlVariableArgument of controlVariable.arguments)
            {
              if (categoryOptionArgument.id == controlVariableArgument.id)
              {
                categoryOptionArgument.value1 = controlVariableArgument.value1;

                if (controlVariableArgument.value2)
                  categoryOptionArgument.value2 = controlVariableArgument.value2;

                if (controlVariableArgument.value3)
                  categoryOptionArgument.value3 = controlVariableArgument.value3;

                if (controlVariableArgument.value4)
                  categoryOptionArgument.value4 = controlVariableArgument.value4;

                if (controlVariableArgument.dateLoaded)
                  categoryOptionArgument.dateLoaded = controlVariableArgument.dateLoaded;

                if (controlVariableArgument.currentDateRangeValue)
                  controlVariableArgument.currentDateRangeValue = controlVariableArgument.currentDateRangeValue;

                found = true;
                break;
              }
            }

            if (found)
              break;
          }
        }
      }

      setTimeout (() =>
      {
        this.loadData ();
      }, 10);
    }
    else if (changes['controlPanelInterval'])
    {
      // validate the panel configuration before updating
      if (!this.checkPanelConfiguration ())
        return;

      // copy the update interval
      if (this.controlPanelInterval)
      {
        this.values.updateIntervalSwitch = true;
        this.values.updateTimeLeft = this.controlPanelInterval;
      }
      else
      {
        this.values.updateIntervalSwitch = false;
        this.values.updateTimeLeft = 0;
      }

      setTimeout (() =>
      {
        this.loadData ();
      }, 10);
    }
    else if (changes['panelWidth'])
    {
      this.displayLabel = this.panelWidth >= 5 ? true : false;

      if (this.values.currentChartType.flags & ChartFlags.MAPBOX && this.values.displayMapbox)
        this.msfMapRef.resizeMap();

    }
    else if (changes['panelHeight'])
    {
      if (this.values.currentChartType.flags & ChartFlags.MAPBOX && this.values.displayMapbox)
        this.msfMapRef.resizeMap ();
    }
    else if (changes['currentHiddenCategories'])
    {
      for (let series of this.values.chartSeries)
      {
        let hidden: boolean = false;

        if (this.values.variable)
        {
          for (let hiddenCategory of this.currentHiddenCategories)
          {
            if (hiddenCategory.name === series.name && hiddenCategory.variable.toLowerCase () === this.values.variable.name.toLowerCase ())
            {
              hidden = true;
              break;
            }
          }
        }

        if (hidden)
          series.hide ();
        else
          series.show ();
      }
    }
    else if (changes['isMobile'])
    {
      if (this.chart)
      {
        this.zone.runOutsideAngular (() => {
          if (this.isMobile)
          {
            this.chart.scrollbarX = null;
            this.chart.scrollbarY = null;
          }
          else
          {
            if (!(this.values.currentChartType.flags & ChartFlags.PIECHART || this.values.currentChartType.flags & ChartFlags.FUNNELCHART
              || this.values.currentChartType.flags & ChartFlags.MAP || this.values.currentChartType.flags & ChartFlags.HEATMAP))
            {
              // recreate scrollbar
              if (this.chart.data.length > 1)
              {
                let theme = this.globals.theme;

                if (this.values.currentChartType.flags & ChartFlags.ROTATED)
                {
                  this.chart.scrollbarY = new am4core.Scrollbar ();
                  this.chart.scrollbarY.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
                }
                else
                {
                  this.chart.scrollbarX = new am4core.Scrollbar ();
                  this.chart.scrollbarX.background.fill = Themes.AmCharts[theme].chartZoomScrollBar;
                }
              }
            }
          }
        });
      }
    }
  }

  // Function to create horizontal column chart series
  createHorizColumnSeries(values, stacked, chart, item, parseDate, theme, outputFormat, panelLoading, paletteColors): void
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
      series.dateFormatter.dateFormat = outputFormat;

      if (values.valueColumn.item.columnType === "number")
        series.columns.template.tooltipText = "{dateY}: " + (values.valueColumn.item.prefix ? values.valueColumn.item.prefix : "") + "{valueX}" + (values.valueColumn.item.suffix ? values.valueColumn.item.suffix : "");
      else
        series.columns.template.tooltipText = "{dateY}: {valueX}";
    }
    else
    {
      if (values.currentChartType.flags & ChartFlags.ADVANCED)
      {
        series.dataFields.categoryY = "Interval";
        series.columns.template.tooltipText = item.valueAxis + ": {valueX}";
      }
      else
      {
        series.dataFields.categoryY = values.xaxis.id;

        if (values.valueColumn.item.columnType === "number")
          series.columns.template.tooltipText = "{categoryY}: " + (values.valueColumn.item.prefix ? values.valueColumn.item.prefix : "") + "{valueX}" + (values.valueColumn.item.suffix ? values.valueColumn.item.suffix : "");
        else
          series.columns.template.tooltipText = "{categoryY}: {valueX}";
      }
    }

    // Configure columns
    series.stacked = stacked;
    series.columns.template.strokeWidth = 0;
    series.columns.template.width = am4core.percent (60);

    if (!(values.currentChartType.flags & ChartFlags.ADVANCED))
    {
      // Display a special context menu when a chart column is right clicked or touched
      series.columns.template.events.on ("down", function (event) {
        if (!values.currentOption.drillDownOptions.length)
          return;

        if (!event.touch)
          return;

        values.chartClicked = true;
        values.chartObjectSelected = event.target.dataItem.dataContext[values.xaxis.id];
        values.chartSecondaryObjectSelected = series.dataFields.valueX;
      });

      series.columns.template.events.on ("rightclick", function (event) {
        if (!values.currentOption.drillDownOptions.length)
          return;

        values.chartClicked = true;
        values.chartObjectSelected = event.target.dataItem.dataContext[values.xaxis.id];
        values.chartSecondaryObjectSelected = series.dataFields.valueX;
      });
    }

    if (panelLoading)
      series.showOnInit = false;

    return series;
  }

  // Function to create vertical column chart series
  createVertColumnSeries(values, stacked, chart, item, parseDate, theme, outputFormat, panelLoading, paletteColors): any
  {
    let series = chart.series.push (new am4charts.ColumnSeries ());

    series.name = item.valueAxis;
    series.dataFields.valueY = item.valueField;
    series.sequencedInterpolation = true;

    if (parseDate)
    {
      series.dataFields.dateX = values.xaxis.id;
      series.dateFormatter.dateFormat = outputFormat;

      if (values.valueColumn.item.columnType === "number")
        series.columns.template.tooltipText = "{dateX}: " + (values.valueColumn.item.prefix ? values.valueColumn.item.prefix : "") + "{valueY}" + (values.valueColumn.item.suffix ? values.valueColumn.item.suffix : "");
      else
        series.columns.template.tooltipText = "{dateX}: {valueY}";
    }
    else
    {
      if (values.currentChartType.flags & ChartFlags.ADVANCED)
      {
        series.dataFields.categoryX = "Interval";
        series.columns.template.tooltipText = item.valueAxis + ": {valueY}";
      }
      else
      {
        series.dataFields.categoryX = values.xaxis.id;

        if (values.valueColumn.item.columnType === "number")
          series.columns.template.tooltipText = "{categoryX}: " + (values.valueColumn.item.prefix ? values.valueColumn.item.prefix : "") + "{valueY}" + (values.valueColumn.item.suffix ? values.valueColumn.item.suffix : "");
        else
          series.columns.template.tooltipText = "{categoryX}: {valueY}";
      }
    }

    series.stacked = stacked;
    series.columns.template.strokeWidth = 0;
    series.columns.template.width = am4core.percent (60);

    if (values.currentChartType.flags & ChartFlags.ADVANCED)
    {
      series.columns.template.events.on ("down", function (event) {
        if (!values.currentOption.drillDownOptions.length)
          return;

        if (!event.touch)
          return;

        values.chartClicked = true;
        values.chartObjectSelected = event.target.dataItem.dataContext[values.xaxis.id];
        values.chartSecondaryObjectSelected = series.dataFields.valueY;
      });

      series.columns.template.events.on ("rightclick", function (event) {
        if (!values.currentOption.drillDownOptions.length)
          return;

        values.chartClicked = true;
        values.chartObjectSelected = event.target.dataItem.dataContext[values.xaxis.id];
        values.chartSecondaryObjectSelected = series.dataFields.valueY;
      });
    }

    if (panelLoading)
      series.showOnInit = false;

    return series;
  }

  // Function to create line chart series
  createLineSeries(values, stacked, chart, item, parseDate, theme, outputFormat, panelLoading, paletteColors): any
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
      series.dataFields.dateX = values.xaxis.id;
      series.dateFormatter.dateFormat = outputFormat;

      if (values.valueColumn.item.columnType === "number")
        series.tooltipText = "{dateX}: " + (values.valueColumn.item.prefix ? values.valueColumn.item.prefix : "") + "{valueY}" + (values.valueColumn.item.suffix ? values.valueColumn.item.suffix : "");
      else
        series.tooltipText = "{dateX}: {valueY}";
    }
    else
    {
      if (values.currentChartType.flags & ChartFlags.ADVANCED)
      {
        series.dataFields.categoryX = "Interval";
        series.tooltipText = item.valueAxis + ": {valueY}";
      }
      else
      {
        series.dataFields.categoryX = values.xaxis.id;

        if (values.valueColumn.item.columnType === "number")
          series.tooltipText = "{categoryX}: " + (values.valueColumn.item.prefix ? values.valueColumn.item.prefix : "") + "{valueY}" + (values.valueColumn.item.suffix ? values.valueColumn.item.suffix : "");
        else
          series.tooltipText = "{categoryX}: {valueY}";
      }
    }

    // Fill area below line for area chart types
    if (values.currentChartType.flags & ChartFlags.AREAFILL)
      series.fillOpacity = 0.3;

    series.stacked = stacked;

    // Set line color for legend
    series.adapter.add ("fill", (fill, target) => {
      return fill;
    });

    series.adapter.add ("stroke", (stroke, target) => {
      return stroke;
    });

    if (!(values.currentChartType.flags & ChartFlags.ADVANCED))
    {
      // Display a special context menu when a chart line segment is right clicked
      series.segments.template.interactionsEnabled = true;
      series.segments.template.events.on ("down", function (event) {
        if (!values.currentOption.drillDownOptions.length)
          return;

        if (!event.touch)
          return;

        values.chartClicked = true;
        values.chartObjectSelected = event.target.dataItem.component.tooltipDataItem.dataContext[values.xaxis.id];
        values.chartSecondaryObjectSelected = series.dataFields.valueY;
      });

      series.segments.template.events.on ("rightclick", function (event) {
        if (!values.currentOption.drillDownOptions.length)
          return;

        values.chartClicked = true;
        values.chartObjectSelected = event.target.dataItem.component.tooltipDataItem.dataContext[values.xaxis.id];
        values.chartSecondaryObjectSelected = series.dataFields.valueY;
      });
    }

    if (panelLoading)
      series.showOnInit = false;

    return series;
  }

  // Function to create simple line chart series
  createSimpleLineSeries(values, simpleValue, chart, item, parseDate, index, outputFormat, panelLoading, paletteColors): any
  {
    // Set up series
    let series = chart.series.push (new am4charts.LineSeries ());

    if (simpleValue)
    {
      series.name = simpleValue.name;
      series.dataFields.valueY = simpleValue.id;
    }
    else
    {
      series.name = item.valueField;
      series.dataFields.valueY = item.valueField;
    }

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

    if (values.currentChartType.flags & ChartFlags.ADVANCED)
    {
      series.dataFields.categoryX = item.titleField;
      series.tooltipText = "{valueY}";
    }
    else
    {
      if (parseDate)
      {
        series.dataFields.dateX = item.titleField;
        series.dateFormatter.dateFormat = outputFormat;

        if (simpleValue && simpleValue.item.columnType === "number")
          series.tooltipText = "{dateX}: " + (simpleValue.item.prefix ? simpleValue.item.prefix : "") + "{valueY}" + (simpleValue.item.suffix ? simpleValue.item.suffix : "");
        else
          series.tooltipText = "{dateX}: {valueY}";
      }
      else
      {
        series.dataFields.categoryX = item.titleField;

        if (simpleValue && simpleValue.item.columnType === "number")
          series.tooltipText = "{categoryX}: " + (simpleValue.item.prefix ? simpleValue.item.prefix : "") + "{valueY}" + (simpleValue.item.suffix ? simpleValue.item.suffix : "");
        else
          series.tooltipText = "{categoryX}: {valueY}";
      }
    }

    // Set line color for legend
    series.segments.template.adapter.add ("fill", (fill, target) => {
      return am4core.color (paletteColors[index]);
    });

    series.adapter.add ("stroke", (stroke, target) => {
      return am4core.color (paletteColors[index]);
    });

    // Set thresholds
    if (simpleValue && simpleValue.item.columnType === "number")
    {
      series.propertyFields.stroke = "lineColor" + series.dataFields.valueY;
      series.propertyFields.fill = "lineColor" + series.dataFields.valueY;
    }

    if (!(values.currentChartType.flags & ChartFlags.ADVANCED))
    {
      // Display a special context menu when a chart line segment is right clicked
      series.segments.template.interactionsEnabled = true;
      series.segments.template.events.on ("down", function (event) {
        if (!values.currentOption.drillDownOptions.length)
          return;

        if (!event.touch)
          return;

        values.chartClicked = true;
        values.chartObjectSelected = event.target.dataItem.component.tooltipDataItem.dataContext[values.variable.id];
        values.chartSecondaryObjectSelected = series.dataFields.valueY;
      });

      series.segments.template.events.on ("rightclick", function (event) {
        if (!values.currentOption.drillDownOptions.length)
          return;

        values.chartClicked = true;
        values.chartObjectSelected = event.target.dataItem.component.tooltipDataItem.dataContext[values.variable.id];
        values.chartSecondaryObjectSelected = series.dataFields.valueY;
      });
    }

    if (panelLoading)
      series.showOnInit = false;

    return series;
  }

  // Function to create simple vertical column chart series
  createSimpleVertColumnSeries(values, simpleValue, chart, item, parseDate, index, outputFormat, panelLoading, paletteColors): any
  {
    let series = chart.series.push (new am4charts.ColumnSeries ());

    if (simpleValue)
    {
      series.name = simpleValue.name;
      series.dataFields.valueY = simpleValue.id;
    }
    else
    {
      series.name = item.valueField;
      series.dataFields.valueY = item.valueField;
    }

    if (values.currentChartType.flags & ChartFlags.ADVANCED)
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

        if (simpleValue && simpleValue.item.columnType === "number")
          series.columns.template.tooltipText = "{dateX}: " + (simpleValue.item.prefix ? simpleValue.item.prefix : "") + "{valueY}" + (simpleValue.item.suffix ? simpleValue.item.suffix : "");
        else
          series.columns.template.tooltipText = "{dateX}: {valueY}";
      }
      else
      {
        series.dataFields.categoryX = item.titleField;

        if (simpleValue && simpleValue.item.columnType === "number")
          series.columns.template.tooltipText = "{categoryX}: " + (simpleValue.item.prefix ? simpleValue.item.prefix : "") + "{valueY}" + (simpleValue.item.suffix ? simpleValue.item.suffix : "");
        else
          series.columns.template.tooltipText = "{categoryX}: {valueY}";
      }
    }

    series.columns.template.strokeWidth = 0;

    // Set colors
    if (simpleValue && simpleValue.item.columnType === "number")
    {
      series.columns.template.adapter.add ("fill", (fill, target) => {
        if (target.dataItem)
        {
          for (let threshold of values.thresholds)
          {
            if (simpleValue.item.id == threshold.column && target.dataItem.valueY >= threshold.min && target.dataItem.valueY <= threshold.max)
              return am4core.color (threshold.color);
          }
        }

        return am4core.color (paletteColors[index]);
      });
    }

    // Display a special context menu when a chart column is right clicked
    series.columns.template.events.on ("down", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      if (!event.touch)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
      values.chartSecondaryObjectSelected = null;
    });

    series.columns.template.events.on ("rightclick", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
      values.chartSecondaryObjectSelected = null;
    });

    if (panelLoading)
      series.showOnInit = false;

    return series;
  }

  // Function to create simple horizontal column chart series
  createSimpleHorizColumnSeries(values, simpleValue, chart, item, parseDate, index, outputFormat, panelLoading, paletteColors): any
  {
    let series = chart.series.push (new am4charts.ColumnSeries ());

    if (simpleValue)
    {
      series.name = simpleValue.name;
      series.dataFields.valueX = simpleValue.id;
    }
    else
    {
      series.name = item.valueField;
      series.dataFields.valueX = item.valueField;
    }

    if (values.currentChartType.flags & ChartFlags.ADVANCED)
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

        if (simpleValue && simpleValue.item.columnType === "number")
          series.columns.template.tooltipText = "{dateY}: " + (simpleValue.item.prefix ? simpleValue.item.prefix : "") + "{valueX}" + (simpleValue.item.suffix ? simpleValue.item.suffix : "");
        else
          series.columns.template.tooltipText = "{dateY}: {valueX}";
      }
      else
      {
        series.dataFields.categoryY = item.titleField;

        if (simpleValue && simpleValue.item.columnType === "number")
          series.columns.template.tooltipText = "{categoryY}: " + (simpleValue.item.prefix ? simpleValue.item.prefix : "") + "{valueX}" + (simpleValue.item.suffix ? simpleValue.item.suffix : "");
        else
          series.columns.template.tooltipText = "{categoryY}: {valueX}";
      }
    }

    series.columns.template.strokeWidth = 0;

    if (simpleValue && simpleValue.item.columnType === "number")
    {
      series.columns.template.adapter.add ("fill", (fill, target) => {
        if (target.dataItem)
        {
          for (let threshold of values.thresholds)
          {
            if (simpleValue.item.id == threshold.column && target.dataItem.valueX >= threshold.min && target.dataItem.valueX <= threshold.max)
              return am4core.color (threshold.color);
          }
        }

        return am4core.color (paletteColors[index]);
      });
    }

    series.columns.template.events.on("down", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      if (!event.touch)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
      values.chartSecondaryObjectSelected = null;
    });

    series.columns.template.events.on ("rightclick", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
      values.chartSecondaryObjectSelected = null;
    });

    if (panelLoading)
      series.showOnInit = false;

    return series;
  }

  // Function to create pie chart series
  createPieSeries(values, stacked, chart, item, parseDate, theme, outputFormat, panelLoading, paletteColors): any
  {
    let series, colorSet;

    // Set inner radius for donut chart
    if (values.currentChartType.flags & ChartFlags.PIEHOLE)
      chart.innerRadius = am4core.percent (60);

    // Configure Pie Chart
    series = chart.series.push (new am4charts.PieSeries ());

    series.dataFields.value = item.valueField;
    series.dataFields.category = item.titleField;

    if (values.valueColumn.item.columnType === "number")
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
    colorSet.list = paletteColors.map (function (color) {
      return am4core.color (color);
    });
    series.colors = colorSet;

    // Display a special context menu when a pie slice is right clicked
    series.slices.template.events.on ("down", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      if (!event.touch)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
      values.chartSecondaryObjectSelected = null;
    });

    series.slices.template.events.on ("rightclick", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
      values.chartSecondaryObjectSelected = null;
    });

    if (panelLoading)
      series.showOnInit = false;

    return series;
  }

  // Function to create funnel chart series
  createFunnelSeries(values, stacked, chart, item, parseDate, theme, outputFormat, panelLoading, paletteColors): any
  {
    let series, colorSet;

    series = chart.series.push (new am4charts.FunnelSeries ());

    series.dataFields.value = item.valueField;
    series.dataFields.category = item.titleField;

    if (values.valueColumn.item.columnType === "number")
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
    colorSet.list = paletteColors.map (function (color) {
      return am4core.color (color);
    });
    series.colors = colorSet;

    // Display a special context menu when a funnel slice is right clicked
    series.slices.template.events.on ("down", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      if (!event.touch)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
      values.chartSecondaryObjectSelected = null;
    });

    series.slices.template.events.on ("rightclick", function (event) {
      if (!values.currentOption.drillDownOptions.length)
        return;

      values.chartClicked = true;
      values.chartObjectSelected = event.target.dataItem.dataContext[item.titleField];
      values.chartSecondaryObjectSelected = null;
    });

    if (panelLoading)
      series.showOnInit = false;

    return series;
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

  makeChart(chartInfo, panelLoading): void
  {
    let theme = this.globals.theme;

    this.removeDeadVariablesAndCategories.emit ({
      type: this.chartTypes.indexOf (this.oldChartType),
      analysisName: this.oldVariableName,
      chartSeries: this.values.chartSeries,
      controlVariables: this.oldOptionCategories
    });

    this.values.chartSeries = [];

    if (this.values.paletteColors && this.values.paletteColors.length)
      this.paletteColors = this.values.paletteColors;
    else
    {
      if (this.values.currentChartType.flags & ChartFlags.HEATMAP)
        this.paletteColors = Themes.AmCharts[theme].heatMapColor;
      else
        this.paletteColors = Themes.AmCharts[theme].resultColors;
    }

    // reset advanced chart values
    this.addUpValuesSet = false;
    this.sumValueAxis = null;
    this.sumSeriesList = [];
    this.advTableView = false;
    this.intervalTableRows = [];
    this.chartInfo = chartInfo;

    this.zone.runOutsideAngular (() => {
      let chart, options;

      am4core.options.viewportTarget = document.getElementById ("msf-dashboard-element");

      // Check chart type before generating it
      if (this.values.currentChartType.flags & ChartFlags.HEATMAP)
      {
        let chartColor, polygonSeries, polygonTemplate, hoverState;
        let minRange, maxRange, heatLegend, pow, home, zoomControl;

        chart = am4core.create ("msf-dashboard-chart-display-" + this.values.id, am4maps.MapChart);
        chartColor = am4core.color (this.paletteColors[0]);

        if (this.values.valueColumn.item.columnType === "number")
        {
          if (this.values.valueColumn.item.outputFormat)
            chart.numberFormatter.numberFormat = this.utils.convertNumberFormat (this.values.valueColumn.item.outputFormat);
          else
            chart.numberFormatter.numberFormat = this.utils.convertNumberFormat (this.values.valueColumn.item.columnFormat);
        }
        else
          chart.numberFormatter.numberFormat = "#,###.#";

        // Create map instance displaying the chosen geography data
        chart.geodata = this.values.geodata.value;
        if (this.values.geodata.value == am4geodata_usaLow)
          chart.projection = new am4maps.projections.AlbersUsa ();
        else
          chart.projection = new am4maps.projections.Miller ();

        // Add map polygons
        polygonSeries = chart.series.push (new am4maps.MapPolygonSeries ());
        polygonSeries.useGeodata = true;
        polygonSeries.mapPolygons.template.fill = chartColor;
        polygonSeries.mapPolygons.template.stroke = black;
        polygonSeries.mapPolygons.template.strokeOpacity = 0.25;
        polygonSeries.mapPolygons.template.strokeWidth = 0.5;
        polygonSeries.heatRules.push ({
          property: "fill",
          target: polygonSeries.mapPolygons.template,
          min: chartColor.brighten (0.5),
          max: chartColor.brighten (-0.5)
        });

        // Exclude Antartica if the geography data is the world
        if (chart.geodata === am4geodata_worldLow)
        {
          polygonSeries.exclude = ["AQ"];

          chart.homeGeoPoint = {
            latitude: 24.8567,
            longitude: 2.3510
          };
        }

        // Move the delta longitude a bit to the left if the geography
        // data is Asia
        if (chart.geodata === am4geodata_asiaLow)
          chart.deltaLongitude = -90;
        else
          chart.deltaLongitude = 0;

        chart.homeZoomLevel = 1;

        // Configure series tooltip
        polygonTemplate = polygonSeries.mapPolygons.template;
        polygonTemplate.tooltipText = "{name}: {value}";
        polygonTemplate.nonScalingStroke = true;
        polygonTemplate.strokeWidth = 0.5;
        hoverState = polygonTemplate.states.create ("hover");
        hoverState.properties.fill = chartColor;

        // Set the values for each polygon
        polygonSeries.data = [];

        for (let item of chart.geodata.features)
        {
          polygonSeries.data.push ({
            id: item.id,
            value: 0
          });
        }

        for (let result of chartInfo)
        {
          for (let item of polygonSeries.data)
          {
            let resultInfo = result[this.values.valueColumn.id];

            if (resultInfo == null)
              continue;

            if (item.id.includes (resultInfo))
            {
              item.value = result[this.values.variable.id];
              break;
            }
          }
        }

        // Display heat legend
        heatLegend = chart.chartContainer.createChild (am4maps.HeatLegend);
        heatLegend.valueAxis.renderer.labels.template.fill = Themes.AmCharts[theme].fontColor;
        heatLegend.series = polygonSeries;
        heatLegend.align = "right";
        heatLegend.valign = "bottom";
        heatLegend.width = am4core.percent (20);
        heatLegend.marginRight = am4core.percent (4);
        heatLegend.dx -= 10;

        // Set minimum and maximum value for the heat legend
        heatLegend.minValue = 0;
        heatLegend.maxValue = 10;

        // For the maximum value, get the highest value of the result and calculate
        // it by doing an division with the power of 10
        for (let item of polygonSeries.data)
        {
          if (heatLegend.maxValue < item.value)
            heatLegend.maxValue = item.value;
        }

        // Find the power of 10 from the maximum result
        pow = 1;
        while (pow <= heatLegend.maxValue)
          pow = (pow << 3) + (pow << 1);

        pow /= 10; // notch down one power
        heatLegend.maxValue = Math.ceil (heatLegend.maxValue / pow) * pow;

        // Set minimum and maximum values for the heat legend
        minRange = heatLegend.valueAxis.axisRanges.create ();
        minRange.value = heatLegend.minValue;
        minRange.label.text = "0";
        maxRange = heatLegend.valueAxis.axisRanges.create ();
        maxRange.value = heatLegend.maxValue;
        maxRange.label.text = "" + maxRange.value;

        // Hide internal heat legend value labels
        heatLegend.valueAxis.renderer.labels.template.adapter.add ("text",
          function (labelText) {
            return "";
          }
        );

        // Add zoom control buttons
        zoomControl = new am4maps.ZoomControl ();
        chart.zoomControl = zoomControl;
        zoomControl.slider.height = 100;
        zoomControl.valign = "top";
        zoomControl.align = "left";
        zoomControl.marginTop = 40;
        zoomControl.marginLeft = 10;
        zoomControl.plusButton.height = 26;
        zoomControl.minusButton.height = 26;

        // Add home buttom to zoom out
        home = chart.chartContainer.createChild (am4core.Button);
        home.icon = new am4core.Sprite ();
        home.icon.dx -= 9;
        home.icon.dy -= 9;
        home.width = 30;
        home.height = 30;
        home.icon.path = homeSVG;
        home.align = "left";
        home.marginLeft = 15;
        home.dy += 10;
        home.events.on ("hit", function (ev) {
          chart.goHome ();
        });

        this.oldChartType = null;
        this.oldVariableName = "";
        this.oldOptionCategories = JSON.parse (JSON.stringify (this.values.currentOptionCategories));

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

        // Set value axis to null
        this.valueAxis = null;
      }
      else if (this.values.currentChartType.flags & ChartFlags.MAP)
      {
        let polygonSeries, zoomControl, home;

        chart = am4core.create ("msf-dashboard-chart-display-" + this.values.id, am4maps.MapChart);

        // Create map instance
        chart.geodata = am4geodata_worldLow;
        chart.projection = new am4maps.projections.Miller ();

        // Add map polygons and exclude Antartica
        polygonSeries = chart.series.push (new am4maps.MapPolygonSeries ());
        polygonSeries.useGeodata = true;
        polygonSeries.exclude = ["AQ"];
        polygonSeries.mapPolygons.template.fill = Themes.AmCharts[theme].mapPolygonColor;
        polygonSeries.mapPolygons.template.stroke = Themes.AmCharts[theme].mapPolygonStroke;
        polygonSeries.mapPolygons.template.strokeOpacity = 0.25;
        polygonSeries.mapPolygons.template.strokeWidth = 0.5;

        // Set default location and zoom level
        chart.homeGeoPoint = {
          latitude: 24.8567,
          longitude: 2.3510
        };

        chart.homeZoomLevel = 1;
        chart.deltaLongitude = 0;

        // Reset checked cities and routes
        this.checkedRoutes = [];
        this.checkedCities = [];

        // Add zoom control buttons
        zoomControl = new am4maps.ZoomControl ();
        chart.zoomControl = zoomControl;
        zoomControl.slider.height = 100;
        zoomControl.valign = "top";
        zoomControl.align = "left";
        zoomControl.marginTop = 40;
        zoomControl.marginLeft = 10;
        zoomControl.plusButton.height = 26;
        zoomControl.minusButton.height = 26;

        // Add home buttom to zoom out
        home = chart.chartContainer.createChild (am4core.Button);
        home.icon = new am4core.Sprite ();
        home.icon.dx -= 9;
        home.icon.dy -= 9;
        home.width = 30;
        home.height = 30;
        home.icon.path = homeSVG;
        home.align = "left";
        home.marginLeft = 15;
        home.dy += 10;
        home.events.on ("hit", function (ev) {
          chart.goHome ();
        });

        this.oldChartType = null;
        this.oldVariableName = "";
        this.oldOptionCategories = JSON.parse (JSON.stringify (this.values.currentOptionCategories));

        // Set value axis to null
        this.valueAxis = null;

        // If the option meta data is 4 (Route Networks), add origin cities and its destinations
        if (this.values.currentOption.metaData == 4)
          this.setRouteNetworks (chart, theme);
      }
      else if (this.values.currentChartType.flags & ChartFlags.FUNNELCHART
        || this.values.currentChartType.flags & ChartFlags.PIECHART)
      {
        if (this.values.currentChartType.flags & ChartFlags.FUNNELCHART)
          chart = am4core.create ("msf-dashboard-chart-display-" + this.values.id, am4charts.SlicedChart);
        else
          chart = am4core.create ("msf-dashboard-chart-display-" + this.values.id, am4charts.PieChart);

        chart.data = chartInfo.dataProvider;

        if (this.values.valueColumn.item.columnType === "number")
        {
          if (this.values.valueColumn.item.outputFormat)
            chart.numberFormatter.numberFormat = this.utils.convertNumberFormat (this.values.valueColumn.item.outputFormat);
          else
            chart.numberFormatter.numberFormat = this.utils.convertNumberFormat (this.values.valueColumn.item.columnFormat);
        }
        else
          chart.numberFormatter.numberFormat = "#,###.#";

        // Set label font size
        chart.fontSize = 10;

        // Create the series
        this.values.chartSeries.push (this.values.currentChartType.createSeries (this.values, false, chart, chartInfo, null, theme, null, panelLoading, this.paletteColors));

        if (this.values.currentChartType.flags & ChartFlags.FUNNELCHART)
        {
          // Sort values from greatest to least on funnel chart types
          chart.events.on ("beforedatavalidated", function (event) {
            chart.data.sort (function (e1, e2) {
              return e2[chartInfo.valueField] - e1[chartInfo.valueField];
            });
          });
        }

        this.oldChartType = null;
        this.oldVariableName = "";
        this.oldOptionCategories = JSON.parse (JSON.stringify (this.values.currentOptionCategories));

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

        // Set value axis to null
        this.valueAxis = null;
      }
      else
      {
        let categoryAxis, valueAxis, parseDate, outputFormat, stacked;

        chart = am4core.create ("msf-dashboard-chart-display-" + this.values.id, am4charts.XYChart);

        if (this.values.valueColumn && !this.values.valueList)
        {
          if (this.values.valueColumn.item.columnType === "number")
          {
            if (this.values.valueColumn.item.outputFormat)
              chart.numberFormatter.numberFormat = this.utils.convertNumberFormat (this.values.valueColumn.item.outputFormat);
            else
              chart.numberFormatter.numberFormat = this.utils.convertNumberFormat (this.values.valueColumn.item.columnFormat);
          }
          else
            chart.numberFormatter.numberFormat = "#,###.#";
        }
        else
          chart.numberFormatter.numberFormat = "#,###.#"; // universal number format if there are multiple values or no values set

        // Don't parse dates if the chart is a simple version
        if (this.values.currentChartType.flags & ChartFlags.XYCHART)
        {
          chart.data = JSON.parse (JSON.stringify (chartInfo.data));
          if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
            parseDate = false;
          else
            parseDate = (this.values.xaxis.item.columnType === "date") ? true : false;
        }
        else if (!(this.values.currentChartType.flags & ChartFlags.PIECHART) && !(this.values.currentChartType.flags & ChartFlags.FUNNELCHART))
        {
          chart.data = JSON.parse (JSON.stringify (chartInfo.dataProvider));
          if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
            parseDate = false;
          else
            parseDate = (this.values.variable.item.columnType === "date") ? true : false;
        }

        if (parseDate)
        {
          if (this.values.currentChartType.flags & ChartFlags.XYCHART)
          {
            if (this.values.xaxis.item.columnFormat)
            {
              for (let data of chart.data)
                data[this.values.xaxis.id] = this.parseDate (data[this.values.xaxis.id], this.values.xaxis.item.columnFormat);

              if (this.values.xaxis.item.outputFormat)
                outputFormat = this.values.xaxis.item.outputFormat;
              else
                outputFormat = this.values.xaxis.item.columnFormat;

              // Set predefined format if used
              if (this.predefinedColumnFormats[outputFormat])
                outputFormat = this.predefinedColumnFormats[outputFormat];
            }
            else
              parseDate = false;
          }
          else if (!(this.values.currentChartType.flags & ChartFlags.PIECHART) && !(this.values.currentChartType.flags & ChartFlags.FUNNELCHART))
          {
            if (this.values.variable.item.columnFormat)
            {
              for (let data of chart.data)
                data[this.values.variable.id] = this.parseDate (data[this.values.variable.id], this.values.variable.item.columnFormat);

              if (this.values.variable.item.outputFormat)
                outputFormat = this.values.variable.item.outputFormat;
              else
                outputFormat = this.values.variable.item.columnFormat;

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

            categoryAxis.periodChangeDateFormats.setKey ("month", outputFormat);
            categoryAxis.periodChangeDateFormats.setKey ("day", outputFormat);
            categoryAxis.periodChangeDateFormats.setKey ("week", outputFormat);
            categoryAxis.periodChangeDateFormats.setKey ("year", outputFormat);
          }
          else
          {
            categoryAxis = chart.yAxes.push (new am4charts.CategoryAxis ());
            categoryAxis.renderer.minGridDistance = 15;
            categoryAxis.renderer.labels.template.maxWidth = 160;
          }

          valueAxis = chart.xAxes.push (new am4charts.ValueAxis ());

          if (this.values.startAtZero)
            valueAxis.min = 0;

          // Add scrollbar into the chart for zooming if there are multiple series
          if (chart.data.length > 1 && !this.isMobile)
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

          if (chart.data.length > 1 && !this.isMobile)
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

        // Set axis tooltip background color depending of the theme
        valueAxis.tooltip.label.fill = Themes.AmCharts[theme].axisTooltipFontColor;
        valueAxis.tooltip.background.fill = Themes.AmCharts[theme].tooltipFill;
        categoryAxis.tooltip.label.fill = Themes.AmCharts[theme].axisTooltipFontColor;
        categoryAxis.tooltip.background.fill = Themes.AmCharts[theme].tooltipFill;

        if (this.values.currentChartType.flags & ChartFlags.XYCHART)
        {
          if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
          {
            if (!(this.values.currentChartType.flags & ChartFlags.ROTATED))
            {
              if (this.values.horizAxisName && this.values.horizAxisName != "")
                categoryAxis.title.text = this.values.horizAxisName;
              else
                categoryAxis.title.text = "Intervals";
    
              if (this.values.vertAxisName && this.values.vertAxisName != "")
                valueAxis.title.text = this.values.vertAxisName;
              else
              {
                if (this.values.valueColumn)
                  valueAxis.title.text = this.values.valueColumn.name;
                else
                  valueAxis.title.text = "Count";
              }
            }
            else
            {
              if (this.values.vertAxisName && this.values.vertAxisName != "")
                categoryAxis.title.text = this.values.vertAxisName;
              else
                categoryAxis.title.text = "Intervals";
    
              if (this.values.horizAxisName && this.values.horizAxisName != "")
                valueAxis.title.text = this.values.horizAxisName;
              else
              {
                if (this.values.valueColumn)
                  valueAxis.title.text = this.values.valueColumn.name;
                else
                  valueAxis.title.text = "Count";
              }
            }

            categoryAxis.dataFields.category = "Interval";
          }
          else
          {
            // Set axis name into the chart
            if (!(this.values.currentChartType.flags & ChartFlags.ROTATED))
            {
              if (this.values.horizAxisName && this.values.horizAxisName != "")
                categoryAxis.title.text = this.values.horizAxisName;
              else
                categoryAxis.title.text = this.values.xaxis.name;
    
              if (this.values.vertAxisName && this.values.vertAxisName != "")
                valueAxis.title.text = this.values.vertAxisName;
              else
              {
                if (this.values.valueColumn)
                  valueAxis.title.text = this.values.valueColumn.name;
                else
                  valueAxis.title.text = "Count";
              }
            }
            else
            {
              if (this.values.vertAxisName && this.values.vertAxisName != "")
                categoryAxis.title.text = this.values.vertAxisName;
              else
                categoryAxis.title.text = this.values.xaxis.name;
    
              if (this.values.horizAxisName && this.values.horizAxisName != "")
                valueAxis.title.text = this.values.horizAxisName;
              else
              {
                if (this.values.valueColumn)
                  valueAxis.title.text = this.values.valueColumn.name;
                else
                  valueAxis.title.text = "Count";
              }
            }

            // The category will be the x axis if the chart type has it
            categoryAxis.dataFields.category = this.values.xaxis.id;
          }

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

          if (this.values.ordered && !(this.values.currentChartType.flags & ChartFlags.ADVANCED))
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
            if (this.values.variable.item.columnType === "date")
            {
              let date = this.parseDate (object.valueAxis, this.values.variable.item.columnFormat);
              let legendOutputFormat;

              if (this.values.variable.item.outputFormat)
                legendOutputFormat = this.values.variable.item.outputFormat;
              else
                legendOutputFormat = this.values.variable.item.columnFormat;

              // Set predefined format if used
              if (this.predefinedColumnFormats[legendOutputFormat])
                legendOutputFormat = this.predefinedColumnFormats[legendOutputFormat];

              object.valueAxis = new DatePipe ('en-US').transform (date.toString (), legendOutputFormat);
            }

            this.values.chartSeries.push (this.values.currentChartType.createSeries (this.values, stacked, chart, object, parseDate, theme, outputFormat, panelLoading, this.paletteColors));
          }
        }
        else
        {
          if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
          {
            if (!(this.values.currentChartType.flags & ChartFlags.ROTATED))
            {
              if (this.values.horizAxisName && this.values.horizAxisName != "")
                categoryAxis.title.text = this.values.horizAxisName;
              else
                categoryAxis.title.text = "Intervals";

              if (this.values.vertAxisName && this.values.vertAxisName != "")
                valueAxis.title.text = this.values.vertAxisName;
              else
              {
                if (this.values.valueColumn)
                  valueAxis.title.text = this.values.valueColumn.name;
                else
                  valueAxis.title.text = "Count";
              }
            }
            else
            {
              if (this.values.vertAxisName && this.values.vertAxisName != "")
                categoryAxis.title.text = this.values.vertAxisName;
              else
                categoryAxis.title.text = "Intervals";
  
              if (this.values.horizAxisName && this.values.horizAxisName != "")
                valueAxis.title.text = this.values.horizAxisName;
              else
              {
                if (this.values.valueColumn)
                  valueAxis.title.text = this.values.valueColumn.name;
                else
                  valueAxis.title.text = "Count";
              }
            }
          }
          else
          {
            if (!(this.values.currentChartType.flags & ChartFlags.ROTATED))
            {
              if (this.values.horizAxisName && this.values.horizAxisName != "")
                categoryAxis.title.text = this.values.horizAxisName;
              else
                categoryAxis.title.text = this.values.variable.name;

              if (this.values.vertAxisName && this.values.vertAxisName != "")
                valueAxis.title.text = this.values.vertAxisName;
              else
              {
                if (this.values.valueList && this.values.valueList.length == 1)
                  valueAxis.title.text = this.values.valueList[0].name;
                else if (this.values.valueColumn && !this.values.valueList)
                  valueAxis.title.text = this.values.valueColumn.name;
                else
                  valueAxis.title.text = this.values.function.name;
              }
            }
            else
            {
              if (this.values.vertAxisName && this.values.vertAxisName != "")
                categoryAxis.title.text = this.values.vertAxisName;
              else
                categoryAxis.title.text = this.values.variable.name;
  
              if (this.values.horizAxisName && this.values.horizAxisName != "")
                valueAxis.title.text = this.values.horizAxisName;
              else
              {
                if (this.values.valueList && this.values.valueList.length == 1)
                  valueAxis.title.text = this.values.valueList[0].name;
                else if (this.values.valueColumn && !this.values.valueList)
                  valueAxis.title.text = this.values.valueColumn.name;
                else
                  valueAxis.title.text = this.values.function.name;
              }
            }

            if (this.values.ordered && !(this.values.currentChartType.flags & ChartFlags.ADVANCED))
            {
              if (this.values.valueList && this.values.valueList.length > 1)
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
            }
          }

          // The category will the values if the chart type lacks an x axis
          categoryAxis.dataFields.category = chartInfo.titleField;

          // Create the series
          if (this.values.valueList && this.values.valueList.length > 1)
          {
            for (let i = 0; i < chartInfo.valueFields.length; i++)
            {
              let curValue = chartInfo.valueFields[i];

              // Get value name for the legend
              for (let item of this.values.chartColumnOptions)
              {
                if (item.id === chartInfo.valueFields[i])
                {
                  curValue = item;
                  break;
                }
              }

              if (this.isSimpleChart () && this.values.currentChartType.flags & ChartFlags.LINECHART)
              {
                // set line color depending of the threshold
                for (let data of chart.data)
                {
                  let lineColor = am4core.color (this.paletteColors[i]);
                  let value = data[chartInfo.valueFields[i]];

                  for (let threshold of this.values.thresholds)
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

              this.values.chartSeries.push (this.values.currentChartType.createSeries (this.values, curValue, chart, chartInfo, parseDate, i, outputFormat, panelLoading, this.paletteColors));
            }
          }
          else
          {
            let curValue = null;

            for (let item of this.values.chartColumnOptions)
            {
              if (item.id === chartInfo.valueField)
              {
                curValue = item;
                break;
              }
            }

            if (this.isSimpleChart () && this.values.currentChartType.flags & ChartFlags.LINECHART)
            {
              // set line color depending of the threshold
              for (let data of chart.data)
              {
                let lineColor = am4core.color (this.paletteColors[0]);
                let value = data[chartInfo.valueField];

                for (let threshold of this.values.thresholds)
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

            this.values.chartSeries.push (this.values.currentChartType.createSeries (this.values, curValue, chart, chartInfo, parseDate, 0, outputFormat, panelLoading, this.paletteColors));
          }
        }

        // Add cursor if the chart type is line, area or stacked area
        if (this.values.currentChartType.flags & ChartFlags.LINECHART)
          chart.cursor = new am4charts.XYCursor ();

        // Create axis ranges if available
        if (this.values.goals && this.values.goals.length)
        {
          for (let goal of this.values.goals)
          {
            let range = valueAxis.axisRanges.create ();

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

        this.oldChartType = this.values.currentChartType;
        this.oldVariableName = !this.values.variable ? "" : this.values.variable.name;
        this.oldOptionCategories = JSON.parse (JSON.stringify (this.values.currentOptionCategories));

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

        // Save value axis
        this.valueAxis = valueAxis;
      }

      if (this.values.currentChartType.flags & ChartFlags.XYCHART
        || (this.isSimpleChart () && this.values.valueList && this.values.valueList.length > 1))
      {
        // Display Legend
        chart.legend = new am4charts.Legend ();
        chart.legend.markers.template.width = 15;
        chart.legend.markers.template.height = 15;
        chart.legend.labels.template.fontSize = 10;
        chart.legend.labels.template.fill = Themes.AmCharts[theme].fontColor;
      }

      // Add variable and categories into the dashboard control panel if they are not added
      this.addNewVariablesAndCategories.emit ({
        type: this.chartTypes.indexOf (this.values.currentChartType),
        analysisName: !this.values.variable ? null : this.values.variable.name,
        controlVariables: this.values.currentOptionCategories,
        chartSeries: this.values.chartSeries,
        optionId: this.values.currentOption.id
      });

      chart.tapToActivate = true;

      this.chart = chart;

      am4core.options.viewportTarget = null;

      // build interval table for advanced charts
      if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
      {
        let sum = 0;

        if (this.values.currentChartType.flags & ChartFlags.XYCHART)
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

            sum += item[this.values.valueColumn.id];

            this.intervalTableRows.push ({
              key: null,
              Interval: label,
              value: item[this.values.valueColumn.id],
              sum: sum
            });
          }
        }
      }
    });
  }

  destroyChart(): void
  {
    if (this.chart)
    {
      this.zone.runOutsideAngular (() => {
        this.imageSeries = null;
        this.lineSeries = null;
        this.shadowLineSeries = null;
        this.chart.dispose ();
      });
    }
  }

  ngAfterViewInit(): void
  {
    this.msfTableRef.tableOptions = this;

    if (this.dialogData)
      return; // ignore ngAfterViewInit on the dialog version

    if ((this.values.currentChartType.flags & ChartFlags.TABLE)
      || (this.values.currentChartType.flags & ChartFlags.MAPBOX)
      || (this.values.currentChartType.flags & ChartFlags.DYNTABLE))
    {
      if (this.values.function != null && this.values.function != -1)
        this.values.function = -1;
    }
    else if (!this.utils.isJSONEmpty (this.values.lastestResponse))
    {
      if (!this.isResponseValid ())
        return;

      if (this.values.currentChartType.flags & ChartFlags.INFO)
      {
        if (this.values.function != null && this.values.function != -1)
        {
          if (this.values.function == 1)
          {
            if (this.values.currentChartType.flags & ChartFlags.PICTURE)
              this.values.picGenerated = true;
            else if (this.values.currentChartType.flags & ChartFlags.FORM)
              this.values.formGenerated = true;
            else
              this.values.infoGenerated = true;
          }

          this.values.function = -1;
        }
      }
      else
      {
        this.values.chartGenerated = true;
        this.makeChart (this.values.lastestResponse, true);
      }
    }

    // set anchored control variables
    this.configureAnchoredControlVariables ();
  }

  ngAfterContentInit(): void
  {
    if (this.dialogData)
    {
      if (this.values.currentOption)
        this.variableCtrlBtnEnabled = true;

      this.checkChartType ();
      return; // ignore ngAfterContentInit on the dialog version
    }

    // these parts must be here because it generate an error if inserted on ngAfterViewInit
    this.initPanelSettings ();

    if ((this.values.currentChartType.flags & ChartFlags.TABLE)
      || (this.values.currentChartType.flags & ChartFlags.MAPBOX)
      || (this.values.currentChartType.flags & ChartFlags.DYNTABLE))
    {
      if (this.values.function == 1)
      {
        setTimeout (() =>
        {
          this.controlVariablesSet = true;
          this.loadData ();
        }, 100);
      }
    }
    else if (!this.utils.isJSONEmpty (this.values.lastestResponse))
    {
      if (!this.isResponseValid ())
        return;

      if (this.values.currentChartType.flags & ChartFlags.INFO)
      {
        if (this.values.function == 1)
        {
          setTimeout (() =>
          {
            this.values.chartSeries = [];

            // add the control variables into the control panel
            this.addNewVariablesAndCategories.emit ({
              type: this.chartTypes.indexOf (this.values.currentChartType),
              analysisName: null,
              controlVariables: this.values.currentOptionCategories,
              chartSeries: this.values.chartSeries,
              optionId: this.values.currentOption ? this.values.currentOption.id : null
            });

            this.oldChartType = null;
            this.oldVariableName = "";
            this.oldOptionCategories = JSON.parse (JSON.stringify (this.values.currentOptionCategories));
          }, 100);

          this.controlVariablesSet = true;

          if (this.values.currentChartType.flags & ChartFlags.PICTURE)
            this.values.displayPic = true;
          else if (this.values.currentChartType.flags & ChartFlags.FORM)
            this.values.displayForm = true;
          else
            this.values.displayInfo = true;
        }
      }
      else
      {
        this.controlVariablesSet = true;
        this.values.displayChart = true;
      }

      this.startUpdateInterval ();
    }
  }

  private filterVariables(filterCtrl): void
  {
    if (!this.values.chartColumnOptions)
      return;

    // get the search keyword
    let search = filterCtrl.value;
    if (!search)
    {
      this.filteredVariables.next (this.values.chartColumnOptions.slice ());
      return;
    }

    search = search.toLowerCase ();
    this.filteredVariables.next (
      this.values.chartColumnOptions.filter (a => a.name.toLowerCase ().indexOf (search) > -1)
    );
  }

  private filterOptions(filterCtrl): void
  {
    if (!this.values.options)
      return;

    // get the search keyword
    let search = filterCtrl.value;
    if (!search)
    {
      this.filteredOptions.next (this.values.options.slice ());
      return;
    }

    search = search.toLowerCase ();
    this.filteredOptions.next (
      this.values.options.filter (a => a.nameSearch.toLowerCase ().indexOf (search) > -1)
    );
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
      if (this.values.currentChartType.flags & ChartFlags.TABLE || this.values.currentChartType.flags & ChartFlags.DYNTABLE)
        return true; // tables must not check this!
      else if (this.values.currentChartType.flags & ChartFlags.INFO)
      {
        if (this.values.currentChartType.flags & ChartFlags.FORM)
        {
          for (let formVariable of this.values.formVariables)
          {
            if (formVariable.column.item.grouping && !this.checkGroupingValue (formVariable.column.item.columnName, argument.value1))
              return false;
          }
        }
        else if (!(this.values.currentChartType.flags & ChartFlags.PICTURE))
        {
          if (this.values.infoVar1 != null && this.values.infoVar1.grouping)
            return false;

          if (this.values.infoVar2 != null && this.values.infoVar2.grouping)
            return false;

          if (this.values.infoVar3 != null && this.values.infoVar3.grouping)
            return false;
        }
      }
      else if (!(this.values.currentChartType.flags & ChartFlags.MAP))
      {
        if (this.values.variable.item.grouping && !this.checkGroupingValue (this.values.variable.item.columnName, argument.value1))
          return false;

        if (this.values.currentChartType.flags & ChartFlags.XYCHART)
        {
          if (this.values.xaxis.item.grouping && !this.checkGroupingValue (this.values.xaxis.item.columnName, argument.value1))
            return false;
        }

        if (this.isSimpleChart ())
        {
          let valuesWithNoGroup = 0;

          for (let value of this.values.valueList)
          {
            if (value.item.grouping && !this.checkGroupingValue (value.item.columnName, argument.value1))
              valuesWithNoGroup++;
          }

          if (valuesWithNoGroup == this.values.valueList.length)
            return false;
        }
        else
        {
          if (this.values.valueColumn.item.grouping && !this.checkGroupingValue (this.values.valueColumn.item.columnName, argument.value1))
            return false;
        }
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
    let currentOptionCategories;
    let params;

    if (this.tempOptionCategories)
      currentOptionCategories = this.tempOptionCategories;
    else
      currentOptionCategories = this.values.currentOptionCategories;

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

  // return current panel information into a JSON for a http message body
  //
  // panels that only displays information will reuse some values from the database
  // for simplicity reasons: analysis, xaxis and values will store the data type used
  // for variables #1, #2 and #3 respectively; function will be used to check if the
  // results are generated or not and lastestResponse will store all the functions
  // values and results (if it was generated)
  getPanelInfo(): any
  {
    if (this.values.currentChartType.flags & ChartFlags.HEATMAP)
    {
      return {
        id: this.values.id,
        option: this.values.currentOption,
        title: this.values.chartName,
        description: this.values.chartDescription,
        chartType: this.chartTypes.indexOf (this.values.currentChartType),
        categoryOptions: this.values.currentOptionCategories ? JSON.stringify (this.values.currentOptionCategories) : null,
        function: this.geodatas.indexOf (this.values.geodata),
        updateTimeInterval: (this.values.updateIntervalSwitch ? this.values.updateTimeLeft : 0),
        analysis: this.values.chartColumnOptions ? (this.values.variable ? this.values.variable.item.id : null) : null,
        values: this.values.chartColumnOptions ? (this.values.valueColumn ? this.values.valueColumn.item.id : null) : null,
        paletteColors: JSON.stringify (this.values.paletteColors),
        lastestResponse: JSON.stringify (this.values.lastestResponse),
        thresholds: JSON.stringify (this.values.thresholds),
        goals: null,
        startAtZero: null,
        limitMode: null,
        limitAmount: null,
        ordered: null,
        valueList: null,
        minValueRange: null,
        maxValueRange: null
      };
    }
    else if (this.values.currentChartType.flags & ChartFlags.MAPBOX)
    {
      return {
        id: this.values.id,
        option: this.values.currentOption,
        title: this.values.chartName,
        description: this.values.chartDescription,
        chartType: this.chartTypes.indexOf (this.values.currentChartType),
        categoryOptions: this.values.currentOptionCategories ? JSON.stringify (this.values.currentOptionCategories) : null,
        updateTimeInterval: (this.values.updateIntervalSwitch ? this.values.updateTimeLeft : 0),
        function: 1,
        lastestResponse: JSON.stringify (this.values.lastestResponse),
        analysis: this.msfMapRef.mapTypes.indexOf (this.values.style),
        startAtZero: null,
        limitMode: null,
        limitAmount: null,
        ordered: null,
        valueList: null,
        minValueRange: null,
        maxValueRange: null
      };
    }
    else if (this.values.currentChartType.flags & ChartFlags.FORM
      || this.values.currentChartType.flags & ChartFlags.PICTURE
      || this.values.currentChartType.flags & ChartFlags.TABLE
      || this.values.currentChartType.flags & ChartFlags.DYNTABLE
      || this.values.currentChartType.flags & ChartFlags.MAP)
    {
      return {
        id: this.values.id,
        option: this.values.currentOption,
        title: this.values.chartName,
        description: this.values.chartDescription,
        chartType: this.chartTypes.indexOf (this.values.currentChartType),
        categoryOptions: this.values.currentOptionCategories ? JSON.stringify (this.values.currentOptionCategories) : null,
        updateTimeInterval: (this.values.updateIntervalSwitch ? this.values.updateTimeLeft : 0),
        thresholds: (this.values.currentChartType.flags & ChartFlags.FORM || this.values.currentChartType.flags & ChartFlags.TABLE) ? JSON.stringify (this.values.thresholds) : null,
        goals: null,
        function: 1,
        lastestResponse: JSON.stringify (this.values.lastestResponse),
        startAtZero: null,
        limitMode: null,
        limitAmount: null,
        ordered: null,
        valueList: null,
        minValueRange: null,
        maxValueRange: null
      };
    }
    else if (this.values.currentChartType.flags & ChartFlags.INFO)
    {
      return {
        id: this.values.id,
        option: this.values.currentOption,
        title: this.values.chartName,
        description: this.values.chartDescription,
        analysis: this.values.chartColumnOptions ? (this.values.infoVar1 ? this.values.infoVar1.item.id : null) : null,
        xaxis: this.values.chartColumnOptions ? (this.values.infoVar2 ? this.values.infoVar2.item.id : null) : null,
        values: this.values.chartColumnOptions ? (this.values.infoVar3 ? this.values.infoVar3.item.id : null) : null,
        function: 1,
        chartType: this.chartTypes.indexOf (this.values.currentChartType),
        categoryOptions: this.values.currentOptionCategories ? JSON.stringify (this.values.currentOptionCategories) : null,
        updateTimeInterval: (this.values.updateIntervalSwitch ? this.values.updateTimeLeft : 0),
        startAtZero: null,
        limitMode: null,
        limitAmount: null,
        ordered: null,
        valueList: null,
        minValueRange: null,
        maxValueRange: null
      };
    }
    else if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
    {
      return {
        id: this.values.id,
        option: this.values.currentOption,
        title: this.values.chartName,
        description: this.values.chartDescription,
        analysis: this.values.chartColumnOptions ? (this.values.variable ? this.values.variable.item.id : null) : null,
        values: this.values.chartColumnOptions ? (this.values.valueColumn ? this.values.valueColumn.item.id : null) : null,
        function: this.values.intervalType === 'ncile' ? 0 : 1,
        chartType: this.chartTypes.indexOf (this.values.currentChartType),
        categoryOptions: this.values.currentOptionCategories ? JSON.stringify (this.values.currentOptionCategories) : null,
        paletteColors: JSON.stringify (this.values.paletteColors),
        updateTimeInterval: (this.values.updateIntervalSwitch ? this.values.updateTimeLeft : 0),
        vertAxisName: this.values.vertAxisName,
        horizAxisName: this.values.horizAxisName,
        advIntervalValue: this.values.intValue,
        startAtZero: null,
        limitMode: null,
        limitAmount: null,
        ordered: null,
        valueList: null,
        minValueRange: this.values.minValueRange,
        maxValueRange: this.values.maxValueRange,
        variableName: this.values.chartColumnOptions ? (this.values.variable ? this.values.variable.id : null) : null,
        valueName: this.values.chartColumnOptions ? (this.values.valueColumn ? this.values.valueColumn.id : null) : null,
        functionName: "advby" + this.values.intervalType
      };
    }
    else
    {
      return {
        id: this.values.id,
        option: this.values.currentOption,
        title: this.values.chartName,
        description: this.values.chartDescription,
        analysis: this.values.chartColumnOptions ? (this.values.variable ? this.values.variable.item.id : null) : null,
        xaxis: this.values.chartColumnOptions ? (this.values.xaxis ? this.values.xaxis.item.id : null) : null,
        values: this.values.chartColumnOptions ? (this.values.valueColumn ? this.values.valueColumn.item.id : null) : null,
        function: this.functions.indexOf (this.values.function),
        chartType: this.chartTypes.indexOf (this.values.currentChartType),
        categoryOptions: this.values.currentOptionCategories ? JSON.stringify (this.values.currentOptionCategories) : null,
        paletteColors: JSON.stringify (this.values.paletteColors),
        updateTimeInterval: (this.values.updateIntervalSwitch ? this.values.updateTimeLeft : 0),
        thresholds: (this.isSimpleChart () ? JSON.stringify (this.values.thresholds) : null),
        goals: JSON.stringify (this.values.goals),
        vertAxisName: this.values.vertAxisName,
        horizAxisName: this.values.horizAxisName,
        startAtZero: this.values.startAtZero,
        limitMode: this.values.limitMode,
        limitAmount: this.values.limitAmount,
        ordered: this.values.ordered,
        valueList: this.generateValueList (),
        minValueRange: null,
        maxValueRange: null,
        variableName: this.values.chartColumnOptions ? (this.values.variable ? this.values.variable.id : null) : null,
        xaxisName: this.values.chartColumnOptions ? (this.values.xaxis ? this.values.xaxis.id : null) : null,
        valueName: this.values.chartColumnOptions ? ((this.values.valueColumn && !this.isSimpleChart ()) ? this.values.valueColumn.id : null) : null,
        functionName: this.values.function.id,
        valueNameList: this.generateValueNameList ()
      };
    }
  }

  loadTextSummary(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg, panel, variables;

    this.values.isLoading = true;
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

    // Prepare list of variables
    variables = [];

    for (let i = 0; i < this.values.infoNumVariables; i++)
    {
      let infoVar, infoFunc;

      switch (i)
      {
        case 2:
          infoVar = this.values.infoVar3;
          infoFunc = this.values.infoFunc3;
          break;

        case 1:
          infoVar = this.values.infoVar2;
          infoFunc = this.values.infoFunc2;
          break;

        default:
          infoVar = this.values.infoVar1;
          infoFunc = this.values.infoFunc1;
          break;
      }

      for (let j = 0; j < 5; j++)
      {
        let funcShortName = ['Avg ', 'Sum ', 'Min ', 'Max ', 'Count '];

        if (!infoFunc[j].checked)
          continue;

        variables.push ({
          id : i,
          function : infoFunc[j].id,
          title : (infoFunc[j].title && infoFunc[j].title != "") ? infoFunc[j].title : (funcShortName[j] + infoVar.name),
          measure : infoFunc[j].measure,
          column : infoVar.id
        });
      }
    }

    // set panel info for the HTTP message body
    panel = this.getPanelInfo ();
    panel.paletteColors = JSON.stringify (variables); // store the variables into the paletteColors for temporary use

    if (isDevMode ())
      console.log (urlArg);

    if (this.public)
      url = this.service.host + "/getTextSummaryResponse?url=" + urlArg;
    else
      url = this.service.host + "/secure/getTextSummaryResponse?url=" + urlArg;

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;
  
    this.authService.post (this, url, panel, handlerSuccess, handlerError);
  }

  loadChartData(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg, panel;

    // set panel info for the HTTP message body
    panel = this.getPanelInfo ();
    this.values.isLoading = true;

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


    if (this.public)
      url = this.service.host + "/getChartData?url=" + urlArg + "&optionId=" + this.values.currentOption.id;
    else
      url = this.service.host + "/secure/getChartData?url=" + urlArg + "&optionId=" + this.values.currentOption.id;

    if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
    {
      if (this.values.currentChartType.flags & ChartFlags.XYCHART)
        url += "&chartType=advancedbar";
      else
        url += "&chartType=simpleadvancedbar";
    }
    else
    {
      // don't use the xaxis parameter if the chart type is pie, donut or radar
      if (this.values.currentChartType.flags & ChartFlags.PIECHART || this.values.currentChartType.flags & ChartFlags.FUNNELCHART)
        url += "&chartType=pie";
      else if (!(this.values.currentChartType.flags & ChartFlags.XYCHART))
        url += "&chartType=simplebar";
    }

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    url += "&saveResults=1";

    this.authService.post (this, url, panel, handlerSuccess, handlerError);
  }

  loadMapData(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg;

    this.values.isLoading = true;
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

    if (this.public)
      url = this.service.host + "/consumeWebServices?url=" + urlArg + "&optionId=" + this.values.currentOption.id;
    else
      url = this.service.host + "/secure/consumeWebServices?url=" + urlArg + "&optionId=" + this.values.currentOption.id;

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    this.authService.get (this, url, handlerSuccess, handlerError);
  }

  loadMapboxData(handlerSuccess, handlerError): void
  {
    let params, url, urlArg;

    this.values.isLoading = true;
    this.values.displayMapbox = true;
    this.msfMapRef.data = [];
    this.msfMapRef.coordinates = [];
 
    params = this.getParameters ();
    url = this.globals.baseUrl2 + "/getMapBoxTracking?" + params;
    urlArg = encodeURIComponent (url);

    if (isDevMode ())
      console.log (url);

    if (this.public)
      url = this.service.host + "/consumeWebServices?url=" + urlArg + "&optionId=" + this.values.currentOption.id + "&noXml=true";
    else
      url = this.service.host + "/secure/consumeWebServices?url=" + urlArg + "&optionId=" + this.values.currentOption.id + "&noXml=true";

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    this.authService.get (this.msfMapRef, url, handlerSuccess, handlerError);
  }

  loadFormData(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg, formConfig;

    this.values.isLoading = true;
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

    if (this.public)
      url = this.service.host + "/getFormResponse?url=" + urlArg + "&optionId=" + this.values.currentOption.id;
    else
      url = this.service.host + "/secure/getFormResponse?url=" + urlArg + "&optionId=" + this.values.currentOption.id;

    // Prepare the form configuration
    formConfig = [];

    for (let formVariable of this.values.formVariables)
    {
      formConfig.push ({
        function : formVariable.function.id,
        column : formVariable.column.id
      });
    }

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    this.authService.post (this, url, formConfig, handlerSuccess, handlerError);
  }

  loadTableData(moreResults, handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg;

    this.msfTableRef.displayedColumns = [];
  
    if (moreResults)
    {      
      if(this.pageIndex){
        this.actualPageNumber = this.pageIndex.pageIndex;
        this.moreResults = true;
      }else{
        this.actualPageNumber++;
      }
    }
    else{
      this.actualPageNumber = 0;
      // this.authService.removeTokenResultTable();
      this.values.tokenResultTable = "";
    }

    if (!this.actualPageNumber)
      this.msfTableRef.dataSource = null;

    this.values.isLoading = true;

    this.msfTableRef.actualPageNumber = this.actualPageNumber;
    // this.authService.removeTokenResultTable(); // para que cada vez que ejecute un dashboard trabaje con un token nuevo
    let tokenResultTable = this.values.tokenResultTable;
    
    if (this.globals.currentApplication.name === "DataLake")
    {
      if (this.getParameters ())
        urlBase = this.values.currentOption.baseUrl + "?uName=" + this.globals.userName + "&" + this.getParameters ();
      else
        urlBase = this.values.currentOption.baseUrl + "?uName=" + this.globals.userName;
    }
    else
      urlBase = this.values.currentOption.baseUrl + "?" + this.getParameters ();

    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=" + Globals.TABLE_PAGESIZE + "&page_number=" + this.actualPageNumber+"&token="+tokenResultTable+"&sortingColumns=" + this.values.ListSortingColumns;
    urlArg = encodeURIComponent (urlBase);

    if (isDevMode ())
      console.log (urlBase);

    if (this.public)
      url = this.service.host + "/consumeWebServices?url=" + urlArg + "&optionId=" + this.values.currentOption.id;
    else
      url = this.service.host + "/secure/consumeWebServices?url=" + urlArg + "&optionId=" + this.values.currentOption.id;

    for (let tableVariable of this.values.tableVariables)
    {
      if (tableVariable.checked)
        url += "&metaDataIds=" + tableVariable.itemId;
    }

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    this.authService.get (this.msfTableRef, url, handlerSuccess, handlerError);
  }

  loadDynamicTableData(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg, data;

    this.values.isLoading = true;
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

    data = { variables: this.values.dynTableVariables, values: this.values.dynTableValues };

    if (this.public)
      url = this.service.host + "/getHorizontalMatrix?url=" + urlArg + "&optionId=" + this.values.currentOption.id;
    else
      url = this.service.host + "/secure/getHorizontalMatrix?url=" + urlArg + "&optionId=" + this.values.currentOption.id;

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    this.authService.post (this, url, data, handlerSuccess, handlerError);
  }

  loadData(): void
  {
    // on advanced charts, check if the value selected is a number type
    if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
    {
      if (this.values.valueColumn.item.columnType !== "number")
      {
        this.dialog.open (MessageComponent, {
          data: { title: "Error", message: "Only numeric value types are allowed for aggregation value." }
        });

        return;
      }
    }

    if (this.dialogData)
    {
      this.dialogRef.close ({ generateChart: true });
      return;
    }

    this.globals.startTimestamp = new Date ();

    // check if any variable that requires grouping are in configure properly
    /*if (!this.checkPanelVariables ())
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "Some variables used to get the results must be added in the grouping inside the control variables." }
      });

      return;
    }*/

    if (this.values.currentChartType.flags & ChartFlags.MAPBOX)
      this.loadMapboxData (this.msfMapRef.successHandler, this.msfMapRef.errorHandler);
    else if (this.values.currentChartType.flags & ChartFlags.HEATMAP)
      this.loadMapData (this.handlerHeatMapSuccess, this.handlerHeatMapError);
    else if (this.values.currentChartType.flags & ChartFlags.MAP)
      this.loadMapData (this.handlerMapSuccess, this.handlerMapError);
    else if (this.values.currentChartType.flags & ChartFlags.DYNTABLE)
      this.loadDynamicTableData (this.handlerDynTableSuccess, this.handlerDynTableError);
    else if (this.values.currentChartType.flags & ChartFlags.TABLE)
      this.loadTableData (false, this.msfTableRef.handlerSuccess, this.msfTableRef.handlerError);
    else if (this.values.currentChartType.flags & ChartFlags.PICTURE)
      this.loadPicData ();
    else if (this.values.currentChartType.flags & ChartFlags.FORM)
      this.loadFormData (this.handlerFormSuccess, this.handlerFormError);
    else if (this.values.currentChartType.flags & ChartFlags.INFO)
      this.loadTextSummary (this.handlerTextSuccess, this.handlerTextError);
    else
      this.loadChartData (this.handlerChartSuccess, this.handlerChartError);
  }

  ngOnDestroy()
  {
    this._onDestroy.next ();
    this._onDestroy.complete ();

    if (this.dialogData)
      return; // ignore the rest of ngOnDestroy on the dialog version

    clearInterval (this.updateInterval);

    this.destroyChart ();
  }

  isResponseValid(): boolean
  {
    if (this.values.currentChartType.flags & ChartFlags.MAP
      || this.values.currentChartType.flags & ChartFlags.HEATMAP)
    {
      if (this.utils.isJSONEmpty (this.values.lastestResponse))
        return false;
    }
    else if (this.values.currentChartType.flags & ChartFlags.INFO)
    {
      if (this.values.currentChartType.flags & ChartFlags.FORM)
      {
        if (!this.values.lastestResponse.length)
          return false;
      }
      else if (this.values.currentChartType.flags & ChartFlags.PICTURE)
      {
        if (!this.values.urlImg || (this.values.urlImg && !this.values.urlImg.length))
          return false;
      }
      else
      {
        if (!this.haveDataInfo (this.values.lastestResponse))
          return false;
      }
    }
    else
    {
      if (this.values.currentChartType.flags & ChartFlags.XYCHART && this.utils.isJSONEmpty (this.values.lastestResponse.data))
        return false;

      if ((!(this.values.currentChartType.flags & ChartFlags.XYCHART) && this.values.lastestResponse.dataProvider == null) ||
        (this.values.currentChartType.flags & ChartFlags.XYCHART && !this.values.lastestResponse.filter))
        return false;
    }

    return true;
  }

  noDataFound(): void
  {
    this.values.lastestResponse = null;
    this.values.chartGenerated = false;
    this.values.infoGenerated = false;
    this.values.formGenerated = false;
    this.values.picGenerated = false;
    this.values.tableGenerated = false;
    this.values.mapboxGenerated = false;
    this.values.dynTableGenerated = false;
    this.values.isLoading = false;

    if (this.values.currentChartType.flags & ChartFlags.MAP)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "No data available for the map." }
      });
    }
    else if (this.values.currentChartType.flags & ChartFlags.DYNTABLE)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "No data available for the dynamic table." }
      });      
    }
    else if (this.values.currentChartType.flags & ChartFlags.TABLE)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "No data available for the table." }
      });
    }
    else if (this.values.currentChartType.flags & ChartFlags.PICTURE)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "No image available." }
      });
    }
    else if (this.values.currentChartType.flags & ChartFlags.FORM)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "No data available for the form." }
      });
    }
    else if (this.values.currentChartType.flags & ChartFlags.INFO)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "No data available for information." }
      });
    }
    else
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "No data available for chart generation." }
      });
    }
  }

  haveDataInfo(data): boolean
  {
    let numEmpty = 0;

    for (let i = 0; i < data.length; i++)
    {
      if (data[i].value == null)
        numEmpty++;
    }

    if (numEmpty == data.length)
      return false;
    else
      return true;
  }

  getMainKey(keys, response)
  {
    for (let i of keys)
    {
      let obj = response[i];

      if (obj instanceof Object)
        return obj;
    }

    return null;
  }

  finishMapboxLoading(error)
  {
    if (error)
      this.handlerMapboxError (this, "Failed to generate the results for the map tracker.");
    else
    {
      if (!this.values.isLoading)
        return;

      this.values.lastestResponse = 1;
      this.service.saveLastestResponse (this, this.getPanelInfo (), this.handlerMapboxLastestResponse, this.handlerMapboxError);
    }
  }

  handlerHeatMapSuccess(_this, data): void
  {
    let response, result;

    if (!_this.values.isLoading)
      return;

    if (_this.utils.isJSONEmpty (data) || _this.utils.isJSONEmpty (data.Response))
    {
      _this.noDataFound ();
      return;
    }

    // only use the first result and filter out the values
    response = data.Response;
    for (let key in response)
    {
      let array = response[key];
      if (array != null)
      {
        if (Array.isArray (array))
        {
          result = array;
          break;
        }
      }
    }

    _this.values.lastestResponse = result;
    _this.service.saveLastestResponse (_this, _this.getPanelInfo (), _this.handlerHeatMapLastestResponse, _this.handlerHeatMapError);
  }

  handlerMapSuccess(_this, data): void
  {
    let response, result;

    if (!_this.values.isLoading)
      return;

    if (_this.utils.isJSONEmpty (data) || _this.utils.isJSONEmpty (data.Response))
    {
      _this.noDataFound ();
      return;
    }

    // only use the first result and filter out the values
    response = data.Response;
    for (let key in response)
    {
      let array = response[key];
      if (array != null)
      {
        if (Array.isArray (array))
        {
          result = array;
          break;
        }
      }
    }

    _this.values.lastestResponse = result;

    if (_this.values.currentOption.metaData == 4)
      _this.values.flightRoutes = [];
    else
      _this.values.flightRoutes = JSON.parse (JSON.stringify (_this.values.lastestResponse));

    _this.service.saveLastestResponse (_this, _this.getPanelInfo (), _this.handlerMapLastestResponse, _this.handlerMapError);
  }

  handlerDynTableSuccess(_this, data): void
  {
    let topOffsetValue = 0;

    if (!_this.values.isLoading)
      return;

    if (data == null)
    {
      _this.noDataFound ();
      return;
    }

    _this.dynTableData = data;
    _this.yAxisColSpan = 1;

    for (let i = 0; i < _this.dynTableData.headers.length; i++)
    {
      let header = _this.dynTableData.headers[i];
      header.topOffset = topOffsetValue;

      if (!i)
      {
        for (let j = 0; j < header.values.length - 1; j++)
        {
          let value = header.values[j];

          _this.yAxisColSpan += value.colSpan;
        }
      }

      topOffsetValue += 35;
    }

    _this.values.lastestResponse = {
      variables: _this.values.dynTableVariables,
      values: _this.values.dynTableValues
    };

    _this.service.saveLastestResponse (_this, _this.getPanelInfo (), _this.handlerDynTableLastestResponse, _this.handlerDynTableError);
  }

  loadPicData(): void
  {


    // if (data == null)
    // {      
    //   _this.noDataFound ();
    //   return;
    // }

    // destroy current chart if it's already generated to avoid a blank chart later
    this.values.lastestResponse = this.values.urlImg;
    this.values.isLoading = true;
    this.service.saveLastestResponse (this, this.getPanelInfo (), this.handlerPicSuccess, this.handlerPicError);
  }

  handlerPicSuccess(_this): void
  {
    if (!_this.values.isLoading)
      return;

    _this.values.isLoading = false;
    _this.destroyChart ();

    _this.values.displayPic = true;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = true;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.dynTableGenerated = false;

    _this.removeDeadVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.oldChartType),
      analysisName: _this.oldVariableName,
      chartSeries: _this.values.chartSeries,
      controlVariables: _this.oldOptionCategories
    });

    _this.values.chartSeries = [];

    _this.addNewVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.values.currentChartType),
      analysisName: null,
      controlVariables: _this.values.currentOptionCategories,
      chartSeries: _this.values.chartSeries,
      optionId: _this.values.currentOption.id
    });

    _this.oldChartType = null;
    _this.oldVariableName = "";
    _this.oldOptionCategories = JSON.parse (JSON.stringify (_this.values.currentOptionCategories));

    _this.anchoredArguments = []; // images has no control variables

    _this.stopUpdateInterval ();
    _this.startUpdateInterval ();
  }

  handlerFormSuccess(_this, data): void
  {
    let formResults, result;

    if (!_this.values.isLoading)
      return;

    formResults = [];

    if (!_this.haveDataInfo (data))
    {
      _this.noDataFound ();
      return;
    }

    for (let i = 0; i < data.length; i++)
    {
      let formVariable = _this.values.formVariables[i];
      let value = data[i].value;

      formResults.push ({
        value: (isNaN (value) ? value : _this.getResultValue (value)),
        column: formVariable.column.item.id,
        fontSize: _this.fontSizes.indexOf (formVariable.fontSize),
        valueFontSize: _this.fontSizes.indexOf (formVariable.valueFontSize),
        valueOrientation: _this.orientations.indexOf (formVariable.valueOrientation),
        function: _this.functions.indexOf (formVariable.function)
      });
    }

    _this.values.lastestResponse = formResults;

    // save the panel into the database
    _this.service.saveLastestResponse (_this, _this.getPanelInfo (), _this.handlerFormLastestResponse, _this.handlerFormError);
  }

  handlerFormLastestResponse(_this): void
  {
    let data = JSON.parse (JSON.stringify (_this.values.lastestResponse));

    if (!_this.values.isLoading)
      return;

    _this.values.lastestResponse = [];

    for (let formVariable of data)
    {
      let columnIndex = 0;

      for (let i = 0; i < _this.values.chartColumnOptions.length; i++)
      {
        if (_this.values.chartColumnOptions[i].item.id === formVariable.column)
        {
          columnIndex = i;
          break;
        }
      }

      _this.values.lastestResponse.push ({
        value: formVariable.value,
        column: _this.values.chartColumnOptions[columnIndex].item,
        fontSize: _this.fontSizes[formVariable.fontSize],
        valueFontSize: _this.fontSizes[formVariable.valueFontSize],
        valueOrientation: _this.orientations[formVariable.valueOrientation],
        function: _this.functions[formVariable.function]
      });
    }

    // destroy current chart if it's already generated to avoid a blank chart later
    _this.destroyChart ();

    _this.values.isLoading = false;
    _this.values.displayForm = true;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = true;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.dynTableGenerated = false;

    _this.removeDeadVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.oldChartType),
      analysisName: _this.oldVariableName,
      chartSeries: _this.values.chartSeries,
      controlVariables: _this.oldOptionCategories
    });

    _this.values.chartSeries = [];

    _this.addNewVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.values.currentChartType),
      analysisName: null,
      controlVariables: _this.values.currentOptionCategories,
      chartSeries: _this.values.chartSeries,
      optionId: _this.values.currentOption.id
    });

    _this.oldChartType = null;
    _this.oldVariableName = "";
    _this.oldOptionCategories = JSON.parse (JSON.stringify (_this.values.currentOptionCategories));

    _this.configureAnchoredControlVariables ();

    _this.stopUpdateInterval ();
    _this.startUpdateInterval ();
  }

  handlerTableLastestResponse(_this): void
  {
    if (!_this.values.isLoading)
      return;

    _this.values.isLoading = false;

    // destroy current chart if it's already generated to avoid a blank chart later
    _this.destroyChart ();

    _this.values.displayTable = true;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = true;
    _this.values.mapboxGenerated = false;
    _this.values.dynTableGenerated = false;

    _this.removeDeadVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.oldChartType),
      analysisName: _this.oldVariableName,
      chartSeries: _this.values.chartSeries,
      controlVariables: _this.oldOptionCategories
    });

    _this.values.chartSeries = [];

    _this.addNewVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.values.currentChartType),
      analysisName: null,
      controlVariables: _this.values.currentOptionCategories,
      chartSeries: _this.values.chartSeries,
      optionId: _this.values.currentOption.id
    });

    _this.oldChartType = null;
    _this.oldVariableName = "";
    _this.oldOptionCategories = JSON.parse (JSON.stringify (_this.values.currentOptionCategories));

    _this.configureAnchoredControlVariables ();

    _this.stopUpdateInterval ();
    _this.startUpdateInterval ();
  }

  handlerDynTableLastestResponse(_this): void
  {
    if (!_this.values.isLoading)
      return;

    _this.values.isLoading = false;

    // destroy current chart if it's already generated to avoid a blank chart later
    _this.destroyChart ();

    _this.values.displayDynTable = true;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.dynTableGenerated = true;

    _this.removeDeadVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.oldChartType),
      analysisName: _this.oldVariableName,
      chartSeries: _this.values.chartSeries,
      controlVariables: _this.oldOptionCategories
    });

    _this.values.chartSeries = [];

    _this.addNewVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.values.currentChartType),
      analysisName: null,
      controlVariables: _this.values.currentOptionCategories,
      chartSeries: _this.values.chartSeries,
      optionId: _this.values.currentOption.id
    });

    _this.oldChartType = null;
    _this.oldVariableName = "";
    _this.oldOptionCategories = JSON.parse (JSON.stringify (_this.values.currentOptionCategories));

    _this.configureAnchoredControlVariables ();

    _this.stopUpdateInterval ();
    _this.startUpdateInterval ();
  }

  handlerMapboxLastestResponse(_this): void
  {
    if (!_this.values.isLoading)
      return;

    _this.values.isLoading = false;

    _this.destroyChart ();

    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = true;
    _this.values.dynTableGenerated = false;

    _this.removeDeadVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.oldChartType),
      analysisName: _this.oldVariableName,
      chartSeries: _this.values.chartSeries,
      controlVariables: _this.oldOptionCategories
    });

    _this.values.chartSeries = [];

    _this.addNewVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.values.currentChartType),
      analysisName: null,
      controlVariables: _this.values.currentOptionCategories,
      chartSeries: _this.values.chartSeries,
      optionId: _this.values.currentOption.id
    });

    _this.oldChartType = null;
    _this.oldVariableName = "";
    _this.oldOptionCategories = JSON.parse (JSON.stringify (_this.values.currentOptionCategories));

    _this.configureAnchoredControlVariables ();

    setTimeout (() => {
      _this.values.isLoading = false;
      _this.msfMapRef.resizeMap ();
    }, 50);

    _this.mapboxInterval = setInterval (() =>
    {
      if (_this.lastWidth != _this.values.width)
      {
        _this.msfMapRef.resizeMap ();
        _this.lastWidth = _this.values.width;
      }
    }, 500);

    _this.stopUpdateInterval ();
    _this.startUpdateInterval ();
  }

  handlerHeatMapLastestResponse(_this): void
  {
    if (!_this.values.isLoading)
      return;

    _this.destroyChart ();

    _this.values.displayChart = true;
    _this.values.chartGenerated = true;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.dynTableGenerated = false;

    setTimeout (() =>
    {
      _this.values.isLoading = false;

      _this.makeChart (_this.values.lastestResponse, false);
      _this.configureAnchoredControlVariables ();
  
      _this.stopUpdateInterval ();
      _this.startUpdateInterval ();
    }, 50);
  }

  handlerMapLastestResponse(_this): void
  {
    if (!_this.values.isLoading)
      return;

    // destroy current chart if it's already generated to avoid a blank chart
    _this.destroyChart ();

    _this.values.displayChart = true;
    _this.values.chartGenerated = true;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.dynTableGenerated = false;

    setTimeout (() =>
    {
      _this.values.isLoading = false;

      _this.makeChart (_this.values.lastestResponse, false);
      _this.configureAnchoredControlVariables ();
  
      _this.stopUpdateInterval ();
      _this.startUpdateInterval ();
    }, 50);
  }

  handlerTextSuccess(_this, data): void
  {
    if (!_this.values.isLoading)
      return;

    if (!_this.haveDataInfo (data))
    {
      _this.noDataFound ();
      return;
    }

    _this.values.lastestResponse = data;

    // destroy current chart if it's already generated to avoid a blank chart later
    _this.destroyChart ();

    _this.values.displayInfo = true;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = true;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.dynTableGenerated = false;
    _this.values.isLoading = false;

    _this.removeDeadVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.oldChartType),
      analysisName: _this.oldVariableName,
      chartSeries: _this.values.chartSeries,
      controlVariables: _this.oldOptionCategories
    });

    _this.values.chartSeries = [];

    _this.addNewVariablesAndCategories.emit ({
      type: _this.chartTypes.indexOf (_this.values.currentChartType),
      analysisName: null,
      controlVariables: _this.values.currentOptionCategories,
      chartSeries: _this.values.chartSeries,
      optionId: _this.values.currentOption.id
    });

    _this.oldChartType = null;
    _this.oldVariableName = "";
    _this.oldOptionCategories = JSON.parse (JSON.stringify (_this.values.currentOptionCategories));

    _this.configureAnchoredControlVariables ();

    _this.stopUpdateInterval ();
    _this.startUpdateInterval ();
  }

  handlerChartSuccess(_this, data): void
  {
    if (!_this.values.isLoading)
      return;

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

    // destroy current chart if it's already generated to avoid a blank chart
    _this.destroyChart ();

    _this.values.displayChart = true;
    _this.values.chartGenerated = true;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.dynTableGenerated = false;

    setTimeout (() =>
    {
      _this.values.isLoading = false;

      _this.makeChart (data, false);
      _this.configureAnchoredControlVariables ();
  
      _this.stopUpdateInterval ();
      _this.startUpdateInterval ();
    }, 50);
  }

  loadChartFilterValues(component): void
  {
    let i;

    this.values.chartColumnOptions = [];
    this.values.tableVariables = [];
    this.values.dynTableValues = null;
    this.values.dynTableVariables = [];
    this.values.thresholds = [];
    this.values.goals = [];

    for (let columnConfig of component.columnOptions)
    {
      this.values.chartColumnOptions.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel, item: columnConfig } );
      this.values.tableVariables.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel, itemId: columnConfig.id, grouping: columnConfig.grouping, checked: true } );
    }

    // load the initial filter variables list
    this.filteredVariables.next (this.values.chartColumnOptions.slice ());

    this.searchChange (this.variableFilterCtrl);
    this.searchChange (this.xaxisFilterCtrl);
    this.searchChange (this.valueFilterCtrl);

    this.searchChange (this.infoVar1FilterCtrl);
    this.searchChange (this.infoVar2FilterCtrl);
    this.searchChange (this.infoVar3FilterCtrl);

    this.searchChange (this.columnFilterCtrl);

    // reset chart filter values and disable generate chart button
    this.panelForm.get ('variableCtrl').reset ();
    this.panelForm.get ('xaxisCtrl').reset ();
    this.panelForm.get ('valueCtrl').reset ();
    this.panelForm.get ('valueListCtrl').reset ();
    this.panelForm.get ('columnCtrl').reset ();
    this.panelForm.get ('geodataValueCtrl').reset ();
    this.panelForm.get ('geodataKeyCtrl').reset ();
    this.panelForm.get ('fontSizeCtrl').setValue (this.fontSizes[1]);
    this.panelForm.get ('valueFontSizeCtrl').setValue (this.fontSizes[1]);
    this.panelForm.get ('valueOrientationCtrl').setValue (this.orientations[0]);
    this.panelForm.get ('functionCtrl').setValue (this.functions[0]);

    this.values.formVariables = [];
    this.variableCtrlBtnEnabled = true;

    if ((this.values.currentChartType.flags & ChartFlags.XYCHART
      && this.values.currentChartType.flags & ChartFlags.ADVANCED)
      || !(this.values.currentChartType.flags & ChartFlags.ADVANCED))
      this.panelForm.get ('variableCtrl').enable ();

    if (this.values.currentChartType.flags & ChartFlags.XYCHART)
      this.panelForm.get ('xaxisCtrl').enable ();

    this.panelForm.get ('valueCtrl').enable ();
    this.panelForm.get ('valueListCtrl').enable ();
    this.panelForm.get ('columnCtrl').enable ();
    this.panelForm.get ('fontSizeCtrl').enable ();
    this.panelForm.get ('valueFontSizeCtrl').enable ();
    this.panelForm.get ('valueOrientationCtrl').enable ();
    this.panelForm.get ('geodataValueCtrl').enable ();
    this.panelForm.get ('geodataKeyCtrl').enable ();
    this.panelForm.get ('functionCtrl').enable ();

    this.values.xaxis = null;
    this.values.variable = null;
    this.values.valueColumn = null;
    this.values.infoVar1 = null;
    this.values.infoVar2 = null;
    this.values.infoVar3 = null;
    this.values.geodata = null;
    this.values.currentOptionCategories = null;

    for (i = 0; i < this.values.infoFunc1.length; i++)
      this.values.infoFunc1[i].checked = false;

    for (i = 0; i < this.values.infoFunc2.length; i++)
      this.values.infoFunc2[i].checked = false;

    for (i = 0; i < this.values.infoFunc3.length; i++)
      this.values.infoFunc3[i].checked = false;

    this.checkPanelConfiguration ();
  }

  generateError(): void
  {
    this.values.lastestResponse = null;
    this.values.chartGenerated = false;
    this.values.infoGenerated = false;
    this.values.formGenerated = false;
    this.values.picGenerated = false;
    this.values.tableGenerated = false;
    this.values.mapboxGenerated = false;
    this.values.dynTableGenerated = false;

    this.removeDeadVariablesAndCategories.emit ({
      type: this.chartTypes.indexOf (this.oldChartType),
      analysisName: this.oldVariableName,
      chartSeries: this.values.chartSeries,
      controlVariables: this.oldOptionCategories
    });

    this.values.chartSeries = [];

    this.oldChartType = null;
    this.oldVariableName = "";
    this.oldOptionCategories = JSON.parse (JSON.stringify (this.values.currentOptionCategories));
  }

  handlerChartError(_this, result): void
  {
    _this.generateError ();
  }

  handlerTextError(_this, result): void
  {
    _this.generateError ();
  }

  handlerFormError(_this, result): void
  {
    _this.generateError ();
  }

  handlerPicError(_this, result): void
  {
    _this.generateError ();
  }

  handlerTableError(_this, result): void
  {
    _this.generateError ();
  }

  handlerMapboxError(_this, result): void
  {
    _this.generateError ();
  }

  handlerHeatMapError(_this, result): void
  {
    _this.generateError ();
  }

  handlerMapError(_this, result): void
  {
    _this.generateError ();
  }

  handlerDynTableError(_this, result): void
  {
    _this.generateError ();
  }

  handlerError(_this, result): void
  {
    _this.values.isLoading = false;  
  }

  getChartFilterValues(id, handlerSuccess): void
  {
    this.service.getChartFilterValues (this, id, handlerSuccess, this.handlerError);
  }

  addChartFilterValues(_this, data): void
  {
    _this.values.chartColumnOptions = [];
    _this.values.tableVariables = [];

    for (let columnConfig of data)
    {
      _this.values.chartColumnOptions.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel, item: columnConfig } );
      _this.values.tableVariables.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel, itemId: columnConfig.id, grouping: columnConfig.grouping, checked: true } );
    }

    // load the initial filter variables list
    _this.filteredVariables.next (_this.values.chartColumnOptions.slice ());

    _this.searchChange (_this.variableFilterCtrl);
    _this.searchChange (_this.xaxisFilterCtrl);
    _this.searchChange (_this.valueFilterCtrl);

    _this.searchChange (_this.infoVar1FilterCtrl);
    _this.searchChange (_this.infoVar2FilterCtrl);
    _this.searchChange (_this.infoVar3FilterCtrl);

    _this.searchChange (_this.columnFilterCtrl);

    // reset chart filter values and disable generate chart button
    _this.panelForm.get ('variableCtrl').reset ();
    _this.panelForm.get ('xaxisCtrl').reset ();
    _this.panelForm.get ('valueCtrl').reset ();
    _this.panelForm.get ('valueListCtrl').reset ();
    _this.panelForm.get ('columnCtrl').reset ();
    _this.panelForm.get ('geodataValueCtrl').reset ();
    _this.panelForm.get ('geodataKeyCtrl').reset ();
    _this.panelForm.get ('fontSizeCtrl').setValue (_this.fontSizes[1]);
    _this.panelForm.get ('valueFontSizeCtrl').setValue (_this.fontSizes[1]);
    _this.panelForm.get ('valueOrientationCtrl').setValue (_this.orientations[0]);
    _this.panelForm.get ('functionCtrl').setValue (_this.functions[0]);
    _this.checkPanelConfiguration ();

    _this.values.formVariables = [];
    _this.variableCtrlBtnEnabled = true;

    _this.panelForm.get ('variableCtrl').enable ();

    if (_this.values.currentChartType.flags & ChartFlags.XYCHART)
      _this.panelForm.get ('xaxisCtrl').enable ();

    _this.panelForm.get ('valueCtrl').enable ();
    _this.panelForm.get ('valueListCtrl').enable ();
    _this.panelForm.get ('columnCtrl').enable ();
    _this.panelForm.get ('fontSizeCtrl').enable ();
    _this.panelForm.get ('valueFontSizeCtrl').enable ();
    _this.panelForm.get ('valueOrientationCtrl').enable ();
    _this.panelForm.get ('geodataValueCtrl').enable ();
    _this.panelForm.get ('geodataKeyCtrl').enable ();
    _this.panelForm.get ('functionCtrl').enable ();

    _this.values.isLoading = false;
    _this.values.currentOptionCategories = null;
  }

  searchChange(filterCtrl): void
  {
    // listen for search field value changes
    filterCtrl.valueChanges
      .pipe (takeUntil (this._onDestroy))
      .subscribe (() => {
        this.filterVariables (filterCtrl);
      });
  }

  optionSearchChange(filterCtrl): void
  {
    // load the initial option list
    this.filteredOptions.next (this.values.options.slice ());
    // listen for search field value changes
    filterCtrl.valueChanges
      .pipe (takeUntil (this._onDestroy))
      .subscribe (() => {
        this.filterOptions (filterCtrl);
      });
  }

  goToControlVariables(): void
  {
    let dialogRef;

    this.toggleControlVariableDialogOpen.emit (true);

    dialogRef = this.dialog.open (MsfDashboardControlVariablesComponent, {
      width: '400px',
      panelClass: 'msf-dashboard-arguments-dialog',
      data: {
        currentOptionCategories: this.values.currentOptionCategories,
        currentOptionId: this.values.currentOption.id,
        title: this.values.chartName
      }
    });

    dialogRef.afterClosed ().subscribe ((result) => {
      this.toggleControlVariableDialogOpen.emit (false);

      if (result)
      {
        if (result.error)
        {
          this.dialog.open (MessageComponent, {
            data: { title: "Error", message: "Failed to load control variables." }
          });
        }
        else
          this.values.currentOptionCategories = result.currentOptionCategories;
      }
    });
  }

  // save chart data into a temporary value
  storeChartValues(): void
  {
    if (!this.temp)
    {
      this.temp = new MsfDashboardPanelValues (this.values.options, this.values.chartName,this.values.chartDescription,
        this.values.id, this.values.gridId, this.values.x, this.values.y, this.values.width,
        this.values.height);
    }
    else
      this.temp.chartName = this.values.chartName;

    this.temp.chartDescription = this.values.chartDescription;
    this.temp.urlImg = this.values.urlImg;
    this.temp.currentOption = JSON.parse (JSON.stringify (this.values.currentOption));
    this.temp.variable = this.values.variable ? this.values.variable.item.id : null;
    this.temp.xaxis = this.values.xaxis ? this.values.xaxis.item.id : null;
    this.temp.valueColumn = this.values.valueColumn ? this.values.valueColumn.item.id : null;
    this.temp.function = this.values.function != -1 ? this.functions.indexOf (this.values.function) : -1;
    this.temp.geodata = this.geodatas.indexOf (this.values.geodata);
    this.temp.currentChartType = JSON.parse (JSON.stringify (this.values.currentChartType));
    this.temp.chartColumnOptions = JSON.parse (JSON.stringify (this.values.chartColumnOptions));
    this.temp.currentOptionCategories = JSON.parse (JSON.stringify (this.values.currentOptionCategories));
    this.temp.thresholds = JSON.parse (JSON.stringify (this.values.thresholds));
    this.temp.goals = JSON.parse (JSON.stringify (this.values.goals));
    this.temp.style = JSON.parse (JSON.stringify (this.values.style));
    this.temp.vertAxisName = this.values.vertAxisName;
    this.temp.horizAxisName = this.values.horizAxisName;
    this.temp.dynTableValues = this.values.dynTableValues ? JSON.parse (JSON.stringify (this.values.dynTableValues)) : null;
    this.temp.dynTableVariables = JSON.parse (JSON.stringify (this.values.dynTableVariables));
    this.temp.intervalType = this.values.intervalType;
    this.temp.intValue = this.values.intValue;
    this.temp.valueList = (this.values.valueList && this.values.valueList.length ? this.generateValueList () : null);

    this.temp.formVariables = [];
    this.temp.tableVariables = JSON.parse (JSON.stringify (this.values.tableVariables));

    if (this.values.currentChartType.flags & ChartFlags.FORM)
    {
      this.temp.infoVar1 = null;
      this.temp.infoVar2 = null;
      this.temp.infoVar3 = null;

      for (let i = 0; i < this.values.formVariables.length; i++)
      {
        let formVariable = this.values.formVariables[i];

        this.temp.formVariables.push ({
          value: this.values.lastestResponse[i].value,
          column: formVariable.column.item.id,
          fontSize: this.fontSizes.indexOf (formVariable.fontSize),
          valueFontSize: this.fontSizes.indexOf (formVariable.valueFontSize),
          valueOrientation: this.orientations.indexOf (formVariable.valueOrientation),
          function: this.functions.indexOf (formVariable.function)
        });
      }
    }
    else if (this.values.currentChartType.flags & ChartFlags.INFO
      && !(this.values.currentChartType.flags & ChartFlags.PICTURE))
    {
      if (this.values.infoVar1 != null)
        this.temp.infoVar1 = this.values.infoVar1;

      if (this.values.infoVar2 != null)
        this.temp.infoVar2 = this.values.infoVar2;

      if (this.values.infoVar3 != null)
        this.temp.infoVar3 = this.values.infoVar3;
    }
    else
    {
      this.temp.infoVar1 = null;
      this.temp.infoVar2 = null;
      this.temp.infoVar3 = null;
    }

    this.temp.updateIntervalSwitch = this.values.updateIntervalSwitch;
    this.temp.startAtZero = this.values.startAtZero;
    this.temp.updateTimeLeft = this.values.updateTimeLeft;
    this.temp.limitMode = this.values.limitMode;
    this.temp.limitAmount = this.values.limitAmount;
    this.temp.ordered = this.values.ordered;

    this.stopUpdateInterval ();

    if (this.mapboxInterval)
    {
      clearInterval (this.mapboxInterval);
      this.mapboxInterval = null;
    }
  }

  goToPanelConfiguration(): void
  {
    if (this.values.displayChart)
      this.values.displayChart = false;
    else if (this.values.displayInfo)
      this.values.displayInfo = false;
    else if (this.values.displayForm)
      this.values.displayForm = false;
    else if (this.values.displayPic)
      this.values.displayPic = false;
    else if (this.values.displayTable)
      this.values.displayTable = false;
    else if (this.values.displayMapbox)
      this.values.displayMapbox = false;
    else if (this.values.displayDynTable)
      this.values.displayDynTable = false;

    this.storeChartValues ();
    this.changeDetectorRef.detectChanges ();
    this.selectStep (this.selectedStep);
  }

  goToResults(): void
  {
    let i, item;

    if (this.dialogData)
    {
      this.dialogRef.close ({ goToResults: true });
      return;
    }

    if (this.values.picGenerated)
      this.values.displayPic = true;
    else if (this.values.formGenerated)
      this.values.displayForm = true;
    else if (this.values.infoGenerated)
      this.values.displayInfo = true;
    else if (this.values.tableGenerated)
      this.values.displayTable = true;
    else if (this.values.mapboxGenerated)
      this.values.displayMapbox = true;
    else if (this.values.dynTableGenerated)
      this.values.displayDynTable = true;
    else
      this.values.displayChart = true;

    // discard any changes
    this.values.urlImg = this.temp.urlImg;
    this.values.currentOption = JSON.parse (JSON.stringify (this.temp.currentOption));
    this.values.chartName = this.temp.chartName;
    this.values.chartDescription = this.temp.chartDescription;

    if (this.temp.variable)
      this.values.variable = this.temp.variable;
    else
      this.values.variable = null;

    if (this.temp.xaxis)
      this.values.xaxis = this.temp.xaxis;
    else
      this.values.xaxis = null;

    if (this.temp.valueColumn)
      this.values.valueColumn = this.temp.valueColumn;
    else
      this.values.valueColumn = null;

    this.values.function = this.temp.function;
    this.values.geodata = this.temp.geodata;
    this.values.chartColumnOptions = JSON.parse (JSON.stringify (this.temp.chartColumnOptions));
    this.values.currentOptionCategories = JSON.parse (JSON.stringify (this.temp.currentOptionCategories));
    this.values.thresholds = JSON.parse (JSON.stringify (this.temp.thresholds));
    this.values.goals = JSON.parse (JSON.stringify (this.temp.goals));
    this.values.style = JSON.parse (JSON.stringify (this.temp.style));
    this.values.vertAxisName = this.temp.vertAxisName;
    this.values.horizAxisName = this.temp.horizAxisName;
    this.values.dynTableValues = this.temp.dynTableValues ? JSON.parse (JSON.stringify (this.temp.dynTableValues)) : null;
    this.values.dynTableVariables = JSON.parse (JSON.stringify (this.temp.dynTableVariables));
    this.values.intervalType = this.temp.intervalType;
    this.values.intValue = this.temp.intValue;
    this.values.valueList = this.temp.valueList;

    for (i = 0; i < this.chartTypes.length; i++)
    {
      item = this.chartTypes[i];

      if (item.name === this.temp.currentChartType.name)
      {
        this.values.currentChartType = item;
        break;
      }
    }

    if (this.values.currentChartType.flags & ChartFlags.INFO
      && !(this.values.currentChartType.flags & ChartFlags.FORM)
      && !(this.values.currentChartType.flags & ChartFlags.PICTURE)
      && this.values.chartColumnOptions != null)
    {
      if (this.temp.infoVar1 != null)
      {
        for (i = 0; i < this.values.chartColumnOptions.length; i++)
        {
          item = this.values.chartColumnOptions[i];

          if (this.temp.infoVar1.id === item.id)
          {
            this.values.variable = this.values.chartColumnOptions.indexOf (item);
            break;
          }
        }
      }

      if (this.temp.infoVar2 != null)
      {
        for (i = 0; i < this.values.chartColumnOptions.length; i++)
        {
          item = this.values.chartColumnOptions[i];

          if (this.temp.infoVar2.id === item.id)
          {
            this.values.xaxis = this.values.chartColumnOptions.indexOf (item);
            break;
          }
        }
      }

      if (this.temp.infoVar3 != null)
      {
        for (i = 0; i < this.values.chartColumnOptions.length; i++)
        {
          item = this.values.chartColumnOptions[i];

          if (this.temp.infoVar3.id === item.id)
          {
            this.values.valueColumn = this.values.chartColumnOptions.indexOf (item);
            break;
          }
        }
      }
    }

    this.values.formVariables = [];

    for (let i = 0; i < this.temp.formVariables.length; i++)
    {
      let formVariable = this.temp.formVariables[i];

      this.values.formVariables.push ({
        value: this.values.lastestResponse[i].value,
        column: formVariable.column,
        fontSize: this.fontSizes[formVariable.fontSize],
        valueFontSize: this.fontSizes[formVariable.valueFontSize],
        valueOrientation: this.orientations[formVariable.valueOrientation],
        function: this.functions[formVariable.function]
      });
    }

    this.values.tableVariables = JSON.parse (JSON.stringify (this.temp.tableVariables));

    this.values.updateIntervalSwitch = this.temp.updateIntervalSwitch;
    this.values.startAtZero = this.temp.startAtZero;
    this.values.updateTimeLeft = this.temp.updateTimeLeft;
    this.values.limitMode = this.temp.limitMode;
    this.values.limitAmount = this.temp.limitAmount;
    this.values.ordered = this.temp.ordered;

    // re-initialize panel settings
    this.values.currentChartType = this.chartTypes.indexOf (this.values.currentChartType);
    this.initPanelSettings ();

    this.startUpdateInterval ();

    if (this.values.currentChartType.flags & ChartFlags.MAPBOX)
    {
      setTimeout (() => {
        this.msfMapRef.resizeMap ();
      }, 10);

      this.mapboxInterval = setInterval (() =>
      {
        if (this.lastWidth != this.values.width)
        {
          this.msfMapRef.resizeMap ();
          this.lastWidth = this.values.width;
        }
      }, 500);
    }

    this.changeDetectorRef.detectChanges ();
  }

  // check if the x axis should be enabled or not depending of the chart type
  checkChartType(): void
  {
    if (this.values.currentChartType.flags & ChartFlags.PICTURE)
    {
      if (this.values.urlImg && this.values.urlImg != "")
        this.generateBtnEnabled = true; //kp2020Ene23
      else
        this.generateBtnEnabled = false;

      return;
    }
    else
    {
      if (this.values.currentOption == null)
        return;
    }

    if (this.values.currentChartType.flags & ChartFlags.INFO)
    {
      // disable and reset unused variables
      this.values.variable = null;
      this.panelForm.get ('variableCtrl').reset ();
      this.panelForm.get ('geodataValueCtrl').reset ();

      this.values.xaxis = null;
      this.panelForm.get ('xaxisCtrl').reset ();

      this.values.valueColumn = null;
      this.values.valueList = [];
      this.panelForm.get ('valueCtrl').reset ();
      this.panelForm.get ('valueListCtrl').reset ();
      this.panelForm.get ('geodataKeyCtrl').reset ();

      if (!(this.values.currentChartType.flags & ChartFlags.FORM))
      {
        this.panelForm.get ('columnCtrl').reset ();
        this.panelForm.get ('fontSizeCtrl').setValue (this.fontSizes[1]);
        this.panelForm.get ('valueFontSizeCtrl').setValue (this.fontSizes[1]);
        this.panelForm.get ('valueOrientationCtrl').setValue (this.orientations[0]);
        this.panelForm.get ('functionCtrl').setValue (this.functions[0]);

        this.values.formVariables = [];
      }

      this.values.vertAxisName = null;
      this.values.horizAxisName = null;

      this.values.dynTableValues = null;
      this.values.dynTableVariables = [];
    }
    else
    {
      let i;

      this.values.infoNumVariables = 0;

      if (this.values.currentChartType.flags & ChartFlags.TABLE
        || this.values.currentChartType.flags & ChartFlags.MAP
        || this.values.currentChartType.flags & ChartFlags.HEATMAP
        || this.values.currentChartType.flags & ChartFlags.DYNTABLE)
      {
        if (this.values.currentChartType.flags & ChartFlags.MAP)
        {
          if (this.values.currentOption == null || ((this.values.currentOption.metaData != 2 && this.values.currentOption.metaData != 4)
            && !(this.values.currentChartType.flags & ChartFlags.MAPBOX)) || (this.values.currentOption.tabType !== 'map' && this.values.currentChartType.flags & ChartFlags.MAPBOX))
          {
            this.values.currentOption = null;
            this.panelForm.get ('dataFormCtrl').reset ();
            this.variableCtrlBtnEnabled = false;
          }
        }

        this.values.xaxis = null;
        this.panelForm.get ('xaxisCtrl').reset ();
    
        this.panelForm.get ('valueCtrl').reset ();
        this.panelForm.get ('valueListCtrl').reset ();

        if (!(this.values.currentChartType.flags & ChartFlags.HEATMAP))
        {
          this.panelForm.get ('geodataValueCtrl').reset ();
          this.values.variable = null;

          this.panelForm.get ('geodataKeyCtrl').reset ();
          this.values.valueColumn = null;
        }

        this.panelForm.get ('variableCtrl').reset ();

        this.values.vertAxisName = null;
        this.values.horizAxisName = null;

        if (!(this.values.currentChartType.flags & ChartFlags.DYNTABLE))
        {
          this.values.dynTableValues = null;
          this.values.dynTableVariables = [];
        }
      }
      else if (!(this.values.currentChartType.flags & ChartFlags.XYCHART))
      {
        this.values.xaxis = null;
        this.panelForm.get ('xaxisCtrl').reset ();
        this.panelForm.get ('xaxisCtrl').disable ();

        if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
        {
          this.values.variable = null;
          this.panelForm.get ('variableCtrl').reset ();
          this.panelForm.get ('variableCtrl').disable ();
        }
        else
          this.panelForm.get ('variableCtrl').enable ();

        if (this.values.currentChartType.flags & ChartFlags.FUNNELCHART
          || this.values.currentChartType.flags & ChartFlags.PIECHART)
        {
          this.values.vertAxisName = null;
          this.values.horizAxisName = null;

          this.vertAxisDisabled = true;
          this.horizAxisDisabled = true;

          this.values.dynTableValues = null;
          this.values.dynTableVariables = [];
        }
      }
      else
      {
        this.panelForm.get ('xaxisCtrl').enable ();
        this.panelForm.get ('variableCtrl').enable ();

        this.vertAxisDisabled = false;
        this.horizAxisDisabled = false;

        this.values.dynTableValues = null;
        this.values.dynTableVariables = [];
      }

      this.panelForm.get ('valueCtrl').enable ();
      this.panelForm.get ('valueListCtrl').enable ();
      this.panelForm.get ('geodataValueCtrl').enable ();
      this.panelForm.get ('geodataKeyCtrl').enable ();

      this.values.infoVar1 = null;

      for (i = 0; i < this.values.infoFunc1.length; i++)
        this.values.infoFunc1[i].checked = false;

      this.values.infoVar2 = null;

      for (i = 0; i < this.values.infoFunc2.length; i++)
        this.values.infoFunc2[i].checked = false;

      this.values.infoVar3 = null;

      for (i = 0; i < this.values.infoFunc3.length; i++)
        this.values.infoFunc3[i].checked = false;

      this.panelForm.get ('columnCtrl').reset ();
      this.panelForm.get ('fontSizeCtrl').setValue (this.fontSizes[1]);
      this.panelForm.get ('valueFontSizeCtrl').setValue (this.fontSizes[1]);
      this.panelForm.get ('valueOrientationCtrl').setValue (this.orientations[0]);
      this.panelForm.get ('functionCtrl').setValue (this.functions[0]);

      if (!(this.values.currentChartType.flags & ChartFlags.INFO || this.values.currentChartType.flags & ChartFlags.MAP
        || this.values.currentChartType.flags & ChartFlags.HEATMAP || this.values.currentChartType.flags & ChartFlags.TABLE
        || this.values.currentChartType.flags & ChartFlags.DYNTABLE || this.values.currentChartType.flags & ChartFlags.PICTURE))
        this.values.function = this.functions[0];

      this.values.formVariables = [];
    }

    // check the chart filters to see if the chart generation is to be enabled or not
    this.checkPanelConfiguration ();
  }

  checkPanelConfiguration(): boolean
  {
    if (!this.values.currentChartType)
    {
      this.generateBtnEnabled = false;
      return false;
    }

    if (this.values.currentChartType.flags & ChartFlags.HEATMAP)
    {
      if (this.values.variable != null && this.values.geodata != null)
      {
        this.generateBtnEnabled = true;
        return true;
      }
    }
    else if (this.values.currentChartType.flags & ChartFlags.DYNTABLE)
    {
      if (this.values.currentOption != null && this.isDynamicTableSet ())
      {
        this.generateBtnEnabled = true;
        return true;
      }
    }
    else if (this.values.currentChartType.flags & ChartFlags.TABLE
      || this.values.currentChartType.flags & ChartFlags.MAP)
    {
      if (this.values.currentOption != null)
      {
        this.generateBtnEnabled = true;
        return true;
      }
    }
    else if (this.values.currentChartType.flags & ChartFlags.PICTURE)
    {
      if (this.values.urlImg && this.values.urlImg != "")
      {
        this.generateBtnEnabled = true;
        return true;
      }
    }
    else if (this.values.currentChartType.flags & ChartFlags.FORM)
    {
      if (this.values.formVariables.length)
      {
        this.generateBtnEnabled = true;
        return true;
      }
    }
    else if (this.values.currentChartType.flags & ChartFlags.INFO)
    {
      // Make sure that al least one function is checked when using the information "chart" type
      let i, infoFunc1Ready, infoFunc2Ready, infoFunc3Ready;

      infoFunc1Ready = false;
      infoFunc2Ready = false;
      infoFunc3Ready = false;

      if (this.values.infoNumVariables >= 1)
      {
        for (i = 0; i < this.values.infoFunc1.length; i++)
        {
          if (this.values.infoFunc1[i].checked)
          {
            infoFunc1Ready = true;
            break;
          }
        }
      }

      if (this.values.infoNumVariables >= 2)
      {
        for (i = 0; i < this.values.infoFunc2.length; i++)
        {
          if (this.values.infoFunc2[i].checked)
          {
            infoFunc2Ready = true;
            break;
          }
        }
      }
      else
        infoFunc2Ready = true; // This is to simplify the final condition

      if (this.values.infoNumVariables == 3)
      {
        for (i = 0; i < this.values.infoFunc3.length; i++)
        {
          if (this.values.infoFunc3[i].checked)
          {
            infoFunc3Ready = true;
            break;
          }
        }
      }
      else
        infoFunc3Ready = true;

      if (infoFunc1Ready && infoFunc2Ready && infoFunc3Ready)
      {
        this.generateBtnEnabled = true;
        return true;
      }
    }
    else
    {
      if (!(this.values.currentChartType.flags & ChartFlags.XYCHART))
      {
        if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
        {
          if (this.values.valueColumn != null)
          {
            this.generateBtnEnabled = true;
            return true;
          }
        }
        else
        {
          if (this.values.function.id === "count")
          {
            if (this.values.variable != null)
            {
              this.generateBtnEnabled = true;
              return true;
            }
          }
          else
          {
            if ((this.isSimpleChart () && this.values.valueList != null && this.values.valueList.length)
             || (!this.isSimpleChart () && this.values.variable != null)
              && this.values.valueColumn != null)
            {
              this.generateBtnEnabled = true;
              return true;
            }
          }
        }
      }
      else
      {
        if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
        {
          if (this.values.variable != null && this.values.valueColumn != null)
          {
            this.generateBtnEnabled = true;
            return true;
          }
        }
        else
        {
          if (this.values.function.id === "count")
          {
            if (this.values.variable != null && this.values.xaxis != null)
            {
              this.generateBtnEnabled = true;
              return true;
            }
          }
          else
          {
            if (this.values.variable != null && this.values.xaxis != null && this.values.valueColumn != null)
            {
              this.generateBtnEnabled = true;
              return true;
            }
          }
        }
      }
    }

    this.generateBtnEnabled = false;
    return false;
  }

  initPanelSettings(): void
  {
    let i, options, option;

    if (this.values.currentOption)
    {
      this.values.chartColumnOptions = [];
      this.values.tableVariables = [];

      for (let columnConfig of this.values.currentOption.columnOptions)
      {
        this.values.chartColumnOptions.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel, item: columnConfig } );
        this.values.tableVariables.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel, itemId: columnConfig.id, grouping: columnConfig.grouping, checked: true } );
      }

      this.filteredVariables.next (this.values.chartColumnOptions.slice ());

      this.searchChange (this.variableFilterCtrl);
      this.searchChange (this.xaxisFilterCtrl);
      this.searchChange (this.valueFilterCtrl);

      this.searchChange (this.infoVar1FilterCtrl);
      this.searchChange (this.infoVar2FilterCtrl);
      this.searchChange (this.infoVar3FilterCtrl);

      this.searchChange (this.columnFilterCtrl);
    }

    // refresh the following two values to avoid a blank form
    if (this.values.currentChartType != null && this.values.currentChartType != -1)
    {
      for (i = 0; i < this.chartTypes.length; i++)
      {
        if (i == this.values.currentChartType)
        {
          this.values.currentChartType = this.chartTypes[i];
          break;
        }
      }
    }
    else
      this.values.currentChartType = this.chartTypes[0];

    // set the form values
    if (this.values.currentOption)
    {
      options = this.values.options;

      for (i = 0; i < options.length; i++)
      {
        option = options[i];

        if (option.id == this.values.currentOption.id)
        {
          this.panelForm.get ('dataFormCtrl').setValue (option);
          this.panelForm.get ('variableCtrl').enable ();
          this.panelForm.get ('columnCtrl').enable ();
          this.panelForm.get ('fontSizeCtrl').enable ();
          this.panelForm.get ('valueFontSizeCtrl').enable ();
          this.panelForm.get ('valueOrientationCtrl').enable ();
          this.panelForm.get ('functionCtrl').enable ();

          // only enable x axis if the chart type is not pie, donut or radar
          if (this.values.currentChartType.flags & ChartFlags.XYCHART)
            this.panelForm.get ('xaxisCtrl').enable ();

          this.panelForm.get ('valueCtrl').enable ();
          this.panelForm.get ('valueListCtrl').enable ();
          this.panelForm.get ('geodataValueCtrl').enable ();
          this.panelForm.get ('geodataKeyCtrl').enable ();
          this.values.currentOption = option;
          break;
        }
      }
    }

    if (this.values.currentChartType.flags & ChartFlags.HEATMAP)
    {
      if (this.values.chartColumnOptions.length)
      {
        this.variableCtrlBtnEnabled = true;

        if (this.values.variable != null && this.values.variable != -1)
        {
          for (i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (this.values.variable == this.values.chartColumnOptions[i].item.id)
            {
              this.panelForm.get ('geodataValueCtrl').setValue (this.values.chartColumnOptions[i]);
              this.values.variable = this.values.chartColumnOptions[i];
              break;
            }
          }
        }

        if (this.values.valueColumn != null && this.values.valueColumn != -1)
        {
          for (i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (this.values.valueColumn == this.values.chartColumnOptions[i].item.id)
            {
              this.panelForm.get ('geodataKeyCtrl').setValue (this.values.chartColumnOptions[i]);
              this.values.valueColumn = this.values.chartColumnOptions[i];
              break;
            }
          }
        }
      }

      if (this.values.function != null && this.values.function != -1)
      {
        for (i = 0; i < this.geodatas.length; i++)
        {
          if (i == this.values.function)
          {
            this.values.geodata = this.geodatas[i];
            break;
          }
        }
      }
      else
        this.values.geodata = this.geodatas[0];

      this.values.function = this.functions[0];
      this.checkChartType ();
      return;
    }
    else
      this.values.geodata = this.geodatas[0];

    // picture and map panels doesn't need any data
    if (this.values.currentChartType.flags & ChartFlags.PICTURE)
      this.variableCtrlBtnEnabled = false;
    else if (this.values.currentChartType.flags & ChartFlags.MAP)
    {
      if (this.values.chartColumnOptions.length)
        this.variableCtrlBtnEnabled = true;

      if (this.values.currentChartType.flags & ChartFlags.MAPBOX)
      {
        if (this.values.function == 1)
        {
          if (this.values.variable != null && this.values.variable != -1)
          {
            for (i = 0; i < this.msfMapRef.mapTypes.length; i++)
            {
              if (i == this.values.variable)
              {
                this.values.style = this.msfMapRef.mapTypes[i];
                this.values.variable = -1;
                break;
              }
            }
          }
          else
            this.values.style = this.msfMapRef.mapTypes[1];
        }
        else
        {
          for (i = 0; i < this.msfMapRef.mapTypes.length; i++)
          {
            if (this.msfMapRef.mapTypes[i].id == this.values.style.id)
            {
              this.values.style = this.msfMapRef.mapTypes[i];
              break;
            }
          }
        }
      }

      this.checkChartType ();
      return;
    }

    if (this.values.currentChartType.flags & ChartFlags.DYNTABLE)
    {
      if (this.values.chartColumnOptions.length)
        this.variableCtrlBtnEnabled = true;

      if (this.values.lastestResponse)
      {
        this.values.dynTableVariables = [];

        for (let variable of this.values.lastestResponse.variables)
        {
          for (let columnOption of this.values.chartColumnOptions)
          {
            if (columnOption.id === variable.id)
            {
              let tableVariable;

              this.values.dynTableVariables.push (columnOption);

              tableVariable = this.values.dynTableVariables[this.values.dynTableVariables.length - 1];
              tableVariable.direction = variable.direction;
              tableVariable.order = variable.order;
              break;
            }
          }
        }

        this.values.dynTableValues = [];

        for (let value of this.values.lastestResponse.values)
        {
          for (let columnOption of this.values.chartColumnOptions)
          {
            if (columnOption.id === value.id)
            {
              let tableValue;

              this.values.dynTableValues.push (columnOption);

              tableValue = this.values.dynTableValues[this.values.dynTableValues.length - 1];
              tableValue.order = value.order;

              if (value.summary)
              {
                tableValue.summary = value.summary;

                if (value.sumAlias)
                  tableValue.sumAlias = value.sumAlias;
              }

              if (value.average)
              {
                tableValue.average = value.average;

                if (value.avgAlias)
                  tableValue.avgAlias = value.avgAlias;
              }

              if (value.mean)
              {
                tableValue.mean = value.mean;

                if (value.meanAlias)
                  tableValue.meanAlias = value.meanAlias;
              }

              if (value.max)
              {
                tableValue.max = value.max;

                if (value.maxAlias)
                  tableValue.maxAlias = value.maxAlias;
              }

              if (value.min)
              {
                tableValue.min = value.min;

                if (value.minAlias)
                  tableValue.minAlias = value.minAlias;
              }

              if (value.stddeviation)
              {
                tableValue.stddeviation = value.stddeviation;

                if (value.stdDevAlias)
                  tableValue.stdDevAlias = value.stdDevAlias;
              }

              if (value.count)
              {
                tableValue.count = value.count;

                if (value.cntAlias)
                  tableValue.cntAlias = value.cntAlias;
              }

              break;
            }
          }
        }
      }

      this.checkChartType ();
      return;
    }

    if (this.values.currentChartType.flags & ChartFlags.TABLE)
    {
      if (this.values.chartColumnOptions.length)
        this.variableCtrlBtnEnabled = true;

      // set table column filters settings if loaded from database
      this.values.tableVariables = [];

      for (let columnConfig of this.values.chartColumnOptions)
        this.values.tableVariables.push ( { id: columnConfig.id, name: columnConfig.name, itemId: columnConfig.item.id, grouping: columnConfig.item.grouping, checked: true } );

      for (i = 0; i < this.values.lastestResponse.length; i++)
      {
        let tableColumn = this.values.lastestResponse[i];

        if (tableColumn.id == null)
          continue;
  
        for (let j = 0; j < this.values.tableVariables.length; j++)
        {
          let curVariable = this.values.tableVariables[j];
  
          if (curVariable.itemId == tableColumn.id)
          {
            curVariable.checked = tableColumn.checked;
            break;
          }
        }
      }

      this.checkChartType ();
      return;
    }

    if (this.values.currentChartType.flags & ChartFlags.FORM)
    {
      // reset form column selection combo boxes
      this.panelForm.get ('columnCtrl').reset ();
      this.panelForm.get ('fontSizeCtrl').setValue (this.fontSizes[1]);
      this.panelForm.get ('valueFontSizeCtrl').setValue (this.fontSizes[1]);
      this.panelForm.get ('valueOrientationCtrl').setValue (this.orientations[0]);
      this.panelForm.get ('functionCtrl').setValue (this.functions[0]);

      // set form variable settings if loaded from database
      if (this.values.function != null && this.values.function != -1)
      {
        this.values.formVariables = [];

        for (let formVariable of this.values.lastestResponse)
        {
          let columnIndex = 0;

          for (let i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (this.values.chartColumnOptions[i].item.id == formVariable.column)
            {
              columnIndex = i;
              break;
            }
          }

          this.values.formVariables.push ({
            value: formVariable.value,
            column: this.values.chartColumnOptions[columnIndex],
            fontSize: this.fontSizes[formVariable.fontSize],
            valueFontSize: this.fontSizes[formVariable.valueFontSize],
            valueOrientation: this.orientations[formVariable.valueOrientation],
            function: this.functions[formVariable.function]
          });
        }
      }
      else
      {
        // set the column for each value
        if (this.values.formVariables.length)
        {
          for (let formVariable of this.values.formVariables)
          {
            let columnIndex = 0;

            for (let i = 0; i < this.values.chartColumnOptions.length; i++)
            {
              if (this.values.chartColumnOptions[i].item.id == formVariable.column)
              {
                columnIndex = i;
                break;
              }
            }

            formVariable.column = this.values.chartColumnOptions[columnIndex];
          }
        }
      }

      this.values.lastestResponse = [];

      for (let formVariable of this.values.formVariables)
      {
        this.values.lastestResponse.push ({
          value: formVariable.value,
          column: formVariable.column.item,
          fontSize: formVariable.fontSize,
          valueFontSize: formVariable.valueFontSize,
          valueOrientation: formVariable.valueOrientation,
          function: formVariable.function
        });
      }
    }
    else if (this.values.currentChartType.flags & ChartFlags.INFO)
    {
      this.values.infoNumVariables = 0;

      if (this.values.chartColumnOptions.length)
      {
        if (this.values.variable != null && this.values.variable != -1)
        {
          for (i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (this.values.variable == this.values.chartColumnOptions[i].item.id)
            {
              this.values.infoVar1 = this.values.chartColumnOptions[i];
              this.values.variable = null;
              this.values.infoNumVariables++;
              break;
            }
          }
        }
  
        if (this.values.xaxis != null && this.values.xaxis != -1)
        {
          for (i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (this.values.xaxis == this.values.chartColumnOptions[i].item.id)
            {
              this.values.infoVar2 = this.values.chartColumnOptions[i];
              this.values.xaxis = null;
              this.values.infoNumVariables++;
              break;
            }
          }
        }
  
        if (this.values.valueColumn != null && this.values.valueColumn != -1)
        {
          for (i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (this.values.valueColumn == this.values.chartColumnOptions[i].item.id)
            {
              this.values.infoVar3 = this.values.chartColumnOptions[i];
              this.values.valueColumn = null;
              this.values.infoNumVariables++;
              break;
            }
          }
        }
      }

      // set function values
      for (i = 0; i < this.values.lastestResponse.length; i++)
      {
        let item = this.values.lastestResponse[i];
        let infoFunc, j;

        switch (item.id)
        {
          case 2:
            infoFunc = this.values.infoFunc3;
            break;
  
          case 1:
            infoFunc = this.values.infoFunc2;
            break;
  
          default:
            infoFunc = this.values.infoFunc1;
            break;
        }

        switch (item.function)
        {
          case 'avg':
            j = 0;
            break;

          case 'sum':
            j = 1;
            break;

          case 'max':
            j = 2;
            break;

          case 'min':
            j = 3;
            break;

          case 'count':
            j = 4;
            break;

          default:
            j = -1;
        }

        if (j != -1)
        {
          infoFunc[j].checked = true;
          infoFunc[j].title = item.title;
          infoFunc[j].measure = item.measure;
        }
      }
    }
    else
    {
      if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
      {
        if (this.values.function != null && this.values.function != -1)
        {
          if (this.values.function == 1)
            this.values.intervalType = "value";
          else
            this.values.intervalType = "ncile";
        }

        this.values.function = null;
      }
      else
      {
        if (this.values.function != null && this.values.function != -1)
        {
          for (i = 0; i < this.functions.length; i++)
          {
            if (i == this.values.function)
            {
              this.values.function = this.functions[i];
              break;
            }
          }
        }
        else
          this.values.function = this.functions[0];
      }

      if (this.values.chartColumnOptions.length)
      {
        if (this.values.variable != null && this.values.variable != -1)
        {
          for (i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (this.values.variable == this.values.chartColumnOptions[i].item.id)
            {
              this.panelForm.get ('variableCtrl').setValue (this.values.chartColumnOptions[i]);
              this.values.variable = this.values.chartColumnOptions[i];
              break;
            }
          }
        }

        if (this.values.xaxis != null && this.values.xaxis != -1)
        {
          for (i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (this.values.xaxis == this.values.chartColumnOptions[i].item.id)
            {
              this.panelForm.get ('xaxisCtrl').setValue (this.values.chartColumnOptions[i]);
              this.values.xaxis = this.values.chartColumnOptions[i];
              break;
            }
          }
        }

        if (this.isSimpleChart ())
        {
          if (this.values.valueColumn != null && this.values.valueColumn != -1)
          {
            this.values.valueList = [];

            // Convert older simple charts
            for (i = 0; i < this.values.chartColumnOptions.length; i++)
            {
              if (this.values.valueColumn == this.values.chartColumnOptions[i].item.id)
              {
                this.values.valueList.push (this.values.chartColumnOptions[i]);
                break;
              }
            }

            this.values.valueColumn = null;
          }
          else if (this.values.valueList != null)
          {
            this.values.valueList = this.values.valueList.split (",");

            for (i = 0; i < this.values.valueList.length; i++)
            {
              for (let j = 0; j < this.values.chartColumnOptions.length; j++)
              {
                if (this.values.valueList[i] == this.values.chartColumnOptions[j].item.id)
                {
                  this.values.valueList[i] = this.values.chartColumnOptions[j];
                  break;
                }
              }
            }
          }

          this.panelForm.get ('valueListCtrl').setValue (this.values.valueList);
        }
        else if (this.values.valueColumn != null && this.values.valueColumn != -1)
        {
          for (i = 0; i < this.values.chartColumnOptions.length; i++)
          {
            if (this.values.valueColumn == this.values.chartColumnOptions[i].item.id)
            {
              this.panelForm.get ('valueCtrl').setValue (this.values.chartColumnOptions[i]);
              this.values.valueColumn = this.values.chartColumnOptions[i];
              break;
            }
          }
        }
      }
    }

    if (this.values.chartColumnOptions.length)
      this.variableCtrlBtnEnabled = true;

    this.checkChartType ();
  }

  handlerUpdateSuccess(_this): void
  {
    if (!_this.values.isLoading)
      return;

    // set lastestResponse to null and remove temporary values since the panel has been updated
    _this.values.lastestResponse = null;
    _this.values.chartGenerated = false;
    _this.values.infoGenerated = false;
    _this.values.formGenerated = false;
    _this.values.picGenerated = false;
    _this.values.tableGenerated = false;
    _this.values.mapboxGenerated = false;
    _this.values.dynTableGenerated = false;
    _this.temp = null;
    _this.values.isLoading = false;
  }

  prepareToSavePanel(): void
  {
    let panel;

    if (this.values.currentChartType.flags & ChartFlags.TABLE)
    {
      let tableVariableIds = [];

      panel = this.getPanelInfo ();
      panel.function = -1;

      for (let tableVariable of this.values.tableVariables)
      {
        tableVariableIds.push ({
          id: tableVariable.itemId,
          checked: tableVariable.checked
        });
      }

      panel.lastestResponse = JSON.stringify (tableVariableIds);
    }
    else if (this.values.currentChartType.flags & ChartFlags.FORM)
    {
      let formVariables = [];

      panel = this.getPanelInfo ();
      panel.function = 2;

      for (let formVariable of this.values.formVariables)
      {
        formVariables.push ({
          value: null,
          column: formVariable.column.item.id,
          fontSize: this.fontSizes.indexOf (formVariable.fontSize),
          valueFontSize: this.fontSizes.indexOf (formVariable.valueFontSize),
          valueOrientation: this.orientations.indexOf (formVariable.valueOrientation),
          function: this.functions.indexOf (formVariable.function)
        });
      }

      panel.lastestResponse = JSON.stringify (formVariables);
    }
    else if (this.values.currentChartType.flags & ChartFlags.INFO
      && !(this.values.currentChartType.flags & ChartFlags.PICTURE)
      && !(this.values.currentChartType.flags & ChartFlags.MAP)
      && !(this.values.currentChartType.flags & ChartFlags.HEATMAP)
      && !(this.values.currentChartType.flags & ChartFlags.DYNTABLE))
    {
      let variables;

      panel = this.getPanelInfo ();
      panel.function = -1;

      // Prepare list of variables
      variables = [];

      for (let i = 0; i < this.values.infoNumVariables; i++)
      {
        let infoVar, infoFunc;

        switch (i)
        {
          case 2:
            infoVar = this.values.infoVar3;
            infoFunc = this.values.infoFunc3;
            break;

          case 1:
            infoVar = this.values.infoVar2;
            infoFunc = this.values.infoFunc2;
            break;

          default:
            infoVar = this.values.infoVar1;
            infoFunc = this.values.infoFunc1;
            break;
        }

        for (let j = 0; j < 5; j++)
        {
          if (!infoFunc[j].checked)
            continue;

          variables.push ({
            id : i,
            function : infoFunc[j].id,
            title : infoFunc[j].title,
            measure : infoFunc[j].measure,
            column : infoVar.id
          });
        }
      }

      panel.lastestResponse = JSON.stringify (variables);
    }
    else if (this.values.currentChartType.flags & ChartFlags.PICTURE)
    {
      panel = this.getPanelInfo ();
      panel.lastestResponse = this.values.urlImg;
    }
    else
    {
      panel = this.getPanelInfo ();
      panel.lastestResponse = null;
    }

    this.values.isLoading = true;
    this.service.updateDashboardPanel (this, panel, this.handlerUpdateSuccess, this.handlerError);
  }

  savePanel(fromDialog: boolean): void
  {
    if (fromDialog)
    {
      this.prepareToSavePanel ();
      return;
    }

    this.service.confirmationDialog (this, "Are you sure you want to save the changes?",
      function (_this)
      {
        if (_this.dialogData)
        {
          _this.dialogRef.close ({ savePanel: true });
          return;
        }

        _this.prepareToSavePanel ();
      });
  }

  isInformationPanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.INFO
      && !(this.values.currentChartType.flags & ChartFlags.FORM)
      && !(this.values.currentChartType.flags & ChartFlags.PICTURE)) ? true : false;
  }

  isSimpleChart(): boolean
  {
    return !(this.values.currentChartType.flags & ChartFlags.XYCHART)
      && !(this.values.currentChartType.flags & ChartFlags.ADVANCED)
      && !(this.values.currentChartType.flags & ChartFlags.PIECHART)
      && !(this.values.currentChartType.flags & ChartFlags.FUNNELCHART);
  }

  isSimpleFormPanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.FORM) ? true : false;
  }

  isPicturePanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.PICTURE) ? true : false;
  }

  isTablePanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.TABLE) ? true : false;
  }

  isDynTablePanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.DYNTABLE) ? true : false;
  }

  isAdvChartPanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.ADVANCED) ? true : false;
  }

  isMapPanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.MAP
      && !(this.values.currentChartType.flags & ChartFlags.HEATMAP)
      && !(this.values.currentChartType.flags & ChartFlags.MAPBOX)) ? true : false;
  }

  isHeatMapPanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.HEATMAP) ? true : false;
  }

  isMapboxPanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.MAPBOX) ? true : false;
  }

  checkNumVariables(): void
  {
    let i;

    if (this.values.infoNumVariables < 2)
    {
      this.values.infoVar2 = null;

      for (i = 0; i < this.values.infoFunc2.length; i++)
        this.values.infoFunc2[i].checked = false;
    }

    if (this.values.infoNumVariables != 3)
    {
      this.values.infoVar3 = null;

      for (i = 0; i < this.values.infoFunc3.length; i++)
        this.values.infoFunc3[i].checked = false;
    }

    this.checkPanelConfiguration ();
  }

  goToFunctions(infoVarNum): void
  {
    let infoVar, infoFunc;

    switch (infoVarNum)
    {
      case 2:
        infoVar = this.values.infoVar3;
        infoFunc = this.values.infoFunc3;
        break;

      case 1:
        infoVar = this.values.infoVar2;
        infoFunc = this.values.infoFunc2;
        break;

      default:
        infoVar = this.values.infoVar1;
        infoFunc = this.values.infoFunc1;
        break;
    }

    const dialogRef = this.dialog.open (MsfDashboardInfoFunctionsComponent, {
      height: '382px',
      width: '600px',
      panelClass: 'msf-dashboard-control-variables-dialog',
      autoFocus: false,
      data: {
        title: this.values.chartName,
        subTitle: "Variable #" + (infoVarNum + 1) + ": " + infoVar.name,
        functions: infoFunc
      }
    });

    dialogRef.afterClosed ().subscribe (
      () => this.checkPanelConfiguration ()
    );
  }

  getResultValue(result): string
  {
    return new Intl.NumberFormat ('en-us', { maximumFractionDigits: 1 }).format (result);
  }

  goToAdditionalSettings(): void
  {
    let configFlags = ConfigFlags.NONE;

    if (this.values.currentChartType.flags & ChartFlags.FORM ||
      this.values.currentChartType.flags & ChartFlags.TABLE)
      configFlags = ConfigFlags.THRESHOLDS;
    else if (this.values.currentChartType.flags & ChartFlags.PIECHART
      || this.values.currentChartType.flags & ChartFlags.FUNNELCHART)
      configFlags = ConfigFlags.LIMITVALUES | ConfigFlags.CHARTCOLORS;
    else if (this.values.currentChartType.flags & ChartFlags.HEATMAP)
      configFlags = ConfigFlags.HEATMAPCOLOR | ConfigFlags.CHARTCOLORS;
    else if (this.values.currentChartType.flags & ChartFlags.XYCHART || this.isSimpleChart ())
    {
      configFlags = ConfigFlags.CHARTCOLORS | ConfigFlags.GOALS;

      if (!(this.values.currentChartType.flags & ChartFlags.XYCHART))
      {
        configFlags |= ConfigFlags.LIMITVALUES;

        if (this.isSimpleChart ())
          configFlags |= ConfigFlags.THRESHOLDS;
      }
    }

    // don't allow the option to limit results on advanced charts
    if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
    {
      configFlags &= ~ConfigFlags.LIMITVALUES;
      configFlags |= ConfigFlags.LIMITAGGREGATOR;
    }

    this.dialog.open (MsfDashboardAdditionalSettingsComponent, {
      width: '400px',
      height: 'auto',
      panelClass: 'msf-dashboard-control-variables-dialog',
      autoFocus: false,
      data: {
        values: this.values,
        configFlags: configFlags
      }
    });
  }

  goToDrillDownSettings(): void
  {
    let childChart = {
      types: null
    };

    // clear child panel list befre opening drill down dialog
    this.childPanelValues = [];
    this.childPanelsConfigured = [];

    let dialogRef = this.dialog.open (MsfDashboardDrillDownComponent, {
      height: (this.values.chartName && this.values.chartName.length >= 45) ? '590px ': '560px',
      width: '450px',
      panelClass: 'msf-dashboard-child-panel-dialog',
      data: {
        title: this.values.chartName,
        description: this.values.chartDescription,
        optionId: this.values.currentOption.id,
        parentPanelId: this.values.id,
        childPanelValues: this.childPanelValues,
        drillDownOptions: this.values.currentOption.drillDownOptions,
        childPanelsConfigured: this.childPanelsConfigured,
        categoryOptions: JSON.stringify (this.values.currentOptionCategories),
        functions: this.functions,
        childChart: childChart,
        updateTimeInterval: 0,
        options: this.values.options
      }
    });

    dialogRef.afterClosed ().subscribe (
      (panelToDelete) => {
        if (panelToDelete)
        {
          this.values.isLoading = true;
          this.service.deleteChildPanel (this, panelToDelete, this.drillDownPanelDeleted, this.drillDownSettingsError);
        }
        else
          this.saveChildPanels (childChart.types);
      }
    );
  }

  getChildPanelsInfo(childChartTypes, drillDownIds): any[]
  {
    let childPanels = [];

    for (let i = 0; i < this.childPanelValues.length; i++)
    {
      let value: MsfDashboardPanelValues = this.childPanelValues[i];

      if (!this.childPanelsConfigured[i])
         continue;

      if (value.currentChartType.flags & ChartFlags.TABLE)
      {
        let tableVariableIds = [];

        for (let tableVariable of value.tableVariables)
        {
          tableVariableIds.push ({
            id: tableVariable.itemId,
            checked: tableVariable.checked
          });
        }

        childPanels.push ({
          id: value.id,
          option: value.currentOption,
          title: value.chartName,
          description: value.chartDescription,
          chartColumnOptions: JSON.stringify (value.chartColumnOptions),
          chartType: childChartTypes.indexOf (value.currentChartType),
          lastestResponse: JSON.stringify (tableVariableIds),
          ordered: null,
          startAtZero: null
        });
      }
      else
      {
        childPanels.push ({
          id: value.id,
          option: value.currentOption,
          title: value.chartName,          
          description: value.chartDescription,
          chartColumnOptions: JSON.stringify (value.chartColumnOptions),
          analysis: value.chartColumnOptions ? (value.variable ? value.variable.item.id : null) : null,
          xaxis: value.chartColumnOptions ? (value.xaxis ? value.xaxis.item.id : null) : null,
          values: value.chartColumnOptions ? (value.valueColumn ? value.valueColumn.item.id : null) : null,
          function: this.functions.indexOf (value.function),
          chartType: childChartTypes.indexOf (value.currentChartType),
          paletteColors: JSON.stringify (value.paletteColors),
          vertAxisName: value.vertAxisName,
          horizAxisName: value.horizAxisName,
          startAtZero: value.startAtZero,
          ordered: value.ordered
        });
      }

      drillDownIds.push (this.values.currentOption.drillDownOptions[i].id);
      this.childPanelsConfigured[i] = false;
    }

    return childPanels;
  }

  saveChildPanels(childChartTypes): void
  {
    let drillDownIds = [];
    let childPanels = this.getChildPanelsInfo (childChartTypes, drillDownIds);

    if (!childPanels.length)
      return;

    this.values.isLoading = true;
    this.service.saveChildPanels (this, childPanels, this.values.id, drillDownIds, this.drillDownSettingsClear, this.drillDownSettingsError);
  }

  drillDownPanelDeleted(_this, data): void
  {
    for (let childPanel of _this.values.childPanels)
    {
      if (childPanel.childPanelId == data)
      {
        _this.values.childPanels.splice (_this.values.childPanels.indexOf (childPanel), 1);
        break;
      }
    }

    if (_this.values.childPanels.length > 1)
    {
      _this.values.childPanels.sort (function (e1, e2) {
        return e1.id - e2.id;
      });
    }

    _this.values.isLoading = false;
  }

  // update child panel list after success or failure
  drillDownSettingsClear(_this, data): void
  {
    let drillDownInfo: any[] = [];
    let childPanelNames: any[] = [];

    _this.values.childPanels = [];

    drillDownInfo = data.drillDownInfo;
    childPanelNames = data.childPanelNames;

    if (!drillDownInfo.length)
    {
      // we're done if there are no child panels
      _this.values.isLoading = false;
      return;
    }

    for (let i = 0; i < drillDownInfo.length; i++)
    {
      _this.values.childPanels.push ({
        id: drillDownInfo[i].drillDownId,
        title: childPanelNames[i],
        childPanelId: drillDownInfo[i].childPanelId
      });
    }

    _this.values.isLoading = false;
  }

  drillDownSettingsError(_this, results): void
  {
    _this.values.isLoading = false;
  }

  isFormColumnValid(): boolean
  {
    return (this.panelForm.get ('columnCtrl').value && this.panelForm.get ('fontSizeCtrl').value
      && this.panelForm.get ('valueFontSizeCtrl').value && this.panelForm.get ('valueOrientationCtrl').value
      && this.panelForm.get ('functionCtrl').value);
  }

  addColumnIntoForm(): void
  {
    this.values.formVariables.push ({
      column: this.panelForm.get ('columnCtrl').value,
      fontSize:  this.panelForm.get ('fontSizeCtrl').value,
      valueFontSize: this.panelForm.get ('valueFontSizeCtrl').value,
      valueOrientation: this.panelForm.get ('valueOrientationCtrl').value,
      function: this.panelForm.get ('functionCtrl').value
    });

    // reset main column and font size values
    this.panelForm.get ('columnCtrl').reset ();
    this.panelForm.get ('fontSizeCtrl').setValue (this.fontSizes[1]);
    this.panelForm.get ('valueFontSizeCtrl').setValue (this.fontSizes[1]);
    this.panelForm.get ('valueOrientationCtrl').setValue (this.orientations[0]);
    this.panelForm.get ('functionCtrl').setValue (this.functions[0]);
    this.checkPanelConfiguration ();
  }

  deleteColumnFromForm(index): void
  {
    this.values.formVariables.splice (index, 1);
    this.checkPanelConfiguration ();
  }

  getFormFontSize(column): number
  {
    return this.values.formVariables[column].fontSize.value;
  }

  getValueFormFontSize(column): number
  {
    return this.values.formVariables[column].valueFontSize.value;
  }

  startUpdateInterval(): void
  {
    if (!this.values.updateIntervalSwitch)
      return; // don't start the interval if no update time is set

    // set update time first before starting the interval
    this.updateTimeLeft = this.values.updateTimeLeft;

    this.updateInterval = setInterval (() =>
    {
      if (this.updateTimeLeft)
        this.updateTimeLeft--;

      if (!this.updateTimeLeft)
      {
        this.updateTimeLeft = this.values.updateTimeLeft;
        this.loadData ();
      }
    }, 60000); // update interval each minute
  }

  stopUpdateInterval(): void
  {
    if (!this.values.updateIntervalSwitch)
      return;

    clearInterval (this.updateInterval);
  }

  sharePanel(): void
  {
    this.dialog.open (MsfShareDashboardComponent, {
      height: '430px',
      width: '400px',
      panelClass: 'msf-dashboard-child-panel-dialog',
      data: {
        isPanel: true,
        dashboardContentId: this.values.id,
        dashboardContentTitle: this.values.chartName,
        dashboardContentDescription: this.values.chartDescription
      }
    });
  }

  swapFormVariablePositions(event: CdkDragDrop<MsfDashboardPanelValues[]>): void
  {
    // move items
    moveItemInArray (this.values.formVariables, event.previousIndex, event.currentIndex);
  }

  deleteColumnFromTable(index): void
  {
    this.values.tableVariables.splice (index, 1);
  }

  finishLoadingTable(error)
  {
    if (error)
    {
      this.handlerTableError (this, null);
      return;
    }

    if(this.values.currentOption.tabType != "legacy"){
      if(this.values.showMoreResult){
        this.values.showPaginator = false;
      }else{
        this.values.showPaginator = true;
      }
    }else{
      this.values.showPaginator = false;
    }

    // hide paginator if there are no results
    if (this.msfTableRef.tableOptions)
    {
      if (!this.msfTableRef.tableOptions.dataSource && !this.msfTableRef.tableOptions.template)
        this.values.showPaginator = false;
    }

    // only save the lastest response if the page number of the table is the first one
    if (!this.actualPageNumber)
    {
      this.values.lastestResponse = [];

      for (let tableVariable of this.values.tableVariables)
        this.values.lastestResponse.push ({ id: tableVariable.itemId, checked: tableVariable.checked });

      this.service.saveLastestResponse (this, this.getPanelInfo (), this.handlerTableLastestResponse, this.handlerTableError);
    }
    else
    {
      this.values.isLoading = false;

      this.values.displayTable = true;
      this.values.chartGenerated = false;
      this.values.infoGenerated = false;
      this.values.formGenerated = false;
      this.values.picGenerated = false;
      this.values.tableGenerated = true;
      this.values.mapboxGenerated = false;
      this.values.dynTableGenerated = false;

      // resume the update interval if activated
      if (this.values.updateIntervalSwitch)
      {
        this.updateInterval = setInterval (() =>
        {
          if (this.updateTimeLeft)
            this.updateTimeLeft--;
  
          if (!this.updateTimeLeft)
          {
            this.updateTimeLeft = this.values.updateTimeLeft;
            this.loadData ();
          }
        }, 60000); // update interval each minute
      }
    }
  }

  moreTableResults()
  {
    if (this.moreResultsBtn)
    {
      this.moreResults = false;
      this.values.isLoading = true;
      this.stopUpdateInterval ();

      setTimeout (() => {
        this.loadTableData (true, this.msfTableRef.handlerSuccess, this.msfTableRef.handlerError);
      }, 3000);
    }
  }

  haveTableDataSource(): boolean
  {
    if (!this.msfTableRef)
      return false;

    return this.msfTableRef.dataSource ? true : false;
  }

  toggleMapRoute(route): void
  {
    let theme, tempLat, tempLng, sumX, sumY, sumZ, avgX, avgY, avgZ;
    let circle, label, imageSeriesTemplate, hoverState;
    let newCities, curcity;
    let zoomLevel, self;

    theme = this.globals.theme;
    self = this;
    newCities = [];

    function goForward(plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute)
    {
      let animation;

      if (curRoute == -1 && plane.rotation)
      {
        shadowPlane.rotation = 0;
        shadowPlane.opacity = 0;

        plane.animate ({
          to: 0,
          property: "rotation"
        }, 1000).events.on ("animationended",
          function() {
            curRoute = 0;

            planeContainer.mapLine = routes[curRoute].normal;
            planeContainer.parent = self.lineSeries;
            shadowPlaneContainer.mapLine = routes[curRoute].shadow;
            shadowPlaneContainer.parent = self.shadowLineSeries;

            goForward (plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute);
          }
        );

        return;
      }
      else
        shadowPlane.opacity = 0.75;

      animation = planeContainer.animate ({
        property: "position",
        from: 0,
        to: 1
      }, 6000).delay (300);

      shadowPlaneContainer.animate ({
        property: "position",
        from: 0,
        to: 1
      }, 6000).delay (300);

      animation.events.on ("animationended",
        function() {
          curRoute++;
          if (curRoute == routes.length)
            goBack (plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute);
          else
          {
            planeContainer.mapLine = routes[curRoute].normal;
            planeContainer.parent = self.lineSeries;
            shadowPlaneContainer.mapLine = routes[curRoute].shadow;
            shadowPlaneContainer.parent = self.shadowLineSeries;

            goForward (plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute);
          }
        }
      );
    }

    function goBack(plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute)
    {
      let animation;

      if (curRoute == routes.length && plane.rotation != 180)
      {
        shadowPlane.rotation = 180;
        shadowPlane.opacity = 0;

        plane.animate ({
          to: 180,
          property: "rotation"
        }, 1000).events.on ("animationended",
          function() {
            curRoute = routes.length - 1;

            planeContainer.mapLine = routes[curRoute].normal;
            planeContainer.parent = self.lineSeries;
            shadowPlaneContainer.mapLine = routes[curRoute].shadow;
            shadowPlaneContainer.parent = self.shadowLineSeries;

            goBack (plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute);
          }
        );

        return;
      }
      else
        shadowPlane.opacity = 0.75;

      animation = planeContainer.animate ({
        property: "position",
        from: 1,
        to: 0
      }, 6000).delay (300);
  
      shadowPlaneContainer.animate ({
        property: "position",
        from: 1,
        to: 0
      }, 6000).delay (300);

      animation.events.on ("animationended",
        function() {
          curRoute--;
          if (curRoute == -1)
            goForward (plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute);
          else
          {
            planeContainer.mapLine = routes[curRoute].normal;
            planeContainer.parent = self.lineSeries;
            shadowPlaneContainer.mapLine = routes[curRoute].shadow;
            shadowPlaneContainer.parent = self.shadowLineSeries;

            goBack (plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute);
          }
        }
      );
    }

    if (!route.checked)
    {
      for (let airport of route.airports)
      {
        curcity = null;

        // Check if the cities city before removing it
        for (let city of this.checkedCities)
        {
          if (city.title === airport.title)
            curcity = city;
        }

        if (curcity)
        {
          curcity.numRoutes--;
          if (!curcity.numRoutes)
            this.checkedCities.splice (this.checkedCities.indexOf (curcity), 1);
        }
      }

      for (let checkedRoute of this.checkedRoutes)
      {
        if (route === checkedRoute)
        {
          this.checkedRoutes.splice (this.checkedRoutes.indexOf (checkedRoute), 1);
          break;
        }
      }
    }
    else
    {
      for (let airport of route.airports)
      {
        curcity = null;

        // Check if the city exists before adding it
        for (let city of this.checkedCities)
        {
          if (city.title === airport.title)
            curcity = city;
        }

        if (curcity)
          curcity.numRoutes++;
        else
        {
          this.checkedCities.push (airport);
          this.checkedCities[this.checkedCities.length - 1].numRoutes = 1;
        }
      }

      this.checkedRoutes.push (route);
    }

    this.zone.runOutsideAngular (() => {
      if (this.imageSeries != null)
        this.chart.series.removeIndex (this.chart.series.indexOf (this.imageSeries));

      // Create image container for the circles and city labels
      this.imageSeries = this.chart.series.push (new am4maps.MapImageSeries ());
      imageSeriesTemplate = this.imageSeries.mapImages.template;

      // Set property fields for the cities
      imageSeriesTemplate.propertyFields.latitude = "latitude";
      imageSeriesTemplate.propertyFields.longitude = "longitude";
      imageSeriesTemplate.horizontalCenter = "middle";
      imageSeriesTemplate.verticalCenter = "middle";
      imageSeriesTemplate.width = 8;
      imageSeriesTemplate.height = 8;
      imageSeriesTemplate.scale = 1;
      imageSeriesTemplate.fill = Themes.AmCharts[theme].tooltipFill;
      imageSeriesTemplate.background.fillOpacity = 0;
      imageSeriesTemplate.background.fill = Themes.AmCharts[theme].mapCityColor;
      imageSeriesTemplate.setStateOnChildren = true;

      // Configure circle and city labels
      circle = imageSeriesTemplate.createChild (am4core.Sprite);
      circle.defaultState.properties.fillOpacity = 1;
      circle.path = targetSVG;
      circle.scale = 0.75;
      circle.fill = Themes.AmCharts[theme].mapCityColor;
      circle.dx -= 2.5;
      circle.dy -= 2.5;
      hoverState = circle.states.create ("hover");
      hoverState.properties.fill = comet;

      label = imageSeriesTemplate.createChild (am4core.Label);
      label.text = "{tooltipText}";
      label.scale = 1;
      label.horizontalCenter = "left";
      label.verticalCenter = "middle";
      label.dx += 17.5;
      label.dy += 5.5;
      label.fill = Themes.AmCharts[theme].mapCityColor;
      hoverState = label.states.create ("hover");
      hoverState.properties.fill = Themes.AmCharts[theme].mapCityLabelHoverColor;
      hoverState.properties.fillOpacity = 1;

      imageSeriesTemplate.events.on ("over", function (event) {
        event.target.setState ("hover");
      });

      imageSeriesTemplate.events.on ("out", function (event) {
        event.target.setState ("default");
      });

      if (!this.checkedCities.length)
      {
        // Dispose any route lines
        if (this.lineSeries != null)
        {
          this.chart.series.removeIndex (this.chart.series.indexOf (this.lineSeries));
          this.lineSeries = null;
        }

        if (this.shadowLineSeries != null)
        {
          this.chart.series.removeIndex (this.chart.series.indexOf (this.shadowLineSeries));
          this.shadowLineSeries = null;
        }

        // Set default location and zoom level if there are no cities
        this.chart.homeGeoPoint = {
          latitude: 24.8567,
          longitude: 2.3510
        };

        zoomLevel = 1;
        this.chart.deltaLongitude = 0;
      }
      else
      {
        sumX = 0;
        sumY = 0;
        sumZ = 0;

        for (let city of this.checkedCities)
        {
          let newCity, newCityInfo, tempLatCos;

          newCity = this.imageSeries.mapImages.create ();
          newCityInfo = city;
          newCity.latitude = newCityInfo.latitude;
          newCity.longitude = newCityInfo.longitude;
          newCity.nonScaling = true;
          newCity.tooltipText = newCityInfo.title;

          newCities.push (newCity);

          tempLat = this.utils.degr2rad (newCity.latitude);
          tempLng = this.utils.degr2rad (newCity.longitude);
          tempLatCos = Math.cos (tempLat);
          sumX += tempLatCos * Math.cos (tempLng);
          sumY += tempLatCos * Math.sin (tempLng);
          sumZ += Math.sin (tempLat);
        }

        avgX = sumX / this.checkedCities.length;
        avgY = sumY / this.checkedCities.length;
        avgZ = sumZ / this.checkedCities.length;

        // Convert average x, y, z coordinate to latitude and longitude
        tempLng = Math.atan2 (avgY, avgX);
        tempLat = Math.atan2 (avgZ, Math.sqrt (avgX * avgX + avgY * avgY));

        // Set home location and zoom level
        this.chart.homeGeoPoint = {
          latitude: this.utils.rad2degr (tempLat),
          longitude: this.utils.rad2degr (tempLng)
        };

        zoomLevel = 4;
        this.chart.deltaLongitude = 360 - this.chart.homeGeoPoint.longitude;

        // Create map line series and connect to the cities
        if (this.lineSeries != null)
          this.chart.series.removeIndex (this.chart.series.indexOf (this.lineSeries));

        this.lineSeries = this.chart.series.push (new am4maps.MapLineSeries ());
        this.lineSeries.zIndex = 10;

        if (this.shadowLineSeries != null)
          this.chart.series.removeIndex (this.chart.series.indexOf (this.shadowLineSeries));

        this.shadowLineSeries = this.chart.series.push (new am4maps.MapLineSeries ());
        this.shadowLineSeries.mapLines.template.line.strokeOpacity = 0;
        this.shadowLineSeries.mapLines.template.line.nonScalingStroke = true;
        this.shadowLineSeries.mapLines.template.shortestDistance = false;
        this.shadowLineSeries.zIndex = 5;

        // Add the selected routes into the map
        for (let checkedRoute of this.checkedRoutes)
        {
          let planeContainer, shadowPlaneContainer, plane, shadowPlane;
          let curRoute, numRoutes, routes, mapLine, shadowMapLine;
          let city1, city2;

          routes = [];
          curRoute = 0;
          numRoutes = 1;
          if (checkedRoute.airports.length > 2)
            numRoutes += checkedRoute.airports.length - 2;

          for (let i = 0; i < numRoutes; i++)
          {
            // Get the cities connected to the route
            for (let city of newCities)
            {
              if (city.tooltipText === checkedRoute.airports[i].title)
                city1 = city;
    
              if (city.tooltipText === checkedRoute.airports[i + 1].title)
                city2 = city;
            }

            mapLine = this.lineSeries.mapLines.create ();
            mapLine.imagesToConnect = [city1, city2];
            mapLine.line.strokeOpacity = 0.6;
            mapLine.line.stroke = Themes.AmCharts[theme].mapLineColor;
            mapLine.line.horizontalCenter = "middle";
            mapLine.line.verticalCenter = "middle";
  
            shadowMapLine = this.shadowLineSeries.mapLines.create ();
            shadowMapLine.imagesToConnect = [city1, city2];
            shadowMapLine.line.horizontalCenter = "middle";
            shadowMapLine.line.verticalCenter = "middle";

            routes.push ({
              normal: mapLine,
              shadow: shadowMapLine
            });
          }

          // Add plane sprite
          planeContainer = mapLine.lineObjects.create ();
          planeContainer.position = 0;
          shadowPlaneContainer = shadowMapLine.lineObjects.create ();
          shadowPlaneContainer.position = 0;

          plane = planeContainer.createChild (am4core.Sprite);
          plane.path = planeSVG;
          plane.fill = Themes.AmCharts[theme].mapPlaneColor;
          plane.scale = 0.75;
          plane.horizontalCenter = "middle";
          plane.verticalCenter = "middle";

          shadowPlane = shadowPlaneContainer.createChild (am4core.Sprite);
          shadowPlane.path = planeSVG;
          shadowPlane.scale = 0.0275;
          shadowPlane.opacity = 0;
          shadowPlane.horizontalCenter = "middle";
          shadowPlane.verticalCenter = "middle";

          // Set first route for the plane
          planeContainer.mapLine = routes[0].normal;
          planeContainer.parent = this.lineSeries;
          shadowPlaneContainer.mapLine = routes[0].shadow;
          shadowPlaneContainer.parent = this.shadowLineSeries;

          // Make the plane bigger in the middle of the line
          planeContainer.adapter.add ("scale", function (scale, target) {
            return 0.02 * (1 - (Math.abs (0.5 - target.position)));
          });

          // Make the shadow of the plane smaller and more visible in the middle of the line
          shadowPlaneContainer.adapter.add ("scale", function (scale, target) {
            target.opacity = (0.6 - (Math.abs (0.5 - target.position)));
            return 0.5 - 0.3 * (1 - (Math.abs (0.5 - target.position)));
          });

          // Start flying the plane
          goForward (plane, shadowPlane, planeContainer, shadowPlaneContainer, routes, curRoute);
        }
      }

      this.chart.homeZoomLevel = zoomLevel;
      this.chart.zoomToGeoPoint ({ latitude: this.chart.homeGeoPoint.latitude, longitude: this.chart.homeGeoPoint.longitude }, zoomLevel);
    });
  }

  copyControlVariables(): void
  {
    this.globals.copiedPanelInfo = JSON.stringify (this.values.currentOptionCategories);

    this.dialog.open (MessageComponent, {
      data: { title: "Information", message: "Control variables copied sucessfully." }
    });
  }

  isArray(item): boolean
  {
    return Array.isArray(item);
  }

  openAssistant(): void
  {
    let dialogRef;

    this.toggleControlVariableDialogOpen.emit (true);

    dialogRef = this.dialog.open (MsfDashboardAssistantComponent, {
      panelClass: 'msf-dashboard-assistant-dialog',
      autoFocus: false,
      data: {
        currentOption: JSON.parse (JSON.stringify (this.values.currentOption)),
        currentOptionCategories: JSON.parse (JSON.stringify (this.values.currentOptionCategories)),
        chartColumnOptions: this.values.chartColumnOptions,
        paletteColors: this.values.paletteColors,
        functions: this.functions,
        nciles: this.nciles
      }
    });

    dialogRef.afterClosed ().subscribe (
      (values) => {
        this.toggleControlVariableDialogOpen.emit (false);

        if (values)
        {
          if (values.panelMode === "advanced")
            values.currentChartTypeName = "Advanced " + values.currentChartTypeName;

          for (let chartType of this.chartTypes)
          {
            if (chartType.name === values.currentChartTypeName)
            {
              this.values.currentChartType = chartType;
              break;
            }
          }

          if (values.variable)
            this.panelForm.get ('variableCtrl').setValue (values.variable);

          if (values.xaxis)
            this.panelForm.get ('xaxisCtrl').setValue (values.xaxis);

          if (values.valueColumn)
          {
            if (this.isSimpleChart ())
            {
              this.values.valueList = [ values.valueColumn ];
              this.panelForm.get ('valueListCtrl').setValue (this.values.valueList);
            }
            else
              this.panelForm.get ('valueCtrl').setValue (values.valueColumn);
          }

          this.values.currentOptionCategories = values.currentOptionCategories;
          this.values.variable = values.variable;
          this.values.xaxis = values.xaxis;
          this.values.valueColumn = values.valueColumn;
          this.values.function = values.function;
          this.values.intervalType = values.intervalType;
          this.values.intValue = values.intValue;
          this.values.startAtZero =  values.startAtZero;
          this.values.ordered = values.ordered;

          this.checkChartType ();
        }
      }
    );
  }

  isDynamicTableSet(): boolean
  {
    if (!this.isDynamicTableVariablesSet () || !this.dynamicTableHasFunctions ())
      return false;

    return true;
  }

  // check if there are any horizontal and vertical variables
  isDynamicTableVariablesSet(): boolean
  {
    let hasVerticalVariables: boolean;

    if (!this.values.dynTableVariables || this.values.dynTableVariables.length < 1)
      return false;

    hasVerticalVariables = false;

    for (let value of this.values.dynTableVariables)
    {
      if (value.direction === "vertical")
      {
        hasVerticalVariables = true;
        break;
      }
    }

    if (!hasVerticalVariables)
      return false;

    return true;
  }

  dynamicTableHasFunctions(): boolean
  {
    if (!this.values.dynTableValues || this.values.dynTableValues.length < 1)
      return false;

    for (let value of this.values.dynTableValues)
    {
      if (!value.average && !value.summary && !value.min && !value.max 
        && !value.count && !value.mean && !value.stddeviation)
        return false;
    }

    return true;
  }

  configureAlias(value, name): void
  {
    let dialogRef, alias;

    switch (name)
    {
      case 'Summary':
        alias = value.sumAlias;
        break;

      case 'Average':
        alias = value.avgAlias;
        break;

      case 'Mean':
        alias = value.meanAlias;
        break;

      case 'Max':
        alias = value.maxAlias;
        break;

      case 'Min':
        alias = value.minAlias;
        break;

      case 'Std Deviation':
        alias = value.stdDevAlias;
        break;

      case 'Count':
        alias = value.cntAlias;
        break;
    }

    dialogRef = this.dialog.open (MsfDynamicTableAliasComponent, {
      height: '180px',
      width: '300px',
      panelClass: 'msf-dashboard-control-variables-dialog',
      autoFocus: false,
      data: {
        alias: alias,
        valueName: value.name,
        name: name
      }
    });

    dialogRef.afterClosed ().subscribe ((result: any) =>
    {
      if (result)
      {
        switch (name)
        {
          case 'Summary':
            value.sumAlias = result;
            break;

          case 'Average':
            value.avgAlias = result;
            break;

          case 'Mean':
            value.meanAlias = result;
            break;

          case 'Max':
            value.maxAlias = result;
            break;

          case 'Min':
            value.minAlias = result;
            break;

          case 'Std Deviation':
            value.stdDevAlias = result;
            break;

          case 'Count':
            value.cntAlias = result;
            break;
        }
      }
    });
  }

  openDiscoveryDialog(): void
  {
    let dialogRef;

    this.toggleControlVariableDialogOpen.emit (true);

    dialogRef = this.dialog.open (MsfSelectDataFromComponent, {
      panelClass: 'msf-select-data-dialog',
      autoFocus: false,
      data: {
        options: this.values.options,
        functions: this.functions,
        nciles: this.nciles
      }
    });

    dialogRef.afterClosed ().subscribe ((selectedItem) => {
      let selectedOption = null;

      this.toggleControlVariableDialogOpen.emit (false);

      if (!selectedItem)
        return;

      for (let option of this.values.options)
      {
        if (option.id == selectedItem.id)
        {
          selectedOption = option;
          break;
        }
      }

      if (!selectedOption)
        return;

      if (this.values.currentOption)
      {
        if (this.values.currentOption.id == selectedOption.id)
          return; // do not reset the dashboard settings if the option id is the same
      }

      this.values.currentOption = selectedOption;
      this.loadChartFilterValues (selectedOption);
    });
  }

  resetIntervalValue(): void
  {
    if (this.values.intervalType === "value")
      this.values.intValue = null;
    else
      this.values.intValue = 5;
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
      if (this.values.currentChartType.flags & ChartFlags.XYCHART)
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
      if (this.values.currentChartType.flags & ChartFlags.ROTATED)
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

      if (this.values.currentChartType.flags & ChartFlags.XYCHART)
      {
        let index = 0;

        for (let object of this.chartInfo.filter)
        {
          let sumSeries = this.chart.series.push (new am4charts.LineSeries ());

          if (this.values.currentChartType.flags & ChartFlags.ROTATED)
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

          if (this.values.currentChartType.flags & ChartFlags.ROTATED)
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

        if (this.values.currentChartType.flags & ChartFlags.ROTATED)
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

        if (this.values.currentChartType.flags & ChartFlags.ROTATED)
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
      if (this.values.currentChartType.flags & ChartFlags.ROTATED)
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

      if (this.values.currentChartType.flags & ChartFlags.ROTATED)
        this.chart.xAxes.removeIndex (this.chart.xAxes.indexOf (this.sumValueAxis));
      else
        this.chart.yAxes.removeIndex (this.chart.yAxes.indexOf (this.sumValueAxis));

      this.sumValueAxis = null;

      // display the normal category axis value labels
      if (this.values.currentChartType.flags & ChartFlags.ROTATED)
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

      if (this.values.currentChartType.flags & ChartFlags.LINECHART)
        this.chart.cursor = new am4charts.XYCursor ();
      else
        this.chart.cursor = null;

      // invalidate data in order to remove the line chart
      this.chart.invalidateData ();
    });
  }

  toggleIntervalTable(): void
  {
    let chartElement;

    this.advTableView = !this.advTableView;

    // redraw chart
    chartElement = document.getElementById ("msf-dashboard-chart-display-" + this.values.id);
    document.getElementById ("msf-dashboard-chart-display-container-" + this.values.id).appendChild (chartElement);
  }

  isLineOrBarChart(): boolean
  {
    if (!(this.values.currentChartType.flags & ChartFlags.PIECHART) && !(this.values.currentChartType.flags & ChartFlags.FUNNELCHART))
      return true;

    return false;
  }

  generateValueList(): string
  {
    let list = "";

    if (!this.isSimpleChart () || !this.values.valueList || (this.values.valueList && !this.values.valueList.length))
      return null;

    for (let i = 0; i < this.values.valueList.length; i++)
    {
      list += this.values.valueList[i].item.id;

      if (i != this.values.valueList.length - 1)
        list += ",";
    }

    return list;
  }

  generateValueNameList(): string
  {
    let list = "";

    if (!this.isSimpleChart () || !this.values.valueList || (this.values.valueList && !this.values.valueList.length))
      return null;

    for (let i = 0; i < this.values.valueList.length; i++)
    {
      list += this.values.valueList[i].id;

      if (i != this.values.valueList.length - 1)
        list += ",";
    }

    return list;
  }

  getValueFormFontColor(formResult): string
  {
    for (let threshold of this.values.thresholds)
    {
      let value = parseFloat (formResult.value);

      if (threshold.column == formResult.column.id && value >= threshold.min && value <= threshold.max)
        return threshold.color;
    }

    return "inherit";
  }

  getServerData(event?: PageEvent): any
  {
    if (this.values.isLoading)
      return null;

    this.pageIndex = event;
    this.moreResultsBtn = true;
    // this.pageIndex = event.pageIndex;
    this.moreTableResults();
    return event;
  }

  paginatorlength(event: any): void
  {
    this.lengthpag = event.length;
    this.pageI = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  shmoreResult(event: any){
    this.values.tokenResultTable = event.tokenResultTable;
    this.values.showMoreResult = event.showMoreResult;
  }

  configureAnchoredControlVariables(): void
  {
    this.anchoredArguments = [];

    if (!this.values.currentOptionCategories)
      return;

    for (let categoryArgument of this.values.currentOptionCategories)
    {
      for (let argument of categoryArgument.arguments)
      {
        if (argument.anchored)
        {
          this.anchoredArguments.push ({
            isLoading: false,
            argument: JSON.parse (JSON.stringify (argument))
          });
        }
      }
    }

    this.savedAnchoredArguments = JSON.parse (JSON.stringify (this.anchoredArguments));
    this.changeDetectorRef.detectChanges ();
  }

  setArgumentLoading(argument, value): void
  {
    argument.isLoading = value;
  }

  removedAnchoredArgument(anchoredArgument): void
  {
    anchoredArgument.anchored = false;
    this.anchoredArguments.splice (this.anchoredArguments.indexOf (anchoredArgument), 1);
  }

  toggleAnchoredArguments(): void
  {
    this.displayAnchoredArguments = !this.displayAnchoredArguments;
  }

  saveAnchoredChanges(): void
  {
    // don't display results when loading new changes
    this.values.displayChart = false;
    this.values.displayInfo = false;
    this.values.displayForm = false;
    this.values.displayMapbox = false;
    this.values.displayPic = false;
    this.values.displayTable = false;
    this.values.displayDynTable = false;

    // set new argument values
    for (let categoryArgument of this.values.currentOptionCategories)
    {
      for (let argument of categoryArgument.arguments)
      {
        let argumentSet = false;

        for (let anchoredArgument of this.anchoredArguments)
        {
          if (argument.name1 === anchoredArgument.argument.name1)
          {
            argument.value1 = anchoredArgument.argument.value1;
            argument.value2 = anchoredArgument.argument.value2;
            argument.value3 = anchoredArgument.argument.value3;
            argument.value4 = anchoredArgument.argument.value4;
            argument.dateLoaded = anchoredArgument.argument.dateLoaded;
            argument.currentDateRangeValue = anchoredArgument.argument.currentDateRangeValue;

            argumentSet = true;
            break;
          }
        }

        if (argumentSet)
          break;
      }
    }

    // run service to set changes
    this.loadData ();
  }

  revertAnchoredChanges(): void
  {
    this.anchoredArguments = JSON.parse (JSON.stringify (this.savedAnchoredArguments));
  }

  setRouteNetworks(chart, theme): void
  {
    let scheduleImageSeries, scheduleLineSeries, imageSeriesTemplate, circle, hoverState, label, zoomLevel;
    let cities = [];
    let routes = [];

    if (!this.values.lastestResponse.length)
      return;

    // Create image container for the circles and city labels
    scheduleImageSeries = chart.series.push (new am4maps.MapImageSeries ());
    imageSeriesTemplate = scheduleImageSeries.mapImages.template;

    // Set property fields for the cities
    imageSeriesTemplate.propertyFields.latitude = "latitude";
    imageSeriesTemplate.propertyFields.longitude = "longitude";
    imageSeriesTemplate.horizontalCenter = "middle";
    imageSeriesTemplate.verticalCenter = "middle";
    imageSeriesTemplate.width = 8;
    imageSeriesTemplate.height = 8;
    imageSeriesTemplate.scale = 1;
    imageSeriesTemplate.fill = Themes.AmCharts[theme].tooltipFill;
    imageSeriesTemplate.background.fillOpacity = 0;
    imageSeriesTemplate.background.fill = Themes.AmCharts[theme].mapCityColor;
    imageSeriesTemplate.setStateOnChildren = true;

    // Configure circle and city labels
    circle = imageSeriesTemplate.createChild (am4core.Sprite);
    circle.defaultState.properties.fillOpacity = 1;
    circle.path = targetSVG;
    circle.scale = 0.75;
    circle.fill = Themes.AmCharts[theme].mapCityColor;
    circle.dx -= 2.5;
    circle.dy -= 2.5;
    hoverState = circle.states.create ("hover");
    hoverState.properties.fill = comet;

    label = imageSeriesTemplate.createChild (am4core.Label);
    label.text = "{tooltipText}";
    label.scale = 1;
    label.horizontalCenter = "left";
    label.verticalCenter = "middle";
    label.dx += 17.5;
    label.dy += 5.5;
    label.fill = Themes.AmCharts[theme].mapCityColor;
    hoverState = label.states.create ("hover");
    hoverState.properties.fill = Themes.AmCharts[theme].mapCityLabelHoverColor;
    hoverState.properties.fillOpacity = 1;

    imageSeriesTemplate.events.on ("over", function (event) {
      event.target.setState ("hover");
    });

    imageSeriesTemplate.events.on ("out", function (event) {
      event.target.setState ("default");
    });

    let tempLatCos, tempLat, tempLng;
    var sumX = 0;
    var sumY = 0;
    var sumZ = 0;

    // Add cities and routes
    for (let record of this.values.lastestResponse)
    {
      let city, latOrigin, lonOrigin, latDest, lonDest;

      if (latOrigin === "NULL" || lonOrigin === "NULL")
      {
        console.warn (record.origin + " have invalid coordinates! (lat: " + latOrigin + ", lon: " + lonOrigin + ")");
        continue;
      }

      if (latDest === "NULL" || lonDest === "NULL")
      {
        console.warn (record.origin + " have invalid coordinates! (lat: " + latDest + ", lon: " + lonDest + ")");
        continue;
      }

      latOrigin = parseFloat (record.latOrigin);
      lonOrigin = parseFloat (record.lonOrigin);
      latDest = parseFloat (record.latDest);
      lonDest = parseFloat (record.lonDest);

      if (cities.indexOf (record.origin) == -1)
      {
        // Add origin city
        city = scheduleImageSeries.mapImages.create ();
    
        if (latOrigin < -90 || latOrigin > 90 || lonOrigin < -180 || lonOrigin > 180)
        {
          console.warn (record.origin + " have invalid coordinates! (lat: " + latOrigin + ", lon: " + lonOrigin + ")");

          if (latOrigin < -90 || latOrigin > 90)
            latOrigin /= 1000000;

          if (lonOrigin < -180 || lonOrigin > 180)
            lonOrigin /= 1000000;
        }
    
        city.latitude = latOrigin;
        city.longitude = lonOrigin;
        city.nonScaling = true;
        city.tooltipText = record.origin;

        cities.push (record.origin);

        tempLat = this.utils.degr2rad (city.latitude);
        tempLng = this.utils.degr2rad (city.longitude);
        tempLatCos = Math.cos (tempLat);
        sumX += tempLatCos * Math.cos (tempLng);
        sumY += tempLatCos * Math.sin (tempLng);
        sumZ += Math.sin (tempLat);
      }
      else
      {
        if (latOrigin < -90 || latOrigin > 90)
          latOrigin /= 1000000;

        if (lonOrigin < -180 || lonOrigin > 180)
          lonOrigin /= 1000000;
      }

      // Add destination city
      if (cities.indexOf (record.dest) == -1)
      {
        city = scheduleImageSeries.mapImages.create ();
  
        if (latDest < -90 || latDest > 90 || lonDest < -180 || lonDest > 180)
        {
          console.warn (record.dest + " have invalid coordinates! (lat: " + latDest + ", lon: " + lonDest + ")");

          if (latDest < -90 || latDest > 90)
            latDest /= 1000000;

          if (lonDest < -180 || lonDest > 180)
            lonDest /= 1000000;
        }
    
        city.latitude = latDest;
        city.longitude = lonDest;
        city.nonScaling = true;
        city.tooltipText = record.dest;

        cities.push (record.dest);

        tempLat = this.utils.degr2rad (city.latitude);
        tempLng = this.utils.degr2rad (city.longitude);
        tempLatCos = Math.cos (tempLat);
        sumX += tempLatCos * Math.cos (tempLng);
        sumY += tempLatCos * Math.sin (tempLng);
        sumZ += Math.sin (tempLat);
      }
      else
      {
        if (latDest < -90 || latDest > 90)
          latDest /= 1000000;

        if (lonDest < -180 || lonDest > 180)
          lonDest /= 1000000;
      }

      // Add route
      routes.push ([
        { "latitude": latOrigin, "longitude": lonOrigin },
        { "latitude": latDest, "longitude": lonDest }
      ]);
    }

    var avgX = sumX / cities.length;
    var avgY = sumY / cities.length;
    var avgZ = sumZ / cities.length;

    // convert average x, y, z coordinate to latitude and longtitude
    var lng = Math.atan2 (avgY, avgX);
    var hyp = Math.sqrt (avgX * avgX + avgY * avgY);
    var lat = Math.atan2 (avgZ, hyp);
    var zoomlat =  this.utils.rad2degr (lat);
    var zoomlong = this.utils.rad2degr (lng);

    // Create map line series and connect the origin city to the desination cities
    scheduleLineSeries = chart.series.push (new am4maps.MapLineSeries ());
    scheduleLineSeries.zIndex = 10;
    scheduleLineSeries.data = [{
      "multiGeoLine": routes
    }];

    // Set map line template
    let mapLinesTemplate = scheduleLineSeries.mapLines.template;
    mapLinesTemplate.opacity = 0.6;
    mapLinesTemplate.stroke = Themes.AmCharts[theme].mapLineColor;
    mapLinesTemplate.horizontalCenter = "middle";
    mapLinesTemplate.verticalCenter = "middle";

    if (!cities.length)
    {
      zoomLevel = 1;
      zoomlat = 24.8567;
      zoomlong = 2.3510;
    }
    else
      zoomLevel = 4;

    chart.deltaLongitude = 360 - Number (zoomlong);
    chart.homeGeoPoint.longitude = Number (zoomlong);
    chart.homeGeoPoint.latitude = Number (zoomlat);
    chart.homeZoomLevel = zoomLevel;
    chart.zoomToGeoPoint ({ latitude: zoomlat, longitude: zoomlong }, zoomLevel);
  }

  startURLUpdate(): void
  {
    this.updateURLResults = true;

    setTimeout (() => {
      this.updateURLResults = false;
    }, 100);
  }

  configurePanel(): void
  {
    let dialogRef;

    dialogRef = this.dialog.open (MsfDashboardPanelComponent, {
      width: '900px',
      height: '595px',
      panelClass: 'msf-dashboard-panel-dialog',
      data: {
        values: this.values,
        panelWidth: 12,           // random width and height panel values
        panelHeight: 7,
        toggleControlVariableDialogOpen: this.toggleControlVariableDialogOpen,
        functions: this.functions,
        chartTypes: this.chartTypes,
        nciles: this.nciles,
        fontSizes: this.fontSizes,
        orientations: this.orientations,
        geodatas: this.geodatas,
        childPanelValues: this.childPanelValues,
        childPanelsConfigured: this.childPanelsConfigured,
        panelForm: this.panelForm,
        dataFormFilterCtrl: this.dataFormFilterCtrl,
        variableFilterCtrl: this.variableFilterCtrl,
        xaxisFilterCtrl: this.xaxisFilterCtrl,
        valueFilterCtrl: this.valueFilterCtrl,
        infoVar1FilterCtrl: this.infoVar1FilterCtrl,
        infoVar2FilterCtrl: this.infoVar2FilterCtrl,
        infoVar3FilterCtrl: this.infoVar3FilterCtrl,
        columnFilterCtrl: this.columnFilterCtrl,
        filteredVariables: this.filteredVariables,
        filteredOptions: this.filteredOptions,
        variableCtrlBtnEnabled: this.variableCtrlBtnEnabled,
        generateBtnEnabled: this.generateBtnEnabled
      }
    });

    dialogRef.afterClosed ().subscribe ((result) => {
      if (this.values.currentOption)
        this.variableCtrlBtnEnabled = true;

      this.checkChartType ();

      if (result)
      {
        if (result.generateChart)
          this.loadData ();
        else if (result.savePanel)
          this.savePanel (true);
        else if (result.goToResults)
          this.goToResults ();
      }
    });
  }

  enableContextMenu(event): void
  {
    let contextMenuFlags: any = {
      advChartTableView: false,
      advChartView: false,
      sumSeriesList: false,
      anchoredArguments: false,
      anchoredArgumentsSettings: false
    };

    if (this.isAdvChartPanel ())
    {
      if (this.advTableView)
        contextMenuFlags.advChartTableView = true;
      else
      {
        contextMenuFlags.advChartView = true;

        if (this.sumSeriesList && this.sumSeriesList.length)
          contextMenuFlags.sumSeriesList = true;
      }
    }

    if (this.anchoredArguments && this.anchoredArguments.length)
    {
      contextMenuFlags.anchoredArguments = true;

      if (this.displayAnchoredArguments)
        contextMenuFlags.anchoredArgumentsSettings = true;
    }

    this.enablePanelContextMenu.emit ({
      event: event,
      flags: contextMenuFlags,
      panel: this
    });
  }

  sortingDataTable(event: any): void
  {
    if (event.columnName != "") {
      this.values.ListSortingColumns = event.columnName + " " + event.order;
    }

    if (event.order === "") {
      this.values.ListSortingColumns = "";
    }
    if (event && this.values.currentOption.serverSorting === 1
      && ((!this.moreResultsBtn && this.actualPageNumber!=0) || this.moreResultsBtn)) {
      let sorting = true;
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
              let argument = category.arguments[j];
              if (argument.type === "sortingCheckboxes") {
                if (argument.value1 && argument.value1.length != 0) {
                  sorting = false;
                }
              }
            }
          }
        }
      }

      if (sorting)
        this.loadData ();
    }
  }


  clearSort() {
    if (this.values.ListSortingColumns != "") {
      this.values.ListSortingColumns = "";
      this.actualPageNumber = 0;
      this.moreResults = false;
      this.msfTableRef.sort.sort({ id: '', start: 'asc', disableClear: false });
    }
  }

  configureDynamicTable(): void
  {
    let dynamicTableValues =
    {
      xaxis: [],
      yaxis: [],
      values: []
    };

    if (this.values.dynTableVariables)
    {
      for (let variable of this.values.dynTableVariables)
      {
        if (variable.direction === "horizontal")
          dynamicTableValues.xaxis.push (variable);
        else
          dynamicTableValues.yaxis.push (variable);
      }
    }

    if (this.values.dynTableValues)
    {
      for (let value of this.values.dynTableValues)
        dynamicTableValues.values.push (value);
    }

    const dialogRef = this.dialog.open (MsfDynamicTableVariablesComponent,
    {
      width: '1100px',
      height: '600px',
      panelClass: 'dynamic-table-dialog',
      autoFocus: false,
      data: {
        metadata: this.values.currentOption.columnOptions,
        dynamicTableValues: dynamicTableValues,
        dashboardPanel: this.values
      }
    });

    dialogRef.afterClosed ().subscribe (result =>
    {
      if (result != null)
      {
        this.values.dynTableVariables = [];
        this.values.dynTableValues = [];

        for (let variable of result.xaxis)
        {
          this.values.dynTableVariables.push (variable);
          this.values.dynTableVariables[this.values.dynTableVariables.length - 1].direction = "horizontal";
        }

        for (let i = 0; i < result.yaxis.length; i++)
        {
          let variable = result.yaxis[i];
          let index;

          this.values.dynTableVariables.push (variable);
          index = this.values.dynTableVariables.length - 1;
          this.values.dynTableVariables[index].direction = "vertical";

          if (i != result.yaxis.length - 1)
            this.values.dynTableVariables[index].summary = true;
          else
            this.values.dynTableVariables[index].summary = false;
        }

        for (let value of result.values)
          this.values.dynTableValues.push (value);

        this.checkPanelConfiguration ();
      }
    });
  }

  getMasFlightMobileLogoImage(): string
  {
    return "../../assets/images/dark-theme-masFlight-mobile-logo.png";
  }

  getMasFlightLogoImage(): string
  {
    return "../../assets/images/dark-theme-masFlight-logo.png";
  }

  checkPanelTypeSelection(): void
  {
    this.selectingAnalysis = null;
    this.analysisSelected = null;
    this.values.variable = null;
    this.values.xaxis = null;

    if (this.panelMode === "advanced")
    {
      let selectedChartType;

      if (!this.selectedPanelType.allowedInAdvancedMode)
      {
        this.selectedPanelType = this.panelTypes[0];

        if (!this.values.function)
          this.values.function = this.functions[0];

        this.scrollSelectedPanelIntoView ();
      }

      selectedChartType = "Advanced " + this.selectedPanelType.name;

      for (let chart of this.chartTypes)
      {
        if (chart.name === selectedChartType)
        {
          this.values.currentChartType = chart;
          break;
        }
      }

      this.checkChartType ();

      this.selectingXAxis = null;
      this.xAxisSelected = null;
      this.selectingValue = null;
      this.valueSelected = null;
      this.values.valueColumn = null;
      this.values.valueList = [];
      this.values.startAtZero = false;
    }
    else
    {
      this.selectingAggregationValue = null;
      this.aggregationValueSelected = null;
      this.values.valueColumn = null;
      this.values.valueList = [];

      for (let chart of this.chartTypes)
      {
        if (chart.name === this.selectedPanelType.name)
        {
          this.values.currentChartType = chart;
          break;
        }
      }

      this.checkChartType ();

      if (!this.isLineOrBarChart ())
        this.values.startAtZero = false;
    }
  }

  selectPanelType(panelType): void
  {
    let name = panelType.name;

    this.selectedPanelType = panelType;
    this.selectingXAxis = null;
    this.selectingAnalysis = null;
    this.selectingValue = null;
    this.selectingAggregationValue = null;

    // Remove X Axis selection if the chart type doesn't use it
    if (!this.haveXAxis())
    {
      this.xAxisSelected = null;
      this.values.xaxis = null;
    }

    // Remove analysis selection if the simple chart uses intervals
    if (this.panelMode === "advanced" && !(this.selectedPanelType.flags & ChartFlags.XYCHART))
      this.analysisSelected = null;

    if (this.panelMode === "advanced")
      name = "Advanced " + name;

    for (let chart of this.chartTypes)
    {
      if (chart.name === name)
      {
        this.values.currentChartType = chart;
        break;
      }
    }

    this.checkChartType ();
  }

  checkPanelType(chartType): boolean
  {
    if (!chartType.allowedInAdvancedMode && this.panelMode === "advanced")
      return false;

    if (this.globals.currentApplication.name !== "masFlight")
    {
      // don't allow map types on applications other than masFlight
      if ((chartType.flags & ChartFlags.MAP) || (chartType.flags & ChartFlags.HEATMAP))
        return false;
    }

    return true;
  }

  selectStep(step: number): void
  {
    this.menuCategories = [];

    switch (step)
    {
      case 3:
        this.selectedStep = 3;

        if (!this.menuCategories.length)
        {
          this.stepLoading = 3;
          this.selectedItem = null;
          this.service.loadMenuOptionsForDashboard (this, this.selectDataSuccess, this.selectDataError);
        }
        break;

      case 4:
        if (!this.values.currentOption)
          return;

        this.selectedStep = 4;
        this.stepLoading = 4;
        this.service.loadOptionCategoryArguments (this, this.values.currentOption.id, this.setCategories, this.categoriesError);
        break;

      case 5:
        if (!(this.values.currentOption && this.values.currentOptionCategories && this.controlVariablesSet))
          return;

        if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
          this.panelMode = "advanced";
        else
          this.panelMode = "basic";

        this.selectedStep = 5;

        if (!this.msfConfigTableRef.dataSource)
        {
          this.stepLoading = 5;
          this.configTableLoading = true;
          this.loadConfigTableData (this.msfConfigTableRef.handlerSuccess, this.msfConfigTableRef.handlerError);
        }
        else
        {
          if (this.values.variable)
          {
            for (let column of this.msfConfigTableRef.metadata)
            {
              if (this.values.variable.id == column.columnName)
              {
                this.analysisSelected = column;
                break;
              }
            }
          }

          if (this.values.xaxis)
          {
            for (let column of this.msfConfigTableRef.metadata)
            {
              if (this.values.xaxis.id == column.columnName)
              {
                this.xAxisSelected = column;
                break;
              }
            }
          }

          if (this.values.valueColumn)
          {
            for (let column of this.msfConfigTableRef.metadata)
            {
              if (this.values.valueColumn.id == column.columnName)
              {
                if (this.panelMode === "advanced")
                  this.aggregationValueSelected = column;
                else
                  this.valueSelected = column;

                break;
              }
            }
          }
        }
        break;

      case 6:
      case 7:
      case 8:
      case 9:
        if (!(this.values.currentOption && this.values.currentOptionCategories && this.controlVariablesSet))
          return;

        this.selectedStep = step;
        this.stepLoading = 0;
        break;

      case 2:
        this.selectedStep = 2;

        if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
        {
          this.panelMode = "advanced";

          for (let type of this.panelTypes)
          {
            if (this.values.currentChartType.name === "Advanced " + type.name)
            {
              this.selectedPanelType = type;
              break;
            }
          }
        }
        else
        {
          this.panelMode = "basic";

          // set panel type for the interface
          for (let type of this.panelTypes)
          {
            if (this.values.currentChartType.name === type.name)
            {
              this.selectedPanelType = type;
              break;
            }
          }
        }

        this.changeDetectorRef.detectChanges ();
        this.scrollSelectedPanelIntoView ();

      default:
        this.selectedStep = step;
        this.stepLoading = 0;
        break;
    }
  }

  scrollSelectedPanelIntoView(): void
  {
    let target;

    target = document.getElementById (this.selectedPanelType.name + "-panel");
    target.parentNode.parentNode.scrollTop = target.offsetTop - 107;
  }

  setCategories(_this, data): void
  {
    let optionCategories = [];

    if (_this.stepLoading != 4)
      return;

    if (!data.length)
    {
      // load table when there are no control variables
      _this.configTableLoading = true;
      _this.loadConfigTableData (_this.msfConfigTableRef.handlerSuccess, _this.msfConfigTableRef.handlerError);
      return;
    }

    if (_this.values.currentOptionCategories == null || !_this.controlVariablesSet)
      _this.tablePreview = false;
    else
      _this.tablePreview = true;

    data = data.sort((a, b) => a["position"] > b["position"] ? 1 : a["position"] === b["position"] ? 0 : -1);

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
                argument.filters.splice(i, 1);
            }
          }
        }

        optionCategories.push(category);
      }
    }

    // if the category is not empty, add the categories that are missing
    if (_this.values.currentOptionCategories != null)
    {
      for (let optionCategory of optionCategories)
      {
        for (let curOptionCategory of _this.values.currentOptionCategories)
        {
          for (let curCategoryArgument of curOptionCategory.arguments)
          {
            for (let argument of optionCategory.arguments)
            {
              if (curCategoryArgument.name1 == argument.name1)
              {
                argument.value1 = curCategoryArgument.value1;
                argument.value2 = curCategoryArgument.value2;
                argument.value3 = curCategoryArgument.value3;
                argument.value4 = curCategoryArgument.value4;
                argument.dateLoaded = curCategoryArgument.dateLoaded;
                argument.currentDateRangeValue = curCategoryArgument.currentDateRangeValue;
                argument.dateSelectionMode = curCategoryArgument.dateSelectionMode;
                argument.anchored = curCategoryArgument.anchored;
                break;
              }
            }
          }
        }
      }
    }

    _this.values.currentOptionCategories = optionCategories;

    if (_this.tablePreview)
    {
      _this.tempOptionCategories = null;
      _this.configureControlVariables ();
      _this.configTableLoading = true;
      _this.loadConfigTableData (_this.msfConfigTableRef.handlerSuccess, _this.msfConfigTableRef.handlerError);
    }
    else
    {
      _this.tempOptionCategories = JSON.parse (JSON.stringify (_this.values.currentOptionCategories));
      _this.values.currentOptionCategories = null;
      _this.stepLoading = 0;
      _this.controlVariablesSet = false;
      _this.changeDetectorRef.detectChanges ();
      _this.editTabs.realignInkBar ();
    }
  }

  loadConfigTableData(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg;

    this.msfConfigTableRef.displayedColumns = [];

    if (!this.actualPageNumber)
      this.msfConfigTableRef.dataSource = null;

    if (this.globals.currentApplication.name === "DataLake")
    {
      if (this.getParameters ())
        urlBase = this.values.currentOption.baseUrl + "?uName=" + this.globals.userName + "&" + this.getParameters ();
      else
        urlBase = this.values.currentOption.baseUrl + "?uName=" + this.globals.userName;
    }
    else
      urlBase = this.values.currentOption.baseUrl + "?" + this.getParameters ();

    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&&pageSize=25&page_number=0";
    urlArg = encodeURIComponent (urlBase);
    url = this.service.host + "/secure/consumeWebServices?url=" + urlArg + "&optionId=" + this.values.currentOption.id;

    if (this.globals.testingPlan != -1)
      url += "&testPlanId=" + this.globals.testingPlan;

    if (isDevMode ())
      console.log (urlBase);

    this.authService.get (this.msfConfigTableRef, url, handlerSuccess, handlerError);
  }

  categoriesError(_this): void
  {
    if (_this.stepLoading != 4)
      return;

    _this.stepLoading = 0;
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

  refreshTable(): void
  {
    this.stepLoading = 4;
    this.configTableLoading = true;
    this.loadConfigTableData (this.msfConfigTableRef.handlerSuccess, this.msfConfigTableRef.handlerError);
    this.changeDetectorRef.detectChanges ();
  }

  cancelEdit(): void
  {
    this.values.currentOptionCategories = JSON.parse (JSON.stringify (this.tempOptionCategories));
    this.tablePreview = true;
    this.tempOptionCategories = null;
    this.changeDetectorRef.detectChanges ();
    this.configTabs.realignInkBar ();
  }

  goToEditor(): void
  {
    this.tempOptionCategories = JSON.parse (JSON.stringify (this.values.currentOptionCategories));
    this.tablePreview = false;
    this.changeDetectorRef.detectChanges ();
    this.editTabs.realignInkBar();
    this.editTabs._tabHeader._alignInkBarToSelectedTab ();
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

  configureControlVariables(): void
  {
    if (!this.values.currentOptionCategories)
      return;

    for (let controlVariable of this.values.currentOptionCategories)
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
              if (!this.isSingleCheckbox (argument))
                break;

              controlVariableArgument.checkboxes.push (argument);
            }
          }
        }
      }
    }
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

  setCtrlVariableLoading(value: boolean): void
  {
    if (value)
      this.stepLoading = 4;
    else
      this.stepLoading = 0;
  }

  recursiveMenuCategory(menuCategory): void
  {
    if (menuCategory.children && menuCategory.children.length)
    {
      // the submenu must have the items with children first
      menuCategory.children.sort (function(e1, e2) {
        if (e1.children.length && e2.children.length)
          return 0;

        return e2.children.length - e1.children.length;
      });

      for (let i = menuCategory.children.length - 1; i >= 0; i--)
      {
        let child = menuCategory.children[i];

        if (child.typeOption == '1')
          menuCategory.children.splice (i, 1);
        else if (child.children && child.children.length)
          this.recursiveMenuCategory (child);
      }
    }
  }

  selectDataSuccess(_this, data): void
  {
    if (_this.stepLoading != 3)
      return;

    _this.menuCategories = data;

    for (let menuCategory of _this.menuCategories)
    {
      menuCategory.flatNodeMap = new Map<ExampleFlatNode, any> ();
      menuCategory.nestedNodeMap = new Map<any, ExampleFlatNode> ();

      let transformer = (node: any, level: number) =>
      {
        const existingNode = menuCategory.nestedNodeMap.get (node);
        const flatNode = existingNode && existingNode.label === node.label
          ? existingNode
          : new ExampleFlatNode ();
        flatNode.expandable = !!node.children && node.children.length > 0;
        flatNode.id = node.id;
        flatNode.uid = node.uid;
        flatNode.label = node.label;
        flatNode.level = level;
        flatNode.menuOptionArgumentsAdmin = node.menuOptionArgumentsAdmin;
        flatNode.categoryParentId = node.categoryParentId;
        flatNode.baseUrl = node.baseUrl;
        flatNode.icon = node.icon;
        flatNode.tab = node.tab;
        flatNode.tabType = node.tabType;
        flatNode.menuParentId = node.menuParentId;
        flatNode.toDelete = node.toDelete;
        flatNode.dataAvailability = node.dataAvailability;
        flatNode.metaData = node.metaData;
        flatNode.order = node.order,
        flatNode.selected = node.selected;
        flatNode.applicationId = node.applicationId;
        flatNode.isRoot = node.isRoot;
        flatNode.children = node.children;
        flatNode.initialRol = node.initialRol;
        flatNode.finalRol = node.finalRol;
        flatNode.typeOption = node.typeOption;
        flatNode.welcome = node.welcome;

        if (_this.values.currentOption && _this.values.currentOption.id == flatNode.id && !_this.selectedItem)
          _this.selectedItem = flatNode;
    
        menuCategory.flatNodeMap.set (flatNode, node);
        menuCategory.nestedNodeMap.set (node, flatNode);

        return flatNode;
      };

      menuCategory.transformer = transformer;

      menuCategory.treeControl = new FlatTreeControl<ExampleFlatNode> (
        node => node.level,
        node => node.expandable
      );

      menuCategory.treeFlattener = new MatTreeFlattener (
        transformer,
        node => node.level,
        node => node.expandable,
        node => node.children
      );

      // remove options that are exclusive to the main menu
      if (menuCategory.children && menuCategory.children.length)
      {
        // the submenu must have the items with children first
        menuCategory.children.sort (function(e1, e2) {
          if (e1.children.length && e2.children.length)
            return 0;

          return e2.children.length - e1.children.length;
        });

        for (let i = menuCategory.children.length - 1; i >= 0; i--)
        {
          let child = menuCategory.children[i];

          if (child.typeOption == '1')
            menuCategory.children.splice (i, 1);
          else if (child.children && child.children.length)
            _this.recursiveMenuCategory (child);
        }
      }

      menuCategory.tree = new MatTreeFlatDataSource (menuCategory.treeControl, menuCategory.treeFlattener);
      menuCategory.tree.data = menuCategory.children;
    }

    _this.stepLoading = 0;
  }

  selectDataError(_this): void
  {
    if (_this.stepLoading != 3)
      return;

    _this.stepLoading = 0;
  }

  tablePreview: boolean = true;

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

  analysisSelected: any = null;
  selectingAnalysis: boolean = false;
  xAxisSelected: any = null;
  selectingXAxis: boolean = false;
  valueSelected: any = null;
  selectingValue: boolean = false;
  chartPreviewHover: boolean = false;
  aggregationValueSelected: any = null;
  selectingAggregationValue: boolean = false;
  lastColumn: any;

  hasAnalysisByValue(): boolean
  {
    if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
    {
      if (this.values.currentChartType.flags & ChartFlags.XYCHART)
        return true;

      return false;
    }

    return true;
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
    this.values.variable = null;
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
    this.values.xaxis = null;
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
    this.values.valueColumn = null;
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
    this.values.valueColumn = null;
  }

  finishLoadingConfigTable(error): void
  {
    this.stepLoading = 0;
    this.configTableLoading = false;

    this.changeDetectorRef.detectChanges ();

    if (this.configTabs)
      this.configTabs.realignInkBar ();

    if (error)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "Failed to generate results." }
      });

      return;
    }

    if (!this.msfConfigTableRef.tableOptions.dataSource && !this.msfConfigTableRef.tableOptions.template)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Information", message: "Results not available." }
      });

      return;
    }

    if (this.tempOptionCategories)
    {
      this.values.currentOptionCategories = JSON.parse (JSON.stringify (this.tempOptionCategories));
      this.tempOptionCategories = null;
    }

    this.controlVariablesSet = true;
    this.configuredControlVariables = true;
    this.tablePreview = true;
    this.analysisSelected = null;
    this.xAxisSelected = null;
    this.valueSelected = null;

    if (this.selectedStep == 5)
    {
      if (this.values.variable)
      {
        for (let column of this.msfConfigTableRef.metadata)
        {
          if (this.values.variable.id == column.columnName)
          {
            this.analysisSelected = column;
            break;
          }
        }
      }

      if (this.values.xaxis)
      {
        for (let column of this.msfConfigTableRef.metadata)
        {
          if (this.values.xaxis.id == column.columnName)
          {
            this.xAxisSelected = column;
            break;
          }
        }
      }

      if (this.values.valueColumn)
      {
        for (let column of this.msfConfigTableRef.metadata)
        {
          if (this.values.valueColumn.id == column.columnName)
          {
            if (this.panelMode === "advanced")
              this.aggregationValueSelected = column;
            else
              this.valueSelected = column;

            break;
          }
        }
      }
    }
  }

  selectItem(item): void
  {
    if (item == this.selectedItem)
      return;

    this.selectedItem = item;

    for (let option of this.values.options)
    {
      if (option.id == item.id)
      {
        this.values.currentOption = option;
        break;
      }
    }

    this.controlVariablesSet = false;
    this.loadChartFilterValues (this.values.currentOption);
  }

  filterMenuOptions(menuCategory): void
  {
    for (let index = 0; index < menuCategory.treeControl.dataNodes.length; index++)
    {
      const option = menuCategory.treeControl.dataNodes[index];

      this.setShowOption (option, menuCategory.searchLabel);
      this.recursiveOption (option, menuCategory.searchLabel);
    }

    if (menuCategory.searchLabel)
      menuCategory.treeControl.expandAll ();
    else
      menuCategory.treeControl.collapseAll ();
  }

  recursiveOption(option: any, searchLabel: string): void
  {
    if (option.children.length)
    {
      for (let index = 0; index < option.children.length; index++)
      {
        const element = option.children[index];
  
        this.setShowOption (element, searchLabel);
        this.recursiveOption (element, searchLabel);
      }
    }
    else
      this.setShowOption (option, searchLabel);
  }

  setShowOption(option: any, searchLabel: string): void
  {
    if (searchLabel != "" && searchLabel != null)
    {
      if (option.label.toLowerCase ().indexOf (searchLabel.toLowerCase ()) != -1)
        option.show = true;
      else
        option.show = false;
    }
    else
      option.show = true;
  }

  resultsGenerated(): boolean
  {
    return !(!this.values.chartGenerated && !this.values.infoGenerated && !this.values.formGenerated && !this.values.picGenerated && !this.values.tableGenerated && !this.values.mapboxGenerated && !this.values.dynTableGenerated);
  }

  isValueSelectedForSimpleChart(column): boolean
  {
    if (!this.isSimpleChart())
      return false;

    if (!this.values.valueList)
      return false;

    for (let value of this.values.valueList)
    {
      if (column.columnName === value.id)
        return true;
    }

    return false;
  }

  dynTableHasXAxis(): boolean
  {
    if (this.values.dynTableVariables)
    {
      for (let variable of this.values.dynTableVariables)
      {
        if (variable.direction === "horizontal")
          return true;
      }
    }

    return false;
  }

  dynTableHasYAxis(): boolean
  {
    if (this.values.dynTableVariables)
    {
      for (let variable of this.values.dynTableVariables)
      {
        if (variable.direction === "vertical")
          return true;
      }
    }

    return false;
  }

  dynTableHasValues(): boolean
  {
    if (this.values.dynTableValues && this.values.dynTableValues.length)
      return true;

    return false;
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

      for (let variable of this.values.chartColumnOptions)
      {
        if (variable.id == this.lastColumn.columnName)
        {
          this.values.variable = variable;
          break;
        }
      }

      this.selectingAnalysis = false;
      this.checkPanelConfiguration ();
    }

    if (this.selectingXAxis)
    {
      this.xAxisSelected = this.lastColumn;

      for (let variable of this.values.chartColumnOptions)
      {
        if (variable.id == this.lastColumn.columnName)
        {
          this.values.xaxis = variable;
          break;
        }
      }

      this.selectingXAxis = false;
      this.checkPanelConfiguration ();
    }

    if (this.selectingValue)
    {
      this.valueSelected = this.lastColumn;

      for (let variable of this.values.chartColumnOptions)
      {
        if (variable.id == this.lastColumn.columnName)
        {
          this.values.valueColumn = variable;
          break;
        }
      }

      this.selectingValue = false;
      this.checkPanelConfiguration ();
    }

    if (this.selectingAggregationValue)
    {
      this.aggregationValueSelected = this.lastColumn;

      for (let variable of this.values.chartColumnOptions)
      {
        if (variable.id == this.lastColumn.columnName)
        {
          this.values.valueColumn = variable;
          break;
        }
      }

      this.selectingAggregationValue = false;
      this.checkPanelConfiguration ();
    }

    this.lastColumn = null;
  }

  haveXAxis(): boolean
  {
    if (this.selectedPanelType.flags & ChartFlags.XYCHART)
      return true;

    return false;
  }

  isSmallPanel(): boolean
  {
    let element, item, width;

    if (this.dialogData)
      return false;

    element = document.getElementsByClassName("lb-generated-id-" + this.values.gridId);
    item = element ? element[0] : null;

    if (!item)
      return true;

    if (item.style.width != null && item.style.width != "")
      width = parseInt (item.style.width, 10);
    else
      width = item.offsetWidth;

    return width < 875 ? true : false;
  }

  isTinyPanel(): boolean
  {
    let element, item, width, height;

    if (this.dialogData)
      return false;

    element = document.getElementsByClassName ("lb-generated-id-" + this.values.gridId);
    item = element ? element[0] : null;

    if (!item)
      return true;

    if (item.style.width != null && item.style.width != "")
      width = parseInt (item.style.width, 10);
    else
      width = item.offsetWidth;

    if (item.style.height != null && item.style.height != "")
      height = parseInt (item.style.height, 10);
    else
      height = item.offsetHeight;

    if (!this.values.displayChart && !this.values.displayInfo && !this.values.displayForm && !this.values.displayPic
      && !this.values.displayTable && !this.values.displayMapbox && !this.values.displayDynTable && !this.globals.readOnlyDashboard
      && width >= 600 && height >= 390 && this.panelConfigRefresh)
    {
      // refresh panel if it can be configurable
      setTimeout (() => {
        this.selectStep (this.selectedStep);
        this.panelConfigRefresh = false;
      }, 10);
    }

    if (width < 600 || height < 390)
      this.panelConfigRefresh = true;

    return (width < 600 || height < 390) ? true : false;
  }
}
