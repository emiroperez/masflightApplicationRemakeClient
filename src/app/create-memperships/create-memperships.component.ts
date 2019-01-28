import { Component, OnInit ,Input, Inject, ViewChildren, AfterViewInit, QueryList, ChangeDetectorRef, Renderer2 } from '@angular/core';
import {FormControl, Validators,ValidatorFn, ValidationErrors, AbstractControl, FormGroup,FormArray, FormBuilder} from '@angular/forms';
import { Globals } from '../globals/Globals';
import { Utils } from '../commons/utils';
import { Plan } from '../model/Plan';
import { PlanFeature } from '../model/PlanFeature';
import { ApplicationService } from '../services/application.service';
import { PlanFeatureOption } from '../model/PlanFeatureOption';
import { PlanPrice } from '../model/PlanPrice';
import { PlanService } from '../services/plan.service';
import { NG_SELECT_DEFAULT_CONFIG } from '@ng-select/ng-select';
import { Arguments } from '../model/Arguments';
import { ApiClient } from '../api/api-client';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog-edit-options.html',
  styleUrls: ['./../admin-menu/admin-menu.component.css']
})
export class EditOptionsDialog {

  itemSelected: any = {};

  argumentSelected: any = {};

  selectedCategories: any[] = [];

  displayedColumns: string[] = ['label1', 'label2', 'name1', 'name2'];

  constructor(
    public dialogRef: MatDialogRef<EditOptionsDialog>,
    private service: ApplicationService,
    @Inject(MAT_DIALOG_DATA) public menu) { }

  onNoClick(): void {
    this.dialogRef.close();
    console.log("aqui es el click.............");
    this.getMenuData();
  }

  onCreate(): void {
    this.dialogRef.close();
    console.log("aqui es el click.............");
    this.getMenuData();
  }

  selectArgumentCategory(category) {
    if (this.itemSelected != category) {
      category.isSelected = !category.isSelected;
      this.itemSelected.isSelected = !this.itemSelected.isSelected;
      this.itemSelected = category;
    } else {
      category.isSelected = !category.isSelected;
      this.itemSelected = {};
    }
  }

  setSelectedCategoryArguments(category) {
    if (category.isSelected) {
      this.selectedCategories.forEach(function (currentValue, index, array) {
        if (currentValue == category) {
          array.splice(index, 1);
        }
      });
    } else {
      this.selectedCategories.push(category);
    }
    category.isSelected = !category.isSelected;
  }

  addCategoryArgument() {
    let node = {
      "selected": true,
      "label": null,
      "icon:": null,
      "arguments": []
    };
    this.data.push(node);
  }

  deleteCategoryArgument() {
    let filterSelected = this.data.filter(item => item.isSelected);
    for (var i = 0; i < filterSelected.length; i += 1) {
      this.selectedCategories.forEach(function (currentValue, index, array) {
        if (currentValue == filterSelected[i]) {
          array.splice(index, 1);
        }
      });
    }
    filterSelected.forEach(function (item, index, array) {
      item.toDelete = true;
    });
  }

  toggleGroup(item) {
    item.isOpened = !item.isOpened;
  }

  addArgument(item) {
    var node = {
      "isSelected": false,
      "toDelete": false
    };
    item.arguments.push(node);
  }

  deleteArgument(item) {
    /*
    let filterSelected = item.arguments.filter(node => node.isSelected);
    filterSelected.forEach(function (node, index, array) {
      node.toDelete = true;
    });
    */
    item.toDelete = true;
  }

  getMenuData(): void {
    this.service.loadMenuOptions(this, this.handlerGetSuccessMenuData, this.handlerGetErrorMenuData);
    console.log("busca data---------");
  }
  handlerGetSuccessMenuData(_this, data) {
    _this.menu = data;
    _this.globals.isLoading = false;
    console.log(_this.menu);
  }

  handlerGetErrorMenuData(_this, result) {
    console.log(result);
    _this.globals.isLoading = false;
  }

  setSelectedAgument(item) {
    if (item == this.argumentSelected) {
      this.argumentSelected.isSelected = false;
      this.argumentSelected = {};
    } else {
      this.argumentSelected = item;
      this.argumentSelected.isSelected = true;
    }
  }
}

























