import { Injectable } from '@angular/core';
import { Globals } from '../globals/Globals';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';

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
  ipAddress: string;
  clientjs: any = new ClientJS ();

  constructor(public http: HttpClient, private globals: Globals)
  {
    // this.http.get ("http://api.ipify.org?format=json").subscribe (data => {
    this.http.get ("https://api.ipify.org?format=json").subscribe (data => {
      this.ipAddress = data["ip"];
    });
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

  getIpAddress(): string
  {
    return this.ipAddress;
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

  get = function (_this, url, successHandler, errorHandler)
  {
    this.createAuthorizationHeader ();
    this.http.get (url, httpOptions).subscribe (result => {
        successHandler (_this, result);
      }, error => errorHandler (_this, error)
    );
  }

  post = function (_this, url, data, successHandler, errorHandler)
  {
    this.createAuthorizationHeader ();
    this.http.post (url, data, httpOptions).subscribe (result => {
        successHandler (_this, result);
      }, error => errorHandler (_this, error)
    );
  }
}
