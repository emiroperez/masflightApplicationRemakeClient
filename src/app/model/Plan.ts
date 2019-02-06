import { PlanFeature } from "./PlanFeature"
import { PlanPrice } from "./PlanPrice"
import { PlanOption } from "./PlanOption"
import { PlanAdvanceFeatures} from "./PlanAdvanceFeatures";

export class Plan{
    "id": string;
    "name": string;
    "features":Array<PlanFeature>;
    "fares":Array<PlanPrice>;
    "options":Array<PlanOption>;
    "advanceFeatures":Array<PlanAdvanceFeatures>;
    "delete": boolean;

    constructor(){
        this.name = '';
        this.features = new Array();
        this.fares=new Array();
        this.options=new Array();
        this.advanceFeatures=new Array();
        this.delete=false;
    }
}
