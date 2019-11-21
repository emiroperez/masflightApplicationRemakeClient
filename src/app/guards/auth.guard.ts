import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatDialog } from '@angular/material';
import { MessageComponent } from '../message/message.component';

@Injectable()
export class AuthGuard implements CanActivate {
  sessionInterval: any;

  constructor (private router: Router, private authService: AuthService, private dialog: MatDialog)
  {
  }

  disableSessionInterval()
  {
    if (this.sessionInterval)
    {
      clearInterval (this.sessionInterval);
      this.sessionInterval = null;
    }
  }

  logout()
  {
    if (this.authService.getToken ())
    {
      this.authService.setUserLastLoginTime (this, this.authService.getUserIdFromToken (), this.logoutSuccess, this.redirectToLogin);
      this.authService.removeToken ();
    }
    else
      this.redirectToLogin (this);
  }

  logoutSuccess(_this)
  {
    const dialogRef = _this.dialog.open (MessageComponent, {
      data: { title: "Session Expired", message: "Your session has expired. If you want to continue, please log in again." }
    });
  
    dialogRef.afterClosed ().subscribe (
      () => _this.redirectToLogin (_this)
    );
  }

  redirectToLogin(_this)
  {
    _this.router.navigate (['']);
  }

  canActivate()
  {
    if (!this.authService.isTokenExpired ())
    {
      if (!this.sessionInterval)
      {
        // poll each 5 seconds while checking the status of the token
        this.sessionInterval = setInterval (() => {
          if (!this.authService.isTokenExpired ())
            return;

          this.logout ();

          clearInterval (this.sessionInterval);
          this.sessionInterval = null;
        }, 5000);
      }

      return true;
    }

    this.logout ();
    return false;
  }
}