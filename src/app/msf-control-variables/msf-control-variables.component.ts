import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Globals } from '../globals/Globals';
import { ComponentType } from '../commons/ComponentType';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-control-variables',
  templateUrl: './msf-control-variables.component.html'
})
export class MsfControlVariablesComponent implements OnInit {

  open: boolean = false;

  @Input()
  currentOptionCategories: any;

  @Input()
  currentOptionId: number;

  @Output("setLoading")
  setLoading = new EventEmitter ();

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  @Input("updateURLResults")
  updateURLResults: boolean;

  argsBefore: any;
  iconBefore: any;

  constructor(public globals: Globals) { }

  ngOnInit() {
  }

  isMatIcon(icon): boolean
  {
    return !icon.endsWith (".png");
  }

  getImageIcon(url, argsContainer): string
  {
    let newurl, filename: string;
    let path: string[];

    path = url.split ('/');
    filename = path.pop ().split ('?')[0];
    newurl = "";

    // recreate the url with the theme selected
    for (let dir of path)
      newurl += dir + "/";

    if (argsContainer.hover || argsContainer.open)
      newurl += this.globals.theme + "-hover-" + filename;
    else
      newurl += this.globals.theme + "-" + filename;

    return newurl;
  }

  componentClickHandler(argsContainer, icon): void
  {
    if (this.globals.currentArgs)
    {
      this.globals.currentArgs.open = false;
      this.globals.iconBefore.innerText ="expand_more";
    }

    if (!this.open || (this.open && (this.globals.currentArgs !== argsContainer)))
    {
      argsContainer.open = true;
      icon.innerText ="expand_less";
      this.open = true;
    }
    else
    {
      argsContainer.open = false;
      icon.innerText ="expand_more";
      this.open = false;
    }

    this.globals.currentArgs = argsContainer;
    this.globals.iconBefore = icon;
    this.argsBefore = argsContainer;
  }
}
