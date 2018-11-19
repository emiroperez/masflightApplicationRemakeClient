import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Menu } from '../model/Menu';
import { MatMenuTrigger } from '@angular/material';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  @Input("menu")
  menu: Menu;

  trigger: MatMenuTrigger;

  currentTrigger:MatMenuTrigger;

  constructor() {
    
  }

  ngOnInit() {
  }

  openMenu(menu,trigger) { 
    if(menu === this.currentTrigger)  {
      //if(!menu.menu.menuOpen()){
        menu.openMenu();
        this.currentTrigger = menu;
        console.log('mouseover');
      //}       
    }else{
      menu.openMenu();
      this.currentTrigger = menu;
    }
    //this.trigger = menu;
    
  }

  closeMenu(menu, trigger) {
    if(menu === this.currentTrigger)  {
      //if(menu.menu.menuOpen()){
        menu.closeMenu();
        console.log('mouseout');
      //}       
    }else{
        menu.closeMenu();
        console.log('mouseout');
    }
  
  }


}
