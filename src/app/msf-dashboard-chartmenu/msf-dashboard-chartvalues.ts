// Object used to mantain data values for each dashboard panel
export class MsfDashboardChartValues {
    options:any[] = [];

    id: number;
    displayChart: boolean;
    chartGenerated: boolean;

    chartName: String;
    chartColumnOptions:any[] = []; 
    currentChartType;
    currentOption: any;
    currentOptionCategories: any;

    width: any;
    height: any;

    lastestResponse: string;

    variable;
    xaxis;
    valueColumn;
    function;

    constructor(options: any[], chartName: String, id: number, width: any, height: any, currentOption?: any, chartColumnOptions? : any,
        variable?, xaxis?, valueColumn?, func?, chartType?, currentOptionCategories?: any, lastestResponse?: string)
    {
        this.options = options;
        this.chartName = chartName;
        this.id = id;
        this.currentOption = currentOption;
        this.variable = variable;
        this.xaxis = xaxis;
        this.valueColumn = valueColumn;
        this.function = func;
        this.currentChartType = chartType;
        this.width = width;
        this.height = height;

        // check if the following parameters are null before parsing the JSON
        if (chartColumnOptions)
            this.chartColumnOptions = JSON.parse (chartColumnOptions);
        else
            this.chartColumnOptions = null;

        if (lastestResponse)
            this.lastestResponse = JSON.parse (lastestResponse);
        else
            this.lastestResponse = null;

        if (currentOptionCategories)
            this.currentOptionCategories = JSON.parse (currentOptionCategories);
        else
            this.currentOptionCategories = null;
    }
}
