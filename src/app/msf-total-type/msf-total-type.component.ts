import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-total-type',
  templateUrl: './msf-total-type.component.html',
  styleUrls: ['./msf-total-type.component.css']
})
export class MsfTotalTypeComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  types: any[] = [
    {name: 'Total Movies'},
    {name: 'Hollywood'},
    {name: 'Total World Movies'},
    {name: 'Total Tv Shows'},
    {name: 'Total Episodes'}
];
  
  constructor() { }


  ngOnInit() {
  }

}
