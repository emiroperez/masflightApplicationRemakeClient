import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-time-picker',
  templateUrl: './msf-time-picker.component.html',
  styleUrls: ['./msf-time-picker.component.css']
})
export class MsfTimePickerComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  constructor() { }

  ngOnInit() {
  }

}
