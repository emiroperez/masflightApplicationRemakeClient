import { Component, OnInit, Input, ViewChild, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { Globals } from '../globals/Globals';
import { MatTab, MatTabGroup, MatTabChangeEvent, MatPaginator } from '@angular/material';
import { MsfTableComponent } from '../msf-table/msf-table.component';
import { MsfDynamicTableComponent } from '../msf-dynamic-table/msf-dynamic-table.component';
import { MsfMapComponent } from '../msf-map/msf-map.component';
import { MsfDashboardComponent } from '../msf-dashboard/msf-dashboard.component';
import { MediaMatcher } from '@angular/cdk/layout';
import { MsfScheduleMapsComponent } from '../msf-schedule-maps/msf-schedule-maps.component';
import { CategoryArguments } from '../model/CategoryArguments';

@Component({
  selector: 'app-msf-container',
  templateUrl: './msf-container.component.html',
  styleUrls: ['./msf-container.component.css']
})
export class MsfContainerComponent implements OnInit {


  @ViewChild('msfTableRef', { static: false })
  msfTableRef: MsfTableComponent;

  @ViewChild('msfMapRef', { static: false })
  msfMapRef: MsfMapComponent;

  @ViewChild('msfDynamicTableRef', { static: false })
  msfDynamicTableRef: MsfDynamicTableComponent;

  @ViewChild('msfDynamicTableTabRef', { static: false })
  msfDynamicTableTabRef: MatTab;

  @ViewChild('msfScMapRef', { static: false })
  msfScMapRef: MsfScheduleMapsComponent;
  
  @ViewChild('msfWelcomeTab', { static: false })
  msfWelcomeTab: MatTab;

  @ViewChild(MatTabGroup, { static: false }) tabGroup: MatTabGroup;


  @Input("paginator")
  paginator: MatPaginator;

  
  @Input("pageIndex")
  pageIndex: any;
  
  @Output('lengthpaginator')
  lengthpaginator = new EventEmitter ();

  @Output('moreResult')
  moreResult = new EventEmitter ();

  @Output('refreshDashboardMenu')
  refreshDashboardMenu = new EventEmitter ();

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

  sortingDataTable(event: any): void
  {
    if (event.columnName != "") {
      this.msfTableRef.ListSortingColumns = event.columnName + " " + event.order;
    }
    if (event.order === "") {
      this.msfTableRef.ListSortingColumns = "";
    }
    if (event && this.msfTableRef.currentOption.serverSorting == 1
      && ((!this.msfTableRef.tableOptions.moreResultsBtn && this.msfTableRef.actualPageNumber) || (this.msfTableRef.tableOptions.moreResultsBtn))) {
      let sorting = true;
      if (this.msfTableRef.currentOption.menuOptionArguments) {
        //para los servicios viejos del pto 8900 verifico si tienen sorting 
        for (let menuOptionArguments of this.msfTableRef.currentOption.menuOptionArguments) {
          if (menuOptionArguments.categoryArguments) {
            for (let i = 0; i < menuOptionArguments.categoryArguments.length; i++) {
              let category: CategoryArguments = menuOptionArguments.categoryArguments[i];
              if (category && category.arguments) {
                for (let j = 0; j < category.arguments.length; j++) {
                  let argument = category.arguments[j];
                  if (argument.type === "sortingCheckboxes") {
                    if (argument.value1 && argument.value1.length != 0) {
                      sorting = false;
                    }
                  }
                }
              }
            }
          }
        }
      }
      if (sorting) {
        this.msfTableRef.getDataSorting(this.msfTableRef.ListSortingColumns);
      }
    }
  }
  
}
