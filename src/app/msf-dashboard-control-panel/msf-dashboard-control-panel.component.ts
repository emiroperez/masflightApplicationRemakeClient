import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Globals } from '../globals/Globals';
import { ComponentType } from '../commons/ComponentType';
import { Arguments } from '../model/Arguments';
import { MsfDashboardComponent } from '../msf-dashboard/msf-dashboard.component';
import { MsfDashboardPanelValues } from '../msf-dashboard-panel/msf-dashboard-panelvalues';

@Component({
  selector: 'app-msf-dashboard-control-panel',
  templateUrl: './msf-dashboard-control-panel.component.html'
})
export class MsfDashboardControlPanelComponent implements OnInit {

  addVariableMenu: boolean;
  setCategoriesValues: boolean;
  setUpdateInterval: boolean;
  controlVariables: any[] = [];
  selectedIndex: number = -1;
  updateInterval: number = 0;

  @Input("controlPanelOpen")
  controlPanelOpen: boolean;

  @Input("controlVariablesAvailable")
  controlVariablesAvailable: any;

  @Input("controlPanelCategories")
  controlPanelCategories: any;

  @Output("updateAllPanels")
  updateAllPanels = new EventEmitter ();

  @Output("hideCategoryFromCharts")
  hideCategoryFromCharts = new EventEmitter ();

  @Input("dashboardColumns")
  dashboardColumns: MsfDashboardPanelValues[][] = null;

  numControlVariablesSelected: number;
  updateURLResults: boolean = false;

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
        let newControlVariable;

        controlVariable.hover = false;
        controlVariable.selected = false;
        controlVariable.added = true;

        newControlVariable = JSON.parse (JSON.stringify (controlVariable));

        if (newControlVariable.arguments)
        {
          for (let i = 0; i < newControlVariable.arguments.length; i++)
          {
            let controlVariableArgument = newControlVariable.arguments[i];
            let args: any[];

            controlVariableArgument.checkboxes = [];

            if (this.isTaxiTimesCheckbox (newControlVariable.arguments[i]) && !newControlVariable.taxiTimesCheckbox)
            {
              // Make sure that this specific checkbox is always the last argument in a control variable
              newControlVariable.taxiTimesCheckbox = newControlVariable.arguments[i];
            }
            else if (i + 1 < newControlVariable.arguments.length
              && (this.isSingleCheckbox (newControlVariable.arguments[i + 1])))
            {
              // Count the number of checkboxes for a special case
              args = newControlVariable.arguments.slice (i + 1, newControlVariable.arguments.length);

              for (let argument of args)
              {
                if (!this.isSingleCheckbox(argument))
                  break;

                controlVariableArgument.checkboxes.push (argument);
              }
            }
          }
        }

        this.controlVariables.push (newControlVariable);
      }
    }

    this.addVariableMenu = false;
  }

  onLinkClick(event: any)
  {
    this.selectedIndex = event;
  }

  removeVariable(): void
  {
    for (let controlVariable of this.controlVariablesAvailable)
    {
      if (this.controlVariables[this.selectedIndex].id == controlVariable.id)
      {
        controlVariable.added = false;
        break;
      }
    }

    this.controlVariables.splice (this.selectedIndex, 1);

    if (this.selectedIndex)
      this.selectedIndex--;
  }

  removeControlVariables(): void
  {
    this.addVariableMenu = false;
    this.setCategoriesValues = false;
    this.selectedIndex = -1;
    this.controlVariables = [];
  }

  updateDashboard(): void
  {
    this.updateAllPanels.emit (false);
  }

  updateDashboardInterval(): void
  {
    this.updateAllPanels.emit (true);
  }

  setCategories(): void
  {
    this.setCategoriesValues = true;
    this.setUpdateInterval = false;
  }

  setInterval(): void
  {
    this.setCategoriesValues = false;
    this.setUpdateInterval = true;
  }

  returnToVariables(): void
  {
    this.setCategoriesValues = false;
    this.setUpdateInterval = false;
  }

  toggleCategory(category, controlPanelCategory): void
  {
    category.checked = !category.checked;
    this.hideCategoryFromCharts.emit({ name: category.name, variable: controlPanelCategory.name });
  }

  isTitleOnly(argument: Arguments): boolean
  {
    return ComponentType.title == argument.type;
  }

  isSingleCheckbox(argument: Arguments): boolean
  {
    return ComponentType.singleCheckbox == argument.type;
  }

  isTaxiTimesCheckbox(argument: Arguments): boolean
  {
    return ComponentType.taxiTimesCheckbox == argument.type;
  }

  isDateRange(argument: Arguments): boolean
  {
    return ComponentType.dateRange == argument.type;
  }

  setLoading(value: boolean): void
  {
    this.globals.isLoading = value;
  }

  startURLUpdate(): void
  {
    this.updateURLResults = true;

    setTimeout (() => {
      this.updateURLResults = false;
    }, 100);
  }
}
