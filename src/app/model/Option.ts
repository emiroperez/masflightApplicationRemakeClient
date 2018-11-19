import { CategoryArguments } from "./CategoryArguments";

export class Option{
    id: any;
    label: string;
    icon:string;
    categoryArguments: CategoryArguments[];
    children: Option[];
    tab: string;
    baseUrl: string;



    constructor(idIn:string, labelIn: string, tabsIn: string, baseUrlIn:string, iconIn:string, childrenIn: Option[], categoryArgts: CategoryArguments[]){
        this.id = idIn;
        this.label = labelIn;
        this.tab = tabsIn;
        this.children = childrenIn
        this.icon = iconIn;
        this.categoryArguments = categoryArgts;
        this.baseUrl = baseUrlIn;
    }


}