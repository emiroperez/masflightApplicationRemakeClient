import { Component, OnInit } from '@angular/core';
import { MsfDashboardChartmenuComponent } from '../msf-dashboard-chartmenu/msf-dashboard-chartmenu.component';

@Component({
  selector: 'app-msf-dashboard',
  templateUrl: './msf-dashboard.component.html',
  styleUrls: ['./msf-dashboard.component.css']
})
export class MsfDashboardComponent implements OnInit {
  dashboardRows: MsfDashboardChartmenuComponent[] = [];
  addChartMenu: boolean = false;

  constructor() { }

  ToggleAddChartMenu(): void {
    this.addChartMenu = !this.addChartMenu;
  }

  AddChartRow(numCharts): void {
    let charts;

    charts = [];
  
    do
    {
      charts.push (new MsfDashboardChartmenuComponent ());
    } while (--numCharts);

    this.dashboardRows.push (charts);

    // display the specified number of charts and hide the menu
    this.addChartMenu = false;
  }

  ngOnInit() {
  }

}
