import { Component, OnInit, HostListener, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';
import "codemirror/mode/sql/sql";

import { Globals } from '../globals/Globals';
import { DatalakeService } from '../services/datalake.service';
import { DatalakeQuerySchema } from '../datalake-query-engine/datalake-query-schema';
import { DatalakeQueryTab } from './datalake-query-tab';
import { MessageComponent } from '../message/message.component';

const minPanelWidth = 25;

@Component({
  selector: 'app-datalake-query-engine',
  templateUrl: './datalake-query-engine.component.html'
})
export class DatalakeQueryEngineComponent implements OnInit {
  leftPanelWidth: number = 25;
  rightPanelWidth: number = 75;
  resizePanels: boolean = false;
  selectedIndex: number = 0;

  queryTabs: DatalakeQueryTab[] = [ new DatalakeQueryTab () ];
  querySchemas: DatalakeQuerySchema[] = [];
  queryLoading: boolean;

  // ngx-codemirror variables
  @ViewChildren(CodemirrorComponent)
  queryEditors: QueryList<CodemirrorComponent>; 

  queryEditorOptions: any = {
    lineNumbers: true,
    theme: 'material',
    mode: {
      name: 'text/x-mariadb'
    }
  };

  // Query execution table result
  startQueryTime: number;
  endQueryTime: number;
  displayedColumns: string[] = [];
  dataSource: any[] = [];

  constructor(public globals: Globals, private changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog, private service: DatalakeService) { }

  ngOnInit()
  {
    this.globals.isLoading = true;
    this.service.getDatalakeSchemas (this, this.setSchemas, this.setSchemasError);
  }

  ngAfterViewInit(): void
  {
    // display first column number on the query editor
    this.queryEditors.forEach ((queryEditor) => {
      queryEditor.codeMirror.refresh ();
    });
  }

  ngOnDestroy(): void
  {
    for (let querySchema of this.querySchemas)
    {
      querySchema._onDestroy.next ();
      querySchema._onDestroy.complete ();
    }
  }

  runQuery(query: DatalakeQueryTab): void
  {
    if (!query.schema)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "You must select a schema before running the query." }
      });

      return;
    }

    if (this.queryLoading)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "A query is already running, you must cancel it before running a new query." }
      });

      return;
    }

    this.queryLoading = true;
    this.startQueryTime = Date.now ();
    this.endQueryTime = null;

    // clear query result table
    this.displayedColumns = [];
    this.dataSource = [];

    this.service.datalakeExecuteQuery (this, query.schema, query.input, this.showQueryResults, this.queryError);
  }

  addQueryTab(): void
  {
    this.queryTabs.push (new DatalakeQueryTab ());
    this.selectedIndex = this.queryTabs.length - 1;
    this.changeDetectorRef.detectChanges (); // detect changes, so we can refresh the query editor on the new tab
    this.queryEditors.last.codeMirror.refresh ();
  }

  closeQueryTab(event, index: number): void
  {
    this.queryTabs.splice (index, 1);

    if (this.selectedIndex == this.queryTabs.length)
      this.selectedIndex--;

    event.preventDefault ();
    event.stopPropagation ();
  }

  onIndexChange(event: any): void
  {
    this.selectedIndex = event;
  }

  onDragClick(event): void
  {
    this.resizePanels = true;

    event.preventDefault ();
    event.stopPropagation ();
  }

  @HostListener('document:mousemove', ['$event'])
  onDragMove(event: MouseEvent)
  {
    let offsetX, totalWidth;

    if (!this.resizePanels)
        return;

    // convert horizontal offset into percentage for proper resizing
    offsetX = event.movementX * 100 / window.innerWidth;
    totalWidth = this.leftPanelWidth + this.rightPanelWidth;

    // begin resizing the panels
    if (offsetX > 0 && this.rightPanelWidth - offsetX < minPanelWidth)
    {
      this.rightPanelWidth = minPanelWidth;
      this.leftPanelWidth = totalWidth - minPanelWidth;
      return;
    }
    else if (offsetX < 0 && this.leftPanelWidth + offsetX < minPanelWidth)
    {    
      this.leftPanelWidth = minPanelWidth;
      this.rightPanelWidth = totalWidth - minPanelWidth;
      return;
    }

    this.leftPanelWidth += offsetX;
    this.rightPanelWidth -= offsetX;
  }

  @HostListener('document:mouseup', ['$event'])
  onDragRelease(event: MouseEvent)
  {
    if (!this.resizePanels)
      return;

    this.resizePanels = false;
  }

  getHoverCursor(): string
  {
    // Use column resize while dragging the panels
    if (this.resizePanels)
      return "col-resize";

    return "inherit";
  }

  setSchemas(_this, data): void
  {
    if (!data.Schemas.length)
    {
      _this.globals.isLoading = false;
      return;
    }

    for (let schema of data.Schemas)
      _this.querySchemas.push (new DatalakeQuerySchema (schema));

    _this.globals.isLoading = false;
  }

  setSchemasError(_this, result): void
  {
    console.log (result);
    _this.globals.isLoading = false;
  }

  showQueryResults(_this, data): void
  {
    if (!data)
    {
      _this.startQueryTime = null;
      _this.queryLoading = false;
      return;
    }

    if (!data.Columns || (data.Columns && !data.Columns.length))
    {
      _this.queryLoading = false;
      return;
    }

    for (let column of data.Columns)
      _this.displayedColumns.push (column.title);

    if (data.Values)
    {
      for (let result of data.Values)
      {
        let item = {};

        for (let i = 0; i < _this.displayedColumns.length; i++)
          item[_this.displayedColumns[i]] = result[i];

        _this.dataSource.push (item);
      }
    }

    _this.endQueryTime = Date.now ();
    _this.queryLoading = false;
  }

  queryError(_this, result): void
  {
    console.log (result);
    _this.queryLoading = false;
    _this.startQueryTime = null;
  }

  calcExecutionTime(): string
  {
    let queryTime: number = this.endQueryTime - this.startQueryTime;
    let result: string = "";

    // print milliseconds if query time is below 1 second
    if (queryTime < 1000)
      return queryTime + "ms";

    // print seconds with fractional digits if query time is below 1 minute
    if (queryTime < 60000)
    {
      let seconds = queryTime / 1000;
      return seconds.toFixed (2) + "s";
    }

    if (queryTime >= 3600000)
      result += Math.trunc (queryTime / 3600000) + "h";

    if (queryTime >= 60000)
    {
      if (result)
        result += " ";

      result += Math.trunc ((queryTime % 60000) / 60000) + "m";
    }

    if (result)
      result += " ";

    return result + Math.trunc ((queryTime % 1000) / 1000) + "s";
  }

  cancelQueryLoading(): void
  {
    this.queryLoading = false;
    this.startQueryTime = null;
  }

  calcTableWidth(): number
  {
    return document.getElementById ("query-engine-result-header").clientWidth;
  }
}
