import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {AuthService} from '../services/auth.service';
import {NotificationComponent} from '../notification/notification.component';
import { FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import { User } from '../model/User';
import { Utils } from '../commons/utils';
import { MenuService } from '../services/menu.service';
import { Globals } from '../globals/Globals';

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

  loginForm: FormGroup;
  loggedIn = false;
  _this = this;

  constructor(private router: Router,  public globals: Globals, private service: MenuService,
    private authService: AuthService, private notification: NotificationComponent,
    private formBuilder: FormBuilder) {
    this.user = new User(null);
    this.utils = new Utils();
    this.user.username = "";
    this.user.password = "";

    this.loginForm = this.formBuilder.group ({
      usernameValidator: new FormControl('username', [Validators.required]),
      passwordValidator: new FormControl('password', [Validators.required])
    });

  }

  isUsernameInvalid(): boolean
  {
    return this.loginForm.get ('usernameValidator').invalid;
  }

  isPasswordInvalid(): boolean
  {
    return this.loginForm.get ('passwordValidator').invalid;
  }

  getErrorUsernameMessage() {
    return this.loginForm.get ('usernameValidator').hasError('required') ? 'You must enter a username' :'';
  }

  getErrorPasswordMessage() {
    return this.loginForm.get ('passwordValidator').hasError('required') ? 'You must enter a password':'';
  }


  storeSecurityToken(token){
    window.localStorage.setItem ("token", token);
  }

  handleResponse(_this,data){
    var response = data;
    if (response.status == _this.OK_STATUS){
      _this.userId = response.userId;
      if (response.token!= null){
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
    this.user.username = this.loginForm.get ('usernameValidator').value;
    this.user.password = this.loginForm.get ('passwordValidator').value;

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
    this.getUserLoggedIn();

  }


  getUserLoggedIn(){
    this.service.getUserLoggedin(this, this.handleLogin, this.errorLogin);
  }

  handleLogin(_this,data){
    _this.loggedIn = true;
    _this.router.navigate(["/welcome"]);
  }
  errorLogin(_this,result){
    console.log(result);
  }


}
