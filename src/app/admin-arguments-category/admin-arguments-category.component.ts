import { Component, OnInit, Renderer2, HostListener, ViewChild } from '@angular/core';
import { Globals } from '../globals/Globals';
import { ApiClient } from '../api/api-client';
import { ApplicationService } from '../services/application.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MessageComponent } from '../message/message.component';
import { ReplaySubject, Subject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { MaterialIconPickerComponent } from '../material-icon-picker/material-icon-picker.component';

@Component({
  selector: 'app-admin-arguments-category, FilterPipeArg',
  templateUrl: './admin-arguments-category.component.html'
})
export class AdminArgumentsCategoryComponent implements OnInit {

  typeFilterCtrl: FormControl = new FormControl ();
  filteredTypes: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  private _onDestroy = new Subject<void> ();

  innerHeight: number;
  category: any = {label: '', icon: '', description: '', isSelected: false};
  categories: any[] = [];
  optionSelected: any;
  idDomOptionSelected: any;
  categoryDelete: any[] = [];
  argumentDelete: any[] = [];
  dataToSend: any[] = [];
  searchText: string;

  @ViewChild("materialIconPicker")
  materialIconPicker: MaterialIconPickerComponent;

  argTypes: any[] = [
    { value: "airline", name: "Airline(s)" },
    { value: "timeRange", name: "Time Range" },
    { value: "dateRange", name: "Date Range" },
    { value: "aircraftType", name: "Aircraft(s)" },
    { value: "airport", name: "Airport(s)" },
    { value: "grouping", name: "Grouping" },
    { value: "rounding", name: "Rounding" },
    { value: "windDirection", name: "Wind direction" },
    { value: "ceiling", name: "Ceiling" },
    { value: "windSpeed", name: "Wind Speed" },
    { value: "temperature", name: "Temperature" },
    { value: "freeTextInput", name: "Free text input" },
    { value: "selectBoxSingleOption", name: "Select box single option" },
    { value: "selectBoxMultipleOption", name: "Select box multiple option" },
    { value: "checkBox", name: "Check box" },
    { value: "cancelsCheckBox", name: "Cancels check boxes" },
    { value: "diversionsCheckbox", name: "Diversions check boxes" },
    { value: "flightDelaysCheckbox", name: "Flight Delays check box" },
    { value: "causesFlightDelaysCheckbox", name: "Causes Of Flight Delays check boxes" },
    { value: "taxiTimes", name: "Taxi times" },
    { value: "taxiTimesCheckbox", name: "Taxi times checkbox" },
    { value: "taxiTimesCheckboxes", name: "Taxi times checkboxes" },
    { value: "region", name: "Region" },
    { value: "sortingCheckboxes", name: "Sorting checkboxes" },
    { value: "groupingAthena", name: "New Grouping" },
    { value: "flightDistance", name: "Flight Distance" },
    { value: "fareTypes", name: "Fare Types" },
    { value: "summary", name: "Summary" },
    { value: "serviceClasses", name: "Service Classes" },
    { value: "resultsLess", name: "Group Results Less Than" },
    { value: "geography", name: "Geography" },
    { value: "excludeItineraries", name: "Itineraries" },
    { value: "excludeFollowing", name: "Exclude The Following Fares" },
    { value: "singleCheckbox", name: "Single checkbox" },
    { value: "filterAirlineType", name: "Filter Airline Type" },
    { value: "fareIncrements", name: "Fare Increments" },
    { value: "fareIncrementMiddle", name: "Fare Increments Middle" },
    { value: "fareIncrementMax", name: "Fare Increments Max" },
    { value: "title", name: "Title" },
    { value: "airportsRoutes", name: "Airports Routes" },
    { value: "fareLower", name: "Exclude Fares lower than" },
    { value: "percentIncrement", name: "Percent Increment" },
    { value: "groupingDailyStatics", name: "Grouping Daily Statics" },
    { value: "quarterHour", name: "Quarter Hour" },
    { value: "functions", name: "Functions" },
    { value: "groupingOperationsSummary", name: "Grouping Operatins Summary" },
    { value: "groupingHubSummaries", name: "Grouping Hub Summaries" },
    { value: "regionSchedule", name: "Region Schedule" },
    { value: "aircraftTypeCheckboxes", name: "Aircraft Type Checkboxes" },
    { value: "seats", name: "Seats" },
    { value: "sortingNostop", name: "Sorting Nostop" },
    { value: "connectionTime", name: "Connection Time" },
    { value: "stops", name: "Stops" },
    { value: "circuityType", name: "Circuity Type" },
    { value: "circuity", name: "Circuity" },
    { value: "summaryRevenueBuilds", name: "Summary Revenue Builds" },
    { value: "fareIncrementsMarketHistograms", name: "Fare Increments Market Histograms" },
    { value: "topNumber", name: "Top Number" },
    { value: "seatClass", name: "Seat Class" },
    { value: "groupingMariaDB", name: "Grouping (MariaDB)" },
    { value: "contentType", name: "Content Type" },
    { value: "totalType", name: "Total Type" },
    { value: "groupingCompGenre",  name: "Grouping Compare Genre" },
    { value: "groupingCompTotal",  name: "Grouping Compare Total" },
    { value: "groupingOpSum", name: "Grouping Sum Operation" },
    { value: "groupingOpSum2", name: "Grouping Sum Operation 2" },
    { value: "states", name: "States" },
    { value: "flightSegments", name: "Flight Segments" },
    { value: "AAA_Group", name: "AAA Group" }
  ];

  constructor(private http: ApiClient,  
    public dialog: MatDialog, public globals: Globals, private service: ApplicationService)
  {
    this.filteredTypes.next (this.argTypes.slice ());
    this.searchChange ();
  }

  ngOnInit() {
    this.innerHeight = window.innerHeight;

    this.getCategoryArguments();

  }

  ngOnDestroy()
  {
    this._onDestroy.next ();
    this._onDestroy.complete ();
  }

  private filterTypes(): void
  {
    // get the search keyword
    let search = this.typeFilterCtrl.value;
    if (!search)
    {
      this.filteredTypes.next (this.argTypes.slice ());
      return;
    }

    search = search.toLowerCase ();
    this.filteredTypes.next (
      this.argTypes.filter (a => a.name.toLowerCase ().indexOf (search) > -1)
    );
  }

  searchChange(): void
  {
    // listen for search field value changes
    this.typeFilterCtrl.valueChanges
      .pipe (takeUntil (this._onDestroy))
      .subscribe (() => {
        this.filterTypes ();
      });
  }

  getCategoryArguments() {
    this.globals.isLoading = true;
    this.service.loadCategoryArguments(this, this.handlerSuccessCategoryArguments, this.handlerErrorCategoryArguments);
  }
  handlerSuccessCategoryArguments(_this, result) {
    _this.categories = result;
    _this.globals.isLoading = false;
  }

  handlerErrorCategoryArguments(_this, result) {
    _this.globals.isLoading = false;
  }
  
sendData() {
  this.dataToSend = this.categories.concat(this.categoryDelete);
  this.service.saveNewCategoryArguments(this, this.dataToSend, this.handlerSuccess, this.handlerError);
}

handlerSuccess(_this, result){

  if (_this.categories.length != result.length)
  {
    _this.dialog.open (MessageComponent, {
      data: { title: "Information", message: "Some arguments category/ies were not deleted because some options are using it."}
    });
  }

  _this.category = { label: '', icon: '', description: '', isSelected: false };
  _this.categories = result;
  _this.globals.isLoading = false;
}

handlerError(_this,result){
  _this.globals.isLoading = false;
  _this.dialog.open(MessageComponent, {
    data: { title:"Error", message: "It was an error, try again."}
  });
}

  getSelectedOption(option) {
    if (this.category !== option) {
      option.isSelected = !option.isSelected;
      this.category.isSelected = !this.category.isSelected;
      option.focus = true;
      this.category = option;
    } else {
      option.isSelected = !option.isSelected;
      option.focus = false;
      this.category = {};
    }
}

addCategory() {
  const cat = {
    label: '',
    icon: '',
    description: '',
    arguments: [],
  }
  this.categories.unshift(cat);
  this.getSelectedOption(this.categories[0]);
}

deleteCategory() {
  this.category.toDelete = true;
  this.categoryDelete.push(this.category);
  const index: number = this.categories.findIndex(d => d === this.category);
  this.categories.splice(index, 1);
  this.category = { label: '', icon: '', description: '', isSelected: false };
}

addArgument() {
  const arg = {
    description: '',
    type: ''
  };
  this.category.arguments.unshift(arg);
}

deleteArgument(argument) {
  argument.toDelete = true;
}

  @HostListener('window:resize', ['$event'])
  checkScreen(event): void
  {
    this.innerHeight = event.target.innerHeight;

    // if(!this.mobileQuery.matches)
    // {
    if (event.target.innerHeight == window.screen.height && event.target.innerWidth == window.screen.width)
      this.globals.isFullscreen = true;
    else
      this.globals.isFullscreen = false;
    // }
    // else{
    //   this.globals.isFullscreen = false;
    // }
  }

  getInnerHeight(): number
  {
    return this.innerHeight;
  }

  setChangeIcon(icon): void
  {
    this.category.icon = icon;
  }

  hideIconPicker(): void
  {
    if (this.materialIconPicker)
      this.materialIconPicker.disableIconPicker ();
  }

  isMatIcon(icon): boolean
  {
    return !icon.endsWith (".png");
  }

  getImageIcon(url): string
  {
    let newurl, filename: string;
    let path: string[];

    path = url.split ('/');
    filename = path.pop ().split ('?')[0];
    newurl = "";

    // recreate the url with the theme selected
    for (let dir of path)
      newurl += dir + "/";

    newurl += this.globals.theme + "-" + filename;
    return newurl;
  }
}
