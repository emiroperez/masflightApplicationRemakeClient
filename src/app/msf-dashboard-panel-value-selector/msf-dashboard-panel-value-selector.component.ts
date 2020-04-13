import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-dashboard-panel-value-selector',
  templateUrl: './msf-dashboard-panel-value-selector.component.html'
})
export class MsfDashboardPanelValueSelectorComponent {

  constructor(public dialogRef: MatDialogRef<MsfDashboardPanelValueSelectorComponent>,
    public globals: Globals,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    if (data.valueList && data.valueList.length)
    {
      for (let item of data.valueList)
      {
        for (let column of this.data.chartColumnOptions)
        {
          if (item.id === column.columnName)
          {
            column.checked = true;
            break;
          }
        }
      }
    }
  }

  onNoClick(): void
  {
    this.dialogRef.close ();
  }

  saveChanges(): void
  {
    this.dialogRef.close (this.data.chartColumnOptions);
  }
}
