import { Component, OnInit ,ViewChild, Input} from '@angular/core';
import { Arguments } from '../model/Arguments';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { MatSelect } from '@angular/material';
import { takeUntil, take } from 'rxjs/operators';
import { Airline } from '../model/Airline';
import { ApiClient } from '../api/api-client';

@Component({
  selector: 'app-msf-single-airline',
  templateUrl: './msf-single-airline.component.html',
  styleUrls: ['./msf-single-airline.component.css']
})
export class MsfSingleAirlineComponent implements OnInit {

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
   private _onDestroy = new Subject<void>();
 
   constructor(private http: ApiClient) { }
 
 
   ngOnInit() {
 
     this.getAirlines(null, this.handlerSuccessInit);
 
     // listen for search field value changes
     this.airlineFilterCtrl.valueChanges
       .pipe(takeUntil(this._onDestroy))
       .subscribe(() => {
         this.filterAirlines();
       });
     
   }
 
   getAirlines(search, handlerSuccess){
     let url = this.argument.url + "?search="+ (search != null?search:'');
     this.http.get(this,url,handlerSuccess,this.handlerError, null);        
   }
 
   handlerSuccessInit(_this,data, tab){
     _this.airlines = data;  
     _this.filteredAirlines.next(_this.airlines.slice());
     _this.argument.value1 = [_this.airlines.slice(1)];
     _this.airlineCtrl.setValue([_this.airlines.slice(1)]);
   }
 
 
   handlerSuccess(_this,data, tab){
     _this.airlines = data;    
     _this.filteredAirlines.next(_this.airlines.slice());
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
     this.filteredAirlines
       .pipe(take(1), takeUntil(this._onDestroy))
       .subscribe(() => {
         this.airlineSelect.compareWith = (a: Airline, b: Airline) => a.id === b.id;        
       });
   }
 
   private filterAirlines() {
     if (!this.airlines) {
       return;
     }
     // get the search keyword
     let search = this.airlineFilterCtrl.value;
     if (!search) {
       this.filteredAirlines.next(this.airlines.slice());
       return;
     } else {
       search = search.toLowerCase();
     }
     // filter the airline
     this.getAirlines(search, this.handlerSuccess);
   }
   

}
