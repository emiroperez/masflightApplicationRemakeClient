import { Injectable, HostBinding, isDevMode } from '@angular/core';
import { MatSort } from '@angular/material';
import { Observable } from 'rxjs';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Cookie } from '../api/cookie';
import { Themes } from './Themes';
import { AmChartConfig } from './AmChartConfig';
import { DatalakeQueryTab } from '../datalake-query-engine/datalake-query-tab';
import * as am4core from "@amcharts/amcharts4/core";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { DashboardMenu } from '../model/DashboardMenu';
import { SharedDashboardMenu } from '../model/SharedDashboardMenu';

am4core.useTheme(am4themes_animated);

@Injectable()
export class Globals {
  public static TABLE_PAGESIZE = 200;

  currentOption: any;
  currentMenuCategory: any;
  currentUser: any;
  currentArgs: any;
  public: boolean = false;
  isLoading: boolean = false;
  popupLoading: boolean = false;
  popupLoading2: boolean = false;
  sort: MatSort;
  dummyTab: boolean = false;
  map: boolean = false;
  mapsc: boolean = false;
  usageStatistics: boolean = false;
  generateDynamicTable = false;
  selectedIndex = 0;
  displayedColumns;
  subDisplayedColumns;
  subPdfViewer: string;
  metadata;
  subDataSource : any
  totalRecord = 0;
  dataSource : boolean = false;
  startTimestamp = null;
  endTimestamp = null;
  bytesLoaded = 0;
  airports: Observable<any[]>;
  moreResults : boolean = false;
  subMoreResults : boolean = false;
  moreResultsBtn : boolean = true;
  subMoreResultsBtn : boolean = true;
  currentApplication : any;
  currentDashboardMenu : any;
  currentDashboardLocation : any;
  readOnlyDashboard : SharedDashboardMenu = null;
  readOnlyDashboardPlan : boolean = false;
  minDate:any;
  maxDate:any;
  welcome:any;
  welcomeMessage:any;
  welcomeDataSource:any;
  query : boolean= false;
  tab : boolean= false;
  showWelcome : boolean= false;
  status: boolean= false;
  currentAirline: any;
  template : boolean = false;
  isFullscreen: boolean = false;
  baseUrl: string;
  baseUrl2: string;
  popupUrl: string;
  scheduledata:any;
  hideParametersPanels : boolean =false;
  Airportdataorigin:any;
  Airportdatadest:any;
  scheduleChart :any;
  schedulepanelinfo :any;
  scheduleImageSeries: any;
  scheduleLineSeries: any;
  scheduleShadowLineSeries: any;
  subTotalRecord = 0;
  currentDrillDown: any;
  popupMainElement: any;
  popupResponse: any;
  iconBefore: any;
  displayMapMenu: number = 1;
  coordinates: string = "";
  subDisplayedColumnNames: string[] = []; 
  copiedPanelInfo: any;
  lastTime: string;
  appLoading: boolean;
  buildScheduleMapChart: boolean = false;

  admin: boolean = false;
  SuperAdmin: boolean = false;
  testingPlan: number = -1;
  token = "Gtk5zI0GAeMbFBRgU191vZmJt8YLUGytwuf";

  //mobile
  showIntroWelcome : boolean = true;
  showMenu : boolean = false;
  showCategoryArguments: boolean = false;
  showTabs: boolean = false;
  showDashboard: boolean = false;
  queryTabs: DatalakeQueryTab[] = [ new DatalakeQueryTab () ];
  restrictedAirlines: boolean = false;
  dateRestrictionInfo: any = {
    startDate: null,
    endDate: null
  };
  
  @HostBinding('class')
  theme: string = "light-theme";
  // selectedSchema: DatalakeQueryTab[] = [ new DatalakeQueryTab () ];
  selectedSchema: any;
  optionDatalakeSelected: number = 2;
  optionsDatalake: any = [];
  // userName: string = "eric.haag.t@aspsols.com";
  userName: string = "";
  showPaginator: boolean = false;

  constructor (public overlayContainer: OverlayContainer, private cookie: Cookie)
  {
    let pulseTheme, useLightTheme;

    if (isDevMode ())
    {
      // this.baseUrl = "http://localhost:8887";
      this.baseUrl = "http://pulse.globaleagle.com:8887";
      this.baseUrl2 = "http://pulse.globaleagle.com:8884/mapBoxServices";
      this.popupUrl = "http://pulse.globaleagle.com:8881";
    }
    else
    {
      this.baseUrl = "";
      this.baseUrl2 = "https://pulse.globaleagle.com:8886/mapBoxServices";
      this.popupUrl = "https://pulse.globaleagle.com:8900";
    }

    AmChartConfig.Init ();

    // get theme setting from cookies
    pulseTheme = cookie.get ("pulseTheme");
    if (!pulseTheme)
      useLightTheme = false;
    else
    {
      if (pulseTheme === "light-theme")
        useLightTheme = true;
      else
        useLightTheme = false;
    }

    this.setOverlayTheme ({ checked : useLightTheme });
  }

