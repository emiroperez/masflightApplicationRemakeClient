import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { FormControl } from '@angular/forms';
import { ReplaySubject ,  Subject } from 'rxjs';
import { MatSelect } from '@angular/material';
import { take, takeUntil } from 'rxjs/operators';
import { ApiClient } from '../api/api-client';

@Component({
  selector: 'app-msf-rounding',
  templateUrl: './msf-rounding.component.html',
  styleUrls: ['./msf-rounding.component.css']
})
export class MsfRoundingComponent implements OnInit {

  @Input("argument") public argument: Arguments;
 

  // public roundingCtrl: FormControl = new FormControl();

  // public roundingFilterCtrl: FormControl = new FormControl();

  roundingList: any[] = [
                          {id: 0, name: '0 Digits (n)'},
                          {id: 1, name: '1 Digits (n.d)'},
                          {id: 2, name: '2 Digits (n.dd)'},
                          {id: 3, name: '3 Digits (n.ddd)'}
                        ];

  // public filteredRounding: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('roundingSelect') roundingSelect: MatSelect;


  // private _onDestroy = new Subject<void>();

  loading = false;
  constructor(private http: ApiClient) { }

  ngOnInit() { 

    this.argument.value1 = {id: 2, name: '2 Digits (n.dd)'};

    // this.filteredRounding.next(this.roundingList.slice());

    // this.roundingFilterCtrl.valueChanges
    //   .pipe(takeUntil(this._onDestroy))
    //   .subscribe(() =>{
    //     this.filterRounding();
    //   });

  }


  // ngAfterViewInit() {
  //   this.setInitialValue();
  // }

  // ngOnDestroy() {
  //   this._onDestroy.next();
  //   this._onDestroy.complete();
  // }

  // private setInitialValue() {
  //   this.filteredRounding
  //     .pipe(take(1), takeUntil(this._onDestroy))
  //     .subscribe(() => {
  //       this.roundingSelect.compareWith = (a: any, b: any) => a.id === b.id;
  //     });
  // }

  // private filterRounding() {
  //   if (!this.roundingList) {
  //     return;
  //   }
  //   let search = this.roundingFilterCtrl.value;
  //   if (!search) {
  //     this.filteredRounding.next(this.roundingList.slice());
  //     return;
  //   } else {
  //     search = search.toLowerCase();
  //   }
  //   this.roundingSelect.compareWith = (a: any, b: any) => a.id === b.id;
  // }

}
