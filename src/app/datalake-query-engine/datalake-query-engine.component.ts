import { Component, OnInit, HostListener } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';

import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';

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
  querySchemas: any[] = [];

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
    {
      _this.querySchemas.push ({
        schemaName: schema,
        open: false,
        filter: "",
        filteredTables: new ReplaySubject<any[]> (1),
        _onDestroy: new Subject<void> (),
        tables: []
      });
    }

    _this.globals.isLoading = false;
  }

  handlerError(_this, result): void
  {
    console.log (result);
    _this.globals.isLoading = false;
  }
}
