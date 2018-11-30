import { PlanFeature } from "./PlanFeature"
import { PlanPrice } from "./PlanPrice"

export class Plan{
    "id": string;
    "name": string;    
    "features":Array<PlanFeature>;
    "fares":Array<PlanPrice>;
    "delete": boolean;

    constructor(){
        this.name = '';
        this.features = new Array();
        this.fares=new Array();
        this.delete=false;
    }
}