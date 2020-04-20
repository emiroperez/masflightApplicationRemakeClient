import { ChartFlags } from '../msf-dashboard-panel/msf-dashboard-chartflags';
import { CategoryArguments } from '../model/CategoryArguments';

// Object used to mantain data values for each dashboard panel
export class MsfDashboardPanelValues {
    options:any[] = [];

    id: number;
    chartGenerated: boolean;
    infoGenerated: boolean;
    formGenerated: boolean;
    picGenerated: boolean;
    tableGenerated: boolean;
    mapboxGenerated: boolean;
    dynTableGenerated: boolean;

    chartName: String;
    chartDescription: String;
    chartColumnOptions:any[] = []; 
    currentChartType;
    currentOption: any;
    currentOptionCategories: CategoryArguments[];
    urlImg: String;

    width: number;
    height: any;

    lastestResponse: any;

    variable: any;
    valueList: any;
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
    paletteColors: string[] = [];

    thresholds: any[];
    goals: any[];

    chartClicked: boolean;
    chartObjectSelected: any;
    chartSecondaryObjectSelected: any;

    isLoading: boolean = false;
    updateTimeLeft: number = 5;
    updateIntervalSwitch: boolean = false;

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

    minValueRange: number;
    maxValueRange: number;

    showPaginator: boolean;
    showMoreResult: boolean;
    ListSortingColumns: any = "";

    tokenResultTable: any;

    gridId: number;
    x: number;
    y: number;
    autoposition: boolean;

    constructor(options: any[], chartName: String,chartDescription: String, id: number, gridId: number, x: number, y: number, width: number, height: number, currentOption?: any, variable?: any,
        xaxis?: any, valueColumn?: any, func?: any, chartType?: any, currentOptionCategories?: any, lastestResponse?: string,
        paletteColors?: any, updateTimeInterval?: number, thresholds?: any, vertAxisName?: string, horizAxisName?: string,
        intValue?: any, startAtZero?: boolean, limitMode?: number, limitAmount?: number, ordered?: boolean,
        valueList?: any, minValueRange?: number, maxValueRange?: number, goals?: any)
    {
        this.options = options;
        this.chartName = chartName;
        this.chartDescription = chartDescription;
        this.id = id;
        this.gridId = gridId;
        this.x = x;
        this.y = y;

        if (this.gridId != null && (x == null || y == null))
            this.autoposition = true;
        else
            this.autoposition = false;

        this.currentOption = currentOption;
        this.variable = variable;
        this.xaxis = xaxis;
        this.valueColumn = valueColumn;
        this.function = func;
        this.currentChartType = chartType;
        this.width = width;
        this.height = height;

        // if (height != null)
            // this.calculatedHeight = 323 + ((height.value - 1) * 15);

        if (thresholds)
            this.thresholds = JSON.parse (thresholds);
        else
            this.thresholds = [];

        if (goals)
            this.goals = JSON.parse (goals);
        else
            this.goals = [];

        // load palette colors if there is any
        if (paletteColors)
            this.paletteColors = JSON.parse (paletteColors);

        if (lastestResponse)
        {
            if (this.currentChartType != 32)
            {
                this.lastestResponse = JSON.parse (lastestResponse);

                if (this.currentChartType == 15 && this.currentOption.metaData == 2)
                    this.flightRoutes = JSON.parse (lastestResponse);
            }
            else
            {
                this.urlImg = lastestResponse.replace (/['"]+/g, '');
                this.lastestResponse = lastestResponse;
            }
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

        this.vertAxisName = vertAxisName;
        this.horizAxisName = horizAxisName;

        this.intervalType = "ncile";

        if (intValue != null)
            this.intValue = intValue;
        else
            this.intValue = 5;

        if (startAtZero != null)
            this.startAtZero = startAtZero;
        else
            this.startAtZero = false;

        if (ordered != null)
            this.ordered = ordered;
        else
            this.ordered = true;

        this.limitMode = limitMode;
        this.limitAmount = limitAmount;

        this.valueList = valueList;

        this.minValueRange = minValueRange;
        this.maxValueRange = maxValueRange;
    }
}
