import { Component, OnInit, Input } from '@angular/core';

import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-dashboard-control-panel',
  templateUrl: './msf-dashboard-control-panel.component.html'
})
export class MsfDashboardControlPanelComponent implements OnInit {

  addVariableMenu: boolean;
  controlVariables: any = [];
  selectedIndex: number = -1;

  @Input("controlPanelOpen")
  controlPanelOpen: boolean;

  @Input("controlVariablesAvailable")
  controlVariablesAvailable: any;

  numControlVariablesSelected: number;

  constructor(public globals: Globals)
  {
    this.numControlVariablesSelected = 0;
  }

  ngOnInit() {
  }

  addVariable(): void
  {
    this.addVariableMenu = true;
  }

  cancelAddVariable(): void
  {
    this.addVariableMenu = false;
  }

  getImageIcon(controlVariable): string
  {
    if (controlVariable.hover)
      return controlVariable.iconHover;
    else
      return controlVariable.icon;
  }

  checkControlVariable(controlVariable): void
  {
    if (!this.numControlVariablesSelected)
      this.selectedIndex = 0;

    controlVariable.selected = true;
    this.numControlVariablesSelected++;
  }

  uncheckControlVariable(controlVariable): void
  {
    controlVariable.selected = false;
    this.numControlVariablesSelected--;
  }

  addControlVariables(): void
  {
    this.numControlVariablesSelected = 0;

    for (let controlVariable of this.controlVariablesAvailable)
    {
      if (controlVariable.selected)
      {
        controlVariable.selected = false;
        controlVariable.added = true;
        this.controlVariables.push (controlVariable);
      }
    }

    this.addVariableMenu = false;
  }

  onLinkClick(event: any)
  {
    this.selectedIndex = event;
  }
}
