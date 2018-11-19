import { Component, OnInit } from '@angular/core';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-current-query-summary',
  templateUrl: './current-query-summary.component.html',
  styleUrls: ['./current-query-summary.component.css']
})
export class CurrentQuerySummaryComponent implements OnInit {

  constructor(public globals: Globals) { }

  ngOnInit() {
  }

}
