// Object used to mantain data values for each dashboard chart component
export class MsfDashboardChartValues {
    options:any[] = [];

    displayChart: boolean;

    currentOptionUrl: String;
    currentChartType;
    currentOption: any;
    currentOptionCategories: any;

    variable;
    xaxis;
    valueColumn;
    function;

    constructor(options: any[], displayChart?, currentOptionUrl?, currentChartType?,
        currentOption?: any, currentOptionCategories?: any, variable?, xaxis?, valueColumn?,
        func?)
    {
        this.options = options;

        // optional parameters, only used when querying for the dashboard tables
        this.displayChart = displayChart;
        this.currentOptionUrl = currentOptionUrl;
        this.currentChartType = currentChartType;
        this.currentOption = currentOption;
        this.currentOptionCategories = currentOptionCategories;
        this.variable = variable;
        this.xaxis = xaxis;
        this.valueColumn = valueColumn;
        this.function = func;
    }
}
