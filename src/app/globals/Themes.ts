import * as am4core from "@amcharts/amcharts4/core";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";

// AmChart colors
const black = am4core.color ("#000000");
const darkGray = am4core.color ("#3b3b3b");
const darkGray2 = am4core.color ("#4d4d4d");
const lightGray = am4core.color ("#b2b2b2");
const lightGray2 = am4core.color ("#b2b2b2");
const white = am4core.color ("#ffffff");
const cyan = am4core.color ("#00a3e1");
// const orange = am4core.color ("#eb5c1b");
const orange = am4core.color ("#003d5b");
// const darkOrange = am4core.color ("#d54505");
const darkOrange = am4core.color ("#00263E");
const darkGreen = am4core.color ("#00be11");
const darkBlue = am4core.color ("#30303d");
const blueJeans = am4core.color ("#67b7dc");
const lightBlue = am4core.color ("#01abec");

// Light theme

function am4themes_light(target)
{
    if (target instanceof am4core.InterfaceColorSet)
    {
        target.setFor ("secondaryButton", lightGray.lighten (0.25));
        target.setFor ("secondaryButtonHover", lightGray);
        target.setFor ("secondaryButtonDown", lightGray);
        target.setFor ("secondaryButtonActive", lightGray);
        target.setFor ("secondaryButtonText", black);
        target.setFor ("secondaryButtonStroke", lightGray.lighten (-0.15));
        target.setFor ("alternativeBackground", black);
        target.setFor ("primaryButton", orange);
        target.setFor ("primaryButtonHover", darkOrange);
        target.setFor ("primaryButtonDown", darkOrange);
        target.setFor ("primaryButtonActive", darkOrange);
    }
}

export class Themes {
    public static AmCharts: any = {
        "dark-theme": {
            mainTheme: am4themes_dark,
            mapPolygonColor: darkGray,
            mapPolygonStroke: black,
            mapCityColor: white,
            mapCityLabelHoverColor: darkGreen,
            mapLineColor: cyan,
            mapPlaneColor: cyan,
            tooltipFill: black,
            ticks: darkBlue,
            stroke: darkBlue,
            fontColor: white,
            chartZoomScrollBar: blueJeans,
            axisTooltipFontColor: white,
            sumStroke: white,
            barHoverOpacity: 0.3,
            heatMapColors: [
                "#dddddd",
                "#01abec"
            ],
            resultColors: [
                "#00defa",
                "#6b94fc",
                "#a769f6",
                "#51e9bd",
                "#00aca9",
                "#136ffc",
                "#8436ff",
                "#c767dc",
                "#dc677e",
                "#dc4238",
                "#ff8b3b",
                "#f3ba25",
                "#ffdb7c"
            ]
        },
        "light-theme": {
            mainTheme: am4themes_light,
            mapPolygonColor: lightGray2,
            mapPolygonStroke: white,
            mapCityLabelHoverColor: darkOrange,
            mapCityColor: darkGray2,
            mapLineColor: orange,
            mapPlaneColor: orange,
            tooltipFill: white,
            ticks: lightGray,
            stroke: lightGray.lighten (0.65),
            fontColor: darkGray2,
            chartZoomScrollBar: orange,
            axisTooltipFontColor: black,
            sumStroke: darkGray,
            barHoverOpacity: 0.1,
            heatMapColors: [
                "#ffffff",
                "#003d5b"
            ],
            resultColors: [
                "#4f933b",
                "#00ca77",
                "#00a68b",
                "#136fc1",
                "#6b94fc",
                "#a769f6",
                "#8436ff",
                "#c767dc",
                "#dc677e",
                "#dc4238",
                "#ff7242",
                "#ffc54f",
                "#8bcccc"
            ]
        }
    };
}
