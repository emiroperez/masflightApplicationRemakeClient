import { Component, OnInit, Input, Inject, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { FormControl, Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Globals } from '../globals/Globals';
import { Utils } from '../commons/utils';
import { AdvanceFeature } from '../model/AdvanceFeature';
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
import { PlanOption } from '../model/PlanOption';
import { Menu } from '../model/Menu';
import { Optional } from 'ag-grid-community';
import { MatSnackBar, MatTableDataSource } from '@angular/material';
import { PlanAdvanceFeatures } from '../model/PlanAdvanceFeatures';


@Component({
  selector: 'app-dialog-edit-options',
  templateUrl: 'dialog-edit-options.html',
  styleUrls: ['./membership.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('animationOption2', [
      transition(':enter', [
        style({
          opacity: 0,
          height: '0px'
        }),
        animate(500)
      ]),
      transition(':leave', [
        animate(500, style({
          opacity: 0,
          height: '0px'
        }))
      ]),
      state('*', style({
        opacity: 1,
        height: '*'
      })),
    ])
  ]
})
export class EditOptionsDialog {

  isOpened: any = true;

  clickedDivState = 'start';

  optionActive: any = {};

  optionSelected: any = {};

  plan: any;

  optionsArray: any[] = [];

  idDomOptionSelected: any;

  menu: any[];

  options: any[];

  constructor(
    public dialogRef: MatDialogRef<EditOptionsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { menuSelected: any, auxOptions: any }) { }


  getItemsSelected(menu) {
    for (let j = 0; j < menu.length; j++) {
      this.recursiveOption(menu[j]);
    }
    this.optionsArray = this.data.auxOptions;
  }

  onNoClick():void{
    this.dialogRef.close();
  }

  recursiveOption(option: any) {

    if (option.children.length !== 0) {
      for (let i = 0; i < option.children.length; i++) {
        const element = option.children[i];
        let found = false;
        for (let j = 0; j < this.data.auxOptions.length; j++) {
          if (!element.selected) {
            if (element.id === this.data.auxOptions[j].optionId) {
              this.data.auxOptions[j].delete = true;
            }
          } else {
            if (element.id === this.data.auxOptions[j].optionId) {
              this.data.auxOptions[j].delete = false;
              found = true;
            }
          }
        }
        if (element.selected && !found) {
          const optionAdd = new PlanOption();
          optionAdd.optionId = element.id;
          optionAdd.delete = false;
          this.data.auxOptions.push(optionAdd);
        }
        if (element.children.length>0){
          this.recursiveOption(element);

        }
      }
    }
  }

}

































