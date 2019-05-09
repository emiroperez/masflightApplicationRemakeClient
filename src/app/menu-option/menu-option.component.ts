import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Option } from '../model/Option';
import { Globals } from '../globals/Globals'
import { MatMenuTrigger } from '@angular/material';

@Component({
  selector: 'app-menu-option',
  templateUrl: './menu-option.component.html'
})
export class MenuOptionComponent implements OnInit {

  @Input("options") options: Option[];

  @Input("trigger") trigger: MatMenuTrigger;

  @ViewChild('childMenu') public childMenu;





  constructor(private globals: Globals) { }

  ngOnInit() {
  }

  optionClickHandler(option) {
    this.globals.clearVariables();
    this.globals.currentOption = option;
    this.globals.initDataSource();
    this.globals.dataAvailabilityInit();
    if(this.globals.currentOption.tabType === 'map'){
      this.globals.map = true;
      this.globals.moreResultsBtn = false;
      this.globals.selectedIndex = 1;
    }
    if(this.globals.currentOption.tabType === 'scmap'){
      this.globals.mapsc = true;
      this.globals.moreResultsBtn = false;
      this.globals.selectedIndex = 1;
    }
    if(this.globals.currentOption.tabType === 'statistics'){
      this.globals.usageStatistics = true;
    }
    this.globals.status = true;
  }

  closeMenu() {
    //this.trigger.closeMenu();
  }
}
