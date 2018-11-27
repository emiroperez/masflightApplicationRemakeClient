import { PlanFeature } from "./PlanFeature"
import { PlanPrice } from "./PlanPrice"

export class Plan{
    "id": string;
    "name": string;    
    "features":Array<PlanFeature>;
    "fares":Array<PlanPrice>;

    constructor(){
        this.name = '';
        this.features = new Array();
        this.fares=new Array();
    }
}