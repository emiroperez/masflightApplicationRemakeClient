import { Component, OnInit } from '@angular/core';
import {FormControl, Validators,ValidatorFn, ValidationErrors, AbstractControl, FormGroup,FormArray, FormBuilder} from '@angular/forms';
import { Globals } from '../globals/Globals';
import { Utils } from '../commons/utils';
import { Plan } from '../model/Plan';
import { PlanFeature } from "../model/PlanFeature"
import { PlanFeatureOption } from "../model/PlanFeatureOption"
import { PlanPrice } from "../model/PlanPrice"
import { PlanService } from '../services/plan.service';
import { NG_SELECT_DEFAULT_CONFIG } from '@ng-select/ng-select';

@Component({
  selector: 'app-create-memperships',
  templateUrl: './create-memperships.component.html',
  providers: [
    {
        provide: NG_SELECT_DEFAULT_CONFIG,
        useValue: {
            notFoundText: 'There is no options'
        }
    }
  ]
})
export class CreateMempershipsComponent implements OnInit {
  utils: Utils;

  plansForms: FormGroup;
  items: FormArray;
  features:FormArray;
  prices:FormArray;

  periodicities = [
    {label: 'Month',code:'M'},
    {label: 'Year',code:'Y'}];


  constructor(private planServices:PlanService,private globals: Globals,private formBuilder: FormBuilder) {
    this.utils = new Utils();
   }


  ngOnInit() {
    this.plansForms= this.formBuilder.group({
      items:this.formBuilder.array([])
    })
  }

  createPlan(): FormGroup{
    return this.formBuilder.group({
      name: new FormControl('',[Validators.required]),
      id :'',
      features: this.formBuilder.array([this.createFeature()]),
      fares: this.formBuilder.array([this.createPrice()])
    });
  }

  addNewPlan(): void{
   this.items=this.plansForms.get('items') as FormArray;
   this.items.push(this.createPlan());
  }

  deletePlan(index) {
    this.items=this.plansForms.get('items') as FormArray;
    this.items.removeAt(index);
  }
  getPlansJson(){
    let plansJsons : Array<Plan>=new Array();
    this.items=this.plansForms.get('items') as FormArray;

    for(let i=0; i< this.items.length; i++){
      let plan:Plan= new Plan();

      if(this.items.at(i).get("id").value!=''){
        plan.id=this.items.at(i).get("id").value;
      }else{
        plan.id=null;
      }
      plan.name=this.items.at(i).get("name").value.toUpperCase();

      plan.features = this.getFeaturesJson(i);
      plan.fares = this.getPricesJson(i);
      plansJsons.push(plan);
    } 
    return plansJsons;
  }

  getPlanFeatures(index): FormArray{
    this.items=this.plansForms.get('items') as FormArray;
    this.features =this.items.controls[index]['controls']['features']['controls'];
    return this.features;
  }

  createFeature(): FormGroup{
    return this.formBuilder.group({
      id :'',
      name: new FormControl('',[Validators.required]),
      description: new FormControl('',[Validators.required])
    })
  }
  addNewFeature(index): void{
    this.items=this.plansForms.get('items') as FormArray;
    this.features=this.items.controls[index]['controls']['features'];
    this.features.push(this.createFeature());  
    
  }

  deleteFeature(indexPlan,indexFeature) {
    this.items=this.plansForms.get('items') as FormArray;
    this.features=this.items.controls[indexPlan]['controls']['features'];
    this.features.removeAt(indexFeature);
  }
  getFeaturesJson(index){
    this.items=this.plansForms.get('items') as FormArray;
    this.features=this.items.controls[index]['controls']['features'];
    let featuresJson : Array<PlanFeature> = new Array();
    for(let i=0; i< this.features.length; i++){
      let feature: PlanFeature=new PlanFeature();
      if(this.features.at(i).get("id").value!=''){
        feature.id=this.features.at(i).get("id").value;
      }else{
        feature.id=null;
      }

      feature.features = this.features.at(i).get("name").value;
      feature.options= this.getFeatureOptions(this.features.at(i).get("description").value);
      featuresJson.push(feature)
    }
    return featuresJson;

  }

  getFeatureOptions(options): Array<PlanFeatureOption>{
    let optionsArray : Array<string>= options.split(",");
    let planFeatureOptions: Array<PlanFeatureOption> = new Array();
    optionsArray.forEach(option => {
      let featureOption : PlanFeatureOption = new PlanFeatureOption()
      featureOption.optionName = option; 
      planFeatureOptions.push(featureOption);
    });
    return planFeatureOptions;
  }

  getPlanPrices(index):FormArray{
    this.items=this.plansForms.get('items') as FormArray;
    this.prices =this.items.controls[index]['controls']['fares']['controls'];
    return this.prices;
  }

  createPrice(): FormGroup{
    return this.formBuilder.group({
      id :'',
      fare: new FormControl('',[Validators.required]),
      periodicity: new FormControl(null,[Validators.required])
    });
  }

  addNewPrice(index): void{
    this.items=this.plansForms.get('items') as FormArray;
    this.prices=this.items.controls[index]['controls']['fares'];
    this.prices.push(this.createPrice());   
  }

  deletePrice(indexPlan,indexFeature) {
    this.items=this.plansForms.get('items') as FormArray;
    this.prices=this.items.controls[indexPlan]['controls']['fares'];
    this.prices.removeAt(indexFeature);
  }

  getPricesJson(index){
    this.items=this.plansForms.get('items') as FormArray;
    this.prices =this.items.controls[index]['controls']['fares'];
    let pricesJson : Array<PlanPrice> = new Array();
    for(let i=0; i< this.prices.length; i++){
      let fare: PlanPrice=new PlanPrice();

      if(this.prices.at(i).get("id").value!=''){
        fare.id=this.prices.at(i).get("id").value;
      }else{
        fare.id=null;
      }
      fare.fare = this.prices.at(i).get("fare").value;
      fare.periodicity= this.prices.at(i).get("periodicity").value;
      pricesJson.push(fare)
    }
    return pricesJson;
    

  }
  getOptionsText(options: any[]){
    let text="";
    let i = 0;
    for(let option of options){
      if(i == 0){
        text += ' ' + option.optionName;
      }else if(i === options.length -1 ){
        text += ' and ' + option.optionName;
      }else{
        text += ', ' + option.optionName;
      }
      i++;
    }
    return text;
  }

  getPeriodicityText(periodicity){
    if( periodicity === 'M'){
      return 'MONTH';
    }
    return 'YEAR'
  }

  savePlans(){
    this.items=this.plansForms.get('items') as FormArray;
    if(this.plansForms.valid && this.items.length > 0){
      console.log(this.getPlansJson());
      this.planServices.savePlans(this,this.getPlansJson(), this.savePlansResponse,this.errorHandleResponse);
    }

  }

  savePlansResponse(this_,data){
    console.log(data);
    this_.items=this_.plansForms.get('items') as FormArray;
    for(let i=0; i< this_.items.length; i++){
      this_.items.at(i).get("id").value=data[i].id;

      this_.prices =this_.items.controls[i]['controls']['fares'];
      for(let j=0; j< this_.prices.length; j++){
        this_.prices.at(j).get("id").value=data[i].fares[j];
      }
      this_.features=this_.items.controls[i]['controls']['features'];
      for(let j=0; j< this_.features.length; j++){
        this_.features.at(j).get("id").value=data[i].features[j];
      }
    }
    console.log(this_.items); 
  }

  errorHandleResponse(){

  }

}
