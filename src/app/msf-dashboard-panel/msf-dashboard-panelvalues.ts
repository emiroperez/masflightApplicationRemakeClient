import { ChartFlags } from '../msf-dashboard-panel/msf-dashboard-chartflags';
import { CategoryArguments } from '../model/CategoryArguments';

// Object used to mantain data values for each dashboard panel
export class MsfDashboardPanelValues {
    options:any[] = [];

    id: number;
    displayChart: boolean;
    displayInfo: boolean;
    displayForm: boolean;
    displayPic: boolean;
    displayTable: boolean;
    displayMapbox: boolean;
    displayDynTable: boolean;
    chartGenerated: boolean;
    infoGenerated: boolean;
    formGenerated: boolean;
    picGenerated: boolean;
    tableGenerated: boolean;
    mapboxGenerated: boolean;
    dynTableGenerated: boolean;

    chartName: String;
    chartColumnOptions:any[] = []; 
    currentChartType;
    currentOption: any;
    currentOptionCategories: CategoryArguments[];

    width: number;
    height: any;

    lastestResponse: any;

    variable: any;
    xaxis: any;
    valueColumn: any;
    function: any;
    geodata: any;
    style: any;

    infoVar1: any;
    infoVar2: any;
    infoVar3: any;
    infoFunc1: any;
    infoFunc2: any;
    infoFunc3: any;

    // values used for the information panel
    infoNumVariables: number;
    formVariables: any[] = [];

    // values used for the table panel
    tableVariables: any[] = [];

    // values used for the dynamic table panel
    dynTableVariables: any[] = [];
    dynTableValues: any;

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

    thresholds: any[];

    chartClicked: boolean;
    chartObjectSelected: any;
    chartSecondaryObjectSelected: any;

    isLoading: boolean = false;
    updateTimeLeft: number = 5;
    updateIntervalSwitch: boolean = false;

    row: number;
    childPanels: any[] = [];
    flightRoutes: any[] = [];

    calculatedHeight: number;
    chartSeries: any[] = [];

    vertAxisName: string;
    horizAxisName: string;

    startAtZero: boolean;
    ordered: boolean;

    // values used for advanced charts
    intervalType: string;
    intValue: any;

    limitMode: number;
    limitAmount: number;

    constructor(options: any[], chartName: String, id: number, width: any, height: any, currentOption?: any, variable?: any,
        xaxis?: any, valueColumn?: any, func?: any, chartType?: any, currentOptionCategories?: any, lastestResponse?: string,
        paletteColors?: any, updateTimeInterval?: number, row?: number, thresholds?: any, vertAxisName?: string, horizAxisName?: string,
        intValue?: any, startAtZero?: boolean, limitMode?: number, limitAmount?: number, ordered?: boolean)
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

        if (height != null)
            this.calculatedHeight = 323 + ((height.value - 1) * 15);

        if (thresholds)
            this.thresholds = JSON.parse (thresholds);
        else
            this.thresholds = [];

        // load palette colors if there is any
        if (paletteColors)
            this.paletteColors = JSON.parse (paletteColors);

        if (lastestResponse)
        {
            this.lastestResponse = JSON.parse (lastestResponse);

            if (this.currentChartType == 15)
                this.flightRoutes = JSON.parse (lastestResponse);
        }
        else
            this.lastestResponse = null;

        if (currentOptionCategories)
            this.currentOptionCategories = JSON.parse (currentOptionCategories);
        else
            this.currentOptionCategories = null;

        if (updateTimeInterval)
        {
            this.updateTimeLeft = updateTimeInterval;
            this.updateIntervalSwitch = true;
        }

        this.row = row;

        this.vertAxisName = vertAxisName;
        this.horizAxisName = horizAxisName;

        this.intervalType = "ncile";

        if (intValue)
            this.intValue = intValue;
        else
            this.intValue = 5;

        if (startAtZero)
            this.startAtZero = startAtZero;
        else
            this.startAtZero = false;

        if (ordered)
            this.ordered = ordered;
        else
            this.ordered = true;

        this.limitMode = limitMode;
        this.limitAmount = limitAmount;
    }
}
