// Object used to mantain data values for each dashboard chart component
export class MsfDashboardChartValues {
    options:any[] = [];

    displayChart: boolean = false;

    currentOptionUrl: String;
    currentChartType;
    currentOption: any;
    currentOptionCategories: any;

    variable;
    xaxis;
    valueColunm;
    function;

    constructor(options: any[])
    {
        this.options = options;
        this.currentChartType = null;
    }
}
