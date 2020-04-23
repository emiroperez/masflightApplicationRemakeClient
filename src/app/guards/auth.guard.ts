import { Injectable, isDevMode } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatDialog } from '@angular/material';
import { MessageComponent } from '../message/message.component';

@Injectable()
export class AuthGuard implements CanActivate {
  static INACTIVITY_TIMEOUT: number = 30 * 60 * 1000; // 30 minutes for inactivity timeout

  sessionInterval: any;
  inactivityTimeout: any;
  timeoutLogout: boolean = false;

  constructor (private router: Router, private authService: AuthService, private dialog: MatDialog)
  {
  }

  private clearIntervals(): void
  {
    let _this = this;

    if (this.inactivityTimeout)
    {
      clearTimeout (this.inactivityTimeout);
      this.inactivityTimeout = null;

      window.removeEventListener ("click", () => {
        _this.resetInactivityTimeout ();
      });

      window.removeEventListener ("scroll", () => {
        _this.resetInactivityTimeout ();
      });

      window.removeEventListener ("keypress", () => {
        _this.resetInactivityTimeout ();
      });
    }

    if (this.sessionInterval)
    {
      clearInterval (this.sessionInterval);
      this.sessionInterval = null;
    }
  }

  private resetInactivityTimeout(): void
  {
    if (!this.inactivityTimeout)
      return;

    clearTimeout (this.inactivityTimeout);
    this.inactivityTimeout = null;

    this.inactivityTimeout = setTimeout (() => {
      this.timeoutLogout = true;

      this.logout();
      this.clearIntervals ();
    }, AuthGuard.INACTIVITY_TIMEOUT);
  }

  disableSessionInterval(): void
  {
    this.clearIntervals ();
  }

  logout(): void
  {
    let _this = this;

    if (this.authService.getToken ())
    {
      this.authService.setUserLastLoginTime (this, this.authService.getUserIdFromToken (), this.logoutSuccess, this.redirectToLogin);
      this.authService.removeToken ();
    }
    else
      this.redirectToLogin (this);
  }

  logoutSuccess(_this): void
  {
    let dialogRef;

    if (_this.timeoutLogout)
    {
      _this.timeoutLogout = false;

      dialogRef = _this.dialog.open (MessageComponent, {
        data: { title: "Timeout", message: "You've been logged out due to inactivity." }
      });
    }
    else
    {
      dialogRef = _this.dialog.open (MessageComponent, {
        data: { title: "Session Expired", message: "Your session has expired. If you want to continue, please log in again." }
      });
    }
  
    dialogRef.afterClosed ().subscribe (
      () => _this.redirectToLogin (_this)
    );
  }

  redirectToLogin(_this): void
  {
    _this.router.navigate (['']);
  }

  canActivate(): boolean
  {
    if (!this.authService.isTokenExpired ())
    {
      if (!this.inactivityTimeout && !isDevMode ())
      {
        let _this = this;

        window.addEventListener ("click", () => {
          _this.resetInactivityTimeout ();
        });

        window.addEventListener ("scroll", () => {
          _this.resetInactivityTimeout ();
        });

        window.addEventListener ("keypress", () => {
          _this.resetInactivityTimeout ();
        });

        this.inactivityTimeout = setTimeout (() => {
          this.timeoutLogout = true;

          this.logout ();
          this.clearIntervals ();
        }, AuthGuard.INACTIVITY_TIMEOUT);
      }

      if (!this.sessionInterval)
      {
        // poll each 5 seconds while checking the status of the token
        this.sessionInterval = setInterval (() => {
          if (!this.authService.isTokenExpired ())
            return;

          this.logout ();
          this.clearIntervals ();
        }, 5000);
      }

      return true;
    }

    this.logout ();
    return false;
  }
}
