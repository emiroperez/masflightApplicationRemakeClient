import { Pipe, PipeTransform } from '@angular/core';

import { ChartFlags } from './msf-dashboard-chartflags';

@Pipe({
    name: 'panelTypeFilter',
    pure: false
})
export class MsfDashboardPanelTypePipe implements PipeTransform
{
    transform(items: any[], currentApplicationName: string): any[]
    {
        // filter out the map option if the application is not masFlight
        return items.filter (item => ((!(item.flags & ChartFlags.MAP) && currentApplicationName !== "masFlight")
            || (currentApplicationName === "masFlight")));
    }
}
