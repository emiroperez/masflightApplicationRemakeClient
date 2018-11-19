import { PlanFeature } from "./PlanFeature"
import { PlanPrice } from "./PlanPrice"

export class Plan{
    "code": string;
    "name": string;    
    "features":Array<PlanFeature>;
    "prices":Array<PlanPrice>;

    constructor(code: string,name:string,features:Array<PlanFeature>,prices:Array<PlanPrice>){
        this.code=code;
        this.name=name;
        this.features=features;
        this.prices=prices;
    }
}