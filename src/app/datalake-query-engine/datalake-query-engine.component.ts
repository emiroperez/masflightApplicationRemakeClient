import { Component, OnInit, HostListener } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';

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
  querySchemas: any[] =
  [
    {
      open: false,
      filter: "",
      filteredTables: new ReplaySubject<any[]> (1),
      _onDestroy: new Subject<void> (),
      tables: [
        {
          longName: "FLIGHT RADAR24 TRACKING",
          tableName: "fradar24_r"
        },
        {
          longName: "FLIGHT RADAR24 TRACKING",
          tableName: "fradar24_r"
        },
        {
          longName: "FLIGHT RADAR24 TRACKING",
          tableName: "fradar24_r"
        },
        {
          longName: "FLIGHT RADAR24 TRACKING",
          tableName: "fradar24_r"
        },
        {
          longName: "FLIGHT RADAR24 TRACKING",
          tableName: "fradar24_r"
        },
        {
          longName: "FLIGHT RADAR24 TRACKING",
          tableName: "fradar24_r"
        },
        {
          longName: "FLIGHT RADAR24 TRACKING",
          tableName: "fradar24_r"
        },
        {
          longName: "FLIGHT RADAR24 TRACKING",
          tableName: "fradar24_r"
        },
        {
          longName: "FLIGHT RADAR24 TRACKING",
          tableName: "fradar24_r"
        },
        {
          longName: "FLIGHT RADAR24 TRACKING",
          tableName: "fradar24_r"
        }
      ]
    },
    {
      open: false,
      filter: "",
      filteredTables: new ReplaySubject<any[]> (1),
      _onDestroy: new Subject<void> (),
      tables: [
        {
          longName: "Test",
          tableName: "test_r"
        },
        {
          longName: "FLIGHT RADAR24 TRACKING",
          tableName: "fradar24_r"
        }
      ]
    }
  ];

  constructor() { }

  ngOnInit()
  {
    for (let querySchema of this.querySchemas)
      querySchema.filteredTables.next (querySchema.tables.slice ());
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

  closeQueryTab(index: number): void
  {
    this.queryTabs.splice (index, 1);

    if (this.selectedIndex == this.queryTabs.length)
      this.selectedIndex--;
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

  toggleSchema(querySchema: any): void
  {
    querySchema.open = !querySchema.open;
  }

  filterSchema(querySchema: any): void
  {
    let search, filteredResults;

    if (!querySchema.tables.length)
      return;

    // get the search keyword
    search = querySchema.filter;
    if (!search)
    {
      querySchema.filteredTables.next (querySchema.tables.slice ());
      return;
    }

    search = search.toLowerCase ();
    filteredResults = querySchema.tables.filter (a => (a.longName.toLowerCase ().indexOf (search) > -1
      || a.tableName.toLowerCase ().indexOf (search) > -1));

    querySchema.filteredTables.next (
      filteredResults.filter (function (elem, index, self)
      {
        return index === self.indexOf(elem);
      })
    );
  }
}
