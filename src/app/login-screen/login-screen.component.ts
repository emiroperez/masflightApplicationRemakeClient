import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {AuthService} from '../services/auth.service';
import {NotificationComponent} from '../notification/notification.component';
import {FormControl, Validators} from '@angular/forms';
import { User } from '../model/User';
import { Utils } from '../commons/utils';

@Component({
  selector: 'app-login-screen',
  templateUrl: './login-screen.component.html'
})
export class LoginScreenComponent implements OnInit {

  LOGIN_URL = '/login/';
  OK_STATUS = 'ok';
  INVALID_USERNAME = 'invaliduser';
  credentials = {};
  authenticated = false;

  user: User;
  utils: Utils;
  userId: string;

  _this = this;

  usernameValidator = new FormControl('username', [Validators.required]);

  constructor(private router: Router, private authService: AuthService, private notification: NotificationComponent) {
    this.user = new User(null);
    this.utils = new Utils();
  }

  getErrorUsernameMessage() {
    return this.usernameValidator.hasError('required') ? 'You must enter a username' :'';
  }

  passwordValidator = new FormControl('username', [Validators.required]);

  getErrorPasswordMessage() {
    return this.passwordValidator.hasError('required') ? 'You must enter a password':'';
  }


  storeSecurityToken(token){
    window.localStorage.setItem ("token", token);
  }

  handleResponse(_this,data){
    var response = data;
    if (response.status == _this.OK_STATUS){
      _this.userId = response.userId;
      if (response.token! = null){
        _this.storeSecurityToken(response.token);
        _this.username = response.username;
        _this.authenticated = true;
      }
      _this.router.navigate(['/welcome']);
    } else {
      _this.utils.showAlert ('warning', data.errorMessage);
      _this.credentials = {};
    }
  }

  errorAutentication(_this,data){

  }


  login(){
    if(this.utils.isEmpty(this.user.username) ){
      this.utils.showAlert('warning', 'Invalid User Name');
      return;
    }
    if( this.utils.isEmpty(this.user.password) ){
      this.utils.showAlert('warning', 'Invalid Password');
      return;
    }
    let encodedObj = this.encodeCredentials();
    this.authService.login(this,encodedObj, this.handleResponse,this.errorAutentication);
  }

  encodeCredentials(){
    let encoded = {};
    encoded['id'] = window.btoa(this.user.username);
    encoded['pd'] = window.btoa(this.user.password);
    return encoded;
  }


  ngOnInit() {
  }


}
