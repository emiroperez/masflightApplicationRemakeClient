import { Component, OnInit, HostListener } from '@angular/core';

import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { DatalakeQuerySchema } from '../datalake-query-engine/datalake-query-schema';

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

  queryTabs: any[] = ["Query 1"];
  querySchemas: DatalakeQuerySchema[] = [];
  queryInput: string = "";

  // Query execution table result
  displayedColumns: string[] = [];
  dataSource: any[] = [];

  constructor(public globals: Globals, private service: ApplicationService) { }

  ngOnInit()
  {
    this.globals.isLoading = true;
    this.service.getDatalakeSchemas (this, this.setSchemas, this.handlerError);
  }

  ngOnDestroy(): void
  {
    for (let querySchema of this.querySchemas)
    {
      querySchema._onDestroy.next ();
      querySchema._onDestroy.complete ();
    }
  }

  runQuery(): void
  {
    this.globals.isLoading = true;
    this.service.datalakeExecuteQuery (this, "pruebaperformancepq", this.queryInput, this.showQueryResults, this.handlerError);
  }

  addQueryTab(): void
  {
    this.queryTabs.push ("Query " + (this.queryTabs.length + 1));
    this.selectedIndex = this.queryTabs.length - 1;
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

  showQueryResults(_this, data): void
  {
    if (!data)
    {
      _this.globals.isLoading = false;
      return;
    }

    if (!data.Columns || (data.Columns && !data.Columns.length))
    {
      _this.globals.isLoading = false;
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

    _this.globals.isLoading = false;
  }

  handlerError(_this, result): void
  {
    console.log (result);
    _this.globals.isLoading = false;
  }
}
