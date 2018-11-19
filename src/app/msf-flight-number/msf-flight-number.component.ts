import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-flight-number',
  templateUrl: './msf-flight-number.component.html',
  styleUrls: ['./msf-flight-number.component.css']
})
export class MsfFlightNumberComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  constructor() { }

  ngOnInit() {
  }

}
