import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { DatalakeService } from '../services/datalake.service';
import { DatalakeQuerySchema } from '../datalake-query-engine/datalake-query-schema';
import { DatalakeBucket } from '../datalake-create-table/datalake-bucket';

@Component({
  selector: 'app-datalake-create-table',
  templateUrl: './datalake-create-table.component.html'
})
export class DatalakeCreateTableComponent {
  schemas: DatalakeQuerySchema[] = [];
  buckets: DatalakeBucket[] = [];
  isLoading: boolean = false;

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
      return;
    }

    for (let bucket of data.sources)
      _this.buckets.push (new DatalakeBucket (bucket.bucketName, bucket.schemaName));

    _this.isLoading = false;
  }

  handlerError(_this, result): void
  {
    console.log (result);
    _this.isLoading = false;
  }

  onNoClick(): void
  {
    this.dialogRef.close ();
  }

  checkVisibility(): string
  {
    if (this.isLoading)
      return "none";

    return "block";
  }
}
