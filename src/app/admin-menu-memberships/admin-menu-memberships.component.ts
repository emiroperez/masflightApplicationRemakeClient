import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ApplicationService } from '../services/application.service';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-admin-menu-memberships',
  templateUrl: './admin-menu-memberships.component.html',
  styleUrls: ['./admin-menu-memberships.component.css'],
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
export class AdminMenuMembershipsComponent implements OnInit {

  @Input("menu")
  option: any;

  @Input("index")
  index: any;

  @Input("options")
  optionsPlan: any[];


  @Input("planId")
  planId: any[];

  @Output() optionSelected = new EventEmitter();

  @Output() idSelected = new EventEmitter();

  isOpened: any = true;

  clickedDivState = 'start';

  optionActive: any = {};

  options: any[] = [];

  constructor(private service: ApplicationService) { }

  ngOnInit() {

  }

 /* getSelectedOptionsByPlan() {
    this.service.loadPlanOptions(this,"1", this.handlerSuccessPlanOptions, this.handlerErrorPlanOptions);
  }

  handlerSuccessPlanOptions(_this, result) {
    _this.options = result;
    this.setSelectedOption(this.option);
    console.log(_this.options);
  }

  handlerErrorPlanOptions(_this, result) {
    console.log(result);
  }

  ngAfterViewInit(): void {
  }*/

  setSelectedOption(option) {
    if (option == this.optionActive) {
      this.optionActive.isSelected = false;
      this.optionActive = {};
    } else {
      this.optionActive = option;
      this.optionActive.isSelected = true;
    }
    console.log(this.optionActive);
  }

  getOptionsPlan() {
       // this.clearSelectedCategoryArguments();
       console.log(this.optionsPlan.length);
    for (var i = 0; i < this.optionsPlan.length; i++) {
      console.log(this.optionsPlan[i]);
      if (this.optionsPlan[i].id = this.option.id){
        this.option.selected = true;
        console.log(this.option);
      }
    }
  }

  getOptionsPlan();

 /*   var categories = this.categories;
    this.optionSelected.menuOptionArgumentsAdmin.forEach(function (itemOptionCategory, indexOptionCategory, arrayOptionCategory) {
      categories.forEach(function (itemCategory, indexCategory, arrayCategory) {
        if (itemOptionCategory.categoryArgumentsId.id == itemCategory.id) {
          itemCategory.selected = true;
        }
      })
    });
    this.globals.isLoading = false;
  }
*/
  toggle(option) {
    if (option.isOpened) {
      option.isOpened = false;
      this.clickedDivState = 'start';
    } else {
      option.isOpened = true;
      this.clickedDivState = 'end';
    }
  }

  selectOption(option) {
    this.optionSelected.emit(option);
  }

  selectIdDom(index){
    this.idSelected.emit(index);
  }

  changeDivState(option) {
    if (option.isOpened) {
      this.clickedDivState = 'end';
    } else {
      setTimeout(() => {
        this.clickedDivState = 'start';
      }, 3000);
    }
  }
}
