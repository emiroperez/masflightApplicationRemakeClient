import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Globals } from '../globals/Globals';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-msf-dashboard-control-variables',
  templateUrl: './msf-dashboard-control-variables.component.html'
})
export class MsfDashboardControlVariablesComponent {

  constructor(
    public dialogRef: MatDialogRef<MsfDashboardControlVariablesComponent>,
    public globals: Globals,
    public dialog: MatDialog,
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
      let optionCategories;

      // check if the option id matches
      if (this.data.currentOptionId != this.globals.copiedPanelInfo.optionId)
      {
        // doesn't match
        this.dialog.open (MessageComponent, {
          data: { title: "Error", message: "The copied information option doesn't match with the current panel." }
        });

        return;
      }

      // pass the arguments values
      optionCategories = JSON.parse (this.globals.copiedPanelInfo.controlVariables);

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
