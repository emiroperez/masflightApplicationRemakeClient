import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { CategoryArguments } from '../model/CategoryArguments';
import { Arguments } from '../model/Arguments';
import { ComponentType } from '../commons/ComponentType';

@Component({
  selector: 'app-msf-dashboard-control-variables',
  templateUrl: './msf-dashboard-control-variables.component.html'
})
export class MsfDashboardControlVariablesComponent {
  isLoading: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<MsfDashboardControlVariablesComponent>,
    public globals: Globals,
    private service: ApplicationService,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.service.loadOptionCategoryArguments (this, this.data.currentOptionId,
      this.setCategories, this.handlerError);
  }

  setCategories(_this, data): void
  {
    let optionCategories = [];

    data = data.sort ((a, b) => a["position"] > b["position"] ? 1 : a["position"] === b["position"] ? 0 : -1);

    for (let optionCategory of data)
    {
      for (let category of optionCategory.categoryArgumentsId)
      {
        for (let argument of category.arguments)
        {
          if (argument.value1)
            argument.value1 = JSON.parse (argument.value1);

          if (argument.value2)
            argument.value2 = JSON.parse (argument.value2);

          if (argument.value3)
            argument.value3 = JSON.parse (argument.value3);

          if (argument.value4)
            argument.value4 = JSON.parse (argument.value4);

          if (argument.dateLoaded)
            argument.dateLoaded = JSON.parse (argument.dateLoaded);

          if (argument.currentDateRangeValue)
            argument.currentDateRangeValue = JSON.parse (argument.currentDateRangeValue);

          if (argument.minDate)
            argument.minDate = new Date (argument.minDate);
    
          if (argument.maxDate)
            argument.maxDate = new Date (argument.maxDate);
        }

        optionCategories.push (category);
      }
    }

    // if the category is not empty, add the categories that are missing
    if (_this.data.currentOptionCategories != null)
    {
      for (let optionCategory of optionCategories)
      {
        for (let curOptionCategory of _this.data.currentOptionCategories)
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
                  argument.dateLoaded = curCategoryArgument.dateLoaded;
                  argument.currentDateRangeValue = curCategoryArgument.currentDateRangeValue;
                  break;
                }
              }
            }

            break;
          }
        }
      }
    }

    _this.data.currentOptionCategories = optionCategories;

    // workaround to prevent errors on certain data forms
    if (!_this.haveSortingCheckboxes ())
      _this.isLoading = false;
  }

  handlerError(_this): void
  {
    _this.dialogRef.close ({
      error: true
    });
  }

  haveSortingCheckboxes(): boolean
  {
    let currentOptionCategories = this.data.currentOptionCategories;
    let result = false;

    if (currentOptionCategories)
    {            
      for (let i = 0; i < currentOptionCategories.length; i++)
      {
        let category: CategoryArguments = currentOptionCategories[i];

        if (category && category.arguments)
        {
          for (let j = 0; j < category.arguments.length; j++)
          {
            let argument: Arguments = category.arguments[j];
            if (ComponentType.sortingCheckboxes == argument.type)
            {
              result = true;
              break;
            }
          }
        }

        if (result)
          break;
      }
    }

    return result;
  }

  onNoClick(): void
  {
    this.dialogRef.close ();
  }

  saveChanges(): void
  {
    this.dialogRef.close ({
      error: false,
      currentOptionCategories: this.data.currentOptionCategories
    });
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
                argument.dateLoaded = curCategoryArgument.dateLoaded;
                argument.currentDateRangeValue = curCategoryArgument.currentDateRangeValue;
                break;
              }
            }
          }

          break;
        }
      }
    }
  }

  setLoading(value: boolean): void
  {
    this.isLoading = value;
  }
}
