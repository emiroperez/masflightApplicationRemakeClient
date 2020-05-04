export class PlanOption {
  "id": string;
  "optionId": string;
  "delete": boolean;
  "label": string;

  constructor(){
      this.optionId='';
      this.delete=false;
      this.label='';
  }
}
