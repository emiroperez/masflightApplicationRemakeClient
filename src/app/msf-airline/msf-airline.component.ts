import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject, Observable, of } from 'rxjs';
import { MatSelect } from '@angular/material';
import { takeUntil, take, delay } from 'rxjs/operators';
import { Airline } from '../model/Airline';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-airline',
  templateUrl: './msf-airline.component.html',
  styleUrls: ['./msf-airline.component.css']
})
export class MsfAirlineComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
 /** control for the selected airline */
 public airlineCtrl: FormControl = new FormControl();

 /** control for the MatSelect filter keyword */
 public airlineFilterCtrl: FormControl = new FormControl();

 

  /** list of airlines */
  private airlines: Airline[] = [];

  /** list of airline filtered by search keyword */
  public filteredAirlines: ReplaySubject<Airline[]> = new ReplaySubject<Airline[]>(1);


  @ViewChild('airlineSelect') airlineSelect: MatSelect;

  /** Subject that emits when the component has been destroyed. */
  data: Observable<any[]>;


  loading = false;
  constructor(private http: ApiClient, public globals: Globals) { }

  // ngOnInit() {

  //   this.getAirlines(null, this.handlerSuccessInit);

  //   // listen for search field value changes
  //   this.airlineFilterCtrl.valueChanges
  //     .pipe(takeUntil(this._onDestroy))
  //     .subscribe(() => {
  //       this.filterAirlines();
  //     });
    
  // }

  // getAirlines(search, handlerSuccess){
  //   let url = this.argument.url + "?search="+ (search != null?search:'');
  //   this.http.get(this,url,handlerSuccess,this.handlerError, null);        
  // }

  // handlerSuccessInit(_this,data, tab){
  //   _this.airlines = data;  
  //   _this.airlines.push({iata:'',name:'ALL'});  
  //   _this.filteredAirlines.next(_this.airlines.slice());

  //   _this.argument.value1 = [{iata:'',name:'ALL'}];

  //   // set initial selection
  //   _this.airlineCtrl.setValue([{iata:'',name:'ALL'}]);
  // }


  // handlerSuccess(_this,data, tab){
  //   _this.airlines = data;    
  //   _this.filteredAirlines.next(_this.airlines.slice());
  // }

  // handlerError(_this,result){
  //   _this.globals.isLoading = false; 
  //   console.log(result);
  // }

  // ngAfterViewInit() {
  //   this.setInitialValue();
  // }

  // ngOnDestroy() {
  //   this._onDestroy.next();
  //   this._onDestroy.complete();
  // }

  //  /**
  //  * Sets the initial value after the filteredBanks are loaded initially
  //  */
  // private setInitialValue() {
  //   this.filteredAirlines
  //     .pipe(take(1), takeUntil(this._onDestroy))
  //     .subscribe(() => {
  //       this.airlineSelect.compareWith = (a: Airline, b: Airline) => a.id === b.id;        
  //     });
  // }

  // private filterAirlines() {
  //   if (!this.airlines) {
  //     return;
  //   }
  //   // get the search keyword
  //   let search = this.airlineFilterCtrl.value;
  //   if (!search) {
  //     this.filteredAirlines.next(this.airlines.slice());
  //     return;
  //   } else {
  //     search = search.toLowerCase();
  //   }
  //   // filter the airline
  //   this.getAirlines(search, this.handlerSuccess);
  // }

  ngOnInit() { 
    this.getRecords(null, this.handlerSuccess);
  }

  getRecords(search, handlerSuccess){
    if(this.data == null || this.getRecords.length == 0){
      let url = this.argument.url + "?search="+ (search != null?search:'');
      this.http.get(this,url,handlerSuccess,this.handlerError, null);  
    }
          
  }

  handlerSuccess(_this,data, tab){   
    _this.data = of(data).pipe(delay(500));;        
  }
  
  handlerError(_this,result){
    console.log(result);
  }
  

}
