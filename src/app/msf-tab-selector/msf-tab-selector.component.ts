import { Component, OnInit } from '@angular/core';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-tab-selector',
  templateUrl: './msf-tab-selector.component.html',
  styleUrls: ['./msf-tab-selector.component.css']
})
export class MsfTabSelectorComponent implements OnInit {


  constructor(public globals: Globals) { }

  ngOnInit() {
  }
}
