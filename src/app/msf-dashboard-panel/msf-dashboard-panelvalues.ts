// Object used to mantain data values for each dashboard panel
export class MsfDashboardPanelValues {
    options:any[] = [];

    id: number;
    displayChart: boolean;
    displayInfo: boolean;
    displayForm: boolean;
    displayPic: boolean;
    chartGenerated: boolean;
    infoGenerated: boolean;
    formGenerated: boolean;
    picGenerated: boolean;

    chartName: String;
    chartColumnOptions:any[] = []; 
    currentChartType;
    currentOption: any;
    currentOptionCategories: any;

    width: number;
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
    formVariables: any[] = [];

    // palette colors used on charts
    paletteColors: string[] = [
	    "#01b0a1",
	    "#9b5e8e",
	    "#fa5751",
	    "#fd8b5a",
	    "#80cfea",
	    "#ff5900",
	    "#005eff",
	    "#ffff00",
	    "#fc636b",
	    "#ff7e00",
	    "#3d67ce",
        "#fffefe"
    ];

    chartClicked: boolean;
    chartObjectSelected: any;

    isLoading: boolean = false;
    updateTimeLeft: number = 5;
    updateIntervalSwitch: boolean = false;

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
