import * as am4core from "@amcharts/amcharts4/core";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";

// AmChart colors
const black = am4core.color ("#000000");
const darkGray = am4core.color ("#3b3b3b");
const darkGray2 = am4core.color ("#4d4d4d");
const lightGray = am4core.color ("#b2b2b2");
const lightGray2 = am4core.color ("#d2d2d2");
const white = am4core.color ("#ffffff");
const cyan = am4core.color ("#00a3e1");
const orange = am4core.color ("#eb5c1b");
const darkOrange = am4core.color ("#d54505");
const darkGreen = am4core.color ("#00be11");
const comet = am4core.color ("#585869");
const darkBlue = am4core.color ("#30303d");

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
            planeColor: cyan,
            stroke: darkBlue,
            fontColor: white
        },
        "light-theme": {
            mainTheme: am4themes_light,
            mapPolygonColor: lightGray,
            mapPolygonStroke: white,
            mapCityLabelHoverColor: darkOrange,
            mapCityColor: darkGray2,
            mapLineColor: orange,
            mapPlaneColor: orange,
            stroke: lightGray2,
            fontColor: darkGray2
        }
    };
}