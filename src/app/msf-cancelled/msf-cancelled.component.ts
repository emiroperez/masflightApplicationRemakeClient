import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-cancelled',
  templateUrl: './msf-cancelled.component.html',
  styleUrls: ['./msf-cancelled.component.css']
})
export class MsfCancelledComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  constructor() { }

  ngOnInit() {
  }

}
