import { Pipe, PipeTransform } from '@angular/core';

import { ChartFlags } from './msf-dashboard-chartflags';

@Pipe({
    name: 'panelOptionFilter',
    pure: false
})
export class MsfDashboardPanelOptionPipe implements PipeTransform
{
    transform(items: any[], currentChartType: any): any[]
    {
        // filter out options that doesn't use the schedule maps if the map panel type is selected
        return items.filter (item => ((item.metaData == 2 && currentChartType.flags & ChartFlags.MAP)
            || !(currentChartType.flags & ChartFlags.MAP) || (currentChartType.flags & ChartFlags.MAPBOX)));
    }
}
