import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-dashboard-browser-folder-item',
  templateUrl: './msf-dashboard-browser-folder-item.component.html'
})
export class MsfDashboardBrowserFolderItemComponent {

  @Input("directoryTree")
  directoryTree: any;

  @Input("treeMargin")
  treeMargin: number;

  @Input("selectedFolder")
  selectedFolder: any;

  @Input("allowEditing")
  allowEditing: boolean = false;

  @Output("selectFolder")
  selectFolder = new EventEmitter ();

  @Output("categoryModified")
  categoryModified = new EventEmitter ();

  constructor(public globals: Globals) { }

  toggleTreeItem(item): void
  {
    item.open = !item.open;
  }

}
