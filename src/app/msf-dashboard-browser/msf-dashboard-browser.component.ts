import { Component } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';

import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-msf-dashboard-browser',
  templateUrl: './msf-dashboard-browser.component.html'
})
export class MsfDashboardBrowserComponent {
  selectedFolder: any = null;
  isLoading: boolean = false;
  root: any = null;

  constructor(public dialogRef: MatDialogRef<MsfDashboardBrowserComponent>,
    public dialog: MatDialog, public globals: Globals,
    private service: ApplicationService)
  {
    this.isLoading = true;
    this.service.getDashboardCategories (this, this.handlerSuccess, this.handlerError);
  }

  onNoClick(): void
  {
    this.dialogRef.close ();
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

  handlerSuccess(_this, data): void
  {
    _this.isLoading = false;

    // set directory tree
    _this.root = {
      id: 0,
      title: "/",
      children: data,
      open: true,
      parent: null
    };

    // set parent for each node
    _this.recursiveDirectoryTree (_this.root);
    _this.selectedFolder = _this.root;
  }

  handlerError(_this): void
  {
    _this.isLoading = false;

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Unable to get service locations." }
    });

    _this.onNoClick ();
  }

  toggleRoot(): void
  {
    this.root.open = !this.root.open;
  }

  selectFolder(item): void
  {
    this.selectedFolder = item;
  }

  setCategory(item): void
  {
    let selectedCategory = { item: null, fullPath: null };
    let node;

    selectedCategory.item = item;

    // set full path for the item
    if (item != this.root)
    {
      selectedCategory.fullPath = "/" + item.title;
      node = item.parent;

      while (node != this.root)
      {
        selectedCategory.fullPath = "/" + node.title + selectedCategory.fullPath;
        node = node.parent;
      }
    }
    else
      selectedCategory.fullPath = "/";

    this.dialogRef.close (selectedCategory);
  }

  categoryModified(item): void
  {
    // do nothing
  }
}
