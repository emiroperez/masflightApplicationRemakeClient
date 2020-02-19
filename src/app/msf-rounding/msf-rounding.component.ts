import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
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
 
  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  // public roundingCtrl: FormControl = new FormControl();

  // public roundingFilterCtrl: FormControl = new FormControl();

  roundingList: any[] = [
                          {id: 0, name: '0 Digits (n)'},
                          {id: 1, name: '1 Digits (n.d)'},
                          {id: 2, name: '2 Digits (n.dd)'},
                          {id: 3, name: '3 Digits (n.ddd)'}
                        ];

  @ViewChild('roundingSelect') roundingSelect: MatSelect;


  loading = false;
  constructor(private http: ApiClient) { }

  ngOnInit() { 
    if(!this.argument.value1){
    this.argument.value1 = {id: 2, name: '2 Digits (n.dd)'};
    }

  }

}
