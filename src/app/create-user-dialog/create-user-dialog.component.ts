import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';

import { User } from '../model/User';
import { Payment } from '../model/Payment';
import { Country } from '../model/Country';
import { State } from '../model/State';
import { RegisterService } from '../services/register.service';
import { UserService } from '../services/user.service';
import { Customer } from '../model/Customer';
import { Globals } from '../globals/Globals';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-create-user-dialog',
  templateUrl: './create-user-dialog.component.html'
})
export class CreateUserDialogComponent
{
  personalInformationForm = new FormGroup ({
    nameValidator:new FormControl('', [Validators.required]),
    lastNameValidator : new FormControl(''),
    passwordValidator : new FormControl('', [Validators.required]),
    repeatPasswordValidator : new FormControl('', [Validators.required, CreateUserDialogComponent.passwordMatchValidator (this)]),
    emailValidator : new FormControl('', [Validators.required, Validators.email]),
    addressValidator : new FormControl(''),
    countryValidator : new FormControl('', [Validators.required]),
    stateValidator : new FormControl(null, [CreateUserDialogComponent.stateValidator (this)]),
    postalCodeValidator : new FormControl(''),
    phoneNumberValidator : new FormControl(''),
    customerValidator : new FormControl('', [Validators.required])
  });

  countryFilterCtrl: FormControl = new FormControl ();
  stateFilterCtrl: FormControl = new FormControl ();
  customerFilterCtrl: FormControl = new FormControl ();

