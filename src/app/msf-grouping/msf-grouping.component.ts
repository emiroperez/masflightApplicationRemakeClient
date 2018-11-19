import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { FormControl } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { MatSelect } from '@angular/material';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { ApiClient } from '../api/api-client';

@Component({
  selector: 'app-msf-grouping',
  templateUrl: './msf-grouping.component.html',
  styleUrls: ['./msf-grouping.component.css']
})
export class MsfGroupingComponent implements OnInit {

  @Input("argument") public argument: Arguments;
 

  public groupingCtrl: FormControl = new FormControl();

  public groupingFilterCtrl: FormControl = new FormControl();

  groupingList: any[] = [
                          {id: 'YEAR', name: 'Year'},
                          {id: 'MONTH', name: 'Month'},
                          {id: 'DAY', name: 'Day'},
                          {id: 'HOUR', name: 'Hour'},
                          {id: 'EQUIPTYPE', name: 'Equip Type'},
                          {id: 'OPERATINGAIRLINE', name: 'Operating Airline'},                          
                          {id: 'ORIGINAIRPORT', name: 'Origin Airport'},
                          {id: 'DESTINATIONAIRPORT', name: 'Destination Airport'},
                          {id: 'FLIGHTNUMBER', name: 'Flight Number'},
                          {id: 'MARKETINGAIRLINE', name: 'Marketing Airline'},
                          {id: 'STATUSCODE', name: 'Status Code'},
                          {id: 'ROUTE', name: 'Route'}
                        ];

  public filteredGrouping: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('groupingSelect') groupingSelect: MatSelect;


  private _onDestroy = new Subject<void>();

  
  constructor(private http: ApiClient) { }

  ngOnInit() { 

    this.argument.value1 = [{id: 'MARKETINGAIRLINE', name: 'Marketing Airline'}];

    this.filteredGrouping.next(this.groupingList.slice());

    this.groupingFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() =>{
        this.filterGrouping();
      });

  }


  ngAfterViewInit() {
    this.setInitialValue();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  private setInitialValue() {
    this.filteredGrouping
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.groupingSelect.compareWith = (a: any, b: any) => a.id === b.id;
      });
  }

  private filterGrouping() {
    if (!this.groupingList) {
      return;
    }
    let search = this.groupingFilterCtrl.value;
    if (!search) {
      this.filteredGrouping.next(this.groupingList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.groupingSelect.compareWith = (a: any, b: any) => a.id === b.id;
  }

}
