import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import {AuthService} from '../services/auth.service';
import { UserService } from '../services/user.service';
import {NotificationComponent} from '../notification/notification.component';
import {FormControl, Validators} from '@angular/forms';
import { User } from '../model/User';
import { Utils } from '../commons/utils';
import { MessageComponent } from '../message/message.component';
import { MatDialog } from '@angular/material';
import { Globals } from '../globals/Globals';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  user: User;
  utils: Utils;
  innerHeight: number;

  emailValidator = new FormControl('email', [Validators.required, Validators.email]);

  constructor(private authService: AuthService, private notification: NotificationComponent,
    private registerServices:UserService, public dialog: MatDialog,
    public globals: Globals) {
    this.user = new User(null);
    this.utils = new Utils();
  }

  getErrorEmailMessage() {
    return this.emailValidator.hasError('required') ? 'You must enter a email' :'';
  }

  getErrorFormatEmailMessage() {
    return this.emailValidator.hasError('email') ? 'Bad format e-mail' :'';
  }

  ngOnInit() {
    this.innerHeight = window.innerHeight;
  }

  validate(){
    this.user.email = this.emailValidator.value;
    this.registerServices.checkEmail(this,this.checkEmailResponse,this.errorHandleResponsen, this.user.email);
  }
  checkEmailResponse(_this, data) {
    if (data){
      _this.globals.isLoading = true;
      _this.sendEmail();
    }else {
      const title = "Error";
      const message= "The email doesn't exist";
      const dialogRef = _this.dialog.open(MessageComponent, {
        data: { title:title, message: message}
      });
      dialogRef.afterClosed().subscribe((result: any) => {
      });
    }

  }
  errorHandleResponsen(_this,result) {
    _this.globals.isLoading = false;
  }

  sendEmail(){
    this.globals.isLoading = true;
    this.registerServices.sendEmailPassword(this, this.sendEmailResponse, this.errorEmailResponse, this.user.email);
  }

  sendEmailResponse(_this,data){
    _this.globals.isLoading = false;
    let title = "";
    let message= "";
    if(data){
      title = "Success";
      message = "A message has been send to your email"
    }else{
      title = "Error";
      message = "An error has ocurred"
    }

    const dialogRef = _this.dialog.open(MessageComponent, {
      data: { title:title, message: message}
    });
    dialogRef.afterClosed().subscribe((result: any) => {
    });
  }

  errorEmailResponse(_this, result){
  }

  @HostListener('window:resize', ['$event'])
  checkScreen(event)
  {
    this.innerHeight = event.target.innerHeight;

    if (this.globals.isTablet ())
      return;

    if (event.target.innerHeight == window.screen.height && event.target.innerWidth == window.screen.width)
      this.globals.isFullscreen = true;
    else
      this.globals.isFullscreen = false;
  }

  getInnerHeight(): number {
    return this.innerHeight;
  }
}
