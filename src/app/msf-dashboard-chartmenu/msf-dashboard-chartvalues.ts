// Object used to mantain data values for each dashboard panel
export class MsfDashboardChartValues {
    options:any[] = [];

    id: number;
    displayChart: boolean;
    chartGenerated: boolean;

    chartName: String;
    chartColumnOptions:any[] = []; 
    currentOptionUrl: String;
    currentChartType;
    currentOption: any;
    currentOptionCategories: any;

    lastestResponse: string;

    variable;
    xaxis;
    valueColumn;
    function;

    constructor(options: any[], chartName: String, id: number, currentOption?: any, chartColumnOptions? : any,
        variable?, xaxis?, valueColumn?, func?, chartType?, lastestResponse?: string)
    /*, displayChart?, currentOptionUrl?: String,
        currentChartType?, currentOption?: any, currentOptionCategories?: any, variable?, xaxis?,
        valueColumn?, func?, chart2?: AmChart, chartGenerated?: boolean)*/
    {
        this.options = options;
        this.chartName = chartName;
        this.id = id;
        this.currentOption = currentOption;

        // check if the following parameters are null before parsing the JSON
        if (chartColumnOptions)
            this.chartColumnOptions = JSON.parse (chartColumnOptions);
        else
            this.chartColumnOptions = null;

        if (variable)
            this.variable = JSON.parse (variable);
        else
            this.variable = null;

        if (xaxis)
            this.xaxis = JSON.parse (xaxis);
        else
            this.xaxis = null;

        if (valueColumn)
            this.valueColumn = JSON.parse (valueColumn);
        else
            this.valueColumn = null;

        if (lastestResponse)
            this.lastestResponse = JSON.parse (lastestResponse);
        else
            this.lastestResponse = null;

        if (func)
            this.function = JSON.parse (func);
        else
            this.function = null;

        if (chartType)
            this.currentChartType = JSON.parse (chartType);
        else
            this.currentChartType = null;
    }
}
