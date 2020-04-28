import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-msf-dashboard-value-selector-dialog',
  templateUrl: './msf-dashboard-value-selector-dialog.component.html'
})
export class MsfDashboardValueSelectorDialogComponent
{
  valueListInfo: any[] = [];

  constructor(public dialogRef: MatDialogRef<MsfDashboardValueSelectorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    if (data.values.valueListInfo && data.values.valueListInfo.length)
    {
      for (let i = 0; i < data.values.valueListInfo.length; i++)
      {
        let valueInfo = data.values.valueListInfo[i];
        let curValue = data.values.valueList[i];

        this.valueListInfo.push ({
          name: curValue.name,
          function: valueInfo.function,
          axis: valueInfo.axis
        });
      }

      this.data.values.valueListInfo = this.valueListInfo;
    }
  }

  updateValueListInfo(): void
  {
    let tempValueListInfo = JSON.parse (JSON.stringify (this.valueListInfo));

    this.valueListInfo = [];

    for (let i = 0; i < this.data.values.valueList.length; i++)
    {
      let value = this.data.values.valueList[i];

      this.valueListInfo.push ({
        name: value.name,
        function: tempValueListInfo[i] ? tempValueListInfo[i].function : 0,
        axis: tempValueListInfo[i] ? tempValueListInfo[i].axis : (!i ? true : false)
      });      
    }

    this.data.values.valueListInfo = this.valueListInfo;
  }

  updateMainFunction(index): void
  {
    if (index)
      return;

    this.data.values.function = this.data.functions[this.data.values.valueListInfo[0].function];
  }

  onNoClick(): void
  {
    this.dialogRef.close ();
  }
}
