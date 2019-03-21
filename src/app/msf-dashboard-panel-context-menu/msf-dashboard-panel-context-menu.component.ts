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

  // make sure that the visibility of the context menu is not out of the window bounds
  getXPosition(): number
  {
    var clientWidth = document.getElementById ('msf-dashboard-panel-context-menu-container').clientWidth;

    if (this.x + clientWidth > window.innerWidth)
      return this.x - clientWidth;

    return this.x;
  }

  getYPosition(): number
  {
    var clientHeight = document.getElementById ('msf-dashboard-panel-context-menu-container').clientHeight;

    if (this.y + clientHeight > window.innerHeight - 90)
      return this.y - clientHeight;

    return this.y;
  }
}
