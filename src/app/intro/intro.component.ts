import { Component, OnInit, Input } from '@angular/core';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.css']
})
export class IntroComponent implements OnInit {
  @Input("isMobile")
  isMobile: boolean = false;

  constructor(public globals: Globals) { }

  ngOnInit() {
  }

}
