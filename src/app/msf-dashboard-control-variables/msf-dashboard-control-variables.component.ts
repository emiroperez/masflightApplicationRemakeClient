import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-dashboard-control-variables',
  templateUrl: './msf-dashboard-control-variables.component.html'
})
export class MsfDashboardControlVariablesComponent {

  constructor(
    public dialogRef: MatDialogRef<MsfDashboardControlVariablesComponent>,
    public globals: Globals,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  onNoClick(): void
  {
    this.dialogRef.close ();
  }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }

  pasteControlVariables(): void
  {
    let optionCategories = JSON.parse (this.globals.copiedPanelInfo);

    // pass the arguments values
    for (let optionCategory of this.data.currentOptionCategories)
    {
      for (let curOptionCategory of optionCategories)
      {
        if (curOptionCategory.id == optionCategory.id)
        {
          for (let curCategoryArgument of curOptionCategory.arguments)
          {
            for (let argument of optionCategory.arguments)
            {
              if (curCategoryArgument.id == argument.id)
              {
                argument.value1 = curCategoryArgument.value1;
                argument.value2 = curCategoryArgument.value2;
                argument.value3 = curCategoryArgument.value3;
                argument.value4 = curCategoryArgument.value4;
                break;
              }
            }
          }

          break;
        }
      }
    }
  }
}
