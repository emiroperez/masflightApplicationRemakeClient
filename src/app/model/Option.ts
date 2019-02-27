import { CategoryArguments } from "./CategoryArguments";

export class Option{
    id: any;
    order: any;
    label: string;
    icon:string;
    categoryArguments: CategoryArguments[];
    children: Option[];
    tab: string;
    baseUrl: string;



    constructor(orderIn:string,idIn:string, labelIn: string, tabsIn: string, baseUrlIn:string, iconIn:string, childrenIn: Option[], categoryArgts: CategoryArguments[]){
        this.order = orderIn;
        this.id = idIn;
        this.label = labelIn;
        this.tab = tabsIn;
        this.children = childrenIn
        this.icon = iconIn;
        this.categoryArguments = categoryArgts;
        this.baseUrl = baseUrlIn;
    }


}
