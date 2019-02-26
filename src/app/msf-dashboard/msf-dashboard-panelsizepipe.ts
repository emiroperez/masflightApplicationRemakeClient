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

        // filter out items by checking the if the value item inside the
        // array is below of the specified filter value
        return items.filter (item => item.value < filter.value);
    }
}