  setOverlayTheme(themeSwitch, keepTheme?): void
  {
    let containerElement = this.overlayContainer.getContainerElement ();
    let themeName;

    if (themeSwitch.checked)
      themeName = "light-theme";
    else
      themeName = "dark-theme";

    // remove previous theme class form the overlay container
    if (this.theme && containerElement.classList.contains (this.theme))
    {
      containerElement.classList.remove (this.theme);
      am4core.unuseTheme (Themes.AmCharts[themeName].mainTheme);
    }

    am4core.useTheme (Themes.AmCharts[themeName].mainTheme);
    containerElement.classList.add (themeName);
    this.theme = themeName;

    // save current theme into the cookies
    if (!keepTheme)
      this.cookie.set ("pulseTheme", themeName);
  }

   initDataSource(){
    if(this.currentMenuCategory!= null){
    if(this.currentMenuCategory.welcome!= null){
      this.welcome = this.currentMenuCategory.welcome;
      this.welcomeMessage = this.welcome.description;
      if(this.currentMenuCategory.welcomeTable!="0"){
        this.initTableDataSource();
      }
      this.showWelcome = true;
    }else{
      this.showWelcome = false;
    }
  }
}

  initTableDataSource(){
        this.welcomeDataSource = new Array();
    for (let index = 0; index < this.currentMenuCategory.options.length; index++) {
      if(this.currentMenuCategory.options[index].label!="How to use this tool?"){
        this.recursiveOption(this.currentMenuCategory.options[index]);
        this.welcomeDataSource.push(this.currentMenuCategory.options[index]);
      }
    }
  }

  recursiveOption(option:any){
    option.outputs ='';
    option.keyControl ='';
    if(option.children.length!=0){
      for (let i = 0; i < option.children.length; i++) {
        const element = option.children[i];
        if(element.menuOptionArguments!=null){
          if(element.menuOptionArguments.length!=0) {
            const aux = element.menuOptionArguments;
            if(i!=option.children.length-1){
              option.outputs += ''+element.label+', ';
            }else{
              option.outputs += ''+element.label+'.';
            }
            for (let j = 0; j < aux.length; j++) {
              const aux2 = aux[j].categoryArguments;
              if(aux2!=null){
                for (let k = 0; k < aux2.length; k++) {
                  const aux3 = aux2[k];
                  if(aux3!=null){
                    for (let l = 0; l < aux3.arguments.length; l++) {
                      const aux4 = aux3.arguments[l];
                      if(aux4!=null){
                        if(aux4.required && aux4.title!="Format :"){
                          if(l!=aux3.arguments.length-1){
                            option.keyControl += aux4.title+'*, \n';
                          }else{
                            option.keyControl += aux4.title+'*.';
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }else{
            if (element.children.length!=0) {
              this.recursiveOption(element.children);
            }
          }
        }


         
      }
    }else{
      const aux = option.menuOptionArguments;
      if(aux!=null){
        if(aux.length!=0) {
          option.outputs = option.label;
          for (let j = 0; j < aux.length; j++) {
            const aux2 = aux[j].categoryArguments;
            if(aux2!=null){
              for (let k = 0; k < aux2.length; k++) {
                const aux3 = aux2[k];
                if(aux3!=null){
                  for (let l = 0; l < aux3.arguments.length; l++) {
                    const aux4 = aux3.arguments[l];
                    if(aux4!=null){
                      if(aux4.required&& aux4.title!="Format :"){
                        if(l!=aux3.arguments.length-1){
                          option.keyControl += aux4.title+'*, \n';
                        }else{
                          option.keyControl += aux4.title+'*.';
                        }
                      }
                    }
                  }
                }
              }
            }
          }
      }
      }
  }
  option.outputs = option.outputs.replace(" :","");
}


clearVariablesMenu(){
  this.showIntroWelcome = true;
  this.showMenu = false;
  this.showCategoryArguments = false;
  this.showTabs  = false;
  this.showDashboard = false;
}

  clearVariables(){
    this.currentOption = null;
    this.currentArgs = null;
    this.isLoading = false;
    this.dummyTab = false;
    this.map = false;
    this.mapsc = false;
    this.generateDynamicTable = false;
    this.selectedIndex = 0;
    this.totalRecord = 0;
    this.startTimestamp = null;
    this.endTimestamp = null;
    this.bytesLoaded = 0;
    this.moreResults = false;
    this.moreResultsBtn = true;
    this.dataSource = false;
    this.query = false;
    this.tab = false;
    this.hideParametersPanels = false;
    this.showPaginator = false;
  }

  getTime(){
    if( this.endTimestamp != null && this.startTimestamp != null){
      return (this.endTimestamp.getTime() - this.startTimestamp.getTime())/ 1000;
    }
    return 0;
  };

  getBytesLoaded(){
    if(this.getTime() > 0){
      return this.bytesLoaded;
    }
    return 0;
  }

  dataAvailabilityInit(){
    const option = this.currentOption;
    if(option.dataAvailability!=null){
      this.minDate = new Date(option.dataAvailability.startDate);
      this.maxDate = new Date(option.dataAvailability.endDate);
    }else{
      this.minDate = null;
      this.maxDate = null;
    }
  }
}
