import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormControl, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Globals } from '../globals/Globals';
import { RegisterService } from '../services/register.service';
import { MessageComponent } from '../message/message.component';
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
  customerForm: FormGroup;

  public countryFilterCtrl: FormControl = new FormControl ();
  public stateFilterCtrl: FormControl = new FormControl ();

  public filteredCountries: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  public filteredStates: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);

  private _onDestroy = new Subject<void> ();

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  constructor(public globals: Globals, private registerServices: RegisterService, private dialog: MatDialog)
  {
    this.customerForm = new FormGroup ({
      nameValidator: new FormControl ('', [Validators.required]),
      shortNameValidator: new FormControl ('', [Validators.required]),
      customerCodeValidator: new FormControl ('', [Validators.required]),
      contactFullNameValidator: new FormControl ('', [Validators.required, CreateCustomerComponent.contactFullNameFieldValidator(this)]),
      typeValidator: new FormControl ('', [Validators.required])
/*      contactEmailValidator:
      statusValidator:
      countryValidator:
      stateValidator:
      cityValidator:
      address1Validator:
      licenseTypeValidator:
      numberOfLicensesValidator:
      startDateValidator:
      endDateValidator:
      paymentTypeValidator:
      termsValidator:*/
    });

    this.selectedCustomer = {
      "invalid": true
    };
  }

  ngOnInit()
  {
    this.innerHeight = window.innerHeight;
    this.innerWidth = window.innerWidth;
    this.customerTable.paginator = this.paginator;

    this.globals.isLoading = true;
    this.registerServices.getCountries (this, this.setCountries, this.errorCountries);

    this.onChanges ();
  }

  ngOnDestroy()
  {
    this._onDestroy.next ();
    this._onDestroy.complete ();
  }

  onChanges(): void
  {
    this.customerForm.get ('nameValidator').valueChanges.subscribe (value =>
    {
      if (this.selectedCustomer)
        this.selectedCustomer.name = value;
    });

    this.customerForm.get ('shortNameValidator').valueChanges.subscribe (value =>
    {
      if (this.selectedCustomer)
        this.selectedCustomer.shortName = value;
    });

    this.customerForm.get ('customerCodeValidator').valueChanges.subscribe (value =>
    {
      if (this.selectedCustomer)
        this.selectedCustomer.customerCode = value;
    });

    this.customerForm.get ('typeValidator').valueChanges.subscribe (value =>
    {
      if (this.selectedCustomer)
        this.selectedCustomer.type = value;
    });

    this.customerForm.get ('contactFullNameValidator').valueChanges.subscribe (value =>
    {
      if (this.selectedCustomer)
        this.selectedCustomer.contactFullName = value;
    });
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

  checkSelectedCustomer(): boolean
  {
    let error: boolean = false;

    if (!this.selectedCustomer || this.selectedCustomer.invalid)
      return true;

    // validate customer form before continuing
    Object.keys (this.customerForm.controls).forEach (field =>
    {
      this.customerForm.get (field).markAsTouched ({ onlySelf: true });
    });

    if (this.customerForm.get ('nameValidator').hasError ('required')
      || this.customerForm.get ('shortNameValidator').hasError ('required')
      || this.customerForm.get ('customerCodeValidator').hasError ('required')
      || this.customerForm.get ('typeValidator').hasError ('required')
      || this.customerForm.get ('contactFullNameValidator').hasError ('required'))
      error = true;

    if (error)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "One or more form values are not valid, please correct them before continuing." }
      });

      return false;
    }

    this.selectedCustomer.highlight = false;
    return true;
  }

  createCustomer(): void
  {
    if (!this.checkSelectedCustomer ())
      return;

    this.customers.push ({});
    this.customerTable._updateChangeSubscription ();
    this.selectedCustomer = this.customers[this.customers.length - 1];
    this.selectedCustomer.highlight = true;

    this.customerForm.get ('nameValidator').reset ();
    this.customerForm.get ('shortNameValidator').reset ();
    this.customerForm.get ('customerCodeValidator').reset ();
    this.customerForm.get ('typeValidator').reset ();
    this.customerForm.get ('contactFullNameValidator').reset ();

    // go to the last page after adding a new customer
    setTimeout (() => {
      this.paginator.lastPage ();
    }, 10);
  }

  saveCustomers(): void
  {
    if (!this.checkSelectedCustomer ())
      return;
  }

  selectCustomer(row): void
  {
    if (!this.checkSelectedCustomer ())
      return;

    this.selectedCustomer = row;
    this.selectedCustomer.highlight = true;

    this.customerForm.get ('nameValidator').setValue (this.selectedCustomer.name);
    this.customerForm.get ('shortNameValidator').setValue (this.selectedCustomer.shortName);
    this.customerForm.get ('customerCodeValidator').setValue (this.selectedCustomer.customerCode);
    this.customerForm.get ('typeValidator').setValue (this.selectedCustomer.type);
    this.customerForm.get ('contactFullNameValidator').setValue (this.selectedCustomer.contactFullName);
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

  static contactFullNameFieldValidator(obj: CreateCustomerComponent): ValidatorFn
  {
    return (control: AbstractControl): ValidationErrors =>
    {
      if (obj.selectedCustomer)
      {
        if (!obj.customerForm.get ('contactFullNameValidator').value || !obj.customerForm.get ('contactFullNameValidator').value.length)
          return { required: true, shortValue: false };

        return obj.customerForm.get ('contactFullNameValidator').value.length < 4 ? { shortValue: true, required: false } : null;
      }
      else
        return null;
    };
  }

  getNameErrorMessage(): string
  {
    return this.customerForm.get ('nameValidator').hasError ('required') ? 'You must enter the name' : '';
  }

  getShortNameErrorMessage(): string
  {
    return this.customerForm.get ('shortNameValidator').hasError ('required') ? 'You must enter the short name' : '';
  }

  getCustomerCodeErrorMessage(): string
  {
    return this.customerForm.get ('customerCodeValidator').hasError ('required') ? 'You must enter the customer code' : '';
  }

  getTypeErrorMessage(): string
  {
    return this.customerForm.get ('typeValidator').hasError ('required') ? 'You must select the customer type' : '';
  }

  getContactFullNameErrorMessage(): string
  {
    if (this.customerForm.get ('contactFullNameValidator').hasError ('shortValue'))
      return 'The contact full name is too short';

    return this.customerForm.get ('contactFullNameValidator').hasError ('required') ? 'You must enter the contact name' : '';
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
