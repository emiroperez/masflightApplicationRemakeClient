import { Component, OnInit, ViewEncapsulation, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, Validators,ValidatorFn, ValidationErrors, AbstractControl, FormGroup } from '@angular/forms';
import { User} from '../model/User';
import { State } from '../model/State';
import { Country } from '../model/Country';
import { Plan } from '../model/Plan';
import { UserPlan } from '../model/UserPlan';
import { Utils } from '../commons/utils';
import { UserService } from '../services/user.service';
import { RegisterService } from '../services/register.service';
import { Payment } from '../model/Payment';
import { Globals } from '../globals/Globals';
import { NgSelectConfig } from '@ng-select/ng-select';
import { MessageComponent } from '../message/message.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject, Subject } from 'rxjs';
import { ApplicationService } from '../services/application.service';
import { Customer } from '../model/Customer';



@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.css'],
  encapsulation: ViewEncapsulation.None
})
export class RegisterComponent implements OnInit {
  innerHeight: number;
  users: User;
  utils: Utils;
  userPlan : UserPlan;
  countries: Country[];
  states : State[];
  selectedCountries: Country[];
  selectedStates: State[];
  customers: Customer[];
  isLinear = true;
  title: string = 'Personal Information';

  personalInformationForm = new FormGroup({
    nameValidator:new FormControl('name', [Validators.required]),
    lastNameValidator : new FormControl('lastName', [Validators.required]),
    passwordValidator : new FormControl('password', [Validators.required]),
    repeatPasswordValidator : new FormControl('repeatPassword', [Validators.required, RegisterComponent.passwordMatchValidator(this)]),
    emailValidator : new FormControl('email', [Validators.required,Validators.email]),
    addressValidator : new FormControl('address', [Validators.required]),
    countryValidator : new FormControl('country', [Validators.required]),
    stateValidator : new FormControl('state', [Validators.required]),
    postalCodeValidator : new FormControl('postalCode', [Validators.required]),
    phoneNumberValidator : new FormControl('phoneNumber', [Validators.required]),
    customerValidator : new FormControl('customer', [Validators.required])
  });

  public countryFilterCtrl: FormControl = new FormControl();
  public stateFilterCtrl: FormControl = new FormControl();
  public customerFilterCtrl: FormControl = new FormControl();

  public filteredCountries: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filteredStates: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filteredCustomers: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  private _onDestroy = new Subject<void> ();

  constructor(private userServices: UserService,
    private registerServices:RegisterService,
    private appServices: ApplicationService,
    public dialog: MatDialog,
    private globals: Globals,private router: Router,
    private config: NgSelectConfig) {

    this.config.notFoundText = 'There is no options';

    this.users = new User( new Payment());
    this.userPlan=new UserPlan();
    this.utils = new Utils();
    this.countries = new Array();
    this.states = new Array();
    this.globals.isLoading = true;
    this.registerServices.getCountries(this,this.renderCountries,this.errorCountries);


  }

  ngOnInit() {
    this.innerHeight = window.innerHeight;
  }

