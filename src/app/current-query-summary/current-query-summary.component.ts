import { Component, OnInit } from '@angular/core';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-current-query-summary',
  templateUrl: './current-query-summary.component.html',
  styleUrls: ['./current-query-summary.component.css']
})
export class CurrentQuerySummaryComponent implements OnInit {

  constructor(private services: ApplicationService, public globals: Globals) { }

  ngOnInit() {
  }


  

}
