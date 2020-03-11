import { Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MenuMobileNode } from '../model/MenuMobileNode';
import { Globals } from '../globals/Globals';
import { MenuDashboardMobileNode } from '../model/MenuDashboardMobileNode';
import { DashboardMenu } from '../model/DashboardMenu';
import { MediaMatcher } from '@angular/cdk/layout';
import { DashboardCategory } from '../model/DashboardCategory';
import { SharedDashboardMenu } from '../model/SharedDashboardMenu';

@Component({
  selector: 'app-menu-nav',
  templateUrl: './menu-nav.component.html',
  styleUrls: ['./menu-nav.component.css']
})
export class MenuNavComponent implements OnInit {

  


  optionSelected: any = {};
    
  flatNodeMap = new Map<MenuMobileNode, any>();
  nestedNodeMap = new Map<any, MenuMobileNode>();

  
  flatNodeDashboardMap = new Map<MenuDashboardMobileNode, any>();
  nestedNodeDashboardMap = new Map<any, MenuDashboardMobileNode>();

  private transformer = (node: any, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.label === node.label
      ? existingNode
      : new MenuMobileNode();
    flatNode.expandable = (!!node.children && node.children.length > 0) || (!!node.options && node.options.length > 0);
    flatNode.id = node.id;
    flatNode.parentId = node.parentId;
    flatNode.label = node.label;
    flatNode.level = level;
    flatNode.options = node.options;
    flatNode.categoryId = node.categoryId;
    flatNode.baseUrl = node.baseUrl;
    flatNode.icon = node.icon;
    flatNode.tab = node.tab;
    flatNode.tabType = node.tabType;
    flatNode.children = node.children;	
    flatNode.menuOptionArguments = node.menuOptionArguments;
    flatNode.optionId = node.optionId;
    flatNode.categoryArgumentsId = node.categoryArgumentsId;
    flatNode.position = node.position;
    flatNode.categoryArguments = node.categoryArguments;	
    flatNode.dataAvailability = node.dataAvailability;
    flatNode.welcomeName = node.welcomeName; 
    flatNode.description = node.description;	
    flatNode.metaData = node.metaData;
    flatNode.order = node.order;
    flatNode.childrenOption = node.childrenOption;
    flatNode.typeOption = node.typeOption;	
    flatNode.application = node.application;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  private transformerDashboard = (node: any, level: number) => {
    const existingNode = this.nestedNodeDashboardMap.get(node);
    const flatNodeDashboard = existingNode && existingNode.title === node.title
      ? existingNode
      : new MenuDashboardMobileNode();
      flatNodeDashboard.expandable = (!!node.children && node.children.length > 0) || (!!node.dashboards && node.dashboards.length > 0) || (!!node.sharedDashboards && node.sharedDashboards.length > 0);
      flatNodeDashboard.id = node.id;
      flatNodeDashboard.parentId = node.parentId;
      flatNodeDashboard.applicationId = node.applicationId;
      flatNodeDashboard.title = node.title;
      flatNodeDashboard.level = level;
      flatNodeDashboard.dashboards = node.dashboards;
      flatNodeDashboard.sharedDashboards = node.sharedDashboards;
      flatNodeDashboard.readOnly = node.readOnly;
      flatNodeDashboard.dashboardMenuId = node.dashboardMenuId;
    this.flatNodeDashboardMap.set(flatNodeDashboard, node);
    this.nestedNodeDashboardMap.set(node, flatNodeDashboard);
    return flatNodeDashboard;
  };
  
  treeControl = new FlatTreeControl<MenuMobileNode>(
    node => node.level,
    node => node.expandable
  );
  treeControlDashboard = new FlatTreeControl<MenuDashboardMobileNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => this.getChildrens(node),
  );
  
  treeFlattenerDashboard = new MatTreeFlattener(
    this.transformerDashboard,
    node => node.level,
    node => node.expandable,
    node => this.getDashboardChildrens(node),
  );
  dashboardButton: any;

  getChildrens(node: any): any
  {
    let items = [];

    if (node.options)
    {
      if (node.options.length != 0)
      {
        for (let option of node.options)
          items.push (option);
      }
    }

    if (node.children)
    {
      if (node.children.length != 0)
      {
        for (let child of node.children)
          items.push (child);
      }
    }

    return items;
  }

  getDashboardChildrens(node: any): any
  {
    let items = [];

    if (node.children)
    {
      if (node.children.length != 0)
      {
        for (let child of node.children)
          items.push (child);
      }
    }

    if (node.dashboards)
    {
      if (node.dashboards.length != 0)
      {
        for (let dashboard of node.dashboards)
          items.push (dashboard);
      }
    }

    if (node.sharedDashboards)
    {
      if (node.sharedDashboards.length != 0)
      {
        for (let sharedDashboard of node.sharedDashboards)
          items.push (sharedDashboard);
      }
    }

    return items;
  }

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  dataSourceDashboard = new MatTreeFlatDataSource(this.treeControlDashboard, this.treeFlattenerDashboard);

