import { Component, Inject, ViewChild, ChangeDetectorRef, isDevMode, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTabGroup, MatDialog, MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material';
import { FlatTreeControl } from '@angular/cdk/tree';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';

import { ApplicationService } from '../services/application.service';
import { CategoryArguments } from '../model/CategoryArguments';
import { MsfTableComponent } from '../msf-table/msf-table.component';
import { AuthService } from '../services/auth.service';
import { Arguments } from '../model/Arguments';
import { Utils } from '../commons/utils';
import { Globals } from '../globals/Globals';
import { ComponentType } from '../commons/ComponentType';
import { ChartFlags } from '../msf-dashboard-panel/msf-dashboard-chartflags';
import { Themes } from '../globals/Themes';
import { MessageComponent } from '../message/message.component';
import { MsfDashboardPanelValues } from '../msf-dashboard-panel/msf-dashboard-panelvalues';
import { ConfigFlags } from '../msf-dashboard-panel/msf-dashboard-configflags';
import { ExampleFlatNode } from '../admin-menu/admin-menu.component';
import { ReplaySubject, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { MsfDashboardInfoFunctionsComponent } from '../msf-dashboard-info-functions/msf-dashboard-info-functions.component';
import { MsfDynamicTableVariablesComponent } from '../msf-dynamic-table-variables/msf-dynamic-table-variables.component';
import { MsfChartPreviewComponent } from '../msf-chart-preview/msf-chart-preview.component';
import { AirportSelection } from '../commons/AirportSelection';
import { ActionListFlatNode } from '../model/ActionListFlatNode';
import { MaterialIconPickerComponent } from '../material-icon-picker/material-icon-picker.component';
import { MsfDashboardValueSelectorDialogComponent } from '../msf-dashboard-value-selector-dialog/msf-dashboard-value-selector-dialog.component';

// const signos = "!#&?¿¡!><=}{:,%$.';\-";
const Expresion = "(.*?)";
// const Expresion = "\CHARACTER(.*?)\CHARACTER";

@Component({
  selector: 'app-msf-dashboard-assistant',
  templateUrl: './msf-dashboard-assistant.component.html',
  styleUrls: ['./msf-dashboard-assistant.component.css']
})



export class MsfDashboardAssistantComponent implements OnInit {
  utils: Utils;
  values: MsfDashboardPanelValues;
  panelForm: FormGroup;
  updateURLResults: boolean = false;
 

  @ViewChild("materialIconPicker", { static: false })
  materialIconPicker: MaterialIconPickerComponent;
  recursiveDeleteDone: boolean;

  listActionIcons: any[] = ['IconOption1.png','IconOption2.png','IconOption3.png','IconOption4.png','IconOption5.png','IconOption6.png',
  'datePeriod.png','Airlines.png','Airport_Date_Time.png','content_type.png','genre.png','media_name.png','region.png','Types.png','World Region.png'];

  listFormat: any[] = [
    {
      title: 'Italic',
      description: 'To <i>italicize</i> your text, place an underscore on both sides of the text:',
      example: '_text_'
    },
    {
      title: 'Bold',
      description: 'To <strong>bold</strong> your text, place an asterisk on both sides of the text:',
      example: '*text*'
    },
    {
      title: 'Italic-Bold',
      description: 'To <i><strong>italicize and bold</i></strong> your text, place an underscore and an asterisk on both sides of the text:',
      example: '_*text*_'
    },
    {
      title: 'Strikethrough',
      description: 'To <del>strikethrough</del> your text, place a tilde on both sides of the text:',
      example: '~text~'
    },
    {
      title: 'Monospace',
      description: 'To <tt>monospace</tt> your text, place an underscore and a tilde on both sides of the text:',
      example: '_~text~_'
    },
    {
      title: 'Link',
      description: "To hyperlink your text, place <a url='your link'> at the beginning of your text  and </a> at the end of the text , inside the quotes put in link",
      example: "<a url='https://pulse.globaleagle.com/'> Text <a>"
      // example: ""
    },

  ];


  panelTypes: any[] = [
    { name: 'Bars', flags: ChartFlags.XYCHART, image: 'vert-bar-chart.png', allowedInAdvancedMode: true },
    { name: 'Horizontal Bars', flags: ChartFlags.XYCHART | ChartFlags.ROTATED, image: 'horiz-bar-chart.png', allowedInAdvancedMode: true },
    { name: 'Simple Bars', flags: ChartFlags.NONE, image: 'simple-vert-bar-chart.png', allowedInAdvancedMode: true },
    { name: 'Simple Horizontal Bars', flags: ChartFlags.ROTATED, image: 'simple-horiz-bar-chart.png', allowedInAdvancedMode: true },
    { name: 'Stacked Bars', flags: ChartFlags.XYCHART | ChartFlags.STACKED, image: 'stacked-vert-column-chart.png', allowedInAdvancedMode: true },
    { name: 'Horizontal Stacked Bars', flags: ChartFlags.XYCHART | ChartFlags.ROTATED | ChartFlags.STACKED, image: 'stacked-horiz-column-chart.png', allowedInAdvancedMode: true },
    { name: 'Funnel', flags: ChartFlags.FUNNELCHART, image: 'funnel-chart.png', allowedInAdvancedMode: false },
    { name: 'Lines', flags: ChartFlags.XYCHART | ChartFlags.LINECHART, image: 'normal-line-chart.png', allowedInAdvancedMode: true },
    { name: 'Simple Lines', flags: ChartFlags.LINECHART, image: 'line-chart.png', allowedInAdvancedMode: true },
    { name: 'Scatter', flags: ChartFlags.XYCHART | ChartFlags.BULLET, image: 'scatter-chart.png', allowedInAdvancedMode: false },
    { name: 'Area', flags: ChartFlags.XYCHART | ChartFlags.AREACHART, image: 'area-chart.png', allowedInAdvancedMode: false },
    { name: 'Stacked Area', flags: ChartFlags.XYCHART | ChartFlags.STACKED | ChartFlags.AREACHART, image: 'stacked-area-chart.png', allowedInAdvancedMode: false },
    { name: 'Pie', flags: ChartFlags.PIECHART, image: 'pie-chart.png', allowedInAdvancedMode: false },
    { name: 'Donut', flags: ChartFlags.DONUTCHART, image: 'donut-chart.png', allowedInAdvancedMode: false },
    { name: 'Table', flags: ChartFlags.TABLE, image: 'table.png', allowedInAdvancedMode: false },
    { name: 'Dynamic Table', flags: ChartFlags.DYNTABLE, image: 'dyn-table.png', allowedInAdvancedMode: false },
    { name: 'Information', flags: ChartFlags.INFO, image: 'info.png', allowedInAdvancedMode: false },
    { name: 'Simple Form', flags: ChartFlags.INFO | ChartFlags.FORM, image: 'simple-form.png', allowedInAdvancedMode: false },
    { name: 'Link Image', flags: ChartFlags.INFO | ChartFlags.PICTURE, image: 'link-image.png', allowedInAdvancedMode: false },
    { name: 'Editable List', flags:  ChartFlags.INFO | ChartFlags.EDITACTIONLIST, image: 'actionList.png', allowedInAdvancedMode: false },
    { name: 'Map', flags: ChartFlags.MAP, image: 'map.png', allowedInAdvancedMode: false },
    { name: 'Heat Map', flags: ChartFlags.HEATMAP, image: 'heatmap.png', allowedInAdvancedMode: false },
    { name: 'Bubble Heat Map', flags: ChartFlags.HEATMAP | ChartFlags.BUBBLE, image: 'bubble-heatmap.png', allowedInAdvancedMode: false },
    { name: 'Map Tracker', flags: ChartFlags.MAP | ChartFlags.MAPBOX, image: 'mapbox.png', allowedInAdvancedMode: false }
  ];

  functions: any[];
  chartTypes: any[];
  nciles: number[];
  fontSizes: any[];
  orientations: any[];
  geodatas: any[];

  msfMapRef: any;
  generateBtnEnabled: boolean = false;

  // dashboard interface values
  selectedPanelType: any = this.panelTypes[0];
  selectedStep: number = 1;
  stepLoading: number = 0;

  EditActionList: any;
  menuCategories: any[] = [];
  selectedItem: any = null;

  hasChild = (_: number, node: any) => (node.expandable);

  configTableLoading: boolean = false;
  noControlVariables: boolean = false;
  configuredControlVariables: boolean = false;
  panelMode: string = "basic";
  panelConfigRefresh: boolean = false;
  advConfigFlags: ConfigFlags = null;
  useThemeColors: boolean = false;
  scrollToOption: any = null;
  controlVariablesSet: boolean = false;

  childPanelValues: any[] = [];
  childPanelsConfigured: boolean[] = [];

  @ViewChild("configTabs", { static: false })
  configTabs: MatTabGroup;

  @ViewChild("editTabs", { static: false })
  editTabs: MatTabGroup;

  @ViewChild('msfConfigTableRef', { static: false })
  msfConfigTableRef: MsfTableComponent;

  filteredVariables: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  filteredValues: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  filteredInfoVar1: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  filteredInfoVar2: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  filteredInfoVar3: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  filteredColumns: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);

  variableFilterCtrl: FormControl = new FormControl ();
  valueFilterCtrl: FormControl = new FormControl ();
  infoVar1FilterCtrl: FormControl = new FormControl ();
  infoVar2FilterCtrl: FormControl = new FormControl ();
  infoVar3FilterCtrl: FormControl = new FormControl ();
  columnFilterCtrl: FormControl = new FormControl ();

  formFilterCtrl: FormControl[] = [];

  _onDestroy = new Subject<void> ();

  optionSelected: any = {};
  dataChange = new BehaviorSubject<any[]>([]);
  get dataEditActionList(): any[] { return this.dataChange.value; }
  expandedNodeSet = new Set<string>();
  dragging = false;
  expandTimeout: any;
  expandDelay = 1000;
  flatNodeMap = new Map<ActionListFlatNode, any>();
  nestedNodeMap = new Map<any, ActionListFlatNode>();
  private transformer = (node: any, level: number) =>
      {
        const existingNode = this.nestedNodeMap.get (node);
        const flatNode = existingNode && existingNode.title === node.title
          ? existingNode
          : new ActionListFlatNode ();
        flatNode.expandable = !!node.children && node.children.length > 0;
        flatNode.id = node.id;
        flatNode.uid = node.uid;
        flatNode.icon = node.icon;
        flatNode.dashboardPanel_id = node.dashboardPanel_id;
        flatNode.level = level;
        flatNode.parent = node.parent;
        flatNode.title = node.title;
        flatNode.description = node.description;
        flatNode.children = node.children;
        flatNode.isActive = node.isActive;
        
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };
  treeControl = new FlatTreeControl<ActionListFlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );
  dataSourceEditActionList = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(public dialogRef: MatDialogRef<MsfDashboardAssistantComponent>,
    public globals: Globals,
    private service: ApplicationService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.utils = new Utils ();

    // This is for the dialog version
    this.values = new MsfDashboardPanelValues (this.data.values.options, this.data.values.chartName,
      this.data.values.chartDescription, this.data.values.id, this.data.values.gridId,
      this.data.values.x, this.data.values.y, this.data.values.width,
      this.data.values.height);

    this.values.chartGenerated = this.data.values.chartGenerated;
    this.values.infoGenerated = this.data.values.infoGenerated;
    this.values.formGenerated = this.data.values.formGenerated;
    this.values.picGenerated = this.data.values.picGenerated;
    this.values.EditactionListGenerated = this.data.values.EditactionListGenerated;
    this.values.tableGenerated = this.data.values.tableGenerated;
    this.values.mapboxGenerated = this.data.values.mapboxGenerated;
    this.values.dynTableGenerated = this.data.values.dynTableGenerated;

    this.functions = this.data.functions;
    this.chartTypes = this.data.chartTypes;
    this.nciles = this.data.nciles;
    this.fontSizes = this.data.fontSizes;
    this.orientations = this.data.orientations;
    this.geodatas = this.data.geodatas;
    this.childPanelValues = this.data.childPanelValues;
    this.childPanelsConfigured = this.data.childPanelsConfigured;

    this.values.currentChartType = this.chartTypes[0];

    this.panelForm = this.formBuilder.group ({
      columnCtrl: new FormControl (''),
      fontSizeCtrl: new FormControl (this.fontSizes[1]),
      valueFontSizeCtrl: new FormControl (this.fontSizes[1]),
      valueOrientationCtrl: new FormControl (this.orientations[0]),
      functionCtrl: new FormControl (this.functions[0])
    });

    this.msfMapRef = this.data.msfMapRef;

    this.generateBtnEnabled = this.data.generateBtnEnabled;

    this.dataChange.subscribe(data => {
      this.dataSourceEditActionList.data = data;
      this.values.EditActionList = data;
    });
  }

  ngOnInit()
  {
    let i, item;

    // copy function list for use with the information panel
    this.values.infoFunc1 = JSON.parse (JSON.stringify (this.functions));
    this.values.infoFunc2 = JSON.parse (JSON.stringify (this.functions));
    this.values.infoFunc3 = JSON.parse (JSON.stringify (this.functions));

    this.values.urlImg = this.data.values.urlImg;
    this.values.EditActionList = this.data.values.EditActionList;

    if (this.data.values.currentOption != null)
      this.values.currentOption = JSON.parse (JSON.stringify (this.data.values.currentOption));

    this.values.chartName = this.data.values.chartName;
    this.values.chartDescription = this.data.values.chartDescription;

    this.values.function = this.data.values.function;
    this.values.geodata = this.data.values.geodata;
    this.values.chartColumnOptions = JSON.parse (JSON.stringify (this.data.values.chartColumnOptions));
    this.values.currentOptionCategories = JSON.parse (JSON.stringify (this.data.values.currentOptionCategories));
    this.values.thresholds = JSON.parse (JSON.stringify (this.data.values.thresholds));
    this.values.goals = JSON.parse (JSON.stringify (this.data.values.goals));
    this.values.style = JSON.parse (JSON.stringify (this.data.values.style));
    this.values.vertAxisName = this.data.values.vertAxisName;
    this.values.horizAxisName = this.data.values.horizAxisName;
    this.values.dynTableValues = this.data.values.dynTableValues ? JSON.parse (JSON.stringify (this.data.values.dynTableValues)) : null;
    this.values.dynTableVariables = JSON.parse (JSON.stringify (this.data.values.dynTableVariables));
    this.values.intervalType = this.data.values.intervalType;
    this.values.intValue = this.data.values.intValue;
    this.values.valueList = this.data.values.valueList;    
    if(this.values.EditActionList){
      this.convertDescription(this.values.EditActionList,false);
      this.dataChange.next(this.values.EditActionList);
      // this.dataChange.next(this.data.values.EditActionList);
      this.treeControl.expandAll();
    }

    if (this.values.currentOption)
    {
      // prepare the data form combo box
      this.filteredVariables.next (this.values.chartColumnOptions.slice ());
      this.filteredValues.next (this.values.chartColumnOptions.slice ());

      this.filteredInfoVar1.next (this.values.chartColumnOptions.slice ());
      this.filteredInfoVar2.next (this.values.chartColumnOptions.slice ());
      this.filteredInfoVar3.next (this.values.chartColumnOptions.slice ());

      this.filteredColumns.next (this.values.chartColumnOptions.slice ());

      this.variableSearchChange (this.variableFilterCtrl);
      this.valueSearchChange (this.valueFilterCtrl);

      this.searchChange (this.infoVar1FilterCtrl, this.filterInfoVar1);
      this.searchChange (this.infoVar2FilterCtrl, this.filterInfoVar2);
      this.searchChange (this.infoVar3FilterCtrl, this.filterInfoVar3);

      this.columnSearchChange (this.columnFilterCtrl);
    }

    if (this.data.values.variable && this.values.chartColumnOptions != null)
    {
      for (i = 0; i < this.values.chartColumnOptions.length; i++)
      {
        item = this.values.chartColumnOptions[i];

        if (this.data.values.variable.id === item.id)
        {
          this.values.variable = item;
          break;
        }
      }
    }
    else
      this.values.variable = null;

    if (this.data.values.xaxis && this.values.chartColumnOptions != null)
    {
      for (i = 0; i < this.values.chartColumnOptions.length; i++)
      {
        item = this.values.chartColumnOptions[i];

        if (this.data.values.xaxis.id === item.id)
        {
          this.values.xaxis = item;
          break;
        }
      }
    }
    else
      this.values.xaxis = null;

    if (this.data.values.valueColumn && this.values.chartColumnOptions != null)
    {
      for (i = 0; i < this.values.chartColumnOptions.length; i++)
      {
        item = this.values.chartColumnOptions[i];

        if (this.data.values.valueColumn.id === item.id)
        {
          this.values.valueColumn = item;
          break;
        }
      }
    }
    else
      this.values.valueColumn = null;

    for (i = 0; i < this.chartTypes.length; i++)
    {
      item = this.chartTypes[i];

      if (item.name === this.data.values.currentChartType.name)
      {
        this.values.currentChartType = item;
        break;
      }
    }

    this.values.valueList = [];

    if (this.data.values.valueList && this.values.chartColumnOptions != null && this.values.currentChartType && this.isSimpleChart ())
    {
      for (i = 0; i < this.data.values.valueList.length; i++)
      {
        let value = this.data.values.valueList[i];

        for (let column of this.values.chartColumnOptions)
        {
          if (column.id === value.id)
          {
            this.values.valueList.push (column);
            break;
          }
        }
      }
    }

    if (this.values.currentChartType)
    {
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
    }

    if (this.values.currentChartType.flags & ChartFlags.INFO
      && !(this.values.currentChartType.flags & ChartFlags.FORM)
      && !(this.values.currentChartType.flags & ChartFlags.PICTURE)
      && !(this.values.currentChartType.flags & ChartFlags.EDITACTIONLIST)
      && this.values.chartColumnOptions != null)
    {
      if (this.data.values.infoVar1 != null)
      {
        for (i = 0; i < this.values.chartColumnOptions.length; i++)
        {
          item = this.values.chartColumnOptions[i];

          if (this.data.values.infoVar1.id === item.id)
          {
            this.values.variable = item;
            break;
          }
        }
      }

      if (this.data.values.infoVar2 != null)
      {
        for (i = 0; i < this.values.chartColumnOptions.length; i++)
        {
          item = this.values.chartColumnOptions[i];

          if (this.data.values.infoVar2.id === item.id)
          {
            this.values.xaxis = item;
            break;
          }
        }
      }

      if (this.data.values.infoVar3 != null)
      {
        for (i = 0; i < this.values.chartColumnOptions.length; i++)
        {
          item = this.values.chartColumnOptions[i];

          if (this.data.values.infoVar3.id === item.id)
          {
            this.values.valueColumn = item;
            break;
          }
        }
      }
    }


    this.values.formVariables = [];

    if (this.values.chartColumnOptions != null)
    {
      for (let i = 0; i < this.data.values.formVariables.length; i++)
      {
        let formVariable = this.data.values.formVariables[i];
        let filteredVariables = new ReplaySubject<any[]>(1);
        let column = this.values.chartColumnOptions[0];

        filteredVariables.next (this.values.chartColumnOptions.slice ());

        for (let j = 0; j < this.values.chartColumnOptions.length; j++)
        {
          let item = this.values.chartColumnOptions[j];

          if (formVariable.column.id === item.id)
          {
            column = item;
            break;
          }
        }

        this.values.formVariables.push ({
          value: this.data.values.lastestResponse[i].value,
          column: column,
          fontSize: formVariable.fontSize,
          valueFontSize: formVariable.valueFontSize,
          valueOrientation: formVariable.valueOrientation,
          function: formVariable.function,
          filteredVariables: filteredVariables
        });
      }
    }

    if (this.values.thresholds && this.values.thresholds.length)
    {
      for (let threshold of this.values.thresholds)
      {
        threshold.filteredVariables = new ReplaySubject<any[]> (1);
        threshold.filteredVariables.next (this.values.chartColumnOptions.slice ());
      }
    }

    this.values.tableVariables = JSON.parse (JSON.stringify (this.data.values.tableVariables));

    this.values.updateIntervalSwitch = this.data.values.updateIntervalSwitch;
    this.values.startAtZero = this.data.values.startAtZero;
    this.values.updateTimeLeft = this.data. values.updateTimeLeft;
    this.values.limitMode = this.data.values.limitMode;
    this.values.limitAmount = this.data.values.limitAmount;
    this.values.ordered = this.data.values.ordered;

    this.values.paletteColors = JSON.parse (JSON.stringify (this.data.values.paletteColors));

    this.values.valueListInfo = JSON.parse (JSON.stringify (this.data.values.valueListInfo));
    if (!this.values.valueListInfo.length && this.values.valueList)
    {
      for (let i = 0; i < this.values.valueList.length; i++)
      {
        this.values.valueListInfo.push ({
          function: this.functions.indexOf (this.values.function),
          axis: !i ? true : false
        });
      }
    }

    this.values.style = this.msfMapRef.mapTypes[1];
  }

  ngAfterContentInit(): void
  {
    this.checkChartType ();
  }

  ngOnDestroy(): void
  {
    this._onDestroy.next ();
    this._onDestroy.complete ();
  }

  filterValues(filterCtrl): void
  {
    if (!this.values.chartColumnOptions)
      return;

    // get the search keyword
    let search = filterCtrl.value;
    if (!search)
    {
      this.filteredValues.next (this.values.chartColumnOptions.slice ());
      return;
    }

    search = search.toLowerCase ();
    this.filteredValues.next (
      this.values.chartColumnOptions.filter (a => a.name.toLowerCase ().indexOf (search) > -1)
    );
  }

  filterVariables(filterCtrl): void
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

  filterInfoVar1(filterCtrl): void
  {
    if (!this.values.chartColumnOptions)
      return;

    // get the search keyword
    let search = filterCtrl.value;
    if (!search)
    {
      this.filteredInfoVar1.next (this.values.chartColumnOptions.slice ());
      return;
    }

    search = search.toLowerCase ();
    this.filteredInfoVar1.next (
      this.values.chartColumnOptions.filter (a => a.name.toLowerCase ().indexOf (search) > -1)
    );
  }

  filterInfoVar2(filterCtrl): void
  {
    if (!this.values.chartColumnOptions)
      return;

    // get the search keyword
    let search = filterCtrl.value;
    if (!search)
    {
      this.filteredInfoVar2.next (this.values.chartColumnOptions.slice ());
      return;
    }

    search = search.toLowerCase ();
    this.filteredInfoVar2.next (
      this.values.chartColumnOptions.filter (a => a.name.toLowerCase ().indexOf (search) > -1)
    );
  }

  filterInfoVar3(filterCtrl): void
  {
    if (!this.values.chartColumnOptions)
      return;

    // get the search keyword
    let search = filterCtrl.value;
    if (!search)
    {
      this.filteredInfoVar3.next (this.values.chartColumnOptions.slice ());
      return;
    }

    search = search.toLowerCase ();
    this.filteredInfoVar3.next (
      this.values.chartColumnOptions.filter (a => a.name.toLowerCase ().indexOf (search) > -1)
    );
  }

  filterColumn(filterCtrl): void
  {
    if (!this.values.chartColumnOptions)
      return;

    // get the search keyword
    let search = filterCtrl.value;
    if (!search)
    {
      this.filteredColumns.next (this.values.chartColumnOptions.slice ());
      return;
    }

    search = search.toLowerCase ();
    this.filteredColumns.next (
      this.values.chartColumnOptions.filter (a => a.name.toLowerCase ().indexOf (search) > -1)
    );
  }

  filterThreshold(value, threshold): void
  {
    if (!this.values.chartColumnOptions)
      return;

    // get the search keyword
    let search = value;
    if (!search)
    {
      threshold.filteredVariables.next (this.values.chartColumnOptions.slice ());
      return;
    }

    search = search.toLowerCase ();
    threshold.filteredVariables.next (
      this.values.chartColumnOptions.filter (a => a.name.toLowerCase ().indexOf (search) > -1)
    );
  }

  filterForm(value, formVariable): void
  {
    if (!this.values.chartColumnOptions)
      return;

    // get the search keyword
    let search = value;
    if (!search)
    {
      formVariable.filteredVariables.next (this.values.chartColumnOptions.slice ());
      return;
    }

    search = search.toLowerCase ();
    formVariable.filteredVariables.next (
      this.values.chartColumnOptions.filter (a => a.name.toLowerCase ().indexOf (search) > -1)
    );
  }

  variableSearchChange(filterCtrl): void
  {
    // listen for search field value changes
    filterCtrl.valueChanges
      .pipe (takeUntil (this._onDestroy))
      .subscribe (() => {
        this.filterVariables (filterCtrl);
      });
  }

  valueSearchChange(filterCtrl): void
  {
    // listen for search field value changes
    filterCtrl.valueChanges
      .pipe (takeUntil (this._onDestroy))
      .subscribe (() => {
        this.filterValues (filterCtrl);
      });
  }

  searchChange(filterCtrl, filterFunc): void
  {
    // listen for search field value changes
    filterCtrl.valueChanges
      .pipe (takeUntil (this._onDestroy))
      .subscribe (() => {
        filterFunc (filterCtrl);
      });
  }

  columnSearchChange(filterCtrl): void
  {
    // listen for search field value changes
    filterCtrl.valueChanges
      .pipe (takeUntil (this._onDestroy))
      .subscribe (() => {
        this.filterColumn (filterCtrl);
      });
  }

  getParameters()
  {
    let currentOptionCategories;
    let paramsGroup = [];
    let params;

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

  hasLimitResultsSettings(): boolean
  {
    return (this.advConfigFlags & ConfigFlags.LIMITVALUES) ? true : false;
  }

  hasLimitValueRangeSettings(): boolean
  {
    return (this.advConfigFlags & ConfigFlags.LIMITAGGREGATOR) ? true : false;
  }

  hasColorSettings(): boolean
  {
    return (this.advConfigFlags & ConfigFlags.CHARTCOLORS) ? true : false;
  }

  hasHeatMapColorSettings(): boolean
  {
    return (this.advConfigFlags & ConfigFlags.HEATMAPCOLOR) ? true : false;
  }

  hasThresholdValuesSettings(): boolean
  {
    return (this.advConfigFlags & ConfigFlags.THRESHOLDS) ? true : false;
  }

  hasGoalsSettings(): boolean
  {
    return (this.advConfigFlags & ConfigFlags.GOALS) ? true : false;
  }

  hasAxisNamesSettings(): boolean
  {
    return (this.advConfigFlags & ConfigFlags.AXISNAMES) ? true : false;
  }

  hasAnimationSettings(): boolean
  {
    return (this.advConfigFlags & ConfigFlags.ANIMATIONS) ? true : false;
  }

  configureAdditionalSettings(): void
  {
    this.advConfigFlags = ConfigFlags.NONE;

    if (this.values.currentChartType.flags & ChartFlags.FORM ||
      this.values.currentChartType.flags & ChartFlags.TABLE)
      this.advConfigFlags = ConfigFlags.THRESHOLDS;
    else if (this.values.currentChartType.flags & ChartFlags.PIECHART
      || this.values.currentChartType.flags & ChartFlags.FUNNELCHART)
      this.advConfigFlags = ConfigFlags.LIMITVALUES | ConfigFlags.CHARTCOLORS;
    else if (this.values.currentChartType.flags & ChartFlags.HEATMAP)
      this.advConfigFlags = ConfigFlags.HEATMAPCOLOR;
    else if (this.values.currentChartType.flags & ChartFlags.XYCHART || this.isSimpleChart ())
    {
      if (this.values.currentChartType.flags & ChartFlags.BULLET)
        this.advConfigFlags = ConfigFlags.CHARTCOLORS | ConfigFlags.AXISNAMES;
      else
        this.advConfigFlags = ConfigFlags.CHARTCOLORS | ConfigFlags.GOALS | ConfigFlags.AXISNAMES;

      if (this.values.currentChartType.flags & ChartFlags.LINECHART)
        this.advConfigFlags |= ConfigFlags.ANIMATIONS;

      if (!(this.values.currentChartType.flags & ChartFlags.XYCHART))
      {
        this.advConfigFlags |= ConfigFlags.LIMITVALUES;

        if (this.isSimpleChart ())
          this.advConfigFlags |= ConfigFlags.THRESHOLDS;
      }
    }

    // don't allow the option to limit results on advanced charts
    if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
    {
      this.advConfigFlags &= ~ConfigFlags.LIMITVALUES;
      this.advConfigFlags |= ConfigFlags.LIMITAGGREGATOR | ConfigFlags.CHARTCOLORS;

      if (this.values.currentChartType.flags & ChartFlags.LINECHART)
        this.advConfigFlags |= ConfigFlags.ANIMATIONS;
    }

    if (this.values.limitMode == null)
      this.values.limitMode = 0;

    if (this.values.limitAmount == null)
      this.values.limitAmount = 10;

    if (this.values.paletteColors == null)
      this.useThemeColors = true;
    else
      this.useThemeColors = false;
  }

  isInformationPanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.INFO
      && !(this.values.currentChartType.flags & ChartFlags.FORM)
      && !(this.values.currentChartType.flags & ChartFlags.PICTURE)
      && !(this.values.currentChartType.flags & ChartFlags.EDITACTIONLIST)) ? true : false;
  }

  isSimpleChart(): boolean
  {
    return !(this.values.currentChartType.flags & ChartFlags.XYCHART)
      && !(this.values.currentChartType.flags & ChartFlags.ADVANCED)
      && !(this.values.currentChartType.flags & ChartFlags.PIECHART)
      && !(this.values.currentChartType.flags & ChartFlags.FUNNELCHART);
  }

  isLineOrBarChart(): boolean
  {
    if (!(this.values.currentChartType.flags & ChartFlags.PIECHART) && !(this.values.currentChartType.flags & ChartFlags.FUNNELCHART) && !(this.values.currentChartType.flags & ChartFlags.BULLET))
      return true;

    return false;
  }

  isScatterChart(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.BULLET) ? true : false;
  }

  isSimpleFormPanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.FORM) ? true : false;
  }

  isPicturePanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.PICTURE) ? true : false;
  }

  isEditActionListPanel(): boolean
  {
    return (this.values.currentChartType.flags & ChartFlags.EDITACTIONLIST) ? true : false;
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

  toggleThemeColors(): void
  {
    if (!this.values.paletteColors || !this.values.paletteColors.length)
    {
      if (this.hasHeatMapColorSettings ())
        this.values.paletteColors = JSON.parse (JSON.stringify (Themes.AmCharts[this.globals.theme].heatMapColors));
      else
        this.values.paletteColors = JSON.parse (JSON.stringify (Themes.AmCharts[this.globals.theme].resultColors));
    }
    else
      this.values.paletteColors = [];
  }

  toggleHeatLegend(): void
  {
    if (!this.values.limitMode)
    {
      this.values.limitMode = 1;
      this.values.thresholds = [{
        min: 0,
        color: "#000000"
      }];
    }
    else
    {
      this.values.limitMode = null;
      this.values.thresholds = [];
    }
  }

  addColor(): void
  {
    this.values.thresholds.push ({
      min: 0,
      color: "#000000"
    });
  }

  removeColor(): void
  {
    if (this.values.thresholds.length == 1)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "At least one color must be available." }
      });

      return;
    }

    this.values.thresholds.pop ();
  }

  checkPanelTypeSelection(): void
  {
    this.selectingAnalysis = null;
    this.analysisSelected = null;
    this.values.variable = null;
    this.values.xaxis = null;
    this.values.geodata = null;

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
      this.values.valueListInfo = [];
      this.values.startAtZero = false;
    }
    else
    {
      this.selectingAggregationValue = null;
      this.aggregationValueSelected = null;
      this.values.valueColumn = null;
      this.values.valueList = [];
      this.values.valueListInfo = [];

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

    if (this.values.limitMode != null || (this.values.currentChartType.flags & ChartFlags.HEATMAP))
      this.values.limitMode = 0;

    if (this.values.limitAmount != null)
      this.values.limitAmount = 10;

    if (this.values.paletteColors == null)
      this.useThemeColors = true;
    else
      this.useThemeColors = false;
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

  isControlVariablesSet(): boolean
  {
    if (!this.values.currentOptionCategories)
    {
      this.controlVariablesSet = false;
      return false;
    }

    for (let curOptionCategory of this.values.currentOptionCategories)
    {
      for (let argument of curOptionCategory.arguments)
      {
        if (argument.required == 1)
        {
          if (argument.type == ComponentType.airport)
          {
            if (argument.value1 == null || argument.value1.toString() == "")
            {
              this.controlVariablesSet = false;
              return false;
            }

            if (argument.selectionMode)
            {
              let selectionMode = argument.selectionMode & ~AirportSelection.MULTIPLESELECTION;

              if (selectionMode == AirportSelection.ROUTE)
              {
                if (argument.value2 == null || argument.value2.toString() == "")
                {
                  this.controlVariablesSet = false;
                  return false;
                }
              }
              else if (selectionMode == AirportSelection.ROUTEWITHCONNECTION)
              {
                if (argument.value3 == null || argument.value3.toString() == "")
                {
                  this.controlVariablesSet = false;
                  return false;
                }
              }
            }
          }
          else
          {
            if ((argument.value1 == null || argument.value1.toString() == "") || (argument.name2 && (argument.value2 == null || argument.value2.toString() == "")))
            {
              this.controlVariablesSet = false;
              return false;
            }
          }
        }
      }
    }

    this.controlVariablesSet = true;
    return true;
  }

  selectStep(step: number): void
  {
    this.menuCategories = [];

    switch (step)
    {
      case 3:
        this.selectedStep = 3;
        this.stepLoading = 3;
        this.selectedItem = null;
        this.service.loadMenuOptionsForDashboard (this, this.selectDataSuccess, this.selectDataError);
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

        //if (!this.msfConfigTableRef.dataSource)
        {
          this.msfConfigTableRef.displayedColumns = [];
          this.msfConfigTableRef.dataSource = null;

          if (this.stepLoading != 4)
          {
            this.stepLoading = 5;
            this.configTableLoading = true;
            this.loadConfigTableData (this.msfConfigTableRef.handlerSuccess, this.msfConfigTableRef.handlerError);
          }
        }
        /*else
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
        }*/
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

      case 11:
        if (!(this.values.currentOption && this.values.currentOptionCategories && this.controlVariablesSet))
          return;

        this.configureAdditionalSettings ();

        if (this.values.limitMode == null && !(this.values.currentChartType.flags & ChartFlags.HEATMAP))
          this.values.limitMode = 0;

        if (this.values.limitAmount == null)
          this.values.limitAmount = 10;

        if (!this.values.paletteColors || !this.values.paletteColors.length)
          this.useThemeColors = true;

        this.selectedStep = 11;
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
    target.parentNode.parentNode.scrollTop = target.offsetTop - 370;
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
      _this.noControlVariables = true;
      _this.loadConfigTableData (_this.msfConfigTableRef.handlerSuccess, _this.msfConfigTableRef.handlerError);
      return;
    }

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
    _this.configureControlVariables ();

    _this.stepLoading = 0;
    _this.changeDetectorRef.detectChanges ();
    _this.editTabs.realignInkBar ();
  }

  loadConfigTableData(handlerSuccess, handlerError): void
  {
    let url, urlBase, urlArg;

    this.msfConfigTableRef.displayedColumns = [];
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

    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&&pageSize=15&page_number=0";
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

  previewTable(): void
  {
    this.stepLoading = 4;
    this.tablePreview = true;
    this.configTableLoading = true;
    this.loadConfigTableData (this.msfConfigTableRef.handlerSuccess, this.msfConfigTableRef.handlerError);
    this.changeDetectorRef.detectChanges ();
  }

  goToEditor(): void
  {
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

      menuCategory.tree = new MatTreeFlatDataSource (menuCategory.treeControl, menuCategory.treeFlattener);
      menuCategory.tree.data = menuCategory.children;

      if (_this.values.currentOption)
        _this.expandSelectedOption (menuCategory, _this.values.currentOption.id);
    }

    _this.stepLoading = 0;

    if (_this.scrollToOption)
    {
      let target, optionOffsetTop;

      _this.changeDetectorRef.detectChanges();

      // scroll to the selected option
      target = document.getElementById (_this.scrollToOption.category);
      target.parentNode.parentNode.parentNode.scrollLeft = 401 * _this.scrollToOption.categoryIndex;

      optionOffsetTop = document.getElementById (_this.scrollToOption.option).offsetTop - 527;
      if (optionOffsetTop + 32 > 294)
        target.scrollTop = optionOffsetTop;

      _this.scrollToOption = null;
    }
  }

  expandSelectedOption (menuCategory, selectedOptionId: number)
  {
    if (!menuCategory.treeControl.dataNodes || menuCategory.treeControl.dataNodes.length === 0)
      return;

    return menuCategory.treeControl.dataNodes.forEach(node =>
    {
      if (selectedOptionId == node.id)
      {
        let parent;

        menuCategory.treeControl.expand (menuCategory.treeControl.dataNodes[menuCategory.treeControl.dataNodes.indexOf(node)]);

        parent = this.getParentNode (menuCategory, node);
        while (parent)
        {
          menuCategory.treeControl.expand (menuCategory.treeControl.dataNodes[menuCategory.treeControl.dataNodes.indexOf (parent)]);
          parent = this.getParentNode (menuCategory, parent);
        }

        // scroll here
        this.scrollToOption = {
          category: "menu-" + this.menuCategories.indexOf (menuCategory) + "-scroll",
          option: "node-" + node.label,
          categoryIndex: this.menuCategories.indexOf (menuCategory)
        };
      }
    });
  }

  getParentNode(menuCategory, node: ExampleFlatNode): ExampleFlatNode | null
  {
    const currentLevel = node.level;

    if (currentLevel < 1)
      return null;

    const startIndex = menuCategory.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--)
    {
      const currentNode = menuCategory.treeControl.dataNodes[i];

      if (currentNode.level < currentLevel)
        return currentNode;
    }

    return null;
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
    if (this.stepLoading != 4 && this.stepLoading != 5)
      return;

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
    else if (this.noControlVariables)
    {
      this.noControlVariables = false;
      this.values.currentOptionCategories = [];
      this.configureControlVariables ();
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
    return !(!this.values.chartGenerated && !this.values.infoGenerated && !this.values.formGenerated && !this.values.picGenerated && !this.values.tableGenerated && !this.values.mapboxGenerated && !this.values.dynTableGenerated && !this.values.EditactionListGenerated);
  }

  isValueSelectedForSimpleChart(column): boolean
  {
    if (!this.isSimpleChart ())
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

  hasAdditinalSettings(): boolean
  {
    if (!this.isDynTablePanel () && !this.isTablePanel () && !this.isInformationPanel () && !this.isSimpleFormPanel ()
      && !this.isMapPanel () && !this.isHeatMapPanel () && !this.isPicturePanel () && !this.isMapboxPanel ()  && !this.isEditActionListPanel())
      return true;

    return (this.isHeatMapPanel () || this.isSimpleFormPanel () || this.isTablePanel ()) ? true : false;
  }

  trackColor(index): number
  {
    return index;
  }

  addThreshold(): void
  {
    let filteredVariables = new ReplaySubject<any[]> (1);

    filteredVariables.next (this.values.chartColumnOptions.slice ());

    this.values.thresholds.push ({
      min: 0,
      max: 0,
      color: "#000000",
      filteredVariables: filteredVariables
    });
  }

  removeThreshold(): void
  {
    if (this.values.thresholds.length)
      this.values.thresholds.pop ();
  }

  addGoal(): void
  {
    this.values.goals.push ({
      value: 0,
      color: "#000000"
    });
  }

  removeGoal(): void
  {
    if (this.values.goals.length)
      this.values.goals.pop ();
  }

  toggleInfo(menuCategory): void
  {
    menuCategory.infoOpen = !menuCategory.infoOpen;
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

    this._onDestroy.next ();
    this._onDestroy.complete();
    this._onDestroy = new Subject<void> ();

    // load the initial filter variables list
    this.filteredVariables.next (this.values.chartColumnOptions.slice ());
    this.filteredValues.next (this.values.chartColumnOptions.slice ());

    this.filteredInfoVar1.next (this.values.chartColumnOptions.slice ());
    this.filteredInfoVar2.next (this.values.chartColumnOptions.slice ());
    this.filteredInfoVar3.next (this.values.chartColumnOptions.slice ());

    this.filteredColumns.next (this.values.chartColumnOptions.slice ());

    this.variableSearchChange (this.variableFilterCtrl);
    this.valueSearchChange (this.valueFilterCtrl);

    this.searchChange (this.infoVar1FilterCtrl, this.filterInfoVar1);
    this.searchChange (this.infoVar2FilterCtrl, this.filterInfoVar2);
    this.searchChange (this.infoVar3FilterCtrl, this.filterInfoVar3);

    this.columnSearchChange (this.columnFilterCtrl);

    this.values.formVariables = [];

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
    else if (this.values.currentChartType.flags & ChartFlags.EDITACTIONLIST)
    {
      if (this.values.EditActionList && this.values.EditActionList.length != 0)
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
          if (this.values.function != null && this.values.function.id === "count")
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
          if (this.values.function != null && this.values.function.id === "count")
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

  isArray(item): boolean
  {
    return Array.isArray(item);
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

  checkChartType(): void
  {
    if (this.values.currentChartType.flags & ChartFlags.PICTURE)
    {
      if (this.values.urlImg && this.values.urlImg != "")
        this.generateBtnEnabled = true; //kp2020Ene23
      else
        this.generateBtnEnabled = false;

      return;
    }else if (this.values.currentChartType.flags & ChartFlags.EDITACTIONLIST)
    {
      if (this.values.EditActionList && this.values.EditActionList.length != 0)
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

      this.values.xaxis = null;

      this.values.valueColumn = null;
      this.values.valueList = [];
      this.values.valueListInfo = [];

      if (!(this.values.currentChartType.flags & ChartFlags.FORM))
        this.values.formVariables = [];

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
            this.values.currentOption = null;
        }

        this.values.xaxis = null;

        if (!(this.values.currentChartType.flags & ChartFlags.HEATMAP))
        {
          this.values.variable = null;
          this.values.valueColumn = null;
          this.values.horizAxisName = null;
        }

        this.values.vertAxisName = null;

        if (!(this.values.currentChartType.flags & ChartFlags.DYNTABLE))
        {
          this.values.dynTableValues = null;
          this.values.dynTableVariables = [];
        }
      }
      else if (!(this.values.currentChartType.flags & ChartFlags.XYCHART))
      {
        this.values.xaxis = null;

        if (this.values.currentChartType.flags & ChartFlags.ADVANCED)
          this.values.variable = null;

        if (this.values.currentChartType.flags & ChartFlags.FUNNELCHART
          || this.values.currentChartType.flags & ChartFlags.PIECHART)
        {
          this.values.vertAxisName = null;
          this.values.horizAxisName = null;

          this.values.dynTableValues = null;
          this.values.dynTableVariables = [];
        }
      }
      else
      {
        this.values.dynTableValues = null;
        this.values.dynTableVariables = [];
      }

      this.values.infoVar1 = null;

      for (i = 0; i < this.values.infoFunc1.length; i++)
        this.values.infoFunc1[i].checked = false;

      this.values.infoVar2 = null;

      for (i = 0; i < this.values.infoFunc2.length; i++)
        this.values.infoFunc2[i].checked = false;

      this.values.infoVar3 = null;

      for (i = 0; i < this.values.infoFunc3.length; i++)
        this.values.infoFunc3[i].checked = false;

      if (!(this.values.currentChartType.flags & ChartFlags.INFO || this.values.currentChartType.flags & ChartFlags.MAP
        || this.values.currentChartType.flags & ChartFlags.HEATMAP || this.values.currentChartType.flags & ChartFlags.TABLE
        || this.values.currentChartType.flags & ChartFlags.DYNTABLE || this.values.currentChartType.flags & ChartFlags.PICTURE
        || this.values.currentChartType.flags & ChartFlags.EDITACTIONLIST) && this.functions.indexOf(this.values.function) == -1)
        this.values.function = this.functions[0];

      this.values.formVariables = [];
    }

    // check the chart filters to see if the chart generation is to be enabled or not
    this.checkPanelConfiguration ();
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

    // remove filters from simple form columns and thresholds
    for (let formVariable of this.values.formVariables)
      formVariable.filteredVariables = null;

    for (let threshold of this.values.thresholds)
      threshold.filteredVariables = null;

    if (this.values.currentChartType.flags & ChartFlags.PICTURE)
      this.values.currentOption = null;
    
    if (this.values.currentChartType.flags & ChartFlags.EDITACTIONLIST){
      this.values.currentOption = null;
      this.optionSelected = {};
      this.convertDescription(this.values.EditActionList,true);
    }
      this.dialogRef.close ({ generateChart: true, values: this.values });
  }

  goToResults(): void
  {
    this.dialogRef.close ({ goToResults: true });
  }

  isFormColumnValid(): boolean
  {
    return (this.panelForm.get ('columnCtrl').value && this.panelForm.get ('fontSizeCtrl').value
      && this.panelForm.get ('valueFontSizeCtrl').value && this.panelForm.get ('valueOrientationCtrl').value
      && this.panelForm.get ('functionCtrl').value);
  }

  addColumnIntoForm(): void
  {
    let filteredVariables = new ReplaySubject<any[]> (1);

    filteredVariables.next (this.values.chartColumnOptions.slice ());

    this.values.formVariables.push ({
      column: this.panelForm.get ('columnCtrl').value,
      fontSize:  this.panelForm.get ('fontSizeCtrl').value,
      valueFontSize: this.panelForm.get ('valueFontSizeCtrl').value,
      valueOrientation: this.panelForm.get ('valueOrientationCtrl').value,
      function: this.panelForm.get ('functionCtrl').value,
      filteredVariables: filteredVariables
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

  swapFormVariablePositions(event: CdkDragDrop<MsfDashboardPanelValues[]>): void
  {
    // move items
    moveItemInArray (this.values.formVariables, event.previousIndex, event.currentIndex);
  }

  getFormFontSize(column): number
  {
    return this.values.formVariables[column].fontSize.value;
  }

  getValueFormFontSize(column): number
  {
    return this.values.formVariables[column].valueFontSize.value;
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

  startURLUpdate(): void
  {
    this.updateURLResults = true;

    setTimeout (() => {
      this.updateURLResults = false;
    }, 100);
  }

  resetIntervalValue(): void
  {
    if (this.values.intervalType === "value")
      this.values.intValue = 100;
    else
      this.values.intValue = 5;
  }

  pasteControlVariables(): void
  {
    let optionCategories = JSON.parse (this.globals.copiedPanelInfo);

    // pass the arguments values
    for (let optionCategory of this.data.currentOptionCategories)
    {
      for (let curOptionCategory of optionCategories)
      {
        if (curOptionCategory.id == optionCategory.id)
        {
          for (let curCategoryArgument of curOptionCategory.arguments)
          {
            for (let argument of optionCategory.arguments)
            {
              if (curCategoryArgument.id == argument.id && curCategoryArgument.selectionMode == argument.selectionMode)
              {
                argument.value1 = curCategoryArgument.value1;
                argument.value2 = curCategoryArgument.value2;
                argument.value3 = curCategoryArgument.value3;
                argument.value4 = curCategoryArgument.value4;
                argument.dateLoaded = curCategoryArgument.dateLoaded;
                argument.currentDateRangeValue = curCategoryArgument.currentDateRangeValue;
                argument.anchored = false;

                if (argument.type == ComponentType.dateRange)
                  argument.refreshDate = true;

                break;
              }
            }
          }

          break;
        }
      }
    }
  }

  previewChart(): void
  {
    let i, variable, xaxis, valueColumn, selectedType;

    if (this.panelMode === "advanced")
    {
      if (this.aggregationValueSelected.columnType !== "number")
      {
        this.dialog.open (MessageComponent, {
          data: { title: "Error", message: "Only numeric value types are allowed for aggregation value." }
        });

        return;
      }
    }

    if ((this.panelMode === "advanced" && this.selectedPanelType.flags & ChartFlags.XYCHART
      || this.panelMode === "basic")
      && this.analysisSelected)
    {
      for (i = 0; i < this.values.chartColumnOptions.length; i++)
      {
        if (this.values.chartColumnOptions[i].id == this.analysisSelected.columnName)
        {
          variable = this.values.chartColumnOptions[i];
          break;
        }
      }
    }
    else
      variable = null;

    if (this.selectedPanelType.flags & ChartFlags.XYCHART && this.xAxisSelected)
    {
      for (i = 0; i < this.values.chartColumnOptions.length; i++)
      {
        if (this.values.chartColumnOptions[i].id == this.xAxisSelected.columnName)
        {
          xaxis = this.values.chartColumnOptions[i];
          break;
        }
      }
    }
    else
      xaxis = null;

    if (this.panelMode === "advanced")
    {
      for (i = 0; i < this.values.chartColumnOptions.length; i++)
      {
        if (this.values.chartColumnOptions[i].id == this.aggregationValueSelected.columnName)
        {
          valueColumn = this.values.chartColumnOptions[i];
          break;
        }
      }
    }
    else if (this.valueSelected)
    {
      for (i = 0; i < this.values.chartColumnOptions.length; i++)
      {
        if (this.values.chartColumnOptions[i].id == this.valueSelected.columnName)
        {
          valueColumn = this.values.chartColumnOptions[i];
          break;
        }
      }
    }

    for (let type of this.chartTypes)
    {
      if (type.name === this.values.currentChartType.name)
      {
        selectedType = type;
        break;
      }
    }

    this.dialog.open (MsfChartPreviewComponent, {
      panelClass: 'msf-dashboard-assistant-dialog',
      autoFocus: false,
      data: {
        currentChartType: selectedType,
        currentOption: this.values.currentOption,
        currentOptionCategories: this.values.currentOptionCategories,
        function: this.values.function,
        variable: variable,
        xaxis: xaxis,
        valueColumn: valueColumn,
        valueList: this.values.valueList,
        chartMode: this.panelMode,
        intervalType: this.values.intervalType,
        intValue: this.values.intValue,
        startAtZero: this.values.startAtZero,
        ordered: this.values.ordered,
        chartColumnOptions: this.values.chartColumnOptions,
        thresholds: this.values.thresholds,
        goals: this.values.goals,
        paletteColors: this.values.paletteColors,
        chartTypes: this.chartTypes,
        minValueRange: this.values.minValueRange,
        maxValueRange: this.values.maxValueRange,
        vertAxisName: this.values.vertAxisName,
        horizAxisName: this.values.horizAxisName,
        valueListInfo: this.values.valueListInfo
      }
    });
  }

  setSimpleValues(): void
  {
    const dialogRef = this.dialog.open (MsfDashboardValueSelectorDialogComponent, {
      panelClass: 'msf-dashboard-value-selector-dialog',
      autoFocus: false,
      data: {
        values: this.values,
        functions: this.functions,
        chartTypes: this.chartTypes
      }
    });

    dialogRef.afterClosed ().subscribe (() => {
      this.checkPanelConfiguration ();
    });
  }

  getOptionSelected($event,option) {
      if(this.optionSelected.uid != option.uid){
      if(this.optionSelected.uid){
        this.optionSelected.isActive = false;
        this.setChangeisActive(this.optionSelected);
      }
      if(option){
        option.isActive = true;
        this.setChangeisActive(option);
      }
      this.optionSelected = option;
    }
  }

  setChangeisActive(node) {
    const nestedNode = this.flatNodeMap.get(node);
    if(nestedNode){
      nestedNode.isActive = node.isActive
      this.dataChange.next(this.dataEditActionList);
    }
  }

  addNewItem(node,$event) {
    $event.stopPropagation();
      if(this.optionSelected.uid){
        this.optionSelected.isActive = false;
        this.setChangeisActive(this.optionSelected);
      }
      if(node){
        node.isActive = false;
        this.setChangeisActive(node);
      }
    const parentNode = this.flatNodeMap.get(node);
    this.insertItem(parentNode!,this.values.id,$event);
    this.treeControl.expand(node);
  }

  DeleteItem(node) {
    const parentNode = this.flatNodeMap.get(node);
    this.deleteOption(parentNode!);
    this.treeControl.expand(node);
  }

  recursiveDelete(node) {
    if (!node.children)
      return;

    for (let i = 0; i < node.children.length; i++) {
      if (node.children[i].uid === this.optionSelected.uid) {
        const index: number = node.children.findIndex(d => d.uid === this.optionSelected.uid);
        node.children.splice(index, 1);
        // node.children.splice(node.children.indexOf(this.optionSelected), 1);
        this.dataChange.next(this.dataEditActionList);
        this.recursiveDeleteDone = true;
      }
      else
        this.recursiveDelete(node.children[i]);

      if (this.recursiveDeleteDone)
        break;
    }
  }

  deleteNewItem() {
    this.recursiveDeleteDone = false;

    // find the node and delete it
    for (let i = 0; i < this.dataSourceEditActionList.data.length; i++) {
      if (this.dataSourceEditActionList.data[i].uid === this.optionSelected.uid) {
        this.dataSourceEditActionList.data.splice(this.dataSourceEditActionList.data.indexOf(this.optionSelected), 1);
        this.dataChange.next(this.dataEditActionList);
        this.recursiveDeleteDone = true;
      }
      else
        this.recursiveDelete(this.dataSourceEditActionList.data[i]);

      if (this.recursiveDeleteDone)
        break;
    }

    this.optionSelected = {};
  }

  deleteOption(node) {
    if(node.parent){
      this.deleteNewItem();
    }else{
      const index: number = this.dataSourceEditActionList.data.findIndex(d => d.uid === node.uid);
      if(index != -1){
        this.dataSourceEditActionList.data.splice(index, 1);
        this.dataChange.next(this.dataEditActionList);
      }
    }
     
  }

  insertItem(parent: any,idpanel,$event) {
    if (parent) {
      parent.children.push({
        title: '',
        uid: 'childNode' + parent.uid + parent.children.length,
        dashboardPanel_id: idpanel,
        icon: 'IconOption6.png',
        parent: parent.uid,
        children: [],
        description: null,
        isActive: true
      } as any);
      this.optionSelected = parent.children[parent.children.length-1];
      this.dataChange.next(this.dataEditActionList);
    } else {
      let size = this.dataSourceEditActionList.data.length ? this.dataSourceEditActionList.data.length : 0;
      this.dataSourceEditActionList.data.push({
        title: '',
        uid: 'rootNode' + size,
        dashboardPanel_id: idpanel,
        icon: 'IconOption3.png',
        parent: null,
        children: [],
        description: null,
        isActive: true
      } as any);
      this.optionSelected = this.dataSourceEditActionList.data[this.dataSourceEditActionList.data.length-1];
      this.dataChange.next(this.dataEditActionList);
    }
    this.checkChartType();
  }

  setChange(node) {
    const nestedNode = this.flatNodeMap.get(node);
    nestedNode.title = node.title;
    nestedNode.description = node.description;
    nestedNode.icon = node.icon;
    this.dataChange.next(this.dataEditActionList);
  }

  rebuildTreeForData(data: any) {
    this.rememberExpandedTreeNodes(this.treeControl, this.expandedNodeSet);
    this.dataSourceEditActionList.data = data;
    this.forgetMissingExpandedNodes(this.treeControl, this.expandedNodeSet);
    this.expandNodesById(
      this.treeControl.dataNodes,
      Array.from(this.expandedNodeSet)
    );
  }

  private rememberExpandedTreeNodes(
    treeControl: FlatTreeControl<ActionListFlatNode>,
    expandedNodeSet: Set<string>
  ) {
    if (treeControl.dataNodes) {
      treeControl.dataNodes.forEach(node => {
        if (treeControl.isExpandable(node) && treeControl.isExpanded(node)) {
          // capture latest expanded state
          expandedNodeSet.add(node.uid);
        }
      });
    }
  }

  private forgetMissingExpandedNodes(
    treeControl: FlatTreeControl<ActionListFlatNode>,
    expandedNodeSet: Set<string>
  ) {
    if (treeControl.dataNodes) {
      expandedNodeSet.forEach(nodeId => {
        if (!treeControl.dataNodes.find(n => n.uid === nodeId)) {
          expandedNodeSet.delete(nodeId);
        }
      });
    }
  }

  private expandNodesById(flatNodes: ActionListFlatNode[], ids: string[]) {
    if (!flatNodes || flatNodes.length === 0) return;
    const idSet = new Set(ids);
    return flatNodes.forEach(node => {
      if (idSet.has(node.uid)) {
        this.treeControl.expand(node);
        let parent = this.getParentEditActionListNode(node);
        while (parent) {
          this.treeControl.expand(parent);
          parent = this.getParentEditActionListNode(parent);
        }
      }
    });
  }

  private getParentEditActionListNode(node: ActionListFlatNode): ActionListFlatNode | null {
    const currentLevel = node.level;
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (currentNode.level < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  getNodeIndent(node){
    return 20;
  }

  stop_Propagation(node,$event){
    if(node.isActive){
      $event.stopPropagation()
    }
  }

  convertDescription(data,convert){
    for (let index = 0; index < data.length; index++) {
      const item = data[index];
      item.isActive = false;
      if(convert){
        data[index].description = this.getDescription(item.description);
        if(item.children.length>0){
          this.convertDescription(item.children,true);
        }
      }else{
        data[index].description = this.RollbackDescription(item.description);
        if(item.children.length>0){
          this.convertDescription(item.children,false);
        }
      }
    }
  }

  RollbackDescription(text){
    if(text){
      //italicBold
      // exp = new RegExp('[~](\\w)+[~]', 'g');
      // let exp = new RegExp('(</?i></?strong>)([A-Za-z0-9'+signos+']\\s*)+(</?strong></?i>)', 'g');
      let exp =new RegExp('(</?i></?strong>)'+Expresion+'(</?strong></?i>)', 'g');
      let matchEpresion = text.match(exp);
      if(matchEpresion){
        for (let index = 0; index < matchEpresion.length; index++) {
          const element = matchEpresion[index];
          let newElement = element.replace('<i><strong>','_*');
          newElement = newElement.replace('</strong></i>','*_');
          text = text.replace(element, newElement);      
        }
      }

      //italic
      // exp = new RegExp('(</?i>)([A-Za-z0-9'+signos+']\\s*)+(</?i>)', 'g');
      exp = new RegExp('(</?i>)'+Expresion+'(</?i>)', 'g');
      matchEpresion = text.match(exp);
      if(matchEpresion){
        for (let index = 0; index < matchEpresion.length; index++) {
          const element = matchEpresion[index];
          let newElement = element.replace('<i>','_');
          newElement = newElement.replace('</i>','_');
          text = text.replace(element, newElement);      
        }
      }

      //bold
      // exp = new RegExp('(</?strong>)([A-Za-z0-9'+signos+']\\s*)+(</?strong>)', 'g');
      exp = new RegExp('(</?strong>)'+Expresion+'(</?strong>)', 'g');
      matchEpresion = text.match(exp);
      if(matchEpresion){
        for (let index = 0; index < matchEpresion.length; index++) {
          const element = matchEpresion[index];
          let newElement = element.replace('<strong>','*');
          newElement = newElement.replace('</strong>','*');
          text = text.replace(element, newElement);      
        }
      }
      
      //monospace
      // exp = new RegExp('(</?tt>)([A-Za-z0-9'+signos+']\\s*)+(</?tt>)', 'g');
      exp = new RegExp('(</?tt>)'+Expresion+'(</?tt>)', 'g');
      matchEpresion = text.match(exp);
      if(matchEpresion){
        for (let index = 0; index < matchEpresion.length; index++) {
          const element = matchEpresion[index];
          let newElement = element.replace('<tt>','_~');
          newElement = newElement.replace('</tt>','~_');
          text = text.replace(element, newElement);      
        }
      }

      //Strikethrough
      // exp = new RegExp('(</?del>)([A-Za-z0-9'+signos+']\\s*)+(</?del>)', 'g');
      exp = new RegExp('(</?del>)'+Expresion+'(</?del>)', 'g');
      matchEpresion = text.match(exp);
      if(matchEpresion){
        for (let index = 0; index < matchEpresion.length; index++) {
          const element = matchEpresion[index];
          let newElement = element.replace('<del>','~');
          newElement = newElement.replace('</del>','~');
          text = text.replace(element, newElement);      
        }
      }
    }
    return text;
  }
    getDescription(text){
      if(text){
        
        //italicBold
        // exp = new RegExp('[~](\\w)+[~]', 'g');
        // let exp = new RegExp('[_][*]([A-Za-z0-9'+signos+']\\s*)+[*][_]', 'g');
        let exp = new RegExp('[_][*]'+Expresion+'[*][_]', 'g');
        let matchEpresion = text.match(exp);
        if(matchEpresion){
          for (let index = 0; index < matchEpresion.length; index++) {
            const element = matchEpresion[index];
            let newElement = element.replace('_*','<i><strong>');
            newElement = newElement.replace('*_','</strong></i>');
            text = text.replace(element, newElement);      
          }
        }

        //italic
        // exp = new RegExp('[~](\\w)+[~]', 'g');
        // exp = new RegExp('[_]([A-Za-z0-9'+signos+']\\s*)+[_]', 'g');
        exp = new RegExp('[_]'+Expresion+'[_]', 'g');
        matchEpresion = text.match(exp);
        if(matchEpresion){
          for (let index = 0; index < matchEpresion.length; index++) {
            const element = matchEpresion[index];
            let newElement = element.replace('_','<i>');
            newElement = newElement.replace('_','</i>');
            text = text.replace(element, newElement);      
          }
        }

        //bold
        // let exp = new RegExp('[*](\\w)+[*]', 'g');
        // let exp = new RegExp('[*](\\w)+(\\s*)(\\w)+[*]', 'g');
        // exp = new RegExp('[*]([A-Za-z0-9'+signos+']\\s*)+[*]', 'g');
        exp = new RegExp('[*]'+Expresion+'[*]', 'g');
        matchEpresion = text.match(exp);
        if(matchEpresion){
          for (let index = 0; index < matchEpresion.length; index++) {
            const element = matchEpresion[index];
            let newElement = element.replace('*','<strong>');
            newElement = newElement.replace('*','</strong>');
            text = text.replace(element, newElement);      
          }
        }
        
        
        //monospace
        // exp = new RegExp('[~](\\w)+[~]', 'g');
        // exp = new RegExp('[_][~]([A-Za-z0-9'+signos+']\\s*)+[~][_]', 'g');
        exp = new RegExp('[_][~]'+Expresion+'[~][_]', 'g');
        matchEpresion = text.match(exp);
        if(matchEpresion){
          for (let index = 0; index < matchEpresion.length; index++) {
            const element = matchEpresion[index];
            let newElement = element.replace('_~','<tt>');
            newElement = newElement.replace('~_','</tt>');
            text = text.replace(element, newElement);      
          }
        }

        //Strikethrough
        // exp = new RegExp('[~](\\w)+[~]', 'g');
        // exp = new RegExp('[~]([A-Za-z0-9'+signos+']\\s*)+[~]', 'g');
        exp = new RegExp('[~]'+Expresion+'[~]', 'g');
        matchEpresion = text.match(exp);
        if(matchEpresion){
          for (let index = 0; index < matchEpresion.length; index++) {
            const element = matchEpresion[index];
            let newElement = element.replace('~','<del>');
            newElement = newElement.replace('~','</del>');
            text = text.replace(element, newElement);      
          }
        }
      }
      return text;
    }

  }
