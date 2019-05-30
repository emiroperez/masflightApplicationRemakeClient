import { Component, OnInit ,ViewChild, Input} from '@angular/core';
import { Arguments } from '../model/Arguments';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { MatSelect } from '@angular/material';
import { takeUntil, take } from 'rxjs/operators';
import { SimpleUser } from '../model/SimpleUser';
import { ApiClient } from '../api/api-client';

@Component({
  selector: 'app-msf-user-list',
  templateUrl: './msf-user-list.component.html',
  styleUrls: ['./msf-user-list.component.css']
})
export class MsfUserListComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  /** control for the selected user */
  public userCtrl: FormControl = new FormControl();
 
  /** control for the MatSelect filter keyword */
  public userFilterCtrl: FormControl = new FormControl();
 
  
 
   /** list of users */
   private users: SimpleUser[] = [];
 
   /** list of users filtered by search keyword */
   public filteredSimpleUser: ReplaySubject<SimpleUser[]> = new ReplaySubject<SimpleUser[]>(1);
 
 
   @ViewChild('userSelect') usersSelect: MatSelect;
 
   /** Subject that emits when the component has been destroyed. */
   private _onDestroy = new Subject<void>();
 
   constructor(private http: ApiClient) { }
 
 
   ngOnInit() {
 
     this.getUsers(null, this.handlerSuccessInit);
 
     // listen for search field value changes
     this.userFilterCtrl.valueChanges
       .pipe(takeUntil(this._onDestroy))
       .subscribe(() => {
         this.filterUsers();
       });
     
   }
 
   getUsers(search, handlerSuccess){
     let url = this.argument.url + "?search="+ (search != null?search:'');
     this.http.get(this,url,handlerSuccess,this.handlerError, null); 
   }
 
   handlerSuccessInit(_this,data, tab){

     _this.users = data;  
     _this.users.push({id: '', email:'ALL'})
     _this.filteredSimpleUser.next(_this.users.slice());
     _this.argument.value1 = '';
     _this.userCtrl.setValue('');
   }
 
 
   handlerSuccess(_this,data, tab){
     _this.users = data;    
     _this.filteredSimpleUser.next(_this.users.slice());
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
 
   private filterUsers() {
     if (!this.users) {
       return;
     }
     // get the search keyword
     let search = this.userFilterCtrl.value;
     if (!search) {
       this.filteredSimpleUser.next(this.users.slice());
       return;
     } else {
       search = search.toLowerCase();
     }
     // filter the user
     this.getUsers(search, this.handlerSuccess);
   }
   

}
