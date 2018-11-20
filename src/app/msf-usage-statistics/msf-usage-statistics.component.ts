import { Component, OnInit } from '@angular/core';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-msf-usage-statistics',
  templateUrl: './msf-usage-statistics.component.html',
  styleUrls: ['./msf-usage-statistics.component.css']
})
export class MsfUsageStatisticsComponent implements OnInit {

  constructor(private services: ApplicationService) { }

  ngOnInit() {
    //this.services.getDataTableSource
  }

}
