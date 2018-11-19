import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-date',
  templateUrl: './msf-date.component.html',
  styleUrls: ['./msf-date.component.css']
})
export class MsfDateComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  constructor() { }

  ngOnInit() {
  }

}
