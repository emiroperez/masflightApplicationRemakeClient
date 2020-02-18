import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-component',
  templateUrl: './msf-component.component.html'
})
export class MsfComponentComponent implements OnInit {

  @Input()
  currentOption: any;

  constructor(public globals: Globals) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["currentOption"])
    {
      // parse the JSON of value1 for each argument
      for (let menuOptionArguments of this.globals.currentOption.menuOptionArguments)
      {
        for (let category of menuOptionArguments.categoryArguments)
        {
          for (let argument of category.arguments)
          {
            if (!argument.valueLoaded)
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

              if (argument.filters)
              {
                argument.filters = JSON.parse (argument.filters);

                for (let i = argument.filters.length - 1; i >= 0; i--)
                {
                  let filter = argument.filters[i];
                  let argExists = false;
        
                  for (let option of this.globals.currentOption.menuOptionArguments)
                  {
                    for (let item of option.categoryArguments)
                    {
                      if (filter.argument == item.id)
                      {
                        argument.filters[i].argument = item;        
                        argExists = true;
                        break;
                      }
                    }

                    if (argExists)
                      break;
                  }

                  if (!argExists)
                    argument.filters.splice (i, 1);
                }
              }
            }

            argument.valueLoaded = true;
          }
        }
      }
    }
  }

  orderOptionArgumentsBy(prop: string)
  {
    return this.globals.currentOption.menuOptionArguments.sort ((a, b) => a[prop] > b[prop] ? 1 : a[prop] === b[prop] ? 0 : -1);
  }

  setLoading(value: boolean): void
  {
    this.globals.isLoading = value;
  }
}