  filteredCountries: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  filteredStates: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  filteredCustomers: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);

  _onDestroy = new Subject<void> ();

  isLoading: boolean = false;

  countries: Country[];
  states : State[];
  selectedCountries: Country[];
  selectedStates: State[];
  customers: Customer[];
  user: User;

  constructor(public dialogRef: MatDialogRef<CreateUserDialogComponent>,
    private userServices: UserService,
    private registerServices: RegisterService,
    private dialog: MatDialog,
    public globals: Globals,
    @Inject(MAT_DIALOG_DATA) public data)
  {
    this.user = new User (new Payment ());
    this.countries = new Array ();
    this.states = new Array ();
    this.isLoading = true;
    this.customers = data.customers;
    this.registerServices.getCountries (this, this.renderCountries, this.errorCountries);
  }

  ngOnDestroy(): void
  {
    this._onDestroy.next ();
    this._onDestroy.complete ();
  }

  close(): void
  {
    this.dialogRef.close ();
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
    // load the initial option list
    this.filteredCountries.next (this.countries.slice ());
    // listen for search field value changes
    this.countryFilterCtrl.valueChanges
      .pipe (takeUntil (this._onDestroy))
      .subscribe (() => {
        this.filterCountries ();
      });
  }

  filterCustomers(): void
  {
    if (!this.customers)
      return;

    // get the search keyword
    let search = this.customerFilterCtrl.value;
    if (!search)
    {
      this.filteredCustomers.next (this.customers.slice ());
      return;
    }

    search = search.toLowerCase ();
    this.filteredCustomers.next (
      this.customers.filter (a => a.name.toLowerCase ().indexOf (search) > -1)
    );
  }

  customersSearchChange(): void
  {
    // load the initial option list
    this.filteredCustomers.next (this.customers.slice ());
    // listen for search field value changes
    this.customerFilterCtrl.valueChanges
      .pipe (takeUntil (this._onDestroy))
      .subscribe (() => {
        this.filterCustomers ();
      });
  }

  renderCountries(_this, data): void
  {
    _this.countries = data;
    _this.selectedCountries = _this.countries;
    _this.countriesSearchChange ();
    _this.customersSearchChange ();
    _this.isLoading = false;
  }

  errorCountries(_this): void
  {
    _this.isLoading = false;
    _this.dialogRef.close ({ error: "Failed to load the list of countries. "});
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
    // load the initial option list
    this.filteredStates.next (this.states.slice ());
    // listen for search field value changes
    this.stateFilterCtrl.valueChanges
      .pipe (takeUntil (this._onDestroy))
      .subscribe (() => {
        this.filterStates ();
      });
  }

  CountryChangeEvent(event)
  {
    let stateValidatorForm = this.personalInformationForm.get ('stateValidator');

    stateValidatorForm.setValue (null);
    stateValidatorForm.markAsUntouched ();

    if (event != undefined)
    {
      this.states = event.value.states;
      this.selectedStates = this.states;
      this.stateSearchChange ();
    }
    else
    {
      this.states = [];
      this.filteredStates.next ([]);
    }
  }

  setUserValues(): void
  {
    this.user.name = this.personalInformationForm.get ('nameValidator').value;
    this.user.lastname = this.personalInformationForm.get ('lastNameValidator').value;
    this.user.password = this.personalInformationForm.get ('passwordValidator').value;
    this.user.repeatPassword = this.personalInformationForm.get ('repeatPasswordValidator').value;
    this.user.email = this.personalInformationForm.get ('emailValidator').value;
    this.user.address = this.personalInformationForm.get ('addressValidator').value;
    this.user.country = this.personalInformationForm.get ('countryValidator').value;
    this.user.CState = this.personalInformationForm.get ('stateValidator').value;
    this.user.postalCode = this.personalInformationForm.get ('postalCodeValidator').value;
    this.user.phoneNumber = this.personalInformationForm.get ('phoneNumberValidator').value;
    this.user.customerInfo = null;
    this.user.customer = this.personalInformationForm.get ('customerValidator').value;
  }

  insertUser(): void
  {
    if (this.personalInformationForm.valid)
    {
      this.globals.isLoading = true;
      this.setUserValues ();
      this.userServices.saveUser (this, this.user, this.saveUserHandleResponse, this.saveUserError);
    }
    else
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "You must complete all field before saving." }
      });
    }
  }

  saveUserHandleResponse(_this)
  {
    _this.dialogRef.close ({ error: null });
  }

  saveUserError(_this)
  {
    _this.globals.isLoading = false;
    _this.dialogRef.close ({ error: "Failed to create user!" });
  }

  static stateValidator(comp: CreateUserDialogComponent): ValidatorFn
  {
    return (control: AbstractControl): ValidationErrors =>
    {
      if (comp.user != undefined && comp.personalInformationForm.get ('countryValidator').value.states)
        return comp.personalInformationForm.get ('countryValidator').value.states.length && !control.value ? { required: true } : null;
      else
        return null;
    };
  }

  static passwordMatchValidator(comp: CreateUserDialogComponent): ValidatorFn
  {
    return (control: AbstractControl): ValidationErrors =>
    {
      if (comp.user != undefined)
        return comp.personalInformationForm.get ('passwordValidator').value !== control.value ? { mismatch: true } : null;
      else
        return null;
    };
  }

  checkEmailValidator(email): void
  {
    this.registerServices.checkEmail (this, this.checkEmailResponse, this.checkEmailError, email);
  }

  checkEmailResponse(_this,data): void
  {
    if (data)
      _this.personalInformationForm.get ("emailValidator").setErrors ({ exists: data });
    else
      _this.personalInformationForm.get ("emailValidator").setErrors (null);
  }

  checkEmailError(_this): void
  {
  }

  getErrorNameMessage(): string
  {
    return this.personalInformationForm.get ('nameValidator').hasError( 'required') ? 'You must enter the name' : '';
  }

  getErrorLastNameMessage(): string
  {
    return this.personalInformationForm.get ('lastNameValidator').hasError ('required') ? 'You must enter the last name' : '';
  }

  getErrorPasswordMessage(): string
  {
    return this.personalInformationForm.get ('passwordValidator').hasError ('required') ? 'You must enter a password' : '';
  }

  getErrorRepeatPasswordMessage(): string
  {
    return this.personalInformationForm.get ('repeatPasswordValidator').hasError ('required') ? 'You must repeat password' : this.personalInformationForm.get ('repeatPasswordValidator').hasError ('mismatch') ? 'You must enter the same password' : '';
  }

  getErrorEmailMessage(): string
  {
    return this.personalInformationForm.get ('emailValidator').hasError ('required') ? 'You must enter an e-mail' : '';
  }

  getErrorFormatEmailMessage(): string
  {
    return this.personalInformationForm.get ('emailValidator').hasError ('email') ? 'Bad e-mail format' : '';
  }

  getErrorEmaiExistlMessage(): string
  {
    return this.personalInformationForm.get ('emailValidator').hasError ('exists') ? 'E-mail already exists' : '';
  }

  getErrorAddressMessage(): string
  {
    return this.personalInformationForm.get ('addressValidator').hasError ('required') ? 'You must enter an address' : '';
  }

  getErrorCountryMessage(): string
  {
    return this.personalInformationForm.get ('countryValidator').hasError ('required') ? 'You must select a country' : '';
  }

  getErrorStateMessage(): string
  {
    return this.personalInformationForm.get ('stateValidator').hasError ('required') ? 'You must select a state' : '';
  }

  getErrorPostalCodeMessage(): string
  {
    return this.personalInformationForm.get ('postalCodeValidator').hasError ('required') ? 'You must enter a postal code' : '';
  }

  getErrorPhoneNumberMessage(): string
  {
    return this.personalInformationForm.get ('phoneNumberValidator').hasError ('required') ? 'You must enter a phone number' : '';
  }

  getErrorCustomerMessage(): string
  {
    return this.personalInformationForm.get('customerValidator').hasError('required') ? 'You must select the customer' :'';
  }
}
