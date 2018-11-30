import { PlanFeatureOption } from "./PlanFeatureOption"

export class PlanFeature{
    "id": string;
    "features": string;    
    "options": Array<PlanFeatureOption>;
    "delete": boolean;

    constructor(){
        this.features='';
        this.options=new Array();
        this.delete=false;
    }
}