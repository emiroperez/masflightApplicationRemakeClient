import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormControl, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Globals } from '../globals/Globals';
import { RegisterService } from '../services/register.service';
import { ApplicationService } from '../services/application.service';
import { MessageComponent } from '../message/message.component';
import { State } from '../model/State';
import { Country } from '../model/Country';
import { Plan } from '../model/Plan';
import { Customer } from '../model/Customer';

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
  selectedCustomer: Customer;
  countries: Country[];
  states : State[] = [];
  plans: Plan[];
  customers: Customer[] = [];

  statuses: any[] = [
    { value: 0, name: "Active" },
    { value: 1, name: "Inactive" },
    { value: 2, name: "Trial" }
  ];

  customerColumns: string[] = ['name', 'shortName', 'licenseType', 'status', 'endDate', 'numberOfLicenses'];
  customerTable: MatTableDataSource<Customer>;
  customerForm: FormGroup;

  public countryFilterCtrl: FormControl = new FormControl ();
  public stateFilterCtrl: FormControl = new FormControl ();

  public filteredCountries: ReplaySubject<Country[]> = new ReplaySubject<Country[]> (1);
  public filteredStates: ReplaySubject<State[]> = new ReplaySubject<State[]> (1);

  private _onDestroy = new Subject<void> ();

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  @ViewChild('customerNameField')
  customerNameField: ElementRef;

  constructor(public globals: Globals, private registerServices: RegisterService,
    private dialog: MatDialog, private appServices: ApplicationService)
  {
    this.customerForm = new FormGroup ({
      nameValidator: new FormControl ('', [Validators.required]),
      shortNameValidator: new FormControl ('', [Validators.required]),
      customerCodeValidator: new FormControl ('', [Validators.required]),
      contactFullNameValidator: new FormControl ('', [CreateCustomerComponent.contactFullNameFieldValidator(this)]),
      typeValidator: new FormControl ('', [Validators.required]),
      contactEmailValidator: new FormControl ('', [Validators.required, Validators.email]),
      statusValidator: new FormControl ('', [Validators.required]),
      countryValidator: new FormControl ('', [Validators.required]),
      stateValidator: new FormControl ('', [CreateCustomerComponent.stateFieldValidator(this)]),
      cityValidator: new FormControl (''),
      address1Validator: new FormControl ('', [Validators.required]),
      address2Validator: new FormControl (''),
      zipCodeValidator: new FormControl ('', [CreateCustomerComponent.zipCodeFieldValidator(this)]),
      billingTypeValidator: new FormControl ('', [Validators.required]),
      licenseTypeValidator: new FormControl ('', [Validators.required]),
      numberOfLicensesValidator: new FormControl ('', [Validators.required]),
      startDateValidator: new FormControl ('', [Validators.required]),
      endDateValidator: new FormControl ('', [Validators.required]),
      paymentTypeValidator: new FormControl ('', [Validators.required]),
      termsValidator: new FormControl ('', [Validators.required])
    });

    this.customerForm.disable ();
  }

  ngOnInit()
  {
    this.innerHeight = window.innerHeight;
    this.innerWidth = window.innerWidth;

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
  
    this.customerForm.get ('contactEmailValidator').valueChanges.subscribe (value =>
    {
      if (this.selectedCustomer)
        this.selectedCustomer.contactEmail = value;
    });

    this.customerForm.get ('statusValidator').valueChanges.subscribe (value =>
    {
      if (this.selectedCustomer)
        this.selectedCustomer.status = value;
    });

    this.customerForm.get ('countryValidator').valueChanges.subscribe (value =>
    {
      if (this.selectedCustomer)
        this.selectedCustomer.country = value;
    });

    this.customerForm.get ('stateValidator').valueChanges.subscribe (value =>
    {
      if (this.selectedCustomer)
        this.selectedCustomer.state = value;
    });

    this.customerForm.get ('cityValidator').valueChanges.subscribe (value =>
    {
      if (this.selectedCustomer)
        this.selectedCustomer.city = value;
    });

    this.customerForm.get ('address1Validator').valueChanges.subscribe (value =>
    {
      if (this.selectedCustomer)
        this.selectedCustomer.address1 = value;
    });

    this.customerForm.get ('address2Validator').valueChanges.subscribe (value =>
    {
      if (this.selectedCustomer)
        this.selectedCustomer.address2 = value;
    });

    this.customerForm.get ('zipCodeValidator').valueChanges.subscribe (value =>
    {
      if (this.selectedCustomer)
        this.selectedCustomer.zipCode = value;
    });

    this.customerForm.get ('billingTypeValidator').valueChanges.subscribe (value =>
    {
      if (this.selectedCustomer)
        this.selectedCustomer.billingType = value;
    });

    this.customerForm.get ('licenseTypeValidator').valueChanges.subscribe (value =>
    {
      if (this.selectedCustomer)
        this.selectedCustomer.licenseType = value;
    });

    this.customerForm.get ('numberOfLicensesValidator').valueChanges.subscribe (value =>
    {
      if (this.selectedCustomer)
        this.selectedCustomer.numberOfLicenses = value;
    });

    this.customerForm.get ('startDateValidator').valueChanges.subscribe (value =>
    {
      if (this.selectedCustomer)
        this.selectedCustomer.startDate = value;
    });

    this.customerForm.get ('endDateValidator').valueChanges.subscribe (value =>
    {
      if (this.selectedCustomer)
        this.selectedCustomer.endDate = value;
    });

    this.customerForm.get ('paymentTypeValidator').valueChanges.subscribe (value =>
    {
      if (this.selectedCustomer)
        this.selectedCustomer.paymentType = value;
    });

    this.customerForm.get ('termsValidator').valueChanges.subscribe (value =>
    {
      if (this.selectedCustomer)
        this.selectedCustomer.terms = value;
    });
  }

  getTableHeight(): string
  {
    return "calc(" + this.innerHeight + "px - 21.9em)";
  }

  getEditorHeight(): string
  {
    return "calc(" + this.innerHeight + "px - 19.55em)";
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

    return month + "-" + day + "-" + d.getFullYear ();
  }

  applyFilter(filterValue: string)
  {
    this.customerTable.filter = filterValue.trim ().toLowerCase ();
  }

  checkSelectedCustomer(): boolean
  {
    if (!this.selectedCustomer)
      return true;

    // validate customer form before continuing
    Object.keys (this.customerForm.controls).forEach (field =>
    {
      this.customerForm.get (field).markAsTouched ({ onlySelf: true });
    });

    if (this.customerForm.invalid)
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

    // enable the form except the state validator
    this.customerForm.enable ();
    this.customerForm.get ('stateValidator').disable ();

    this.customers.push (new Customer ());
    this.customerTable._updateChangeSubscription ();
    this.selectedCustomer = this.customers[this.customers.length - 1];
    this.selectedCustomer.highlight = true;

    this.customerForm.reset ();
    this.customerNameField.nativeElement.focus ();

    // go to the last page after adding a new customer
    setTimeout (() => {
      this.paginator.lastPage ();
    }, 10);
  }

  saveCustomers(): void
  {
    if (!this.checkSelectedCustomer ())
      return;

    this.globals.isLoading = true;
    this.appServices.saveCustomers (this, this.customers, this.saveSuccess, this.saveError);
  }

  selectCustomer(row): void
  {
    if (!this.checkSelectedCustomer ())
      return;

    // enable the customer form except the state validator
    this.customerForm.enable ();

    this.selectedCustomer = row;
    this.selectedCustomer.highlight = true;

    this.customerForm.get ('nameValidator').setValue (this.selectedCustomer.name);
    this.customerForm.get ('shortNameValidator').setValue (this.selectedCustomer.shortName);
    this.customerForm.get ('customerCodeValidator').setValue (this.selectedCustomer.customerCode);
    this.customerForm.get ('typeValidator').setValue (this.selectedCustomer.type);
    this.customerForm.get ('contactFullNameValidator').setValue (this.selectedCustomer.contactFullName);
    this.customerForm.get ('contactEmailValidator').setValue (this.selectedCustomer.contactEmail);
    this.customerForm.get ('statusValidator').setValue (this.selectedCustomer.status);
    this.customerForm.get ('cityValidator').setValue (this.selectedCustomer.city);
    this.customerForm.get ('address1Validator').setValue (this.selectedCustomer.address1);
    this.customerForm.get ('address2Validator').setValue (this.selectedCustomer.address2);
    this.customerForm.get ('zipCodeValidator').setValue (this.selectedCustomer.zipCode);
    this.customerForm.get ('billingTypeValidator').setValue (this.selectedCustomer.billingType);
    this.customerForm.get ('numberOfLicensesValidator').setValue (this.selectedCustomer.numberOfLicenses);
    this.customerForm.get ('startDateValidator').setValue (new Date (this.selectedCustomer.startDate));
    this.customerForm.get ('endDateValidator').setValue (new Date (this.selectedCustomer.endDate));
    this.customerForm.get ('termsValidator').setValue (this.selectedCustomer.terms);

    for (let country of this.countries)
    {
      if (this.selectedCustomer.country.id == country.id)
      {
        this.customerForm.get ('countryValidator').setValue (country);
        this.countryChangeEvent ({ value: country }, false);
        break;
      }
    }

    if (this.states.length)
    {
      for (let state of this.states)
      {
        if (this.selectedCustomer.state.id == state.id)
        {
          this.customerForm.get ('stateValidator').setValue (state);
          break;
        }
      }
    }

    for (let plan of this.plans)
    {
      if (this.selectedCustomer.licenseType.id == plan.id)
      {
        this.customerForm.get ('licenseTypeValidator').setValue (plan);
        break;
      }
    }

    this.customerForm.get ('paymentTypeValidator').setValue (this.selectedCustomer.paymentType);
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
    _this.appServices.getCustomers (_this, _this.setCustomers, _this.errorCustomers);
  }

  errorPlans(_this)
  {
    _this.appServices.getCustomers (_this, _this.setCustomers, _this.errorCustomers);
  }

  setCustomers(_this, data)
  {
    _this.customers = data;
    _this.customerTable = new MatTableDataSource (_this.customers);
    _this.customerTable.paginator = _this.paginator;
    _this.globals.isLoading = false;
  }

  errorCustomers(_this)
  {
    _this.globals.isLoading = false;
  }

  saveSuccess(_this)
  {
    _this.globals.isLoading = false;
  }

  saveError(_this, error)
  {
    _this.globals.consoleLog (error);

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Unable to save the customers." }
    });

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

  countryChangeEvent(event, resetStateValidator)
  {
    let opts = { onlySelf: false, emitEvent: false };

    if (event != undefined)
    {
      this.states = event.value.states;
      this.stateSearchChange ();

      if (this.states.length)
        this.customerForm.get ('stateValidator').enable (opts);
      else
        this.customerForm.get ('stateValidator').disable (opts);
    }
    else
    {
      this.states = [];
      this.filteredStates.next ([]);
      this.customerForm.get ('stateValidator').disable (opts);
    }

    if (resetStateValidator)
      this.customerForm.get ('stateValidator').reset ();
    this.customerForm.get ('zipCodeValidator').updateValueAndValidity ();
  }

  static contactFullNameFieldValidator(obj: CreateCustomerComponent): ValidatorFn
  {
    return (control: AbstractControl): ValidationErrors =>
    {
      if (obj.selectedCustomer)
      {
        if (!obj.customerForm.get ('contactFullNameValidator').value || !obj.customerForm.get ('contactFullNameValidator').value.length)
          return { required: true, shortValue: false };

        if (obj.customerForm.get ('contactFullNameValidator').value.length < 4)
          return { shortValue: true, required: false };
      }

      return null;
    };
  }

  static stateFieldValidator(obj: CreateCustomerComponent): ValidatorFn
  {
    return (control: AbstractControl): ValidationErrors =>
    {
      if (obj.selectedCustomer)
      {
        if (obj.states.length)
        {
          if (!obj.customerForm.get ('stateValidator').value)
            return { required: true };
        }
      }

      return null;
    };
  }

  static zipCodeFieldValidator(obj: CreateCustomerComponent): ValidatorFn
  {
    return (control: AbstractControl): ValidationErrors =>
    {
      if (obj.selectedCustomer)
      {
        if (obj.selectedCustomer.country && obj.selectedCustomer.country.zipCodeRequired)
        {
          if (!obj.customerForm.get ('zipCodeValidator').value)
            return { required: true, shortValue: false };

          if (obj.customerForm.get ('zipCodeValidator').value.toString ().length < 5)
            return { shortValue: true, required: false };
        }
      }

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

  getContactEmailErrorMessage(): string
  {
    if (this.customerForm.get ('contactEmailValidator').hasError ('email'))
      return 'Bad contact e-mail format';

    return this.customerForm.get ('contactEmailValidator').hasError ('required') ? 'You must enter the contact e-mail' : '';
  }

  getStatusErrorMessage(): string
  {
    return this.customerForm.get ('statusValidator').hasError ('required') ? 'You must select the license status' : '';
  }

  getCountryErrorMessage(): string
  {
    return this.customerForm.get ('countryValidator').hasError ('required') ? 'You must select a country' : '';
  }

  getStateErrorMessage(): string
  {
    return this.customerForm.get ('stateValidator').hasError ('required') ? 'You must select a state' : '';
  }

  getAddress1ErrorMessage(): string
  {
    return this.customerForm.get ('address1Validator').hasError ('required') ? 'You must enter an address' : '';
  }

  getZipCodeErrorMessage(): string
  {
    if (this.customerForm.get ('zipCodeValidator').hasError ('shortValue'))
      return 'The zip code must have at least 5 digits number';

    return this.customerForm.get ('zipCodeValidator').hasError ('required') ? 'You must enter a zip code' : '';
  }

  getBillingTypeErrorMessage(): string
  {
    return this.customerForm.get ('billingTypeValidator').hasError ('required') ? 'You must enter a billing type' : '';
  }

  getLicenseTypeErrorMessage(): string
  {
    return this.customerForm.get ('licenseTypeValidator').hasError ('required') ? 'You must select a license type' : '';
  }

  getNumberOfLicensesErrorMessage(): string
  {
    return this.customerForm.get ('numberOfLicensesValidator').hasError ('required') ? 'You must enter the number of licenses' : '';
  }

  getStartDateErrorMessage(): string
  {
    return this.customerForm.get ('startDateValidator').hasError ('required') ? 'You must specify the start date' : '';
  }

  getEndDateErrorMessage(): string
  {
    return this.customerForm.get ('endDateValidator').hasError ('required') ? 'You must specify the end date' : '';
  }

  getPaymentTypeErrorMessage(): string
  {
    return this.customerForm.get ('paymentTypeValidator').hasError ('required') ? 'You must select the payment type' : '';
  }

  getTermsErrorMessage(): string
  {
    return this.customerForm.get ('termsValidator').hasError ('required') ? 'You must enter the terms' : '';
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
