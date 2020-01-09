import * as am4core from "@amcharts/amcharts4/core";

export class AmChartConfig
{
    public static Init(): void
    {
        am4core.options.commercialLicense = true;

        // set some optimizations to avoid slowdowns
        am4core.options.minPolylineStep = 5;
        am4core.options.onlyShowOnViewport = true;
    }
}