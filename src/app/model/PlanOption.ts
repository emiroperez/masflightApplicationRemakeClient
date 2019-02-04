export class PlanOption{
  "id": string;
  "optionId": string;
  "planId": string;
  "delete":boolean;

  constructor(){
      this.optionId='';
      this.delete=false;
      this.planId='';
  }
}
