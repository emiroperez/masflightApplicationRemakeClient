import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Menu } from '../model/Menu';
import { MatMenuTrigger } from '@angular/material';
import { Globals } from '../globals/Globals';
import { OptionWelcomeComponent } from '../option-welcome/option-welcome.component';
import { DashboardMenu } from '../model/DashboardMenu';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  @Input("menu")
  menu: Menu;

  @Input("dashboards")
  dashboards: Array<DashboardMenu>;

  @Input('optionWelcomeComponent')
  optionWelcomeComponent: OptionWelcomeComponent;

  trigger: MatMenuTrigger;

  currentTrigger:MatMenuTrigger;

  constructor(private globals : Globals) {

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

  goToDashboard(dashboard): void
  {
    this.globals.currentDashboardMenu = dashboard;
    this.globals.currentOption = 'dashboard';
  }

  setMenuCategory(category: any){
    if(this.globals.currentMenuCategory!=null){
      if(category.id!=this.globals.currentMenuCategory.id){
        this.globals.currentMenuCategory = category;
      }
    }else{
      this.globals.currentMenuCategory = category;
    }
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
