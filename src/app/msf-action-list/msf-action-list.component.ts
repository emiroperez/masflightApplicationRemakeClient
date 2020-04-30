import { Component, OnInit, Input } from '@angular/core';
import { ApplicationService } from '../services/application.service';
import { Globals } from '../globals/Globals';
import { BehaviorSubject } from 'rxjs';
import { ActionListFlatNode } from '../model/ActionListFlatNode';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material';

@Component({
  selector: 'app-msf-action-list',
  templateUrl: './msf-action-list.component.html'
})
export class MsfActionListComponent implements OnInit {

  @Input('values')
  values: any;

  dataChange = new BehaviorSubject<any[]>([]);
  get dataEditActionList(): any[] { return this.dataChange.value; }
  expandedNodeSet = new Set<string>();
  dragging = false;
  expandTimeout: any;
  expandDelay = 1000;
  flatNodeMap = new Map<ActionListFlatNode, any>();
  nestedNodeMap = new Map<any, ActionListFlatNode>();
  private transformer = (node: any, level: number) =>
      {
        const existingNode = this.nestedNodeMap.get (node);
        const flatNode = existingNode && existingNode.title === node.title
          ? existingNode
          : new ActionListFlatNode ();
        flatNode.expandable = !!node.children && node.children.length > 0;
        flatNode.id = node.id;
        flatNode.uid = node.uid;
        flatNode.icon = node.icon;
        flatNode.dashboardPanel_id = node.dashboardPanel_id;
        flatNode.level = level;
        flatNode.parent = node.parent;
        flatNode.title = node.title;
        flatNode.description = node.description;
        flatNode.children = node.children;
        
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };
  treeControl = new FlatTreeControl<ActionListFlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );
  dataSourceEditActionList = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  hasChild = (_: number, node: any) => (node.expandable);
  
  constructor(private service: ApplicationService,private globals: Globals) {
    this.dataChange.subscribe(data => {
      this.dataSourceEditActionList.data = data;
    });
   }

  ngOnInit() {
    this.globals.isLoading = false;
    this.dataChange.next(this.values);
    this.treeControl.expandAll();

    // this.service.loadActionListForDashboard(this,this.values.panelId, this.handlerGetSuccessMenuData, this.handlerGetErrorMenuData);
  }

  rebuildTreeForData(data: any) {
    this.rememberExpandedTreeNodes(this.treeControl, this.expandedNodeSet);
    this.dataSourceEditActionList.data = data;
    this.forgetMissingExpandedNodes(this.treeControl, this.expandedNodeSet);
    this.expandNodesById(
      this.treeControl.dataNodes,
      Array.from(this.expandedNodeSet)
    );
  }

  private rememberExpandedTreeNodes(
    treeControl: FlatTreeControl<ActionListFlatNode>,
    expandedNodeSet: Set<string>
  ) {
    if (treeControl.dataNodes) {
      treeControl.dataNodes.forEach(node => {
        if (treeControl.isExpandable(node) && treeControl.isExpanded(node)) {
          // capture latest expanded state
          expandedNodeSet.add(node.uid);
        }
      });
    }
  }

  private forgetMissingExpandedNodes(
    treeControl: FlatTreeControl<ActionListFlatNode>,
    expandedNodeSet: Set<string>
  ) {
    if (treeControl.dataNodes) {
      expandedNodeSet.forEach(nodeId => {
        if (!treeControl.dataNodes.find(n => n.uid === nodeId)) {
          expandedNodeSet.delete(nodeId);
        }
      });
    }
  }

  private expandNodesById(flatNodes: ActionListFlatNode[], ids: string[]) {
    if (!flatNodes || flatNodes.length === 0) return;
    const idSet = new Set(ids);
    return flatNodes.forEach(node => {
      if (idSet.has(node.uid)) {
        this.treeControl.expand(node);
        let parent = this.getParentEditActionListNode(node);
        while (parent) {
          this.treeControl.expand(parent);
          parent = this.getParentEditActionListNode(parent);
        }
      }
    });
  }

  
  private getParentEditActionListNode(node: ActionListFlatNode): ActionListFlatNode | null {
    const currentLevel = node.level;
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (currentNode.level < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  getNodeIndent(node){
    return 20;
  }


}