  constructor(public globals:Globals, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {

   }

   

  @Input("menu")
  menu: any;

  @Input("dashboardCategories")
  dashboardCategories: DashboardCategory[];

  @Input("dashboards")
  dashboards: DashboardMenu[];

  @Input("sharedDashboards")
  sharedDashboards: SharedDashboardMenu[];

  @Output('optionChanged')
  optionChanged = new EventEmitter ();

  ngOnInit() {
    this.dataSource.data = this.menu.categories;

    this.dashboardButton = [{
      id: 0,
      title: "Dashboard",
      children: this.dashboardCategories,
      dashboards: this.dashboards,
      sharedDashboards: this.sharedDashboards
    }];

    this.dataSourceDashboard.data = this.dashboardButton;
  }

  hasChild = (_: number, node: MenuMobileNode) => node.expandable;

  getNodeIndent(node){
    return 0;
  }

  getOptionSelected(option) { 
    this.globals.showCategoryArguments = true;
    this.globals.showMenu = false;
    this.globals.showIntroWelcome = false;

    this.optionSelected.isActive = false;
    option.isActive = option.isActive == null ? true : !option.isActive;
    this.optionSelected = option;
    this.optionClickHandler(this.optionSelected); 
  }

   parentIsOpen(node: MenuMobileNode){
    const currentLevel = node.level;
    if (currentLevel < 1) {
      return false;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (currentNode.level < currentLevel) {
        return this.treeControl.isExpanded(currentNode);
      }
    }
    return false;
  }

  optionClickHandler(option)
  {
    this.globals.clearVariables ();
    // this.globals.isLoading=true;    
    this.globals.currentOption = option;
    this.globals.initDataSource ();
    this.globals.dataAvailabilityInit ();   

    if (this.globals.currentOption.tabType === 'map')
    {
      this.globals.map = true;
      this.globals.moreResultsBtn = false;
      this.globals.selectedIndex = 1;
    }
    else if (this.globals.currentOption.tabType === 'scmap')
    {
      this.globals.mapsc = false;
      this.globals.moreResultsBtn = false;
      this.globals.selectedIndex = 1;
    }
    else if(this.globals.currentOption.tabType === 'statistics')
      this.globals.usageStatistics = true;

    if (this.globals.currentOption.metaData == 3)
    {
      this.globals.coordinates = "";
      this.globals.displayMapMenu = 0;
    }
    else
      this.globals.displayMapMenu = 1;

    this.globals.status = true;
    this.optionChanged.emit ();
  }  

  recursiveDashboardFullPath(category, dashboard, arg): any
  {
    for (let item of category.children)
    {
      let path = arg.fullPath + item.title + "/";

      if (dashboard.parentId == item.id)
      {
        return {
          item: item,
          fullPath: path
        };
      }

      if (item.children && item.children.length)
      {
        arg = this.recursiveDashboardFullPath (item, dashboard, {
          item: item,
          fullPath: path
        });

        if (arg.item != null)
          return arg;
      }
    }

    return arg;
  }

  getDashboardFullPath(dashboard, arg): any
  {
    if (dashboard.parentId != null)
    {
      for (let category of this.dashboardCategories)
      {
        let path = arg.fullPath + category.title + "/";

        if (dashboard.parentId == category.id)
        {
          return {
            item: category,
            fullPath: path
          };
        }

        if (category.children && category.children.length)
        {
          arg = this.recursiveDashboardFullPath (category, dashboard, {
            item: category,
            fullPath: path
          });

          if (arg.item != null)
            return arg;
        }
      }
    }

    return arg;
  }

  goToDashboard(dashboard, readOnly): void
  {
    let arg = {
      item: null,
      fullPath: "/"
    };

    this.optionSelected.isActive = false;
    dashboard.isActive = dashboard.isActive == null ? true : !dashboard.isActive;
    
    this.globals.showCategoryArguments = false;
    this.globals.showMenu = false;
    this.globals.showIntroWelcome = false;
    this.globals.showDashboard = true;

    this.globals.minDate=null;
    this.globals.maxDate=null;
    this.globals.showBigLoading = true;

    if (readOnly)
      this.globals.currentDashboardMenu = dashboard.dashboardMenuId;
    else
      this.globals.currentDashboardMenu = dashboard;

    this.globals.currentDashboardLocation = this.getDashboardFullPath (dashboard, arg);

    this.globals.currentOption = 'dashboard';
    this.globals.readOnlyDashboard = readOnly;
    this.optionChanged.emit ();
  }
}
