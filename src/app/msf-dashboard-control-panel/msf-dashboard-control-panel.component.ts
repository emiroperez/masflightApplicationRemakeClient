import { Component, OnInit, Input } from '@angular/core';

import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-dashboard-control-panel',
  templateUrl: './msf-dashboard-control-panel.component.html'
})
export class MsfDashboardControlPanelComponent implements OnInit {

  addVariableMenu: boolean;
  controlVariables: any = [];

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

  isMatIcon(icon): boolean
  {
    return !icon.endsWith (".png");
  }

  getImageIcon(controlVariable): string
  {
    let newurl, filename: string;
    let path: string[];
    let url;

    url = controlVariable.icon;
    path = url.split ('/');
    filename = path.pop ().split ('?')[0];
    newurl = "";

    // recreate the url with the theme selected
    for (let dir of path)
      newurl += dir + "/";

    if (controlVariable.hover)
      newurl += this.globals.theme + "-hover-" + filename;
    else
      newurl += this.globals.theme + "-" + filename;

    return "url(" + newurl + ")";
  }

  checkControlVariable(controlVariable): void
  {
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
}
