import { Component, OnInit, HostListener } from "@angular/core";
import {Router, ActivatedRoute, Params} from '@angular/router';
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service";
import { NotificationComponent } from "../notification/notification.component";
import { FormControl,Validators,ValidatorFn,ValidationErrors,AbstractControl,FormGroup} from "@angular/forms";
import { User } from "../model/User";
import { Utils } from "../commons/utils";
import { Globals } from '../globals/Globals';
import { MessageComponent } from "../message/message.component";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.css"]
})
export class ResetPasswordComponent implements OnInit {
  user: User;
  userSave: User;
  utils: Utils;
  tokenEmail: string;
  personalInformationForm = new FormGroup({
    emailValidator: new FormControl("email", [Validators.required, Validators.email]),
    passwordValidator: new FormControl("password", [Validators.required]),
    repeatPasswordValidator: new FormControl("repeatPassword", [
    Validators.required,
    ResetPasswordComponent.passwordMatchValidator(this)])
  });



  constructor(private authService: AuthService, private notification: NotificationComponent,
    private registerServices:UserService, private globals: Globals,
    private activatedRoute: ActivatedRoute, public dialog: MatDialog,
    private router: Router) {
    this.user = new User(null);
    this.utils = new Utils();
  }

  ngOnInit() {
    let self = this;

    this.activatedRoute.queryParams.subscribe(params => {
      self.tokenEmail = params['token'];

      if (self.tokenEmail)
      {
        console.log(self.tokenEmail);
        self.user.email = self.tokenEmail.split(":")[0];
        self.personalInformationForm.get ('emailValidator').setValue (self.user.email);
        self.verifyToken();
      }
    });

  }


  verifyToken(){
    this.globals.isLoading = true;
    this.registerServices.verifyToken(this, this.successHandler, this.errorHandler,this.tokenEmail);
  }
  successHandler(_this,data){
    _this.globals.isLoading = false;
    console.log(data);
    if(data==null){
      const dialogRef = _this.dialog.open(MessageComponent, {
        data: { title:"Error", message:"Token has expired" }
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        _this.router.navigate(['']);
      });
    }else{
      _this.userSave = data;
    }
  }

  errorHandler(_this, result){
    _this.globals.isLoading = false;
    console.log(result);
  }


resetPassword() {
  this.user.email = this.personalInformationForm.get ('emailValidator').value;
  this.user.password = this.personalInformationForm.get ('passwordValidator').value;
  this.user.repeatPassword = this.personalInformationForm.get ('repeatPasswordValidator').value;

  if(this.personalInformationForm.valid){
    this.userSave.password = this.user.password;
    this.userSave.repeatPassword = this.user.repeatPassword;
    this.globals.isLoading = true;
    this.registerServices.resetPassword(this,this.userSave, this.resetHandler, this.errorHandler)
  }
}

resetHandler(_this,data) {
  _this.globals.isLoading = false;
  const title = "Success";
  const message= "Your password was  successfully reset";
  const dialogRef = _this.dialog.open(MessageComponent, {
    data: { title: title, message: message}
  });
  dialogRef.afterClosed().subscribe((result: any) => {
    _this.router.navigate(['']);
  });

}

  static passwordMatchValidator(comp: ResetPasswordComponent): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => {
      if (comp.user != undefined) {
        return comp.personalInformationForm.get ('passwordValidator').value !== control.value
          ? { mismatch: true }
          : null;
      } else {
        return null;
      }
    };
  }

  getErrorEmailMessage() {
    return this.personalInformationForm.get('emailValidator').hasError("required")
      ? "You must enter a email"
      : "";
  }

  getErrorFormatEmailMessage() {
    return this.personalInformationForm.get('emailValidator').hasError("email") ? "Bad format e-mail" : "";
  }

  getErrorPasswordMessage() {
    return this.personalInformationForm.get('passwordValidator').hasError("requires") ? "You must enter a password" : "";
  }

  getErrorRepeatPasswordMessage() {
    return this.personalInformationForm.get('repeatPasswordValidator').hasError("required")
      ? "You must repeat password"
      : this.personalInformationForm.get('repeatPasswordValidator').hasError("mismath")
      ? "You must enter the same password"
      : "";
  }

  @HostListener('window:resize', ['$event'])
  checkScreen(event): void
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
