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

  redirectToLogIn()
  {
    if (this.authService.getToken ())
    {
      this.authService.removeToken ();
    
      const dialogRef = this.dialog.open (MessageComponent, {
        data: { title: "Session Expired", message: "Your session has expired. If you want to continue, please log in again." }
      });
    
      dialogRef.afterClosed ().subscribe (
        () => this.router.navigate ([''])
      );
    }
    else
      this.router.navigate (['']);
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

          this.redirectToLogIn ();

          clearInterval (this.sessionInterval);
          this.sessionInterval = null;
        }, 5000);
      }

      return true;
    }

    this.redirectToLogIn ();
    return false;
  }
}