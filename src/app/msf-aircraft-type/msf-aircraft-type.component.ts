import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { take, takeUntil } from 'rxjs/operators';
import { Subject, ReplaySubject } from 'rxjs';
import { MatSelect } from '@angular/material';
import { FormControl } from '@angular/forms';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-aircraft-type',
  templateUrl: './msf-aircraft-type.component.html',
  styleUrls: ['./msf-aircraft-type.component.css']
})
export class MsfAircraftTypeComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  /** control for the selected airline */
  public airlineCtrl: FormControl = new FormControl();
 
  /** control for the MatSelect filter keyword */
  public airlineFilterCtrl: FormControl = new FormControl();
 
  
 
   private data: any[] = [
     {name: 'ALL ', id: ''},
     {name: 'A300-600', id: 'A300-600'},
     {name: 'B-727-2', id: 'B-727-2'},
     {name: 'B-757-2', id: 'B-757-2'},
     {name: 'B-767-3', id: 'B-767-3'}   
   ];
 
   /** list of airline filtered by search keyword */
   public filteredAirlines: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
 
 
   @ViewChild('airlineSelect') airlineSelect: MatSelect;
 
   /** Subject that emits when the component has been destroyed. */
   private _onDestroy = new Subject<void>();
 
   
 
 
   ngOnInit() {
 this.argument.value1 = this.data[0];
 
     // set initial selection
     this.airlineCtrl.setValue(this.data[10]);
 
     // load the initial airline list
     this.filteredAirlines.next(this.data.slice());
 
     // listen for search field value changes
     this.airlineFilterCtrl.valueChanges
       .pipe(takeUntil(this._onDestroy))
       .subscribe(() => {
         this.filterAirlines();
       });
     
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
         // setting the compareWith property to a comparison function
         // triggers initializing the selection according to the initial value of
         // the form control (i.e. _initializeSelection())
         // this needs to be done after the filteredBanks are loaded initially
         // and after the mat-option elements are available
         this.airlineSelect.compareWith = (a: any, b: any) => a.id === b.id;        
       });
   }
 
   private filterAirlines() {
     if (!this.data) {
       return;
     }
     // get the search keyword
     let search = this.airlineFilterCtrl.value;
     if (!search) {
       this.filteredAirlines.next(this.data.slice());
       return;
     } else {
       search = search.toLowerCase();
     }
     // filter the airports
     this.filteredAirlines.next(
       this.data.filter(airport => airport.name.toLowerCase().indexOf(search) > -1)
     );
   }

}