@Component({
  selector: 'app-create-memperships',
  templateUrl: './create-memperships.component.html',
  encapsulation: ViewEncapsulation.None,
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
  index: any;
  menu: any[];
  planJson: any[] = [];
  itemsJson: any[];
  advanceFeatures: any[];
  advanceFeaturesGroup: FormArray;
  plansForms: FormGroup;
  items: FormArray;
  features: FormArray;
  options: FormArray;
  prices: FormArray;
  optionsXPlan: any[];
  optionsByPlan: any[];
  optionsToAdd: any[] = [];
  adFeaturesByPlan: any[] = [];

  private plans: any[];

  periodicities = [
    { label: 'Month', code: 'M' },
    { label: 'Year', code: 'Y' }];
  optionSelected: {};


  constructor(private http: ApiClient,
    private planServices: PlanService, private service: ApplicationService, private globals: Globals, private formBuilder: FormBuilder,
    public dialog: MatDialog, private ref: ChangeDetectorRef) {
    this.utils = new Utils();

  }


  ngOnInit() {
    this.getAdvanceFeatures();
    this.getMenuData();




    this.plansForms = this.formBuilder.group({
      items: this.formBuilder.array([])
    })
  }

  getPlansService() {
    this.globals.isLoading = true;
    let url= this.globals.baseUrl+'/getPlans';
    this.http.get(this, url, this.handlerSuccessInit, this.handlerError, null);
  }

  getPlans() {
    this.items = this.plansForms.get('items') as FormArray;
    return this.items.controls;
  }

  handlerSuccessInit(_this, data, tab) {
    _this.plans = data;
    _this.planJson = data;
    _this.plans.forEach(plan => {
      _this.items = _this.plansForms.get('items') as FormArray;
      _this.items.push(_this.createPlanFromJson(plan));
    });

  }

  createPlanFromJson(plan): FormGroup {
    return this.formBuilder.group({
      name: plan.name,
      id: plan.id,
      features: this.formBuilder.array(this.createFeatureFromJson(plan.features)),
      fares: this.formBuilder.array(this.createPriceFromJson(plan.fares)),
      advanceFeatures: this.formBuilder.array(this.createAdvanceFeatureFromJson(this.advanceFeatures, plan.advanceFeatures)),
      deleted: false
    });
  }

  createFeatureFromJson(featuresArray): FormGroup[] {
    let features: FormGroup[] = [];
    featuresArray.forEach(feature => {
      features.push(this.formBuilder.group({
        id: feature.id,
        name: feature.features,
        options: this.formBuilder.array(this.createOptionsFromJson(feature.options)),
        deleted: false
      }));
    });
    return features;
  }

  getSelectedAdvanceFeatures(id, plan) {
    let value = false;
    for (let i = 0; i < plan.length; i++) {
      if (plan[i].advanceFeatureId == id) {
        value = true;
      }
    }
    return value;
  }

  getIdAFPlan(id, plan){
    let value: any;
    for (let i =0; i <plan.length;i++){
      if (plan[i].advanceFeatureId == id) {
        value = plan[i].id;
    }
  }
  return value;
}

createAdvanceFeature(advanceFeaturesArray): FormGroup[] {
  let advanceFeaturesGroup: FormGroup[] = [];
  advanceFeaturesArray.forEach(advFeature => {
    advanceFeaturesGroup.push(this.formBuilder.group({
      id : advFeature.id,
      idByPlan: null,
      label: advFeature.label,
      selected: false,
      delete: false

    }));
  });
  return advanceFeaturesGroup;
  }

  createAdvanceFeatureFromJson(advanceFeaturesArray, advanceFeaturesPlan): FormGroup[] {
    let advanceFeaturesGroup: FormGroup[] = [];
    advanceFeaturesArray.forEach(advFeature => {
      advanceFeaturesGroup.push(this.formBuilder.group({
        id: advFeature.id,
        idByPlan: this.getIdAFPlan(advFeature.id, advanceFeaturesPlan),
        label: advFeature.label,
        selected: this.getSelectedAdvanceFeatures(advFeature.id, advanceFeaturesPlan),
        deleted: false

      }));
    });
    return advanceFeaturesGroup;
  }

  createOptionsFromJson(optionsArray): FormGroup[] {
    let options: FormGroup[] = [];
    optionsArray.forEach(option => {
      options.push(this.formBuilder.group({
        id: option.id,
        name: option.optionName,
        deleted: false
      }))
    });
    return options;
  }


  createPriceFromJson(faresArray): FormGroup[] {
    let fares: FormGroup[] = [];
    faresArray.forEach(fare => {
      fares.push(this.formBuilder.group({
        id: fare.id,
        fare: fare.fare,
        periodicity: fare.periodicity,
        deleted: false
      }))
    });

    return fares;
  }

  handlerError(_this, result) {
    _this.globals.isLoading = false;
    console.log(result);
  }



  createPlan(): FormGroup {
    return this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      id: '',
      advanceFeatures: this.formBuilder.array(this.createAdvanceFeature(this.advanceFeatures)),
      features: this.formBuilder.array([this.createFeature()]),
      fares: this.formBuilder.array([this.createPrice()]),
      deleted: false
    });
  }

  addNewPlan(): void {
    const newPlan: Plan = new Plan();
    newPlan.id = '';
    newPlan.options = new Array();
    this.items = this.plansForms.get('items') as FormArray;
    this.items.push(this.createPlan());

    this.planJson.push(newPlan);
  }

  deletePlan(index) {
    this.items = this.plansForms.get('items') as FormArray;
    if (this.items.at(index).get('id').value == '') {
      this.items.removeAt(index);
    } else {
      this.items.at(index).get('deleted').setValue(true);
    }
  }

  getMenuData(): void {
    this.service.loadMenuOptions(this, this.handlerGetSuccessMenuData, this.handlerError);
  }
  handlerGetSuccessMenuData(_this, data) {
    _this.menu = data;
    _this.getPlansService();
    _this.globals.isLoading = false;
  }

  getAdvanceFeatures(): void {
    this.service.loadAdvanceFeatures(this, this.handlerGetSuccessAF, this.handlerError);
  }
  handlerGetSuccessAF(_this, data) {
    _this.advanceFeatures = data;
  }

  deleteOption(index, index2, index3) {
    this.items = this.plansForms.get('items') as FormArray;
    this.features = this.items.controls[index]['controls']['features']['controls'];
    this.options = this.features[index2]['controls']['options'];
    if (this.options.at(index3).get('id').value == '') {
      this.options.removeAt(index3);
    } else {
      this.options.at(index3).get('deleted').setValue(true);
    }
  }

  isPlanDelete(index): boolean {
    this.items = this.plansForms.get('items') as FormArray;
    //console.log(this.items.at(index).get('deleted').value);
    return !(this.items.at(index).get('deleted').value);

  }



  getPlanFeaturesOptions(index, index2): FormArray {
    this.items = this.plansForms.get('items') as FormArray;
    this.features = this.items.controls[index]['controls']['features']['controls'];
    this.options = this.features[index2]['controls']['options']['controls'];
    return this.options;
  }

  createFeature(): FormGroup {
    return this.formBuilder.group({
      id: '',
      name: new FormControl('', [Validators.required]),
      deleted: false
    })
  }
  addNewFeature(index): void {
    this.items = this.plansForms.get('items') as FormArray;
    this.features = this.items.controls[index]['controls']['features'];
    this.features.push(this.createFeature());

  }
  addNewOptionFeature(index, index2): void {
    this.items = this.plansForms.get('items') as FormArray;
    this.features = this.items.controls[index]['controls']['features']['controls'];
    this.options = this.features[index2]['controls']['options'];
    this.options.push(this.createOptions());

  }
  createOptions(): FormGroup {
    return this.formBuilder.group({
      id: '',
      name: new FormControl('', [Validators.required]),
      deleted: false
    })
  }

  deleteFeature(indexPlan, indexFeature) {
    this.items = this.plansForms.get('items') as FormArray;
    this.features = this.items.controls[indexPlan]['controls']['features'];

    if (this.features.at(indexFeature).get('id').value == '') {
      this.features.removeAt(indexFeature);
    } else {
      this.features.at(indexFeature).get('deleted').setValue(true);
    }

  }

  isFeatureDelete(indexPlan, indexFeature): boolean {
    this.items = this.plansForms.get('items') as FormArray;
    this.features = this.items.controls[indexPlan]['controls']['features'];
    //console.log(this.features.at(indexFeature).get('deleted').value);
    return !(this.features.at(indexFeature).get('deleted').value);
  }

  isOptionDelete(indexPlan, indexFeature, indexOption): boolean {

    this.items = this.plansForms.get('items') as FormArray;
    this.features = this.items.controls[indexPlan]['controls']['features']['controls'];
    this.options = this.features[indexFeature]['controls']['options'];
    return !(this.options.at(indexOption).get('deleted').value);
  }


  getPlansJson() {
    let plansJsons: Array<Plan> = new Array();
    this.items = this.plansForms.get('items') as FormArray;
    console.log(this.items);
    for (let i = 0; i < this.items.length; i++) {
      let plan: Plan = new Plan();

      if (this.items.at(i).get("id").value != '') {
        plan.id = this.items.at(i).get("id").value;
        plan.delete = this.items.at(i).get("deleted").value;
      } else {
        plan.id = null;
        plan.delete = false;
      }
      plan.name = this.items.at(i).get("name").value.toUpperCase();
      console.log(plan.name);
      plan.options = this.getOptionsPlanJson(i);
      plan.features = this.getFeaturesJson(i);
      plan.fares = this.getPricesJson(i);
      plan.advanceFeatures = this.getAdvanceFeaturesJson(i);
      plansJsons.push(plan);
    }
    console.log("ENVIO");
    console.log(plansJsons);
    return plansJsons;
  }

  getPlanFeatures(index): FormArray {
    this.items = this.plansForms.get('items') as FormArray;
    this.features = this.items.controls[index]['controls']['features']['controls'];
    return this.features;
  }

  getPlanAdvanceFeatures(index): FormArray {
    this.items = this.plansForms.get('items') as FormArray;
    this.advanceFeaturesGroup = this.items.controls[index]['controls']['advanceFeatures']['controls'];
    return this.advanceFeaturesGroup;
  }
  getFeaturesJson(index) {
    this.items = this.plansForms.get('items') as FormArray;
    this.features = this.items.controls[index]['controls']['features'];
    let featuresJson: Array<PlanFeature> = new Array();
    for (let i = 0; i < this.features.length; i++) {
      let feature: PlanFeature = new PlanFeature();
      if (this.features.at(i).get("id").value != '') {
        feature.id = this.features.at(i).get("id").value;
        feature.delete = this.features.at(i).get("deleted").value;
      } else {
        feature.id = null;
        feature.delete = false;
      }
      feature.features = this.features.at(i).get("name").value;
      featuresJson.push(feature)
    }
    return featuresJson;
  }

  getAdvanceFeaturesJson(index) {

    this.items = this.plansForms.get('items') as FormArray;

    this.advanceFeaturesGroup = this.items.controls[index]['controls']['advanceFeatures'];
    let advfeaturesJson: Array<PlanAdvanceFeatures> = new Array();
    for (let i = 0; i < this.advanceFeaturesGroup.length; i++) {
      let advfeature: PlanAdvanceFeatures = new PlanAdvanceFeatures();
      if (this.advanceFeaturesGroup.at(i).get("idByPlan").value !== null &&
      this.advanceFeaturesGroup.at(i).get("idByPlan").value !== "") {
         advfeature.delete = this.advanceFeaturesGroup.at(i).get("selected").value ? false : true;
         advfeature.advanceFeatureId = this.advanceFeaturesGroup.at(i).get("id").value;
         advfeature.id = this.advanceFeaturesGroup.at(i).get("idByPlan").value;
         advfeaturesJson.push(advfeature);
       }else if(this.advanceFeaturesGroup.at(i).get("selected").value) {
            advfeature.advanceFeatureId = this.advanceFeaturesGroup.at(i).get("id").value;
            advfeature.id = null;
            advfeature.delete = false;
            advfeaturesJson.push(advfeature);
        }

    }
    return advfeaturesJson;
  }

  getFeatureOptions(options): Array<PlanFeatureOption> {
    let optionsArray: Array<string> = options.split(",");
    let planFeatureOptions: Array<PlanFeatureOption> = new Array();
    optionsArray.forEach(option => {
      let featureOption: PlanFeatureOption = new PlanFeatureOption()
      featureOption.optionName = option;
      planFeatureOptions.push(featureOption);
    });
    return planFeatureOptions;
  }


  getPlanPrices(index): FormArray {
    this.items = this.plansForms.get('items') as FormArray;
    this.prices = this.items.controls[index]['controls']['fares']['controls'];
    return this.prices;
  }


  createPrice(): FormGroup {
    return this.formBuilder.group({
      id: '',
      fare: new FormControl('', [Validators.required]),
      periodicity: new FormControl(null, [Validators.required]),
      deleted: false
    });
  }

  addNewPrice(index): void {
    this.items = this.plansForms.get('items') as FormArray;
    this.prices = this.items.controls[index]['controls']['fares'];
    this.prices.push(this.createPrice());
  }

  deletePrice(indexPlan, indexFare) {
    this.items = this.plansForms.get('items') as FormArray;
    this.prices = this.items.controls[indexPlan]['controls']['fares'];

    if (this.prices.at(indexFare).get('id').value == '') {
      this.prices.removeAt(indexFare);
    } else {
      this.prices.at(indexFare).get('deleted').setValue(true);
    }
  }

  isFareDelete(indexPlan, indexFare): boolean {
    this.items = this.plansForms.get('items') as FormArray;
    this.features = this.items.controls[indexPlan]['controls']['fares'];
    //console.log(this.features.at(indexFare).get('deleted').value);
    return !(this.features.at(indexFare).get('deleted').value);

  }


  getPricesJson(index) {
    this.items = this.plansForms.get('items') as FormArray;
    this.prices = this.items.controls[index]['controls']['fares'];
    let pricesJson: Array<PlanPrice> = new Array();
    for (let i = 0; i < this.prices.length; i++) {
      let fare: PlanPrice = new PlanPrice();

      if (this.prices.at(i).get("id").value != '') {
        fare.id = this.prices.at(i).get("id").value;
        fare.delete = this.prices.at(i).get("deleted").value;
      } else {
        fare.id = null;
        fare.delete = false;
      }
      fare.fare = this.prices.at(i).get("fare").value;
      fare.periodicity = this.prices.at(i).get("periodicity").value;
      pricesJson.push(fare)
    }
    return pricesJson;


  }

  getOptionsPlanJson(index) {
    const optionsXPlan = this.planJson[index]['options'];
    const opJson: Array<PlanOption> = new Array();
    for (let j = 0; j < optionsXPlan.length; j++) {
      const planOp: PlanOption = new PlanOption();
      planOp.id = optionsXPlan[j]['id'];
      planOp.optionId = optionsXPlan[j]['optionId'];
      planOp.delete = optionsXPlan[j]['delete'];
      opJson.push(planOp);
    }
    return opJson;
  }

  getOptionsText(options: any[]) {
    let text = "";
    let i = 0;
    for (let option of options) {
      if (i == 0) {
        text += ' ' + option.optionName;
      } else if (i === options.length - 1) {
        text += ' and ' + option.optionName;
      } else {
        text += ', ' + option.optionName;
      }
      i++;
    }
    return text;
  }

  getPeriodicityText(periodicity) {
    if (periodicity === 'M') {
      return 'MONTH';
    }
    return 'YEAR';
  }

  savePlans() {
    this.globals.isLoading = true;
    this.items = this.plansForms.get('items') as FormArray;
    if (this.plansForms.valid && this.items.length > 0) {

      this.planServices.savePlans(this, this.getPlansJson(), this.savePlansResponse, this.errorHandleResponse);
    }
  }

  savePlansResponse(this_, data) {
    console.log(data);

    this_.deleteRemoveItems(this_);
    this_.items = this_.plansForms.get('items') as FormArray;
    for (let i = 0; i < this_.items.length; i++) {

      this_.items.at(i).get("id").value = data[i].id;

      this_.prices = this_.items.controls[i]['controls']['fares'];
      for (let j = 0; j < this_.prices.length; j++) {
        this_.prices.at(j).get("id").value = data[i].fares[j].id;
      }
      this_.features = this_.items.controls[i]['controls']['features'];
      for (let j = 0; j < this_.features.length; j++) {

        this_.features.at(j).get("id").value = data[i].features[j].id;

      }

    }
    console.log(this_.items);
    this_.globals.isLoading = false;
  }

  errorHandleResponse(this_) {
    this_.globals.isLoading = false;
  }

  deleteRemoveItems(this_) {
    this_.items = this_.plansForms.get('items') as FormArray;
    for (let i = 0; i < this_.items.length; i++) {
      if (this_.items.at(i).get("deleted").value == true) {
        this_.items.removeAt(i);
      } else {

        this_.prices = this_.items.controls[i]['controls']['fares'];
        for (let j = 0; j < this_.prices.length; j++) {
          if (this_.prices.at(j).get("deleted").value == true) {
            this_.prices.removeAt(j);
          }
        }
        this_.features = this_.items.controls[i]['controls']['features'];
        for (let j = 0; j < this_.features.length; j++) {
          if (this_.features.at(j).get("deleted").value == true) {
            this_.features.removeAt(j);
          }
        }
      }
    }
  }
  getSelectedOptionsByPlan(menu, options, index) {
    const menuData = menu;
    const opData = options;
    const planId: any = this.planJson[index]['id'];
    if (planId) {
      for (let i = 0; i < menuData.length; i++) {
        this.recursiveOptionData(menuData[i], opData);
      }
    }
    console.log(menuData);
    return menuData;

  }
  recursiveOptionData(option, selectedOp) {
    if (option.children.length !== 0) {
      for (let i = 0; i < option.children.length; i++) {
        const element = option.children[i];
        //Validate if selected or not
        for (let j = 0; j < selectedOp.length; j++) {
          if (element.id === selectedOp[j].optionId && !selectedOp[j].delete) {
            element.selected = true;
          }
        }
        /* *********************** */
          this.recursiveOptionData(element, selectedOp);

      }
    }
  }

  clearOptionData(menu) {
    for (let i = 0; i < menu.length; i++) {
      menu[i].selected = false;
      this.clearOptionDataRecursive(menu[i]);
    }
    return menu;
  }
  clearOptionDataRecursive(option) {
    if (option.children.length !== 0) {
      for (let i = 0; i < option.children.length; i++) {
        const element = option.children[i];
        element.selected = false;
        if(element.children.length > 0){
            this.clearOptionDataRecursive(element);
        }
      }
    }
  }

  editOptionsMembership(index) {
    this.index = index;
    let planId: any;
    let menuSelected;
    planId = this.planJson[index]['id'];
    let auxOptions: Array<PlanOption> = new Array();
    let menuClear = this.clearOptionData(this.menu);
    if (planId){
      auxOptions = this.getOptionsPlanJson(index);
      menuSelected = this.getSelectedOptionsByPlan(menuClear, auxOptions, index);
    }else {
      menuSelected = menuClear;
    }
    const dialogRef = this.dialog.open(EditOptionsDialog, {
      width: '80%',
      data: { menuSelected: menuSelected, auxOptions: auxOptions }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      console.log("result");
      console.log(result);
      if (result) {
        this.planJson[index]['options'] = [];
        this.planJson[index]['options'] = result;
        console.log(this.planJson);
      }
    });

  }

}
