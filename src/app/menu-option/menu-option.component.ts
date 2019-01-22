import { Component, OnInit, Input,Output,EventEmitter, ViewChild } from '@angular/core';
import { Option } from '../model/Option';
import {Globals} from '../globals/Globals'
import { MatMenuTrigger } from '@angular/material';
import { OptionWelcomeComponent } from '../option-welcome/option-welcome.component';

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
      this.globals.selectedIndex = 1;
    }
    if(this.globals.currentOption.tabType === 'statistics'){
      this.globals.usageStatistics = true;
    }
  }

  closeMenu() {
    //this.trigger.closeMenu();
  }
}
