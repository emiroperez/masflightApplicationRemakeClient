import * as am4core from "@amcharts/amcharts4/core";

export class AmChartConfig
{
    public static Init(): void
    {
        am4core.options.queue = true;
    }
}
