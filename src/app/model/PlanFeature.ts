import { PlanFeatureOption } from "./PlanFeatureOption"

export class PlanFeature{
    "id": string;
    "features": string;    
    "options": Array<PlanFeatureOption>;

    constructor(){
        this.features='';
        this.options=new Array();
    }
}