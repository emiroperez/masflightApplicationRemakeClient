import { Injectable, HostBinding } from '@angular/core';
import { Option } from '../model/Option';
import { MatSort, MatTab } from '@angular/material';
import { Observable } from 'rxjs';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Cookie } from '../api/cookie';

@Injectable()
export class Globals {
  currentOption: any;
  currentMenuCategory: any;
  currentUser: any;
  currentArgs: any;
  isLoading: boolean = false;
  showBigLoading: boolean = true;
  popupLoading: boolean = false;
  popupLoading2: boolean = false;
  sort: MatSort;
  chart: boolean = false;
  map: boolean = false;
  mapsc: boolean = false;
  usageStatistics: boolean = false;
  variables;
  values;
  generateDynamicTable = false;
  selectedIndex = 0;
  displayedColumns;
  subDisplayedColumns;
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
  readOnlyDashboard : boolean = false;
  readOnlyDashboardPlan: boolean = false;
  minDate:any;
  maxDate:any;
  welcome:any;
  items:any;
  welcomeDataSource:any;
  query : boolean= false;
  tab : boolean= false;
  showWelcome : boolean= false;
  status: boolean= false;
  currentAirline: any;
  template : boolean = false;
  isFullscreen: boolean = false;
  baseUrl = "http://staging.pulse.aspsols.com:8887";
  // baseUrl = "http://192.168.1.50:8887";
  // baseUrl = "";
  // baseUrl2 = "http://localhost:8886";
  baseUrl2 = "http://69.64.45.220:8886";
  // popupUrl = "http://localhost:8900";
  popupUrl = "http://testing.pulse.aspsols.com:8900";
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

  @HostBinding('class')
  theme: string = "light-theme";

  constructor (public overlayContainer: OverlayContainer, private cookie: Cookie)
  {
    let pulseTheme, useLightTheme;

    // get theme setting from cookies
    pulseTheme = cookie.get ("pulseTheme");
    if (!pulseTheme)
      useLightTheme = true;
    else
    {
      if (pulseTheme === "light-theme")
        useLightTheme = true;
      else
        useLightTheme = false;
    }

    this.setOverlayTheme ({ checked : useLightTheme });
  }

  setOverlayTheme(themeSwitch): void
  {
    let containerElement = this.overlayContainer.getContainerElement ();
    let themeName;

    if (themeSwitch.checked)
      themeName = "light-theme";
    else
      themeName = "dark-theme";

    // remove previous theme class form the overlay container
    if (this.theme && containerElement.classList.contains (this.theme))
      containerElement.classList.remove (this.theme);

    containerElement.classList.add (themeName);
    this.theme = themeName;

    // save current theme into the cookies
    this.cookie.set ("pulseTheme", themeName);
  }

   initDataSource(){
    if(this.currentMenuCategory!= null){
    if(this.currentMenuCategory.welcome!= null){
      this.welcome = this.currentMenuCategory.welcome;
      this.items = this.welcome.applicationsDo.split(";");
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
    console.log (this.welcomeDataSource);
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

  clearVariables(){
    this.currentOption=null;
    this.currentArgs=null;
    this.isLoading = false;
    this.chart = false;
    this.map = false;
    this.mapsc = false;
    this.variables = null;
    this.values = null;
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

  getSelectedIndex(){
    if(this.currentOption.tabType==="map"){
      return 1;
    }else{
      return this.selectedIndex;
    }

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
