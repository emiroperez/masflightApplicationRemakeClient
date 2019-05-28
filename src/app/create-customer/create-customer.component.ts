import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Globals } from '../globals/Globals';
import { RegisterService } from '../services/register.service';
import { State } from '../model/State';
import { Country } from '../model/Country';
import { Plan } from '../model/Plan';

export const US_DATE_FORMAT = {
  parse: {
    dateInput: 'MM-DD-YYYY',
  },
  display: {
    dateInput: 'MM-DD-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-create-customer',
  templateUrl: './create-customer.component.html',
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    { provide: MAT_DATE_FORMATS, useValue: US_DATE_FORMAT },
  ]
})
export class CreateCustomerComponent implements OnInit {
  innerHeight: number;
  innerWidth: number;
  selectedCustomer: any;
  countries: Country[];
  states : State[];
  plans: Plan[];
  customers: any[] = [];

  statuses: any[] = [
    { value: 0, name: "Active" },
    { value: 1, name: "Inactive" },
    { value: 2, name: "Trial" }
  ];

  customerColumns: string[] = ['name', 'shortName', 'licenseType', 'status', 'endDate', 'numberOfLicenses'];
  customerTable: MatTableDataSource<any> = new MatTableDataSource (this.customers);

  public countryFilterCtrl: FormControl = new FormControl ();
  public stateFilterCtrl: FormControl = new FormControl ();

  public filteredCountries: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  public filteredStates: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);

  private _onDestroy = new Subject<void> ();

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  constructor(public globals: Globals, private registerServices: RegisterService)
  {
    this.selectedCustomer = {};
  }

  ngOnInit()
  {
    this.innerHeight = window.innerHeight;
    this.innerWidth = window.innerWidth;
    this.customerTable.paginator = this.paginator;

    this.globals.isLoading = true;
    this.registerServices.getCountries (this, this.setCountries, this.errorCountries);
  }

  ngOnDestroy()
  {
    this._onDestroy.next ();
    this._onDestroy.complete ();
  }

  getTableHeight(): string
  {
    return "calc(" + this.innerHeight + "px - 263px)";
  }

  getEditorHeight(): string
  {
    return "calc(" + this.innerHeight + "px - 235px)";
  }

  getPlanName(licenseType): string
  {
    if (licenseType == null)
      return "";

    return licenseType.name;
  }

  getStatusName(status): string
  {
    if (status == null)
      return "";

    return this.statuses[status].name;
  }

  parseDate(date): string
  {
    let day, month;
    let d: Date;

    if (date == null)
      return "";

    d = new Date (date);
    if (Object.prototype.toString.call (d) !== '[object Date]')
      return;

    month = (d.getMonth () + 1);
    if (month < 10)
      month = "0" + month;

    day = d.getDate ();
    if (day < 10)
      day = "0" + day;

    return month + "-" + day + "-" + d.getFullYear ();
  }

  applyFilter(filterValue: string)
  {
    this.customerTable.filter = filterValue.trim ().toLowerCase ();
  }

  createCustomer(): void
  {
    if (this.selectedCustomer)
      this.selectedCustomer.highlight = false;

    this.customers.push ({});
    this.customerTable._updateChangeSubscription ();
    this.selectedCustomer = this.customers[this.customers.length - 1];
    this.selectedCustomer.highlight = true;

    // go to the last page after adding a new customer
    setTimeout (() => {
      this.paginator.lastPage ();
    }, 10);
  }

  saveCustomers(): void
  {

  }

  selectCustomer(row): void
  {
    if (this.selectedCustomer)
      this.selectedCustomer.highlight = false;

    this.selectedCustomer = row;
    this.selectedCustomer.highlight = true;
  }

  setCountries(_this, data)
  {
    _this.countries = data;
    _this.countriesSearchChange ();
    _this.registerServices.getPlans (_this, _this.setPlans, _this.errorPlans);
  }

  errorCountries(_this)
  {
    _this.registerServices.getPlans (_this, _this.setPlans, _this.errorPlans);
  }

  setPlans(_this, data)
  {
    _this.plans = data;
    _this.globals.isLoading = false;
  }

  errorPlans(_this)
  {
    _this.globals.isLoading = false;
  }

  filterCountries(): void
  {
    if (!this.countries)
      return;

    // get the search keyword
    let search = this.countryFilterCtrl.value;
    if (!search)
    {
      this.filteredCountries.next (this.countries.slice ());
      return;
    }

    search = search.toLowerCase ();
    this.filteredCountries.next (
      this.countries.filter (a => a.fullName.toLowerCase ().indexOf (search) > -1)
    );
  }

  countriesSearchChange(): void
  {
    // load the initial country list
    this.filteredCountries.next (this.countries.slice ());
    // listen for search field value changes
    this.countryFilterCtrl.valueChanges
      .pipe (takeUntil (this._onDestroy))
      .subscribe (() => {
        this.filterCountries ();
      });
  }

  filterStates(): void
  {
    if (!this.states)
      return;

    // get the search keyword
    let search = this.stateFilterCtrl.value;
    if (!search)
    {
      this.filteredStates.next (this.states.slice ());
      return;
    }

    search = search.toLowerCase ();
    this.filteredStates.next (
      this.states.filter (a => a.fullName.toLowerCase ().indexOf (search) > -1)
    );
  }

  stateSearchChange(): void
  {
    // load the initial state list
    this.filteredStates.next (this.states.slice ());
    // listen for search field value changes
    this.stateFilterCtrl.valueChanges
      .pipe (takeUntil (this._onDestroy))
      .subscribe (() => {
        this.filterStates ();
      });
  }

  countryChangeEvent(event)
  {
    if (event != undefined)
    {
      this.states = event.states;
      this.stateSearchChange ();

      if (this.selectedCustomer && !event.states.length)
        this.selectedCustomer.state = null;
    }
    else
    {
      this.states = [];
      this.filteredStates.next ([]);
    }
  }

  @HostListener('window:resize', ['$event'])
  checkScreen(event): void
  {
    this.innerHeight = event.target.innerHeight;
    this.innerWidth = event.target.innerWidth;

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

  getInnerWidth(): number
  {
    return this.innerWidth;
  }
}
