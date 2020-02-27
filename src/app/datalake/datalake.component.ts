import { Component, OnInit, ChangeDetectorRef, HostListener, ViewChild } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router } from '@angular/router';

import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '../guards/auth.guard';
import { MenuService } from '../services/menu.service';
import { DatalakeQueryTab } from '../datalake-query-engine/datalake-query-tab';
import { DashboardMenu } from '../model/DashboardMenu';
import { DatalakeExplorerComponent } from '../datalake-explorer/datalake-explorer.component';
import { MessageComponent } from '../message/message.component';
import { ExportAsConfig, ExportAsService } from 'ngx-export-as';
import { MsfEditDashboardComponent } from '../msf-edit-dashboard/msf-edit-dashboard.component';
import { MatDialog } from '@angular/material';
import { MsfShareDashboardComponent } from '../msf-share-dashboard/msf-share-dashboard.component';

@Component({
  selector: 'app-datalake',
  templateUrl: './datalake.component.html'
})
export class DatalakeComponent implements OnInit {

  @ViewChild("dataExplorer", { static: false })
  dataExplorer: DatalakeExplorerComponent;

  currentOption: any;
  defaultDashboardId: number;
  exportConfig: ExportAsConfig = {
    type: 'png',
    elementId: 'msf-dashboard-element',
    options: {}
  };

  TabletQuery: MediaQueryList;
  mobileQuery: MediaQueryList;
  ResponsiveQuery: MediaQueryList;
  private _TabletQueryListener: () => void;
  private _mobileQueryListener: () => void;
  private _ResponsiveQueryListener: () => void;

  sharedDashboards: Array<DashboardMenu>;
  dashboards: Array<DashboardMenu>;

  bodyHeight: number;

