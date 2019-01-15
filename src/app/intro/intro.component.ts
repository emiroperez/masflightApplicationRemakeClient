import { Component, OnInit } from '@angular/core';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.css']
})
export class IntroComponent implements OnInit {

  constructor(public globals: Globals) { }

  ngOnInit() {
  }

}
