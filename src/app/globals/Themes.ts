import * as am4core from "@amcharts/amcharts4/core";

// AmChart colors
const black = am4core.color ("#000000");
const darkGray = am4core.color ("#3b3b3b");
const darkGray2 = am4core.color ("#4d4d4d");
const lightGray = am4core.color ("#b2b2b2");
const lightSkyBlue = am4core.color ("#a1c0df");
const white = am4core.color ("#ffffff");
const cyan = am4core.color ("#00a3e1");
const prussianBlue = am4core.color ("#003d5b");
const tangaroa = am4core.color ("#00263E");
const darkGreen = am4core.color ("#00be11");
const darkBlue = am4core.color ("#30303d");
const blueJeans = am4core.color ("#67b7dc");
const deepSkyBlue = am4core.color ("#01abec");

// Light theme

function am4themes_light(target)
{
    if (target instanceof am4core.InterfaceColorSet)
    {
        target.setFor ("secondaryButton", lightGray);
        target.setFor ("secondaryButtonHover", lightGray.lighten (-0.25));
        target.setFor ("secondaryButtonDown", lightGray.lighten (-0.35));
        target.setFor ("secondaryButtonActive", lightGray.lighten (0.35));
        target.setFor ("secondaryButtonText", black);
        target.setFor ("secondaryButtonStroke", lightGray.lighten (-0.15));
        target.setFor ("alternativeText", darkGray2);
        target.setFor ("alternativeBackground", black);
        target.setFor ("background", white);
        target.setFor ("primaryButton", prussianBlue);
        target.setFor ("text", darkGray2);
        target.setFor ("primaryButtonHover", prussianBlue.lighten (-0.15));
        target.setFor ("primaryButtonDown", prussianBlue.lighten (-0.25));
        target.setFor ("primaryButtonActive", prussianBlue.lighten (-0.25));
    }
}

function am4themes_masFlightDark(target)
{
    if (target instanceof am4core.InterfaceColorSet)
    {
        target.setFor ("secondaryButton", darkGray);
        target.setFor ("secondaryButtonHover", darkGray.lighten (0.1));
        target.setFor ("secondaryButtonDown", darkGray.lighten (0.15));
        target.setFor ("secondaryButtonActive", darkGray.lighten (0.15));
        target.setFor ("secondaryButtonText", darkGray);
        target.setFor ("secondaryButtonStroke", darkGray.lighten (-0.2));
        target.setFor ("alternativeText", black);
        target.setFor ("alternativeBackground", white);
        target.setFor ("background", black);
        target.setFor ("text", white);
        target.setFor ("primaryButton", deepSkyBlue);
        target.setFor ("primaryButtonHover", deepSkyBlue.lighten (-0.15));
        target.setFor ("primaryButtonDown", deepSkyBlue.lighten (-0.25));
        target.setFor ("primaryButtonActive", deepSkyBlue.lighten (-0.25));
    }
}

export class Themes {
    public static AmCharts: any = {
        "dark-theme": {
            mainTheme: am4themes_masFlightDark,
            mapPolygonColor: darkGray,
            mapPolygonStroke: black,
            mapCityColor: white,
            mapCityLabelHoverColor: darkGreen,
            mapLineColor: [
                cyan,
                am4core.color ("#dc4238"),
                am4core.color ("#74d15e"),
                am4core.color ("#f3ba25"),
                am4core.color ("#c767dc"),
                am4core.color ("#ff8b3b")
            ],
            mapPlaneColor: cyan,
            tooltipFill: black,
            ticks: darkBlue,
            stroke: darkBlue,
            fontColor: white,
            chartZoomScrollBar: blueJeans,
            axisTooltipFontColor: white,
            sumStroke: white,
            barHoverOpacity: 0.3,
            animSliderColor: darkGray,
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
            mapPolygonColor: lightSkyBlue,
            mapPolygonStroke: white,
            mapCityLabelHoverColor: tangaroa,
            mapCityColor: darkGray2,
            mapLineColor: [
                prussianBlue,
                am4core.color ("#911109"),
                am4core.color ("#156302"),
                am4core.color ("#a37500"),
                am4core.color ("#6d1980")
            ],
            mapPlaneColor: prussianBlue,
            tooltipFill: white,
            ticks: lightGray,
            stroke: lightGray.lighten (0.65),
            fontColor: darkGray2,
            chartZoomScrollBar: prussianBlue,
            axisTooltipFontColor: black,
            sumStroke: darkGray,
            barHoverOpacity: 0.1,
            animSliderColor: lightGray,
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
