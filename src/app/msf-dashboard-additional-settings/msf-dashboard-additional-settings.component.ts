import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Globals } from '../globals/Globals';
import { ConfigFlags } from '../msf-dashboard-panel/msf-dashboard-configflags';
import { Themes } from '../globals/Themes';

@Component({
  selector: 'app-msf-dashboard-additional-settings',
  templateUrl: './msf-dashboard-additional-settings.component.html'
})
export class MsfDashboardAdditionalSettingsComponent {
  filteredVariables: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  columnFilterCtrl: FormControl = new FormControl ();
  _onDestroy = new Subject<void> ();

  configList: any[] = [
    ConfigFlags.CHARTCOLORS,
    ConfigFlags.THRESHOLDS,
    ConfigFlags.LIMITVALUES,
    ConfigFlags.LIMITAGGREGATOR,
    ConfigFlags.GOALS,
    ConfigFlags.HEATMAPCOLOR
  ];

  advSettingsOpen: number = 0;

  oneSettingActive: boolean = false;
  useThemeColors: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<MsfDashboardAdditionalSettingsComponent>,
    public globals: Globals,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    let numConfigAvail = 0;
    let currentConfig;

    for (let i = 0; i < this.configList.length; i++)
    {
      if (data.configFlags & this.configList[i])
      {
        currentConfig = this.configList[i];
        numConfigAvail++;
      }
    }

    if (numConfigAvail == 1)
    {
      this.componentClickHandler (this.configList.indexOf (currentConfig) + 1);
      this.oneSettingActive = true;
    }

    if (data.values.limitMode == null)
      data.values.limitMode = 0;

    if (data.values.limitAmount == null)
      data.values.limitAmount = 10;

    if (!this.data.values.paletteColors || !this.data.values.paletteColors.length)
      this.useThemeColors = true;

    this.searchChange (this.columnFilterCtrl);
    this.filteredVariables.next (this.data.values.chartColumnOptions.slice ());
  }

  ngOnDestroy()
  {
    this._onDestroy.next ();
    this._onDestroy.complete ();
  }

  trackColor(index): number
  {
    return index;
  }

  addThreshold(): void
  {
    this.data.values.thresholds.push ({
      min: 0,
      max: 0,
      color: "#000000"
    });
  }

  removeThreshold(): void
  {
    if (this.data.values.thresholds.length)
      this.data.values.thresholds.pop ();
  }

  addGoal(): void
  {
    this.data.values.goals.push ({
      value: 0,
      color: "#000000"
    });
  }

  removeGoal(): void
  {
    if (this.data.values.goals.length)
      this.data.values.goals.pop ();
  }

  onNoClick(): void
  {
    this.dialogRef.close ();
  }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }

  componentClickHandler(value: number): void
  {
    if (this.advSettingsOpen == value)
      this.advSettingsOpen = 0; // close if open
    else
      this.advSettingsOpen = value;
  }

  searchChange(filterCtrl): void
  {
    // listen for search field value changes
    filterCtrl.valueChanges
      .pipe (takeUntil (this._onDestroy))
      .subscribe (() => {
        this.filterVariables (filterCtrl);
      });
  }

  filterVariables(filterCtrl): void
  {
    if (!this.data.values.chartColumnOptions)
      return;

    // get the search keyword
    let search = filterCtrl.value;
    if (!search)
    {
      this.filteredVariables.next (this.data.values.chartColumnOptions.slice ());
      return;
    }

    search = search.toLowerCase ();
    this.filteredVariables.next (
      this.data.values.chartColumnOptions.filter (a => a.name.toLowerCase ().indexOf (search) > -1)
    );
  }

  haveConfig(configNumber: number): boolean
  {
    let configFlag;

    switch (configNumber)
    {
      case 1:
        configFlag = ConfigFlags.LIMITVALUES;
        break;

      case 2:
        configFlag = ConfigFlags.LIMITAGGREGATOR;
        break;

      case 3:
        configFlag = ConfigFlags.CHARTCOLORS;
        break;

      case 4:
        configFlag = ConfigFlags.HEATMAPCOLOR;
        break;

      case 5:
        configFlag = ConfigFlags.THRESHOLDS;
        break;

      case 6:
        configFlag = ConfigFlags.GOALS;
        break;
    }

    return (this.data.configFlags & configFlag) ? true : false;
  }

  toggleThemeColors(): void
  {
    if (!this.data.values.paletteColors || !this.data.values.paletteColors.length)
    {
      if (this.haveConfig (4))
        this.data.values.paletteColors = JSON.parse (JSON.stringify (Themes.AmCharts[this.globals.theme].heatMapColor));
      else
        this.data.values.paletteColors = JSON.parse (JSON.stringify (Themes.AmCharts[this.globals.theme].resultColors));
    }
    else
      this.data.values.paletteColors = [];
  }
}
