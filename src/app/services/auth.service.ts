import { Injectable, isDevMode } from '@angular/core';
import { Globals } from '../globals/Globals';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';

declare let ClientJS: any;
import 'clientjs';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

const SECURITY_HEADER = "Authorization";
const TOKEN_STORAGE_KEY = "token";

@Injectable()
export class AuthService {
  jwtHelper: JwtHelperService = new JwtHelperService ();
  clientjs: any = new ClientJS ();

  constructor(public http: HttpClient, private globals: Globals)
  {
  }

  login(_this, credentials, successHandler, errorHandler)
  {
    // let url = 'http://localhost:8887/login';
    let url = this.globals.baseUrl + '/login';
    this.post (_this, url, credentials, successHandler, errorHandler);
  }

  validateLogin(_this, session, successHandler, errorHandler)
  {
    let url = this.globals.baseUrl + '/validateLogin';
    this.post (_this, url, session, successHandler, errorHandler);
  }

  verify2FACode(_this, session, code, successHandler, errorHandler)
  {
    let url = this.globals.baseUrl + '/verify2FACode?code=' + code;
    this.post (_this, url, session, successHandler, errorHandler);
  }

  setUserLastLoginTime(_this, userId, handlerSuccess, handlerError): void
  {
    let url = this.globals.baseUrl + "/users/setLastTime";
    this.post (_this, url, userId, handlerSuccess, handlerError);
  }

  getToken(): string
  {
    return localStorage.getItem ("token");
  }

  setToken(token)
  {
    localStorage.setItem ("token", token);
  }

  removeToken()
  {
    localStorage.removeItem ("token");
  }

  createAuthorizationHeader()
  {
    let token = this.getToken ();

    if (!token)
      token = "noUser";

    httpOptions.headers = new HttpHeaders ({ 'Content-Type': 'application/json' });
    // httpOptions.headers = httpOptions.headers.append (SECURITY_HEADER, localStorage.getItem (TOKEN_STORAGE_KEY));
    httpOptions.headers = httpOptions.headers.append ('Authorization', token);
  }

  isTokenExpired(token?): boolean
  {
    if (!token)
      token = this.getToken ();

    if (!token)
      return true;

    return this.jwtHelper.isTokenExpired (token);
  }

  getUserIdFromToken(token?): number
  {
    let tokenItem;

    if (!token)
      token = this.getToken ();

    tokenItem = this.jwtHelper.decodeToken (token);
    return parseInt (tokenItem["sub"]);
  }

  getIpAddress(): Observable<any>
  {
    return this.http.get (((isDevMode ()) ? "http" : "https") + "://api.ipify.org?format=json");
  }

  getFingerprint(): any
  {
    let fingerprint = this.clientjs.getCustomFingerprint (
      this.clientjs.getBrowser (),
      this.clientjs.getEngine (),
      this.clientjs.getFonts (),
      this.clientjs.getOS (),
      this.clientjs.isMobile (),
      this.clientjs.getTimeZone (),
      this.clientjs.getLanguage (),
      this.clientjs.getSystemLanguage (),
      this.clientjs.getColorDepth (),
      this.clientjs.getCurrentResolution (),
      this.clientjs.getAvailableResolution (),
      this.clientjs.getDeviceXDPI (),
      this.clientjs.getDeviceYDPI (),
      this.clientjs.getDevice (),
      this.clientjs.getDeviceType (),
      this.clientjs.getDeviceVendor (),
      this.clientjs.getCPU ()
    );

    return fingerprint;
  }

  get = function (_this, url, successHandler, errorHandler, ipAddress?)
  {
    this.createAuthorizationHeader ();

    if (ipAddress)
    {
      this.getIpAddress ().subscribe (data => {
        let urlInterface = new URL (url);
        let params = new URLSearchParams (urlInterface.search);
        let postURL;

        params.append ("ipAddress", data["ip"]);
        postURL = urlInterface.origin + urlInterface.pathname + "?" + params.toString ();
        console.log (postURL);

        this.http.get (postURL, httpOptions).subscribe (result => {
            successHandler (_this, result);
          }, error => errorHandler (_this, error)
        );
      });
    }
    else
    {
      this.http.get (url, httpOptions).subscribe (result => {
          successHandler (_this, result);
        }, error => errorHandler (_this, error)
      );
    }
  }

  post = function (_this, url, data, successHandler, errorHandler, ipAddress?)
  {
    this.createAuthorizationHeader ();

    if (ipAddress)
    {
      this.getIpAddress ().subscribe (data => {
        let urlInterface = new URL (url);
        let params = new URLSearchParams (urlInterface.search);
        let postURL;

        params.append ("ipAddress", data["ip"]);
        postURL = urlInterface.origin + urlInterface.pathname + "?" + params.toString ();

        this.http.post (postURL, data, httpOptions).subscribe (result => {
            successHandler (_this, result);
          }, error => errorHandler (_this, error)
        );
      });
    }
    else
    {
      this.http.post (url, data, httpOptions).subscribe (result => {
          successHandler (_this, result);
        }, error => errorHandler (_this, error)
      );
    }
  }
}
