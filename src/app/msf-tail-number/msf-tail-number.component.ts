import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { MatSelect } from '@angular/material';
import { takeUntil, take } from 'rxjs/operators';

@Component({
  selector: 'app-msf-tail-number',
  templateUrl: './msf-tail-number.component.html',
  styleUrls: ['./msf-tail-number.component.css']
})
export class MsfTailNumberComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  

  public tailNumberCtrl: FormControl = new FormControl();
  public tailNumberFilterCtrl: FormControl = new FormControl();

  public tailNumbers: any[] = [
    {name: 'N300AU US Boeing 737-3001 ', id: 'N300AU'},
    {name: 'N103US US Airbus A320-214', id: 'N103US'},
    {name: 'HBIOZ', id: 'HBIOZ'},
    {name: 'N691AA', id: 'N691AA'},
    {name: 'N587AA', id: 'N587AA'},
    {name: 'N620AA', id: 'N620AA'},
    {name: 'N558AA', id: 'N558AA'},
    {name: 'N820NN', id: 'N820NN'},
    {name: 'N942AN', id: 'N942AN'},
    {name: 'N186AN', id: 'N186AN'},
    {name: 'N9618A', id: 'N9618A'},
    {name: 'N9677W', id: 'N9677W'},
    {name: 'N970AN', id: 'N970AN'},
    {name: 'N608AA', id: 'N608AA'},
    {name: 'N817NN', id: 'N817NN'},
    {name: 'N696AN', id: 'N696AN'},
    {name: 'N992AN', id: 'N992AN'},
    {name: 'N380AN', id: 'N380AN'}
  ];

  public filteredTailNumbers: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);


  @ViewChild('tailNumberSelect') tailNumberSelect: MatSelect;

  private _onDestroy = new Subject<void>();

  


  ngOnInit() {
  }


}
