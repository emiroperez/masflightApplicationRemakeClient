import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-admin-menu-memberships',
  templateUrl: './admin-menu-memberships.component.html',
  styleUrls: ['./admin-menu-memberships.component.css'],
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

  /* getSelectedNodes(option){
    this.allSelected = false;
    this.partiallySelected = false;
    let total: any = 0;
    let selected: any = 0;
    this.recursiveSelected(option, total, selected);
    if (total == selected && total > 0) {
      this.allSelected = true;
    }
    else if (total > selected){
      this.partiallySelected = true;
    }

  }

  recursiveSelected(option, total, selected){
    total++;
    if (option.selected){
      console.log(option+ " is selected");
      selected++;
    }
    if (option.children.length > 0) {
        this.recursiveSelected(option.children, total, selected);
      }else{
        for
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
      return true && !this.descendantsAllSelected(option);
    }
  } */
}
