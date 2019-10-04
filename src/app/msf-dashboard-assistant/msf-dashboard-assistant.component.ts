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

@Component({
  selector: 'app-msf-dashboard-assistant',
  templateUrl: './msf-dashboard-assistant.component.html'
})
export class MsfDashboardAssistantComponent {
  utils: Utils;
  isLoading: boolean;

  currentOption: any;
  currentOptionCategories: any[];

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
    // set table preview to true if the index changed
    this.tablePreview = true;
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
    this.tablePreview = true;
  }

  goToEditor(): void
  {
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
