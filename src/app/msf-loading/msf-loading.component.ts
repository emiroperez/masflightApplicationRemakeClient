import { Component, OnInit } from '@angular/core';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-loading',
  templateUrl: './msf-loading.component.html',
  styleUrls: ['./msf-loading.component.css']
})
export class MsfLoadingComponent implements OnInit {

  constructor(public globals: Globals) { }

  ngOnInit() {
  }

  cancelLoading(){
    this.globals.isLoading = false;
  }

}
