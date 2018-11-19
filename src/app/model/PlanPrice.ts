export class PlanPrice{
    "code": string;
    "fare": string;    
    "periodicity": string;

    constructor(code:string,fare:string,periodicity:string){
        this.code=code;
        this.fare=fare;
        if(periodicity=="M"){
            this.periodicity="month";
        }else{
            this.periodicity="year";
        }
    }
}