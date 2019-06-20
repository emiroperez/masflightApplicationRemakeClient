import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationComponent } from '../notification/notification.component';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { User } from '../model/User';
import { Utils } from '../commons/utils';
import { MenuService } from '../services/menu.service';
import { Globals } from '../globals/Globals';
import { HttpClient } from '@angular/common/http';
import { TwoFactorLoginDialogComponent } from '../two-factor-login-dialog/two-factor-login-dialog.component';
import { MatDialog } from '@angular/material';

declare let ClientJS: any;
import 'clientjs';

@Component({
  selector: 'app-login-screen',
  templateUrl: './login-screen.component.html',
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
  securityToken: string;
  session: any;
  hash: any;

  loginForm: FormGroup;
  loggedIn = false;
  _this = this;

  constructor(private router: Router,  public globals: Globals, private service: MenuService,
    private authService: AuthService, private notification: NotificationComponent,
    private formBuilder: FormBuilder, public http: HttpClient, public dialog: MatDialog) {
    this.user = new User (null);
    this.utils = new Utils();
    this.user.username = "";
    this.user.password = "";

    this.loginForm = this.formBuilder.group ({
      usernameValidator: new FormControl('', [Validators.required]),
      passwordValidator: new FormControl('', [Validators.required])
    });

    this.hash = new ClientJS ().getFingerprint ();
    // console.log (this.hash);
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
    this.authService.setToken (token);
  }

  handleResponse(_this,data){
    var response = data;
    if (response.status == _this.OK_STATUS){
      _this.userId = response.userId;
      if (response.token!= null){
        _this.securityToken = response.token;
        _this.username = response.username;

        _this.globals.isLoading = true;

        _this.session = {
          userId: _this.userId,
          ipAddress: _this.authService.getIpAddress (),
          hash: _this.hash
        };

        _this.authService.validateLogin (_this, _this.session, _this.verifyLogin, _this.errorAutentication);
      }
    } else {
      _this.utils.showAlert ('warning', data.errorMessage);
      _this.credentials = {};
    }
  }

  goToWelcomeScreen()
  {
    this.storeSecurityToken (this.securityToken);
    this.securityToken = null;
    this.authenticated = true;
    this.hash = null;
    this.router.navigate(['/welcome']);
  }

  verifyLogin(_this, result)
  {
    let self = _this;

    _this.globals.isLoading = false;

    if (!result)
      _this.goToWelcomeScreen ();
    else
    {
      console.log (result >>> 8); // print the code
      result = result & 255; // remove the code from the result

      let dialogRef = _this.dialog.open (TwoFactorLoginDialogComponent,
      {
        height: '200px',
        width: '300px',
        panelClass: 'msf-dashboard-control-variables-dialog',
        data: {
          message: result == 2 ? "You haven't logged in for 5 days." : "Your account is being used to sign in to a new device.",
          session: _this.session
        }
      });

      dialogRef.afterClosed ().subscribe (results =>
      {
        if (results)
        {
          if (results.pass)
            self.goToWelcomeScreen ();
          else
          {
            _this.securityToken = null;
            _this.username = null;
            _this.userId = null;
            _this.session = null;

            if (results.message)
              _this.utils.showAlert ('warning', results.message);
          }
        }
      });
    }
  }

  errorAutentication(_this, error)
  {
    console.log (error);
    _this.securityToken = null;
    _this.username = null;
    _this.userId = null;
    _this.session = null;
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
    if (this.authService.getToken ())
      this.service.getUserLoggedin(this, this.handleLogin, this.errorLogin);
  }

  handleLogin(_this,data){
    _this.loggedIn = true;
    _this.router.navigate(["/welcome"]);
  }
  errorLogin(_this,result){
    console.log(result);
  }

  @HostListener('window:resize', ['$event'])
  checkScreen(event)
  {
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
}
