import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Globals } from '../globals/Globals';
import { MediaMatcher } from '@angular/cdk/layout';
import { ApplicationService } from '../services/application.service';
import { ConnectionQuery } from '../model/connection';

@Component({
  selector: 'app-query-engine',
  templateUrl: './query-engine.component.html',
  styleUrls: ['./query-engine.component.css']
})
export class QueryEngineComponent implements OnInit {

  TabletQuery: MediaQueryList;
  mobileQuery: MediaQueryList;
  ResponsiveQuery: MediaQueryList;
  private _TabletQueryListener: () => void;
  private _mobileQueryListener: () => void;
  private _ResponsiveQueryListener: () => void;

  panelOpenState = false;
  
  connections: Array<ConnectionQuery> = new Array<ConnectionQuery>();

  constructor(public globals: Globals, 
    private changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private service: ApplicationService,)
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
  }

  ngOnInit()
  {
    this.getConnections();
  }

  ngOnDestroy(): void
  {
    this.TabletQuery.removeListener (this._TabletQueryListener);
	  this.mobileQuery.removeListener (this._mobileQueryListener);
	  this.ResponsiveQuery.removeListener (this._ResponsiveQueryListener);
  }
  
  getConnections(){
    this.globals.appLoading = true;
    this.globals.isLoading = true;
    this.service.getConnections(this,this.handlerConn, this.handlerError);
  }
  
  handlerConn(_this, data){
    _this.connections = data;
    _this.globals.isLoading = false;
  }
 
  handlerError(_this, result) {
    console.log(result);
    _this.globals.isLoading = false;
  } 

}
