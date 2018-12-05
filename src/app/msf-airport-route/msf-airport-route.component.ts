import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { FormControl } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { MatSelect } from '@angular/material';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Airport } from '../model/Airport';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';


@Component({
  selector: 'app-msf-airport-route',
  templateUrl: './msf-airport-route.component.html',
  styleUrls: ['./msf-airport-route.component.css']
})
export class MsfAirportRouteComponent implements OnInit {

  @Input("argument") public argument: Arguments;
 

 /** control for the selected airport */
 public originAirportCtrl: FormControl = new FormControl();

 /** control for the MatSelect filter keyword */
 public originAirportFilterCtrl: FormControl = new FormControl();

 /** control for the selected airport for multi-selection */
 public destAirportCtrl: FormControl = new FormControl();

 /** control for the MatSelect filter keyword multi-selection */
 public destAirportFilterCtrl: FormControl = new FormControl();

  /** list of airports */
  airports: Airport[] =[];

  /** list of banks filtered by search keyword */
  public filteredOriginAirports: ReplaySubject<Airport[]> = new ReplaySubject<Airport[]>(1);

  /** list of banks filtered by search keyword for multi-selection */
  public filteredDestAirports: ReplaySubject<Airport[]> = new ReplaySubject<Airport[]>(1);

  @ViewChild('originAirportSelect') originAirportSelect: MatSelect;
  @ViewChild('destAirportSelect') destAirportSelect: MatSelect;

  /** Subject that emits when the component has been destroyed. */
  private _onDestroy = new Subject<void>();

  
  constructor(private http: ApiClient, private globals: Globals) { }

  ngOnInit() { 

    this.getAirports(null, this.handlerSuccess);
    // listen for search field value changes
    this.originAirportFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() =>{
        this.filterOriginAirports();
      });
      this.destAirportFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterDestAirports();
      });

  }

  getAirports(search, handlerSuccess){
    this.globals.isLoading = true;
    let url = this.argument.url + "?search="+ (search != null?search:'');
    this.http.get(this,url,handlerSuccess,this.handlerError, null);        
  }


  handlerSuccess(_this,data, tab){   
    _this.globals.isLoading = false;
    _this.airports = data;    
    _this.filteredOriginAirports.next(_this.airports.slice());
    _this.filteredDestAirports.next(_this.airports.slice());    
  }

  handlerSuccessOrg(_this,data, tab){
    _this.airports = data;    
    _this.filteredOriginAirports.next(_this.airports.slice());
  }

  handlerSuccessDest(_this,data, tab){
    _this.airports = data;    
    _this.filteredDestAirports.next(_this.airports.slice());
  }

  handlerError(_this,result){
    _this.globals.isLoading = false; 
    console.log(result);
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

   /**
   * Sets the initial value after the filteredBanks are loaded initially
   */
  private setInitialValue() {
    this.filteredOriginAirports
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.originAirportSelect.compareWith = (a: Airport, b: Airport) => a.id === b.id;
        this.destAirportSelect.compareWith = (a: Airport, b: Airport) => a.id === b.id;
      });
  }

  private filterOriginAirports() {
    if (!this.airports) {
      return;
    }
    // get the search keyword
    let search = this.originAirportFilterCtrl.value;
    if (!search) {
      this.filteredOriginAirports.next(this.airports.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the airports
    this.filteredOriginAirports.next(this.airports.filter(a => a.name.toLowerCase().indexOf(search) > -1));
  }

  private filterDestAirports() {
    if (!this.airports) {
      return;
    }
    // get the search keyword
    let search = this.destAirportFilterCtrl.value;
    if (!search) {
      this.filteredDestAirports.next(this.airports.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredDestAirports.next(this.airports.filter(a => a.name.toLowerCase().indexOf(search) > -1));
    
  }


}
