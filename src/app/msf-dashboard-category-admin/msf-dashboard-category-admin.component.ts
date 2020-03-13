import { Component, Output, EventEmitter, Input } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-msf-dashboard-category-admin',
  templateUrl: './msf-dashboard-category-admin.component.html'
})
export class MsfDashboardCategoryAdminComponent
{
  @Input("isMobile")
  isMobile: boolean;

  @Output("refreshDashboardMenu")
  refreshDashboardMenu = new EventEmitter ();

  createdCategories: any[] = [];
  modifiedCategories: any[] = [];
  deletedCategories: any[] = [];

  saving: number = 0;
  categorySelected: any = null;
  root: any = null;
  index: number = 0;

  constructor(public globals: Globals, private service: ApplicationService, private dialog: MatDialog)
  {
    this.globals.isLoading = true;
    this.service.getDashboardCategories2 (this, this.getCategorySuccess, this.getCategoryError);
  }

  recursiveDirectoryTree(data): void
  {
    for (let item of data.children)
    {
      if (item.children.length)
        this.recursiveDirectoryTree (item);

      item.parent = data;
    }
  }

  getCategorySuccess(_this, data): void
  {
    // set directory tree
    _this.root = {
      id: 0,
      title: "/",
      children: data,
      applicationId: _this.globals.currentApplication.id,
      open: true,
      parent: null
    };

    // set parent for each node
    _this.recursiveDirectoryTree (_this.root);
    _this.categorySelected = _this.root;

    if (_this.saving)
    {
      switch (_this.saving)
      {
        case 1:
          _this.refreshDashboardMenu.emit ();
          break;

        case 2:
          _this.globals.isLoading = false;

          _this.dialog.open (MessageComponent, {
            data: { title: "Information", message: "Failed to save the changes to the categories." }
          });

          break;
      }

      _this.saving = 0;
    }
    else
      _this.globals.isLoading = false;

    _this.index = 0;
  }

  getCategoryError(_this): void
  {
    _this.saving = 0;
    _this.globals.isLoading = false;

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Unable to get service locations." }
    });
  }

  toggleRoot(): void
  {
    this.root.open = !this.root.open;
  }

  selectCategory(item): void
  {
    this.categorySelected = item;
  }

  categoryModified(item): void
  {
    if (this.createdCategories.indexOf (item) == -1 && this.modifiedCategories.indexOf (item) == -1)
      this.modifiedCategories.push (item);
  }

  createCategory(item): void
  {
    let newCategory = {
      id: null,
      title: "New Category",
      children: [],
      dashboards: [],
      sharedDashboards: [],
      applicationId: this.globals.currentApplication.id,
      open: false,
      parent: item,
      index: this.index
    };

    item.children.push (newCategory);
    this.createdCategories.push (newCategory);
    this.index++;

    // open the parent
    item.open = true;
  }

  deleteCategory(item): void
  {
    let isCreated: boolean = false;

    if (item.children.length || item.dashboards.length || item.sharedDashboards.length)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "Cannot delete category since it contains sub categories and/or dashboards." }
      });

      return;
    }

    // find category and remove it from the tree and add it
    // into the deleted categories list
    item.parent.children.splice (item.parent.children.indexOf (item), 1);
    item.parent = null;

    // check if item is a created or an existing category
    for (let createdCategory of this.createdCategories)
    {
      if (item == createdCategory)
      {
        isCreated = true;
        break;
      }
    }

    // add to deleted list if it is an existing category
    if (isCreated)
      this.createdCategories.splice (this.createdCategories.indexOf (item), 1);
    else
      this.deletedCategories.push (item);

    // set selected category to root
    this.categorySelected = this.root;
  }

  recursiveSaveCategory(data): void
  {
    for (let item of data.children)
    {
      if (item.children.length)
        this.recursiveSaveCategory (item);

      item.children = null;
      item.dashboards = null;
      item.sharedDashboards = null;
    }
  }

  saveCategories(): void
  {
    let info;

    this.globals.isLoading = true;

    // remove parent from child contained by root
    for (let child of this.root.children)
    {
      if (child.children.length)
        this.recursiveSaveCategory (child);

      child.parent = null;
      child.children = null;
      child.dashboards = null;
      child.sharedDashboards = null;
    }

    info = {
      createdCategories: this.createdCategories,
      deletedCategories: this.deletedCategories,
      modifiedCategories: this.modifiedCategories
    };

    this.root = null;
    this.categorySelected = null;
    this.saving = 1;

    this.service.saveDashboardCategories (this, info, this.saveSuccess, this.saveError);
  }

  saveSuccess(_this): void
  {
    _this.createdCategories = [];
    _this.modifiedCategories = [];
    _this.deletedCategories = [];

    _this.service.getDashboardCategories2 (_this, _this.getCategorySuccess, _this.getCategoryError);
  }

  saveError(_this): void
  {
    _this.saving = 2;

    _this.createdCategories = [];
    _this.modifiedCategories = [];
    _this.deletedCategories = [];

    _this.service.getDashboardCategories2 (_this, _this.getCategorySuccess, _this.getCategoryError);
  }
}
