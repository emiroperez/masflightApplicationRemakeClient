import { Pipe, PipeTransform } from '@angular/core';

import { ChartFlags } from '../msf-dashboard-panel/msf-dashboard-chartflags';

@Pipe({
    name: 'noInformationTypes',
    pure: false
})
export class MsfDashboardChartTypePipe implements PipeTransform
{
    transform(items: any[]): any[]
    {
        // filter out information panel "chart" types
        return items.filter (item => !(item.flags & ChartFlags.INFO));
    }
}