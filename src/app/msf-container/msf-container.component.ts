import { Component, OnInit, Input, ViewChild, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { Globals } from '../globals/Globals';
import { MatTab, MatTabGroup, MatTabChangeEvent, MatPaginator } from '@angular/material';
import { MsfTableComponent } from '../msf-table/msf-table.component';
import { MsfDynamicTableComponent } from '../msf-dynamic-table/msf-dynamic-table.component';
import { MsfMapComponent } from '../msf-map/msf-map.component';
import { MsfDashboardComponent } from '../msf-dashboard/msf-dashboard.component';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-msf-container',
  templateUrl: './msf-container.component.html',
  styleUrls: ['./msf-container.component.css']
})
export class MsfContainerComponent implements OnInit {


  @ViewChild('msfTableRef')
  msfTableRef: MsfTableComponent;

  @ViewChild('msfMapRef')
  msfMapRef: MsfMapComponent;

  @ViewChild('msfDynamicTableRef')
  msfDynamicTableRef: MsfDynamicTableComponent;

  @ViewChild('msfDynamicTableTabRef')
  msfDynamicTableTabRef: MatTab;

  @ViewChild('msfScMapRef')
  msfScMapRef: MatTab;
  
  @ViewChild('msfWelcomeTab')
  msfWelcomeTab: MatTab;

  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;


  @Input("paginator")
  paginator: MatPaginator;

  
  @Input("pageIndex")
  pageIndex: any;
  
  @Output('lengthpaginator')
  lengthpaginator = new EventEmitter ();

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;							   
  constructor(public globals: Globals, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) { 
    
    this.mobileQuery = media.matchMedia('(max-width: 480px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);}
	
  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
  ngAfterViewInit(){
  }

  closeTab(tab : any){
    if(tab==1){
      this.globals.query = false;
    }else if(tab==2){
      this.globals.tab = false;
    }else if(tab==3){
      this.globals.generateDynamicTable = false;
    }else if(tab==4){
      this.globals.chart = false;
    }else if(tab==5){
      this.globals.map = false;
    }
    else if(tab==6){
      this.globals.mapsc = false;
    }
  }

  getCategoryArguments()
  {
    var menuOptionArguments = this.globals.currentOption.menuOptionArguments;
    var categoryArguments = null;
    if(menuOptionArguments[menuOptionArguments.length-1]!=null){
       categoryArguments = menuOptionArguments[menuOptionArguments.length-1].categoryArguments;
    }

    return categoryArguments;
  }

  finishLoadingTable(error)
  {

    if(this.globals.currentOption.tabType=='scmap'){
      this.globals.isLoading = false;
    }else{
      this.msfTableRef.isLoading = false;
      if(this.msfMapRef){
        if(!this.msfMapRef.isLoading){
          this.globals.isLoading = false;
        }
      }else{
        this.globals.isLoading = false;
      }
    }
  }

  finishLoadingMap(error)
  {
    this.msfMapRef.isLoading = false;
    if(!this.msfTableRef.isLoading){
      this.globals.isLoading = false;
    }
  }

  onLinkClick(event: MatTabChangeEvent) {
    this.globals.selectedIndex = event.index;

    // refresh mapbox if tab changed when it is not loading the coordinates
    if (event.tab.textLabel === "Map" && !this.msfMapRef.isLoading)
      this.msfMapRef.resizeMap ();

    if(event.tab.textLabel != "Welcome" && event.tab.textLabel != "Current Query General Summary" 
    && event.tab.textLabel != "Dynamic Table" && event.tab.textLabel != "Chart" && event.tab.textLabel != "Map"){
      if(this.globals.moreResultsBtn){
        this.globals.showPaginator = true;
      }else{
        this.globals.showPaginator = false;
      }
    }else{
      this.globals.showPaginator = false;
    }

  }

  paginatorlength(event: any) {
    this.lengthpaginator.emit(event);
  }
  
}
