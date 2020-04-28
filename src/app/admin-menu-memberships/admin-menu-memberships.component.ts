import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-admin-menu-memberships',
  templateUrl: './admin-menu-memberships.component.html',
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
export class AdminMenuMembershipsComponent implements OnInit {

  @Input("menu")
  option: any;

  @Input("index")
  index: any;

  @Input("options")
  optionsPlan: any[];

  @Output() optionSelected = new EventEmitter();

  @Output() optionSelectedArray = new EventEmitter();

  @Output() idSelected = new EventEmitter();

  @Output("toggleOption")
  toggleOption = new EventEmitter ();

  selected: any;
  total: any;
  isOpened: any = true;

  clickedDivState = 'start';

  optionActive: any = {};

  options: any[] = [];
  allSelected: boolean;
  partiallySelected: boolean;

  constructor(private service: ApplicationService) { }

  ngOnInit() {

  }

  toggle(option) {
    if (option.isOpened) {
      option.isOpened = false;
      this.clickedDivState = 'start';
    } else {
      option.isOpened = true;
      this.clickedDivState = 'end';
    }
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

   getSelectedNodes(option){
    this.allSelected = false;
    this.partiallySelected = false;
    this.total = 0;
    this.selected = 0;
    let childrenOption = option.children;
    for (let i=0; i < childrenOption.length; i++){
    this.recursiveSelected(childrenOption[i]);
    }
    if (this.total == this.selected && this.total != 0) {
      option.selected = true;
    }
    else if (this.total > this.selected && this.selected != 0){
      this.partiallySelected = true;
    }

  }

  recursiveSelected(option){
    this.total++;
    if (option.selected){
      this.selected++;
    }
    if (option.children.length > 0) {
      for (let i=0; i < option.children.length; i++){
        this.recursiveSelected(option.children[i]);
      }
      }
    }


    cascadeState(option){
      let newState = option.selected;
      let childrenOption = option.children;
      this.toggleOption.emit (option);
      for (let i=0; i < childrenOption.length; i++){
      this.recursiveStates(childrenOption[i], newState);
      }
    }

    recursiveStates(option, state){
      option.selected = state;
      this.toggleOption.emit (option);
      if (option.children.length > 0) {
        for (let i=0; i < option.children.length; i++){
          this.recursiveStates(option.children[i], state);
        }
        }
      }


  descendantsAllSelected(option){
    this.getSelectedNodes(option);
    if (this.allSelected){
      return true;
    }
  }

  descendantsPartiallySelected(option){
    this.getSelectedNodes(option);
    if (this.partiallySelected){
      return true;
    }
  }
}
