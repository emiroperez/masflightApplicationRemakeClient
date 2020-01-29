import * as am4core from "@amcharts/amcharts4/core";

export class AmChartConfig
{
    public static Init(): void
    {
        // set some optimizations to avoid slowdowns
        am4core.options.commercialLicense = true;
        am4core.options.queue = true;
        am4core.options.onlyShowOnViewport = true;
        am4core.options.minPolylineStep = 5;
    }
}