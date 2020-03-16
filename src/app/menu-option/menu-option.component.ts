import { Component, OnInit, Input, ViewChild, EventEmitter, Output } from '@angular/core';
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

  @ViewChild('childMenu', { static: true }) public childMenu;


  @Output('optionChanged')
  optionChanged = new EventEmitter ();

  @Output('cancelLoadingFromLastService')
  cancelLoadingFromLastService = new EventEmitter ();

  constructor(private globals: Globals) { }

  ngOnInit() {
  }

  optionClickHandler(option)
  {
    this.cancelLoadingFromLastService.emit ();

    this.globals.clearVariables ();
    this.globals.currentOption = option;
    this.globals.initDataSource ();
    this.globals.dataAvailabilityInit ();

    this.globals.showDashboard = false;
    this.globals.showIntroWelcome = true;

    if (this.globals.currentOption.tabType === 'map')
    {
      this.globals.map = true;
      this.globals.moreResultsBtn = false;
      this.globals.selectedIndex = 1;
    }
    else if (this.globals.currentOption.tabType === 'scmap')
    {
      this.globals.mapsc = false;
      this.globals.moreResultsBtn = false;
      this.globals.selectedIndex = 1;
    }
    else if(this.globals.currentOption.tabType === 'statistics')
      this.globals.usageStatistics = true;

    if (this.globals.currentOption.metaData == 3)
    {
      this.globals.coordinates = "";
      this.globals.displayMapMenu = 0;
    }
    else
      this.globals.displayMapMenu = 1;

    this.globals.status = true;
    this.optionChanged.emit ();
  }

  optionChangedFromChildren()
  {
    this.optionChanged.emit ();
  }
}
