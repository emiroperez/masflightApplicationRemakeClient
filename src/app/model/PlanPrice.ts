export class PlanPrice{
    "id": string;
    "fare": string;    
    "periodicity": string;
    "delete":boolean;

    constructor(){
        this.fare='';
        this.periodicity='';
        this.delete=false;
    }
}