import { Component, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MatStepper, MAT_DIALOG_DATA, MatTabGroup } from '@angular/material';

import { ApplicationService } from '../services/application.service';
import { CategoryArguments } from '../model/CategoryArguments';
import { MsfTableComponent } from '../msf-table/msf-table.component';
import { AuthService } from '../services/auth.service';
import { Arguments } from '../model/Arguments';
import { Utils } from '../commons/utils';
import { Globals } from '../globals/Globals';
import { ComponentType } from '../commons/ComponentType';
import { ChartFlags } from '../msf-dashboard-panel/msf-dashboard-chartflags';

@Component({
  selector: 'app-msf-dashboard-assistant',
  templateUrl: './msf-dashboard-assistant.component.html'
})
export class MsfDashboardAssistantComponent {
  utils: Utils;
  isLoading: boolean;

  chartTypes: any[] = [
    { name: 'Bars', flags: ChartFlags.XYCHART, image: 'vert-bar-chart.png' }, //: this.createVertColumnSeries },
    { name: 'Horizontal Bars', flags: ChartFlags.XYCHART | ChartFlags.ROTATED, image: 'horiz-bar-chart.png' }, //: this.createHorizColumnSeries },
    { name: 'Simple Bars', flags: ChartFlags.NONE, image: 'simple-vert-bar-chart.png' }, //: this.createSimpleVertColumnSeries },
    { name: 'Simple Horizontal Bars', flags: ChartFlags.ROTATED, image: 'simple-horiz-bar-chart.png' }, //: this.createSimpleHorizColumnSeries },
    { name: 'Stacked Bars', flags: ChartFlags.XYCHART | ChartFlags.STACKED, image: 'stacked-vert-column-chart.png' }, //: this.createVertColumnSeries },
    { name: 'Horizontal Stacked Bars', flags: ChartFlags.XYCHART | ChartFlags.ROTATED | ChartFlags.STACKED, image: 'stacked-horiz-column-chart.png' }, //: this.createHorizColumnSeries },
    { name: 'Funnel', flags: ChartFlags.FUNNELCHART, image: 'funnel-chart.png' }, //: this.createFunnelSeries },
    { name: 'Lines', flags: ChartFlags.XYCHART | ChartFlags.LINECHART, image: 'line-chart.png' }, //: this.createLineSeries },                      
    { name: 'Area', flags: ChartFlags.XYCHART | ChartFlags.AREACHART, image: 'area-chart.png' }, //: this.createLineSeries },
    { name: 'Stacked Area', flags: ChartFlags.XYCHART | ChartFlags.STACKED | ChartFlags.AREACHART, image: 'stacked-area-chart.png' }, //: this.createLineSeries },
    { name: 'Pie', flags: ChartFlags.PIECHART, image: 'pie-chart.png' }, //: this.createPieSeries },
    { name: 'Donut', flags: ChartFlags.DONUTCHART, image: 'donut-chart.png' } //: this.createPieSeries },
  ];

  currentOption: any;
  currentOptionCategories: any[];
  tempOptionCategories: any[];

  actualPageNumber: number;
  moreResults: boolean = false;
  moreResultsBtn: boolean = false;
  displayedColumns;

  tablePreview: boolean = true;

  @ViewChild('msfTableRef')
  msfTableRef: MsfTableComponent;

  @ViewChild("tabs")
  tabs: MatTabGroup;

  constructor(public dialogRef: MatDialogRef<MsfDashboardAssistantComponent>,
    public globals: Globals,
    private service: ApplicationService,
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.utils = new Utils ();

    this.isLoading = true;
    this.currentOption = data.currentOption;
    this.currentOptionCategories = data.currentOptionCategories;

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
      return;
    }

    this.tablePreview = true;
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

  /*
  moreTableResults()
  {
    if (this.moreResultsBtn)
    {
      this.moreResults = false;
      this.isLoading = true;

      setTimeout (() => {
        this.loadTableData (true, this.msfTableRef.handlerSuccess, this.msfTableRef.handlerError);
      }, 3000);
    }
  }
  */
}
