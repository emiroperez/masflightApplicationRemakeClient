// Object used to mantain data values for each dashboard panel
export class MsfDashboardChartValues {
    options:any[] = [];

    id: number;
    displayChart: boolean;
    displayInfo: boolean;
    chartGenerated: boolean;
    infoGenerated: boolean;

    chartName: String;
    chartColumnOptions:any[] = []; 
    currentChartType;
    currentOption: any;
    currentOptionCategories: any;

    width: any;
    height: any;

    lastestResponse: any;

    variable: any;
    xaxis: any;
    valueColumn: any;
    function: any;

    infoVar1: any;
    infoVar2: any;
    infoVar3: any;
    infoFunc1: any;
    infoFunc2: any;
    infoFunc3: any;

    // values used for the information panel
    infoNumVariables: number;

    // palette colors used on charts
    paletteColors: string[] = [
	    "#01B0A1",
	    "#9B5E8E",
	    "#FA5751",
	    "#FD8B5A",
	    "#80CFEA",
	    "#FF5900",
	    "#005EFF",
	    "#FFFF00",
	    "#FC636B",
	    "#FF7E00",
	    "#3D67CE",
        "#FFFEFE"
    ];

    constructor(options: any[], chartName: String, id: number, width: any, height: any, currentOption?: any, chartColumnOptions? : any,
        variable?: any, xaxis?: any, valueColumn?: any, func?: any, chartType?: any, currentOptionCategories?: any, lastestResponse?: string,
        paletteColors?: any)
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

        // load palette colors if there is any
        if (paletteColors)
            this.paletteColors = JSON.parse (paletteColors);

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
