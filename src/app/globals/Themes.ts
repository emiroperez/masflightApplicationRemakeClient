import * as am4core from "@amcharts/amcharts4/core";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";

// AmChart colors
const black = am4core.color ("#000000");
const darkGray = am4core.color ("#3b3b3b");
const darkGray2 = am4core.color ("#4d4d4d");
const lightGray = am4core.color ("#b2b2b2");
const white = am4core.color ("#ffffff");
const cyan = am4core.color ("#00a3e1");
const orange = am4core.color ("#eb5c1b");
const darkOrange = am4core.color ("#d54505");
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
            resultColors: [
                am4core.color ("#00defa"),
                am4core.color ("#6b94fc"),
                am4core.color ("#a769f6"),
                am4core.color ("#51e9bd"),
                am4core.color ("#00aca9"),
                am4core.color ("#136ffc"),
                am4core.color ("#8436ff"),
                am4core.color ("#c767dc"),
                am4core.color ("#dc677e"),
                am4core.color ("#dc4238"),
                am4core.color ("#ff8b3b"),
                am4core.color ("#f3ba25"),
                am4core.color ("#ffdb7c")
            ]
        },
        "light-theme": {
            mainTheme: am4themes_light,
            mapPolygonColor: lightGray,
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
            resultColors: [
                am4core.color ("#00ca77"),
                am4core.color ("#ff7242"),
                am4core.color ("#ffc54f"),
                am4core.color ("#4f933b"),
                am4core.color ("#00aca9"),
                am4core.color ("#136fc1"),
                am4core.color ("#6b94fc"),
                am4core.color ("#a769f6"),
                am4core.color ("#8436ff"),
                am4core.color ("#c767dc"),
                am4core.color ("#dc677e"),
                am4core.color ("#dc4238"),
                am4core.color ("#8bcccc")
            ]
        }
    };
}