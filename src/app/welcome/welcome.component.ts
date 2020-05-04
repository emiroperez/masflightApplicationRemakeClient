import { Component, OnInit, Inject, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Globals } from '../globals/Globals';
import { WelcomeService } from '../services/welcome.service';
import { Router } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { MenuService } from '../services/menu.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { AuthGuard } from '../guards/auth.guard';
import { MediaMatcher } from '@angular/cdk/layout';
import { ApplicationService } from '../services/application.service';	 

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html'
})
export class WelcomeComponent implements OnInit {

  options:any[]=[];
  options2:any[]=[];

  activeElement ='Landing';
  userName: string;

  lastTime: Date;

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;				

  constructor(public globals: Globals, private menuService: MenuService, 
    private service: WelcomeService, private authService: AuthService, 
    private authGuard: AuthGuard, private userService: UserService,
     private router: Router, media: MediaMatcher, 
     changeDetectorRef: ChangeDetectorRef,private appService: ApplicationService) {
        
//media querys
this.mobileQuery = media.matchMedia('(max-width: 480px)');
this._mobileQueryListener = () => changeDetectorRef.detectChanges();
this.mobileQuery.addListener(this._mobileQueryListener);

  }

    
  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
	
  parseTimeStamp(timeStamp): string
  {
    let hours: number;
    let minutes: any;
    let ampm: string;
    let date: Date;

    const monthNames: string[] =
    [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    if (timeStamp == null)
      return null;

    date = new Date (timeStamp);
    if (Object.prototype.toString.call (date) === "[object Date]")
    {
      if (isNaN (date.getTime()))
        return null;
    }
    else
      return null;

    hours = date.getHours ();
    if (hours >= 12)
    {
      if (hours > 12)
        hours -= 12;

      ampm = " PM";
    }
    else
    {
      if (!hours)
        hours = 12;

      ampm = " AM";
    }

    minutes = date.getMinutes ();
    if (minutes < 10)
      minutes = "0" + minutes;

    return monthNames[date.getMonth ()] + " " + date.getDate () + ", " + date.getFullYear () + " " + hours + ":" + minutes + ampm;
  }

  setState(option){

      this.activeElement = option;
  };

  ngOnInit() {
    this.getUserLoggedIn();
  }

  getUserLoggedIn(){
    if (!this.authService.getToken ())
      return;

    this.globals.isLoading = true;
    this.menuService.getUserLoggedin(this, this.handleLogin, this.errorLogin);
  }

  handleLogin(_this,data){
    _this.globals.currentUser = data.name;
    _this.userName = _this.globals.currentUser;
    _this.globals.userName = data.email;
    _this.globals.admin = data.admin;
    _this.globals.superAdmin = data.superAdmin;

    if(data.userInfoDatalake){
      data.userInfoDatalake.datalakeRoles.forEach(datalakeRole => {
        datalakeRole.role.datalakeOption.forEach(datalakeOption => {
          if(datalakeOption){
            _this.globals.optionsDatalake.push(datalakeOption)
          }
        });
      });
    }
    _this.userService.getUserLastLoginTime (_this, _this.lastTimeSuccess, _this.errorLogin);
  }

  lastTimeSuccess (_this, data)
  {
    _this.lastTime = _this.parseTimeStamp (data);
    _this.getApplications();
  }

  errorLogin(_this,result){
    _this.getApplications();
  }

  ngAfterViewInit() {
  }

  getApplications(){
    this.service.getApplications(this,this.handlerSuccess,this.handlerError);
  }

  handlerSuccess(_this,data){
    // Temporary hack for DataLake
    // data.push ({
    //   datalakeToken: null,
    //   id: 5,
    //   name: "DataLake",
    //   url: "/datalake"
    // });
    if (data && data.length == 1)
    {
      // Skip welcome screen if there is only one application
      _this.goTo (data[0]);
      return;
    }

    _this.options = data;
    _this.options2 = data.slice();

    _this.activeElement = _this.options[0];
    /*
    Temporal change
    const indexColumn = _this.options2.findIndex(column => column.id === 2);
    _this.options2.splice(indexColumn,1);
    */
    _this.globals.isLoading = false;
  }

  handlerError(_this,result){

    _this.globals.isLoading = false;
  }

  goTo(option:any){
    this.globals.currentApplication = option;
    this.globals.clearVariables();
    localStorage.setItem("currentApplication", JSON.stringify(this.globals.currentApplication));
    this.router.navigate([option.url]);
  }

  getDisplay(option : any){
    if(option.hover){
      return "inline-block !important"
    }else{
      return "none !important"
    }

  }

  getBackground(option : any): string
  {
    var aux = option.name;

    aux = aux.replace (" ","");

    if (option.hover)
      return "../../assets/images/w_" + aux + "2.webp"
    else
      return "../../assets/images/" + this.globals.theme + "-w_" + aux + "1.webp"
  }


  getBackground2(option : any): string
  {
    var aux = option.name;
    aux = aux.replace(" ","");

    if (option.hover)
      return "../../assets/images/dark-theme-w_" + aux + ".webp"
    else
      return "../../assets/images/" + this.globals.theme + "-w_" + aux + ".webp"
  }

  @HostListener('window:resize', ['$event'])
  checkScreen(event)
  {
    if (this.globals.isTablet ())
      return;

    if (event.target.innerHeight == window.screen.height && event.target.innerWidth == window.screen.width)
      this.globals.isFullscreen = true;
    else
      this.globals.isFullscreen = false;
  }

  // logOut(): void
  // {
  //   this.userService.setUserLastLoginTime (this, this.logoutSuccess, this.logoutError);
  // }

  logOut(){
    this.appService.confirmationDialog (this, "Are you sure you want to Log Out?",
      function (_this)
      {
        _this.userService.setUserLastLoginTime (_this, _this.logoutSuccess, _this.logoutError);
      });
  }

  logoutSuccess(_this): void
  {
    _this.authGuard.disableSessionInterval ();
    _this.authService.removeToken ();
    _this.router.navigate (['']);
  }

  logoutError(_this, error): void
  {
    _this.authGuard.disableSessionInterval ();
    _this.authService.removeToken ();
    _this.router.navigate (['']);
  }
}
