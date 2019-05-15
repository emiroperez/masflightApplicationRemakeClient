import { Injectable } from '@angular/core';
import { Globals } from '../globals/Globals';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

const SECURITY_HEADER = "Authorization";
const TOKEN_STORAGE_KEY = "token";

@Injectable()
export class AuthService {
  jwtHelper: JwtHelperService = new JwtHelperService ();

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
