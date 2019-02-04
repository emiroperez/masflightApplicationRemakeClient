import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-argument-title',
  templateUrl: './msf-argument-title.component.html',
  styleUrls: ['./msf-argument-title.component.css']
})
export class MsfArgumentTitleComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  constructor() { }

  ngOnInit() {
  }

}
