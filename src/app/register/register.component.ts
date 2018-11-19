import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import { User} from '../model/User';
import { State } from '../model/State';
import { County } from '../model/Country';
import { Plan } from '../model/Plan';
import { Utils } from '../commons/utils';
import { UserService } from '../services/user.service';
import { Payment } from '../model/Payment';
import { NG_SELECT_DEFAULT_CONFIG } from '@ng-select/ng-select';
import { Globals } from '../globals/Globals';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  providers: [
    {
        provide: NG_SELECT_DEFAULT_CONFIG,
        useValue: {
            notFoundText: 'Custom not found'
        }
    }
]
})
export class RegisterComponent implements OnInit {

  isLinear = false;
  title: string = 'Personal Information';
  nameValidator = new FormControl('name', [Validators.required]);
  lastNameValidator = new FormControl('lastName', [Validators.required]);
  passwordValidator = new FormControl('password', [Validators.required]);
  repeatPasswordValidator = new FormControl('repeatPassword', [Validators.required]);
  emailValidator = new FormControl('email', [Validators.required,Validators.email]);
  addressValidator = new FormControl('address', [Validators.required]);
  countryValidator = new FormControl('country', [Validators.required]);
  stateValidator = new FormControl('state', [Validators.required]);
  postalCodeValidator = new FormControl('postalCode', [Validators.required]);
  phoneNumberValidator = new FormControl('phoneNumber', [Validators.required]);
  cardNumberValidator = new FormControl('cardNumber', [Validators.required]);
  expiryDateValidator = new FormControl('expiryDate', [Validators.required]);
  cvvValidator = new FormControl('cvv', [Validators.required]);

  user: User;
  utils: Utils;
  plans: Plan[];

  states: State[] = [
    {name: 'California', code: '1'},
    {name: 'Florida', code: '3'},
    {name: 'Texas', code: '2'},    
    {name: 'Washington', code: '4'},
  ];

  countries: County[] = [
    {name: 'Australia', code: '4'},
    {name: 'Canada', code: '3'},
    {name: 'China', code: '1'},
    {name: 'Russia', code: '2'}
  ];
  
 
  constructor(private userServices: UserService, private globals: Globals) {
    this.user = new User( new Payment(),null);
    this.utils = new Utils();
    this.plans=new Array();
    this.globals.isLoading = true;
    this.userServices.getPlans(this,this.renderPlans,this.errorPlans);
   
  }

  ngOnInit() {}

  selectionChange(event){
    if(event.selectedIndex == 0){
      this.title = 'Personal Information';
    }else if(event.selectedIndex == 1){
      this.title = 'Membership Plan';
    }else if(event.selectedIndex == 2){
      this.title = 'Payment Method';
    }

  }

  renderPlans(_this,data){
    _this.plans = data;
    _this.globals.isLoading = false;
  }

  errorPlans(_this,error){
    console.log(error);
    _this.globals.isLoading = false;
  }
  getMonthlyValue(price,type){
    if (type=="month"){
      return price;
    }else{
      return price/12;
    }
  }

  getErrorNameMessage() {
    return this.nameValidator.hasError('required') ? 'You must enter the name' :'';
  }

  getErrorLastNameMessage() {
    return this.lastNameValidator.hasError('required') ? 'You must enter the last name' :'';
  }

  getErrorPasswordMessage() {
    return this.passwordValidator.hasError('required') ? 'You must enter a password' :'';
  }

  getErrorRepeatPasswordMessage() {
    return this.repeatPasswordValidator.hasError('required') ? 'You must repeat password' :'';
  }

  getErrorEmailMessage() {
    return this.emailValidator.hasError('required') ? 'You must enter a e-mail' :'';
  }

  getErrorFormatEmailMessage() {
    return this.emailValidator.hasError('email') ? 'Bad format e-mail' :'';
  }

  getErrorAddressMessage() {
    return this.addressValidator.hasError('required') ? 'You must enter a address' :'';
  }

  getErrorCountryMessage() {
    return this.countryValidator.hasError('required') ? 'You must enter a country' :'';
  }

  getErrorStateMessage() {
    return this.stateValidator.hasError('required') ? 'You must enter a state' :'';
  }

  getErrorPostalCodeMessage() {
    return this.postalCodeValidator.hasError('required') ? 'You must enter a postal code' :'';
  }

  getErrorPhoneNumberMessage() {
    return this.phoneNumberValidator.hasError('required') ? 'You must enter a phone number' :'';
  }

  getErrorCardNumberMessage() {
    return this.cardNumberValidator.hasError('required') ? 'You must enter the card number' :'';
  }

  getErrorExpiryDateMessage() {
    return this.expiryDateValidator.hasError('required') ? 'You must enter the expiry date' :'';
  }

  getErrorCvvMessage() {
    return this.cvvValidator.hasError('required') ? 'You must enter the cvv' :'';
  }

  successHandleResponse(_this,data){
		
	}

  errorHandleResponsen(){

  }
  

  insertUser(){
		//if(!this.utils.isEmpty(this.user.username) ){
      this.userServices.save(this,this.user, this.successHandleResponse,this.errorHandleResponsen);
    //}
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

}
