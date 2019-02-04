import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-msf-dashboard-chartmenu',
  templateUrl: './msf-dashboard-chartmenu.component.html',
  styleUrls: ['./msf-dashboard-chartmenu.component.css']
})
export class MsfDashboardChartmenuComponent implements OnInit {
  chartTypes:any[] = [{id:'column',name:'Columns'},
                      {id:'line',name:'Lines'},                      
                      {id:'area',name:'Area'}
                    ]; 

  currentChartType;

  constructor() { }

  ngOnInit() {
    this.currentChartType = this.chartTypes[0];
  }

}
