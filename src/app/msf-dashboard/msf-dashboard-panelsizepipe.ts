import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'panelSizeFilter',
    pure: false
})
export class MsfDashboardPanelSizePipe implements PipeTransform
{
    transform(items: any[], filter: any): any[]
    {
        if (filter === undefined)
            return items;

        // filter out items by checking the name of the array list to be checked
        return items.filter (item => !item.name.includes (filter.name));
    }
}