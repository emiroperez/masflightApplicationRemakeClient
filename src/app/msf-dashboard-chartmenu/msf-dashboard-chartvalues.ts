import { AmChart } from '@amcharts/amcharts3-angular';

// Object used to mantain data values for each dashboard chart component
export class MsfDashboardChartValues {
    options:any[] = [];

    chart2: AmChart;
    displayChart: boolean;
    chartGenerated: boolean;

    chartName: String;
    currentOptionUrl: String;
    currentChartType;
    currentOption: any;
    currentOptionCategories: any;

    variable;
    xaxis;
    valueColumn;
    function;

    constructor(options: any[], chartName: String, displayChart?, currentOptionUrl?: String,
        currentChartType?, currentOption?: any, currentOptionCategories?: any, variable?, xaxis?,
        valueColumn?, func?, chart2?: AmChart, chartGenerated?: boolean)
    {
        this.options = options;

        // optional parameters, only used when querying for the dashboard tables
        this.displayChart = displayChart;
        this.chartName = chartName;
        this.currentOptionUrl = currentOptionUrl;
        this.currentChartType = currentChartType;
        this.currentOption = currentOption;
        this.currentOptionCategories = currentOptionCategories;
        this.variable = variable;
        this.xaxis = xaxis;
        this.valueColumn = valueColumn;
        this.function = func;
        this.chart2 = chart2;
        this.chartGenerated = chartGenerated;
    }
}