@Component({
  selector: 'app-create-memperships',
  // templateUrl: './membership.component.html',
  templateUrl: './create-memperships.component.html',
  styleUrls: ['./membership.css'],
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

  @Input('argument') public argument: Arguments;

  utils: Utils;

  plansForms: FormGroup;
  items: FormArray;
  features:FormArray;
  options:FormArray;
  prices:FormArray;

  private plans: any[] = [];

  periodicities = [
    {label: 'Month',code:'M'},
    {label: 'Year',code:'Y'}];
    service: any;
    optionSelected: {};


  constructor(private http: ApiClient,
    private planServices:PlanService, private globals: Globals, private formBuilder: FormBuilder,
    public dialog: MatDialog, private ref: ChangeDetectorRef) {
    this.utils = new Utils();

   }


  ngOnInit() {
    this.getPlansService();
    this.plansForms= this.formBuilder.group({
      items:this.formBuilder.array([])
    })
  }

  getPlansService(){
    this.globals.isLoading = true;
    let url = "http://localhost:8887/getPlans";
    //let url = '/getPlans';
    this.http.get(this, url, this.handlerSuccessInit, this.handlerError, null);
  }
  getPlans(){
    this.items=this.plansForms.get('items') as FormArray;
    return this.items.controls;
  }

  handlerSuccessInit(_this,data, tab){
    console.log('data: ' + data);
    _this.plans = data;
    _this.plans.forEach(plan => {
      _this.items=_this.plansForms.get('items') as FormArray;
      _this.items.push(_this.createPlanFromJson(plan));
    });
    _this.globals.isLoading = false;
  }

  createPlanFromJson(plan):FormGroup{
    console.log(plan);
    return this.formBuilder.group({
      name: plan.name,
      id : plan.id,
      features: this.formBuilder.array(this.createFeatureFromJson(plan.features)),
      fares: this.formBuilder.array(this.createPriceFromJson(plan.fares)),
      deleted: false
    });
  }

  createFeatureFromJson(featuresArray):FormGroup[]{
    let features:FormGroup[] = [];
    featuresArray.forEach(feature => {
      features.push(this.formBuilder.group({
        id :feature.id,
        name: feature.features,
        options: this.formBuilder.array(this.createOptionsFromJson(feature.options)),
        deleted: false
      }))
    });
    return features;
  }

  createOptionsFromJson(optionsArray):FormGroup[]{
    let options:FormGroup[] = [];
    optionsArray.forEach(option => {
      options.push(this.formBuilder.group({
        id :option.id,
        name: option.optionName,
        //description: new FormControl('',[Validators.required]),
        deleted: false
      }))
    });
    return options;
  }

  createPriceFromJson(faresArray): FormGroup[]{
    let fares:FormGroup[] = [];
    faresArray.forEach(fare => {
      fares.push(this.formBuilder.group({
        id :fare.id,
        fare: fare.fare,
        periodicity: fare.periodicity,
        deleted: false
      }))
    });

    return fares;
  }

  handlerError(_this,result){
    _this.globals.isLoading = false;
    console.log(result);
  }

/*
getUsers(search, handlerSuccess){
     let url = this.argument.url + "?search="+ (search != null?search:'');
     this.http.get(this,url,handlerSuccess,this.handlerError, null);
   }

   handlerSuccessInit(_this,data, tab){

     _this.users = data;
     _this.users.push({id: '', email:'ALL'})
     _this.filteredSimpleUser.next(_this.users.slice());
     _this.argument.value1 = '';
     _this.userCtrl.setValue('');
   }


   handlerSuccess(_this,data, tab){
     _this.users = data;
     _this.filteredSimpleUser.next(_this.users.slice());
   }

   handlerError(_this,result){
     _this.globals.isLoading = false;
     console.log(result);
   }
*/

  createPlan(): FormGroup{
    return this.formBuilder.group({
      name: new FormControl('',[Validators.required]),
      id :'',
      features: this.formBuilder.array([this.createFeature()]),
      fares: this.formBuilder.array([this.createPrice()]),
      deleted: false
    });
  }

  addNewPlan(): void{
   this.items=this.plansForms.get('items') as FormArray;
   this.items.push(this.createPlan());
  }

  deletePlan(index) {
    this.items=this.plansForms.get('items') as FormArray;
    if(this.items.at(index).get('id').value ==''){
      this.items.removeAt(index);
    }else{
      this.items.at(index).get('deleted').setValue(true);
    }
  }

  deleteOption(index,index2,index3) {
    this.items=this.plansForms.get('items') as FormArray;
    this.features =this.items.controls[index]['controls']['features']['controls'];
    this.options = this.features[index2]['controls']['options'];
    if(this.options.at(index3).get('id').value ==''){
      this.options.removeAt(index3);
    }else{
      this.options.at(index3).get('deleted').setValue(true);
    }
  }

  isPlanDelete(index):boolean{
    this.items=this.plansForms.get('items') as FormArray;
    //console.log(this.items.at(index).get('deleted').value);
    return !(this.items.at(index).get('deleted').value);

  }

  getPlansJson(){
    let plansJsons : Array<Plan>=new Array();
    this.items=this.plansForms.get('items') as FormArray;

    for(let i=0; i< this.items.length; i++){
      let plan:Plan= new Plan();

      if(this.items.at(i).get("id").value!=''){
        plan.id=this.items.at(i).get("id").value;
        plan.delete=this.items.at(i).get("deleted").value;
      }else{
        plan.id=null;
        plan.delete=false;
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

  getPlanFeaturesOptions(index,index2): FormArray{
    this.items=this.plansForms.get('items') as FormArray;
    this.features =this.items.controls[index]['controls']['features']['controls'];
    this.options = this.features[index2]['controls']['options']['controls'];
    return this.options;
  }

  createFeature(): FormGroup{
    return this.formBuilder.group({
      id :'',
      name: new FormControl('',[Validators.required]),
      //description: new FormControl('',[Validators.required]),
      options:  this.formBuilder.array([this.createOptions()]),
      deleted: false
    })
  }
  addNewFeature(index): void{
    this.items=this.plansForms.get('items') as FormArray;
    this.features=this.items.controls[index]['controls']['features'];
    this.features.push(this.createFeature());

  }

  addNewOptionFeature(index,index2): void{
    this.items=this.plansForms.get('items') as FormArray;
    this.features =this.items.controls[index]['controls']['features']['controls'];
    this.options = this.features[index2]['controls']['options'];
    this.options.push(this.createOptions());

  }

  createOptions(): FormGroup{
    return this.formBuilder.group({
      id :'',
      name: new FormControl('',[Validators.required]),
      deleted: false
    })
  }

  deleteFeature(indexPlan,indexFeature) {
    this.items=this.plansForms.get('items') as FormArray;
    this.features=this.items.controls[indexPlan]['controls']['features'];

    if(this.features.at(indexFeature).get('id').value==''){
       this.features.removeAt(indexFeature);
    }else{
      this.features.at(indexFeature).get('deleted').setValue(true);
    }

  }

  isFeatureDelete(indexPlan,indexFeature):boolean{
    this.items=this.plansForms.get('items') as FormArray;
    this.features=this.items.controls[indexPlan]['controls']['features'];
    //console.log(this.features.at(indexFeature).get('deleted').value);
    return !(this.features.at(indexFeature).get('deleted').value);
  }

  isOptionDelete(indexPlan,indexFeature,indexOption):boolean{

    this.items=this.plansForms.get('items') as FormArray;
    this.features =this.items.controls[indexPlan]['controls']['features']['controls'];
    this.options = this.features[indexFeature]['controls']['options'];
    return !(this.options.at(indexOption).get('deleted').value);
  }

  getFeaturesJson(index){
    this.items=this.plansForms.get('items') as FormArray;
    this.features=this.items.controls[index]['controls']['features'];
    let featuresJson : Array<PlanFeature> = new Array();
    for(let i=0; i< this.features.length; i++){
      let feature: PlanFeature=new PlanFeature();
      if(this.features.at(i).get("id").value!=''){
        feature.id=this.features.at(i).get("id").value;
        feature.delete=this.features.at(i).get("deleted").value;
      }else{
        feature.id=null;
        feature.delete=false;
      }

     this.options = this.features.at(i).get("options").value;
      let planFeatureOptions: Array<PlanFeatureOption> = new Array();
      for(let j=0; j< this.options.length; j++){
        let option: PlanFeatureOption=new PlanFeatureOption();
        if(this.options[j].id!=''){
          option.id=this.options[j].id;
          option.delete=this.options[j].deleted;
          option.optionName=this.options[j].name;

        }else{
          option.id=null;
          option.delete=false;
          option.optionName = this.options[j].name;
        }
        planFeatureOptions.push(option);
      }


      feature.features = this.features.at(i).get("name").value;
      feature.options= planFeatureOptions;
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
      periodicity: new FormControl(null,[Validators.required]),
      deleted: false
    });
  }

  addNewPrice(index): void{
    this.items=this.plansForms.get('items') as FormArray;
    this.prices=this.items.controls[index]['controls']['fares'];
    this.prices.push(this.createPrice());
  }

  deletePrice(indexPlan,indexFare) {
    this.items=this.plansForms.get('items') as FormArray;
    this.prices=this.items.controls[indexPlan]['controls']['fares'];

    if(this.prices.at(indexFare).get('id').value==''){
        this.prices.removeAt(indexFare);
    }else{
      this.prices.at(indexFare).get('deleted').setValue(true);
    }
  }

  isFareDelete(indexPlan,indexFare):boolean{
    this.items=this.plansForms.get('items') as FormArray;
    this.features=this.items.controls[indexPlan]['controls']['fares'];
    //console.log(this.features.at(indexFare).get('deleted').value);
    return !(this.features.at(indexFare).get('deleted').value);

  }

  getPricesJson(index){
    this.items=this.plansForms.get('items') as FormArray;
    this.prices =this.items.controls[index]['controls']['fares'];
    let pricesJson : Array<PlanPrice> = new Array();
    for(let i=0; i< this.prices.length; i++){
      let fare: PlanPrice=new PlanPrice();

      if(this.prices.at(i).get("id").value!=''){
        fare.id=this.prices.at(i).get("id").value;
        fare.delete=this.prices.at(i).get("deleted").value;
      }else{
        fare.id=null;
        fare.delete=false;
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
    return 'YEAR';
  }

  savePlans(){
    this.globals.isLoading = true;
    this.items=this.plansForms.get('items') as FormArray;
    if(this.plansForms.valid && this.items.length > 0){

      this.planServices.savePlans(this,this.getPlansJson(), this.savePlansResponse,this.errorHandleResponse);
    }
  }

  savePlansResponse(this_,data){
   console.log(data);

    this_.deleteRemoveItems(this_);
    this_.items=this_.plansForms.get('items') as FormArray;
    for(let i=0; i< this_.items.length; i++){

      this_.items.at(i).get("id").value=data[i].id;

      this_.prices =this_.items.controls[i]['controls']['fares'];
      for(let j=0; j< this_.prices.length; j++){
        this_.prices.at(j).get("id").value=data[i].fares[j].id;
      }
      this_.features=this_.items.controls[i]['controls']['features'];
      for(let j=0; j< this_.features.length; j++){

          this_.features.at(j).get("id").value=data[i].features[j].id;

      }

    }
   console.log(this_.items);
   this_.globals.isLoading = false;
  }

  errorHandleResponse(this_){
    this_.globals.isLoading = false;
  }

  deleteRemoveItems(this_){
    this_.items=this_.plansForms.get('items') as FormArray;
    for(let i=0; i< this_.items.length; i++){
      if(this_.items.at(i).get("deleted").value==true){
        this_.items.removeAt(i);
      }else{

        this_.prices =this_.items.controls[i]['controls']['fares'];
        for(let j=0; j< this_.prices.length; j++){
          if(this_.prices.at(j).get("deleted").value==true){
            this_.prices.removeAt(j);
          }
        }
        this_.features=this_.items.controls[i]['controls']['features'];
        for(let j=0; j< this_.features.length; j++){
          if(this_.features.at(j).get("deleted").value==true){
            this_.features.removeAt(j);
          }
        }
      }
    }
  }


  editOptionsMembership() {


    const dialogRef = this.dialog.open(EditOptionsDialog, {
      width: '70%',
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

}
