import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-msf-dashboard-panel-context-menu',
  templateUrl: './msf-dashboard-panel-context-menu.component.html'
})
export class MsfDashboardPanelContextMenuComponent {
  @Input()
  x: number = 0;

  @Input()
  y: number = 0;

  constructor() { }
}
