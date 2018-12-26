import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-check-box',
  templateUrl: './msf-check-box.component.html',
  styleUrls: ['./msf-check-box.component.css']
})
export class MsfCheckBoxComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  constructor() { }

  ngOnInit() {
  }

}
