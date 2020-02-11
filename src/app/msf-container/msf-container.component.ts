import { Component, OnInit, Input, ViewChild, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { Globals } from '../globals/Globals';
import { MatTab, MatTabGroup, MatTabChangeEvent, MatPaginator } from '@angular/material';
import { MsfTableComponent } from '../msf-table/msf-table.component';
import { MsfDynamicTableComponent } from '../msf-dynamic-table/msf-dynamic-table.component';
import { MsfMapComponent } from '../msf-map/msf-map.component';
import { MsfDashboardComponent } from '../msf-dashboard/msf-dashboard.component';
import { MediaMatcher } from '@angular/cdk/layout';
import { MsfScheduleMapsComponent } from '../msf-schedule-maps/msf-schedule-maps.component';

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
  msfScMapRef: MsfScheduleMapsComponent;
  
  @ViewChild('msfWelcomeTab')
  msfWelcomeTab: MatTab;

  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;


  @Input("paginator")
  paginator: MatPaginator;

  
  @Input("pageIndex")
  pageIndex: any;
  
  @Output('lengthpaginator')
  lengthpaginator = new EventEmitter ();

  @Output('moreResult')
  moreResult = new EventEmitter ();


  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;							   
  showMoreResult: boolean;
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
      this.moreResult.emit(this.showMoreResult);
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
        if(this.globals.currentOption.tabType != "legacy"){
          //si es de los nuevos
          if(this.showMoreResult){
            //si tiene total rows muestro el paginador
            this.globals.showPaginator = false;
            this.moreResult.emit(true);
          }else{
            this.globals.showPaginator = true;
            this.moreResult.emit(false);
          }
        }else{
          this.globals.showPaginator = false;
          this.moreResult.emit(true);
        }
      }else{
        // si no trae mas dato verifico que tenga algo en la tabla
        if(this.msfTableRef && this.msfTableRef.dataSource && this.msfTableRef.dataSource.data.length > 0){
          //si es de los nuevos
          if(this.showMoreResult){
            this.moreResult.emit(true);
            this.globals.showPaginator = false;
          }else{
            this.moreResult.emit(false);
            this.globals.showPaginator = true;
          }
        }else{
          this.globals.showPaginator = false;
          this.moreResult.emit(false);
        }
      }
    }else{
      this.globals.showPaginator = false;
      this.moreResult.emit(false);
    }

  }

  paginatorlength(event: any) {
    this.lengthpaginator.emit(event);
  }

  shmoreResult(event: any){
    this.showMoreResult = event.showMoreResult;
  }
  
}
