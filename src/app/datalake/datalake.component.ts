import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router } from '@angular/router';

import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '../guards/auth.guard';
import { MenuService } from '../services/menu.service';
import { DatalakeQueryTab } from '../datalake-query-engine/datalake-query-tab';

@Component({
  selector: 'app-datalake',
  templateUrl: './datalake.component.html'
})
export class DatalakeComponent implements OnInit {

  currentOption: any;

  TabletQuery: MediaQueryList;
  mobileQuery: MediaQueryList;
  ResponsiveQuery: MediaQueryList;
  private _TabletQueryListener: () => void;
  private _mobileQueryListener: () => void;
  private _ResponsiveQueryListener: () => void;

  bodyHeight: number;

  constructor(public globals: Globals, private appService: ApplicationService, private changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher, private router: Router, public authGuard: AuthGuard, public authService: AuthService,
    public userService: UserService, private menuService: MenuService)
  {
    this.TabletQuery = media.matchMedia('(max-width: 768px)');
    this._TabletQueryListener = () => changeDetectorRef.detectChanges ();
    this.TabletQuery.addListener (this._TabletQueryListener);
    
    this.mobileQuery = media.matchMedia('(max-width: 480px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges ();
    this.mobileQuery.addListener (this._mobileQueryListener);

    this.ResponsiveQuery = media.matchMedia('(max-width: 759px)');
    this._ResponsiveQueryListener = () => changeDetectorRef.detectChanges ();
    this.ResponsiveQuery.addListener (this._ResponsiveQueryListener);

    this.bodyHeight = window.innerHeight - 60;
  }

  ngOnInit()
  {
    this.globals.isLoading = true;    
    this.globals.queryTabs = [ new DatalakeQueryTab () ];
    this.menuService.getUserLoggedin (this, this.handleLogin, this.errorLogin);
  }

  ngOnDestroy(): void
  {
    this.TabletQuery.removeListener (this._TabletQueryListener);
	  this.mobileQuery.removeListener (this._mobileQueryListener);
	  this.ResponsiveQuery.removeListener (this._ResponsiveQueryListener);
  }

  getMenuVisibility(): string
  {
    if (!this.mobileQuery.matches && !this.ResponsiveQuery.matches)
      return "block";

    return "none";
  }

  goHome(): void
  {
    this.router.navigate (["/welcome"]);
  }

  logOut(): void
  {
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

  optionHandler(): void
  {
    this.changeDetectorRef.detectChanges ();
  }

  handleLogin(_this, data): void
  {
    _this.globals.currentUser = data.name;
    _this.globals.admin = data.admin;
    _this.globals.userName = data.email;
    _this.globals.optionDatalakeSelected = 2;
    if(data.userInfoDatalake){
      data.userInfoDatalake.datalakeRoles.forEach(datalakeRole => {
        datalakeRole.role.datalakeOption.forEach(datalakeOption => {
          if(datalakeOption){
            _this.globals.optionsDatalake.push(datalakeOption)
          }
        });
      });
    }
    // _this.globals.isLoading = false;
    // _this.currentOption = 2;
  }

  errorLogin(_this, result): void
  {
    _this.globals.isLoading = false;
  }

  setOption(event: any): void
  {
    this.currentOption = event;
  }

  setCurrentOptionSelected(event: any){
    this.currentOption = event;
  }

  @HostListener('window:resize', ['$event'])
  checkScreen(event): void
  {
    this.bodyHeight = window.innerHeight - 60;

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

  showDataExplorer(){
    let index = this.globals.optionsDatalake.findIndex(od => od.option.option === "Datalake Explorer");
    if((this.globals.optionDatalakeSelected === 2 || this.globals.optionDatalakeSelected === 3)  && index != -1){
      return true;
    }else{
      return false;
    }
  }
}
