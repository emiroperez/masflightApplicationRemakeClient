import { Component, OnInit ,ViewChild, Input} from '@angular/core';
import { Arguments } from '../model/Arguments';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { MatSelect } from '@angular/material';
import { takeUntil, take } from 'rxjs/operators';
import { SimpleOption } from '../model/SimpleOption';
import { ApiClient } from '../api/api-client';

@Component({
  selector: 'app-msf-option-list',
  templateUrl: './msf-option-list.component.html',
  styleUrls: ['./msf-option-list.component.css']
})
export class MsfOptionListComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  /** control for the selected option */
  public optionsCtrl: FormControl = new FormControl();
 
  /** control for the MatSelect filter keyword */
  public optionFilterCtrl: FormControl = new FormControl();
 
  
 
   /** list of options */
   private options: SimpleOption[] = [];
 
   /** list of options filtered by search keyword */
   public filteredSimpleOptions: ReplaySubject<SimpleOption[]> = new ReplaySubject<SimpleOption[]>(1);
 
 
   @ViewChild('optionSelect') optionSelect: MatSelect;
 
   /** Subject that emits when the component has been destroyed. */
   private _onDestroy = new Subject<void>();
 
   constructor(private http: ApiClient) { }
 
 
   ngOnInit() {
 
     this.getOptions(null, this.handlerSuccessInit);
 
     // listen for search field value changes
     this.optionFilterCtrl.valueChanges
       .pipe(takeUntil(this._onDestroy))
       .subscribe(() => {
         this.filterOptions();
       });
     
   }
 
   getOptions(search, handlerSuccess){
     let url = this.argument.url + "?search="+ (search != null?search:'');
     this.http.get(this,url,handlerSuccess,this.handlerError, null);        
   }
 
   handlerSuccessInit(_this,data, tab){
     _this.options = data;
     _this.options.push({id: '', name:'ALL'});
     _this.filteredSimpleOptions.next(_this.options.slice());
     _this.argument.value1 = '';
     _this.optionsCtrl.setValue('');
   }
 
 
   handlerSuccess(_this,data, tab){
     _this.options = data;    
     _this.filteredSimpleOptions.next(_this.options.slice());
   }
 
   handlerError(_this,result){
     _this.globals.isLoading = false; 
     _this.globals.consoleLog(result);
   }
 
   ngAfterViewInit() {

   }
 
   ngOnDestroy() {
     this._onDestroy.next();
     this._onDestroy.complete();
   }
 

 
   private filterOptions() {
     if (!this.options) {
       return;
     }
     // get the search keyword
     let search = this.optionFilterCtrl.value;
     if (!search) {
       this.filteredSimpleOptions.next(this.options.slice());
       return;
     } else {
       search = search.toLowerCase();
     }
     // filter the option
     this.getOptions(search, this.handlerSuccess);
   }
   

}