import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MatTabGroup } from '@angular/material';

import { DatalakeService } from '../services/datalake.service';
import { DatalakeQuerySchema } from '../datalake-query-engine/datalake-query-schema';
import { DatalakeBucket } from '../datalake-create-table/datalake-bucket';
import { any } from '@amcharts/amcharts4/.internal/core/utils/Array';

@Component({
  selector: 'app-datalake-create-table',
  templateUrl: './datalake-create-table.component.html'
})
export class DatalakeCreateTableComponent {
  schemas: DatalakeQuerySchema[] = [];
  buckets: DatalakeBucket[] = [];
  isLoading: boolean = false;

  @ViewChild("tabs")
  tabs: MatTabGroup;
  
  constructor(public dialogRef: MatDialogRef<DatalakeCreateTableComponent>,
    private service: DatalakeService)
  {
    this.isLoading = true;
    this.service.getDatalakeSchemas (this, this.setSchemas, this.handlerError);
  }

  setSchemas(_this, data): void
  {
    if (!data.Schemas.length)
    {
      _this.isLoading = false;
      _this.tabs.realignInkBar ();
      return;
    }

    for (let schema of data.Schemas)
      _this.schemas.push (new DatalakeQuerySchema (schema));

    _this.service.getDatalakeBuckets (_this, _this.setBuckets, _this.handlerError);
  }

  setBuckets(_this, data): void
  {
    if (!data.sources || !data.sources.length)
    {
      _this.isLoading = false;
      _this.tabs.realignInkBar ();
      return;
    }

    for (let bucket of data.sources)
      _this.buckets.push (new DatalakeBucket (bucket.bucketName, bucket.schemaName));

    _this.isLoading = false;
    _this.tabs.realignInkBar ();
  }

  handlerError(_this, result): void
  {
    console.log (result);
    _this.isLoading = false;
    _this.tabs.realignInkBar ();
  }

  // onNoClick(request): void
  onNoClick(): void
  {
    // this.dialogRef.close (request);
    this.dialogRef.close ();
  }

  checkVisibility(): string
  {
    if (this.isLoading)
      return "none";

    return "block";
  }
}
