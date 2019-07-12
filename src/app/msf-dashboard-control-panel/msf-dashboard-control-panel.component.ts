import { Component, OnInit, Input } from '@angular/core';

import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-dashboard-control-panel',
  templateUrl: './msf-dashboard-control-panel.component.html'
})
export class MsfDashboardControlPanelComponent implements OnInit {

  addVariableMenu: boolean;

  @Input("controlVariables")
  controlVariables: any;

  @Input("controlVariablesAvailable")
  controlVariablesAvailable: any;

  constructor(public globals: Globals) { }

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

    return newurl;
  }
}
