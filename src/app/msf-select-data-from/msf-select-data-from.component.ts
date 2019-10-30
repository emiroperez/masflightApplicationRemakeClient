import { Component, Inject } from '@angular/core';
import { MatDialogRef, MatTreeFlattener, MatTreeFlatDataSource, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { FlatTreeControl } from '@angular/cdk/tree';

import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { ExampleFlatNode } from '../admin-menu/admin-menu.component';
import { MsfDashboardAssistantComponent } from '../msf-dashboard-assistant/msf-dashboard-assistant.component';

@Component({
  selector: 'app-msf-select-data-from',
  templateUrl: './msf-select-data-from.component.html'
})
export class MsfSelectDataFromComponent {
  menuCategories: any[] = [];
  selectedItem: any = null;

  hasChild = (_: number, node: any) => (node.expandable);

  constructor(public dialogRef: MatDialogRef<MsfSelectDataFromComponent>,
    public globals: Globals,
    public dialog: MatDialog,
    private services: ApplicationService,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.globals.popupLoading = true;
    this.services.loadMenuOptions (this, this.handlerSuccess, this.handlerError);
  }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }

  recursiveMenuCategory(menuCategory): void
  {
    if (menuCategory.children && menuCategory.children.length)
    {
      // the submenu must have the items with children first
      menuCategory.children.sort (function(e1, e2) {
        if (e1.children.length && e2.children.length)
          return 0;

        return e2.children.length - e1.children.length;
      });

      for (let i = menuCategory.children.length - 1; i >= 0; i--)
      {
        let child = menuCategory.children[i];

        if (child.typeOption == '1')
          menuCategory.children.splice (i, 1);
        else if (child.children && child.children.length)
          this.recursiveMenuCategory (child);
      }
    }
  }

  handlerSuccess(_this, data): void
  {
    _this.menuCategories = data;

    for (let menuCategory of _this.menuCategories)
    {
      menuCategory.flatNodeMap = new Map<ExampleFlatNode, any> ();
      menuCategory.nestedNodeMap = new Map<any, ExampleFlatNode> ();

      let transformer = (node: any, level: number) =>
      {
        const existingNode = menuCategory.nestedNodeMap.get (node);
        const flatNode = existingNode && existingNode.label === node.label
          ? existingNode
          : new ExampleFlatNode ();
        flatNode.expandable = !!node.children && node.children.length > 0;
        flatNode.id = node.id;
        flatNode.uid = node.uid;
        flatNode.label = node.label;
        flatNode.level = level;
        flatNode.menuOptionArgumentsAdmin = node.menuOptionArgumentsAdmin;
        flatNode.categoryParentId = node.categoryParentId;
        flatNode.baseUrl = node.baseUrl;
        flatNode.icon = node.icon;
        flatNode.tab = node.tab;
        flatNode.tabType = node.tabType;
        flatNode.menuParentId = node.menuParentId;
        flatNode.toDelete = node.toDelete;
        flatNode.dataAvailability = node.dataAvailability;
        flatNode.metaData = node.metaData;
        flatNode.order = node.order,
        flatNode.selected = node.selected;
        flatNode.applicationId = node.applicationId;
        flatNode.isRoot = node.isRoot;
        flatNode.children = node.children;
        flatNode.initialRol = node.initialRol;
        flatNode.finalRol = node.finalRol;
        flatNode.typeOption = node.typeOption;
        flatNode.welcome = node.welcome;
    
        menuCategory.flatNodeMap.set (flatNode, node);
        menuCategory.nestedNodeMap.set (node, flatNode);

        return flatNode;
      };

      menuCategory.transformer = transformer;

      menuCategory.treeControl = new FlatTreeControl<ExampleFlatNode> (
        node => node.level,
        node => node.expandable
      );

      menuCategory.treeFlattener = new MatTreeFlattener (
        transformer,
        node => node.level,
        node => node.expandable,
        node => node.children
      );

      // remove options that are exclusive to the main menu
      if (menuCategory.children && menuCategory.children.length)
      {
        // the submenu must have the items with children first
        menuCategory.children.sort (function(e1, e2) {
          if (e1.children.length && e2.children.length)
            return 0;

          return e2.children.length - e1.children.length;
        });

        for (let i = menuCategory.children.length - 1; i >= 0; i--)
        {
          let child = menuCategory.children[i];

          if (child.typeOption == '1')
            menuCategory.children.splice (i, 1);
          else if (child.children && child.children.length)
            _this.recursiveMenuCategory (child);
        }
      }

      menuCategory.tree = new MatTreeFlatDataSource (menuCategory.treeControl, menuCategory.treeFlattener);
      menuCategory.tree.data = menuCategory.children;
    }

    _this.globals.popupLoading = false;
  }

  handlerError(_this): void
  {
    _this.globals.popupLoading = false;
  }

  selectItem(item): void
  {
    this.selectedItem = item;
  }

  filterMenuOptions(menuCategory): void
  {
    for (let index = 0; index < menuCategory.treeControl.dataNodes.length; index++)
    {
      const option = menuCategory.treeControl.dataNodes[index];

      this.setShowOption (option, menuCategory.searchLabel);
      this.recursiveOption (option, menuCategory.searchLabel);
    }

    if (menuCategory.searchLabel)
      menuCategory.treeControl.expandAll ();
    else
      menuCategory.treeControl.collapseAll ();
  }

  recursiveOption(option: any, searchLabel: string): void
  {
    if (option.children.length)
    {
      for (let index = 0; index < option.children.length; index++)
      {
        const element = option.children[index];
  
        this.setShowOption (element, searchLabel);
        this.recursiveOption (element, searchLabel);
      }
    }
    else
      this.setShowOption (option, searchLabel);
  }

  setShowOption(option: any, searchLabel: string): void
  {
    if (searchLabel != "" && searchLabel != null)
    {
      if (option.label.toLowerCase ().indexOf (searchLabel.toLowerCase ()) != -1)
        option.show = true;
      else
        option.show = false;
    }
    else
      option.show = true;
  }

  selectData(): void
  {
    this.dialogRef.close (this.selectedItem);
  }

  previewData(): void
  {
    let selectedOption;

    selectedOption = null;

    for (let option of this.data.options)
    {
      if (option.id == this.selectedItem.id)
      {
        selectedOption = option;
        break;
      }
    }

    this.dialog.open (MsfDashboardAssistantComponent, {
      panelClass: 'msf-dashboard-assistant-dialog',
      autoFocus: false,
      data: {
        currentOption: selectedOption,
        functions: this.data.functions[0],
        nciles: this.data.nciles[0],
        selectDataPreview: true
      }
    });
  }
}