  ngOnDestroy(): void {
    this._onDestroy.next ();
    this._onDestroy.complete ();
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

  renderCountries(_this,data){
    _this.countries = data;
    _this.selectedCountries = _this.countries;
    _this.countriesSearchChange ();
    _this.appServices.getCustomers (_this, _this.setCustomers, _this.errorCustomers);
  }

  errorCountries(_this,error){
    //_this.globals.consoleLog(error);
    _this.appServices.getCustomers (_this, _this.setCustomers, _this.errorCustomers);
  }

  setCustomers(_this, data): void
  {
    _this.customers = data;
    _this.customerSearchChange ();
    _this.globals.isLoading = false;
  }

  errorCustomers(_this, error)
  {
    _this.globals.consoleLog (error);
    _this.globals.isLoading = false;
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

  customerSearchChange(): void
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

  CountryChangeEvent(event){
    this.users.CState=null;
    if (event != undefined){
      this.states = event.value.states;
      this.selectedStates = this.states;
      this.stateSearchChange ();
    }else{
      this.states=[];
      this.filteredStates.next ([]);
    }
  }

  setPlan(plan){
    this.userPlan.IdPlan=plan;

  }
  getMonthlyValue(price,type){
    if (type=="month"){
      return price;
    }else{
      return price/12;
    }
  }


  static passwordMatchValidator(comp: RegisterComponent): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => {
      if(comp.users!=undefined){
        return comp.personalInformationForm.get ('passwordValidator').value !== control.value ? { mismatch: true } : null;
      }else{
        return null;
      }
    };
  }

  checkEmailValidator(email){
    this.registerServices.checkEmail(this,this.checkEmailResponse,this.errorHandleResponsen,email);
  }

  checkEmailResponse(_this,data){

    if(data){
      _this.personalInformationForm.get("emailValidator").setErrors({exists:data});
    }else{
      _this.personalInformationForm.get("emailValidator").setErrors(null);
    }
  }
  getErrorNameMessage() {
    return this.personalInformationForm.get('nameValidator').hasError('required') ? 'You must enter the name' :'';
  }

  getErrorLastNameMessage() {
    return this.personalInformationForm.get('lastNameValidator').hasError('required') ? 'You must enter the last name' :'';
  }

  getErrorPasswordMessage() {

    return this.personalInformationForm.get('passwordValidator').hasError('required') ? 'You must enter a password' : '';
  }

  getErrorRepeatPasswordMessage() {
    return this.personalInformationForm.get('repeatPasswordValidator').hasError('required') ? 'You must repeat password' : this.personalInformationForm.get('repeatPasswordValidator').hasError('mismatch') ? 'You must enter the same password' : '';
  }

  getErrorEmailMessage() {
    return this.personalInformationForm.get('emailValidator').hasError('required') ? 'You must enter an e-mail' :'';
  }

  getErrorFormatEmailMessage() {
    return this.personalInformationForm.get('emailValidator').hasError('email') ? 'Bad e-mail format' :'';
  }

  getErrorEmaiExistlMessage() {
    return this.personalInformationForm.get('emailValidator').hasError('exists') ? 'E-mail already exists' :'';
  }

  getErrorAddressMessage() {
    return this.personalInformationForm.get('addressValidator').hasError('required') ? 'You must enter an address' :'';
  }

  getErrorCountryMessage() {
    return this.personalInformationForm.get('countryValidator').hasError('required') ? 'You must select a country' :'';
  }

  getErrorStateMessage() {
    return this.personalInformationForm.get('stateValidator').hasError('required') ? 'You must select a state' :'';
  }

  getErrorPostalCodeMessage() {
    return this.personalInformationForm.get('postalCodeValidator').hasError('required') ? 'You must enter a postal code' :'';
  }

  getErrorPhoneNumberMessage() {
    return this.personalInformationForm.get('phoneNumberValidator').hasError('required') ? 'You must enter a phone number' :'';
  }

  getErrorCustomerMessage() {
    return this.personalInformationForm.get('customerValidator').hasError('required') ? 'You must select the customer' :'';
  }

  successHandleResponse(_this,data){
		//_this.globals.consoleLog(data);
	}

  errorHandleResponsen(){

  }


  insertUser(){
		if(this.personalInformationForm.valid){
      let paymentType;

      this.setUserValues ();
      paymentType = this.users.customer.paymentType + 1;
      this.userPlan.IdUser=this.users;
      this.userPlan.IdPlan=this.users.customer.licenseType;
      this.userPlan.IdFare=this.users.customer.licenseType.fares[0];
      this.userPlan.planPayment = this.users.payment;
      this.userPlan.planPayment.paymentType = paymentType.toString ();
      this.userServices.saveUser(this,this.userPlan, this.saveUserHandleResponse,this.errorHandleResponsen);
    }else{
      this.utils.showAlert('info','No valid form, you must complete all fields');
    }
  }

  saveUserHandleResponse(this_,data){
    const dialogRef = this_.dialog.open(MessageComponent, {
      data: { title:"User created succesfully!", message: "Congratulations! You have created a new user. Please let our administrator validate your user membership plan and we will let you know when your user is activated!"}
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      this_.router.navigate(['']);
    });
  }

  getOptionsText(options: any[]){
    let text="";
    let i = 0;
    for(let option of options){
      if(i == 0){
        text += ' ' + option.optionName;
      }else if(i === options.length -1 ){
        text += ' and ' + option.optionName;
      }else{
        text += ', ' + option.optionName;
      }
      i++;
    }
    return text;
  }

  getPeriodicityText(periodicity){
    if( periodicity === 'M'){
      return 'MONTH';
    }
    return 'YEAR'
  }

  searchCountry(query: string){
    this.selectedCountries = this.countries;
    let result = this.selectCountries(query);
    this.selectedCountries = result;
  }

  searchState(query: string){
    this.selectedStates = this.states;
    let result = this.selectStates(query);
    this.selectedStates = result;
  }

  selectCountries(query: string):Country[]{
    let result: Country[] = [];
    for(let a of this.countries){
      if(a.name.toLowerCase().indexOf(query) > -1){
        result.push(a)
      }
    }
    return result;
  }

  selectStates(query: string):State[]{
    let result: State[] = [];
    for(let a of this.states){
      if(a.name.toLowerCase().indexOf(query) > -1){
        result.push(a)
      }
    }
    return result;
  }

  setUserValues()
  {
    this.users.name = this.personalInformationForm.get ('nameValidator').value;
    this.users.lastname = this.personalInformationForm.get ('lastNameValidator').value;
    this.users.password = this.personalInformationForm.get ('passwordValidator').value;
    this.users.repeatPassword = this.personalInformationForm.get ('repeatPasswordValidator').value;
    this.users.email = this.personalInformationForm.get ('emailValidator').value;
    this.users.address = this.personalInformationForm.get ('addressValidator').value;
    this.users.country = this.personalInformationForm.get ('countryValidator').value;
    this.users.postalCode = this.personalInformationForm.get ('postalCodeValidator').value;
    this.users.phoneNumber = this.personalInformationForm.get ('phoneNumberValidator').value;
    this.users.customer = this.personalInformationForm.get ('customerValidator').value;
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
}

