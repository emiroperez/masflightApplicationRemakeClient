import { Component, OnInit, Input, Output, EventEmitter, QueryList, ViewChildren, AfterViewInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormControl, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-admin-menu-recursive',
  templateUrl: './admin-menu-recursive.component.html',
  styleUrls: ['./admin-menu-recursive.component.css'],
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
export class AdminMenuRecursiveComponent implements OnInit {

  @Input("menu")
  option: any;

  @Input("index")
  index: any;

  @Output() optionSelected = new EventEmitter();

  @Output() idSelected = new EventEmitter();

  isOpened: any = true;

  clickedDivState = 'start';

  optionActive: any = {};

  optionValidator = new FormControl('optionname', [Validators.required]);

  constructor() { }


  ngOnInit() {
  }

  ngAfterViewInit(): void {
  }

  getErrorOptionMessage() {
    return this.optionValidator.hasError('required') ? 'You must enter a label in this field' :'';
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

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.option.children, event.previousIndex, event.currentIndex);
  }


  selectOption(option) {
    this.optionSelected.emit(option);
  }

  selectIdDom(index) {
    this.idSelected.emit(index);
  }


  changeDivState(option) {
    if (option.isOpened) {
      this.clickedDivState = 'end';
    } else {
      setTimeout(() => {
        this.clickedDivState = 'start';
      }, 2000);
    }
  }

}
