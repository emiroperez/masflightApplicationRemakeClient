export class PlanAdvanceFeatures{
    id : string;
    planId : string;
    advanceFeatureId : string;
    delete : boolean;

    constructor() {
        this.advanceFeatureId = '';
        this.delete = false;
    }
}