  constructor(public globals: Globals, private appService: ApplicationService,
    private changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher, private router: Router,
    public authGuard: AuthGuard,
    public authService: AuthService,
    public userService: UserService,
    private menuService: MenuService,
    private exportAsService: ExportAsService,
    public dialog: MatDialog) {
    this.TabletQuery = media.matchMedia('(max-width: 768px)');
    this._TabletQueryListener = () => changeDetectorRef.detectChanges();
    this.TabletQuery.addListener(this._TabletQueryListener);

    this.mobileQuery = media.matchMedia('(max-width: 480px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.ResponsiveQuery = media.matchMedia('(max-width: 759px)');
    this._ResponsiveQueryListener = () => changeDetectorRef.detectChanges();
    this.ResponsiveQuery.addListener(this._ResponsiveQueryListener);

    this.bodyHeight = window.innerHeight - 60;
  }

  ngOnInit() {
    this.changeDetectorRef.detectChanges();

    this.globals.optionsDatalake = [];
    this.globals.isLoading = true;
    this.globals.queryTabs = [new DatalakeQueryTab()];
    this.menuService.getUserLoggedin(this, this.handleLogin, this.errorLogin);
  }

  ngOnDestroy(): void {
    this.TabletQuery.removeListener(this._TabletQueryListener);
    this.mobileQuery.removeListener(this._mobileQueryListener);
    this.ResponsiveQuery.removeListener(this._ResponsiveQueryListener);
  }

  getMenuVisibility(): string {
    if (!this.mobileQuery.matches && !this.ResponsiveQuery.matches)
      return "block";

    return "none";
  }

  goHome(): void {
    this.globals.showBigLoading = true;
    this.router.navigate(["/welcome"]);
  }

  logOut(): void {
    this.appService.confirmationDialog(this, "Are you sure you want to Log Out?",
      function (_this) {
        _this.globals.showBigLoading = true;
        _this.userService.setUserLastLoginTime(_this, _this.logoutSuccess, _this.logoutError);
      });
  }

  logoutSuccess(_this): void {
    _this.authGuard.disableSessionInterval();
    _this.authService.removeToken();
    _this.router.navigate(['']);
  }

  logoutError(_this, error): void {
    _this.authGuard.disableSessionInterval();
    _this.authService.removeToken();
    _this.router.navigate(['']);
  }

  optionHandler(): void {
    this.changeDetectorRef.detectChanges();
  }

  handleLogin(_this, data): void {
    _this.globals.currentUser = data.name;
    _this.globals.admin = data.admin;
    _this.globals.userName = data.email;

    if (data.userInfoDatalake) {
      data.userInfoDatalake.datalakeRoles.forEach(datalakeRole => {
        datalakeRole.role.datalakeOption.forEach(datalakeOption => {
          if (datalakeOption) {
            _this.globals.optionsDatalake.push(datalakeOption);
          }
        });
      });
    }

    _this.appService.getNumAirlinesRestriction (_this, _this.restrictAirlineSuccess, _this.errorHandler);
    // _this.globals.isLoading = false;
    // _this.currentOption = 2;
  }

  restrictAirlineSuccess(_this, data)
  {
    if (data)
      _this.globals.restrictedAirlines = true;
    else
      _this.globals.restrictedAirlines = false;

    _this.appService.getDateRestriction (_this, _this.restrictDateSuccess, _this.errorHandler);
  }

  restrictDateSuccess(_this, data)
  {
    if (data)
    {
      _this.globals.dateRestrictionInfo = data;
      _this.globals.dateRestrictionInfo.startDate = _this.globals.dateRestrictionInfo.startDate ? new Date (_this.globals.dateRestrictionInfo.startDate) : null;
      _this.globals.dateRestrictionInfo.endDate = _this.globals.dateRestrictionInfo.endDate ? new Date (_this.globals.dateRestrictionInfo.endDate) : null;
    }
    else
    {
      _this.globals.dateRestrictionInfo = {
        startDate: null,
        endDate: null
      };
    }

    _this.getDashboardsUser();
  }

  getDashboardsUser() {
    this.menuService.getDashboardsByUser(this, this.handlerDashboard, this.errorHandler);
  }

  handlerDashboard(_this, data) {
    _this.dashboards = data;
    _this.menuService.getSharedDashboardsByUser(_this, _this.handlerSharedDashboard, _this.errorHandler);
  }

  handlerSharedDashboard(_this, data) {
    _this.sharedDashboards = data;
    _this.appService.getDefaultDashboard(_this, _this.handlerDefaultDashboard, _this.errorLogin);
  }

  errorHandler(_this, result) {
    _this.globals.isLoading = false;
  }

  handlerDefaultDashboard(_this, data): void {
    // if the user has a default dashboard selected, go to it
    if (data) {
      _this.defaultDashboardId = data.id;
      _this.globals.currentDashboardMenu = null;

      for (let dashboard of _this.dashboards) {
        if (dashboard.id == data.id) {
          _this.globals.currentDashboardMenu = data;
          _this.globals.currentOption = 'dashboard';
          _this.globals.readOnlyDashboard = false;
          break;
        }
      }

      if (!_this.globals.currentDashboardMenu) {
        for (let dashboard of _this.sharedDashboards) {
          if (dashboard.id == data.id) {
            _this.globals.currentDashboardMenu = data;
            _this.globals.currentOption = 'dashboard';
            _this.globals.readOnlyDashboard = true;
            break;
          }
        }
      }

      if (!_this.globals.currentDashboardMenu) {        
        if(_this.showDataExplorer()){
          _this.globals.optionDatalakeSelected = 2;//aqui
        }else{
          _this.globals.optionDatalakeSelected = 0;
        }
        _this.globals.appLoading = false;
      }
    }
    else {
      _this.defaultDashboardId = null;
      _this.globals.appLoading = false;
      _this.globals.optionDatalakeSelected = 2;//por defecto
      if(!_this.showDataExplorer()){
        // _this.globals.optionDatalakeSelected = 2;//aqui
      // }else{
        _this.globals.optionDatalakeSelected = 0;
        _this.globals.isLoading = false;
      }
    }
  }

  errorLogin(_this, result): void {
    _this.globals.isLoading = false;
  }

  setOption(event: any): void {
    this.currentOption = event;
  }

  setCurrentOptionSelected(event: any) {
    this.currentOption = event;
  }

  @HostListener('window:resize', ['$event'])
  checkScreen(event): void {
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

  showDataExplorer() {
    if (this.globals.optionDatalakeSelected === 2 || this.globals.optionDatalakeSelected === 3) {
      let index;
      index = this.globals.optionsDatalake.findIndex(od => od.action.option === "Datalake Explorer");
      if (index != -1 && this.globals.userName) {
        return true;
      } else {
        let index2 = this.globals.optionsDatalake.findIndex(od => od.action.option === "Query Engine");
        if (index2 != -1) {
          return true;
        } else {
          let index3 = this.globals.optionsDatalake.findIndex(od => od.action.name === "Create New Table");
          if (index3 != -1) {
            return true;
          } else {
            // this.globals.optionDatalakeSelected = 0;
            return false;
          }
        }
      }
    } else {
      //no encontro la opcion
      return false;
    }
  }

  refreshDataExplorer(event: any): void {
    if (event === 2 && this.showDataExplorer())
      this.dataExplorer.getDatalakeTables();
  }

  isDefaultDashboard(): boolean {
    if (!this.globals.currentDashboardMenu || !this.defaultDashboardId)
      return false;

    return this.defaultDashboardId == this.globals.currentDashboardMenu.id;
  }

  setDefaultDashboard(): void {
    this.appService.confirmationDialog(this, "Do you want to set this dashboard as the default?",
      function (_this) {
        _this.globals.isLoading = true;

        if (_this.isDefaultDashboard())
          _this.appService.unsetDefaultDashboard(_this, _this.unsetDashboardDefaultSuccess, _this.setDashboardDefaultError);
        else
          _this.appService.setDefaultDashboard(_this, _this.globals.currentDashboardMenu, _this.setDashboardDefaultSuccess, _this.setDashboardDefaultError);
      }
    );
  }

  unsetDashboardDefaultSuccess(_this): void {
    _this.globals.isLoading = false;
    _this.defaultDashboardId = null;

    _this.dialog.open(MessageComponent, {
      data: { title: "Information", message: "This dashboard is no longer the default." }
    });
  }

  setDashboardDefaultSuccess(_this): void {
    _this.globals.isLoading = false;
    _this.defaultDashboardId = _this.globals.currentDashboardMenu.id;

    _this.dialog.open(MessageComponent, {
      data: { title: "Information", message: "This dashboard has been set to default successfully." }
    });
  }

  setDashboardDefaultError(_this): void {
    _this.globals.isLoading = false;

    _this.dialog.open(MessageComponent, {
      data: { title: "Error", message: "Unable to set default dashboard." }
    });
  }

  exportDashboardAsPNG(): void {
    let dashboardElement: any = document.getElementById("msf-dashboard-element");

    let contentHeight: number = dashboardElement.scrollHeight;
    let contentWidth: number = dashboardElement.scrollWidth;

    // Set PNG width and height for the dashboard content
    this.globals.isLoading = true;
    this.exportConfig.options.width = contentWidth;
    this.exportConfig.options.windowWidth = contentWidth;
    this.exportConfig.options.height = contentHeight;
    this.exportConfig.options.windowHeight = contentHeight + 90;

    this.exportAsService.save(this.exportConfig, this.globals.currentDashboardMenu.title).subscribe(() => {
      this.globals.isLoading = false;
    });
  }

  changeDashboardName(): void {
    this.dialog.open(MsfEditDashboardComponent, {
      height: '160px',
      width: '400px',
      panelClass: 'msf-dashboard-control-variables-dialog',
      data: {
        currentDashboardMenu: this.globals.currentDashboardMenu
      }
    });
  }

  shareDashboard(): void {
    this.dialog.open(MsfShareDashboardComponent, {
      height: '430px',
      width: '400px',
      panelClass: 'msf-dashboard-child-panel-dialog',
      data: {
        isPanel: false,
        dashboardContentId: this.globals.currentDashboardMenu.id,
        dashboardContentTitle: this.globals.currentDashboardMenu.title
      }
    });
  }

  deleteDashboard(): void {
    this.appService.confirmationDialog(this, "Are you sure you want to delete this dashboard?",
      function (_this) {
        _this.globals.isLoading = true;

        if (_this.globals.readOnlyDashboard) {
          _this.menuService.deleteSharedDashboard(_this, _this.globals.currentDashboardMenu.id,
            _this.deleteSuccess, _this.deleteError);
        }
        else {
          _this.menuService.deleteDashboard(_this, _this.globals.currentDashboardMenu.id,
            _this.deleteSuccess, _this.deleteError);
        }
      }
    );
  }

  deleteError(_this): void {
    _this.globals.isLoading = false;
  }

  deleteSuccess(_this): void {
    _this.temporalSelectOption(_this);
  }

  temporalSelectOption(_this) {
    _this.getDashboardsUser();
  }

  goToFullscreen(): void {
    let element: any = document.documentElement;

    if (element.requestFullscreen)
      element.requestFullscreen();
    else if (element.mozRequestFullScreen)
      element.mozRequestFullScreen();
    else if (element.webkitRequestFullscreen)
      element.webkitRequestFullscreen();
    else if (element.msRequestFullscreen)
      element.msRequestFullscreen();
  }

  isSimpleContent(): boolean {
    return (this.globals.currentOption === "dashboard" || !this.globals.currentOption);
  }

  stopPlanTest(): void {
    this.globals.testingPlan = -1;
  }
}
