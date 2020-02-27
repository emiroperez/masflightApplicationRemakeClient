import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { FormControl } from '@angular/forms';
import { Airport } from '../model/Airport';
import { ReplaySubject, Subject } from 'rxjs';
import { MatSelect } from '@angular/material';
import { takeUntil, take } from 'rxjs/operators';

@Component({
  selector: 'app-msf-ceiling',
  templateUrl: './msf-ceiling.component.html',
  styleUrls: ['./msf-ceiling.component.css']
})
export class MsfCeilingComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  loading = false;
  /** control for the selected airport */
//  public originAirportCtrl: FormControl = new FormControl();

//  /** control for the MatSelect filter keyword */
//  public originAirportFilterCtrl: FormControl = new FormControl();

//  /** control for the selected airport for multi-selection */
//  public destAirportCtrl: FormControl = new FormControl();

//  /** control for the MatSelect filter keyword multi-selection */
//  public destAirportFilterCtrl: FormControl = new FormControl();

  /** list of airports */
  private airports: any[] = [
    {name: 'any', id: ''},
    {name: '100', id: '100'},
    {name: '200', id: '200'},
    {name: '300', id: '300'}   
  ];

  /** list of banks filtered by search keyword */
  public filteredOriginAirports: ReplaySubject<Airport[]> = new ReplaySubject<Airport[]>(1);

  // /** list of banks filtered by search keyword for multi-selection */
   public filteredDestAirports: ReplaySubject<Airport[]> = new ReplaySubject<Airport[]>(1);

  // @ViewChild('originAirportSelect', { static: false }) originAirportSelect: MatSelect;
  // @ViewChild('destAirportSelect', { static: false }) destAirportSelect: MatSelect;

  // /** Subject that emits when the component has been destroyed. */
  // private _onDestroy = new Subject<void>();

  


  ngOnInit() {
    if(!this.argument.value1&&!this.argument.value2&&!this.argument.value3){
    this.argument.value1 = this.airports[0];
    this.argument.value2 = this.airports[0];
    this.argument.value3 = 'ft';
    this.filteredOriginAirports.next(this.airports.slice());
    this.filteredDestAirports.next(this.airports.slice());

  }
}
}
