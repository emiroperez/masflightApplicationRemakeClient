import { Component, ViewChild, Output, EventEmitter, Inject } from '@angular/core';
import { MatDialogRef, MatTabGroup, MAT_DIALOG_DATA } from '@angular/material';

import { DatalakeService } from '../services/datalake.service';
import { DatalakeQuerySchema } from '../datalake-query-engine/datalake-query-schema';
import { DatalakeBucket } from '../datalake-create-table/datalake-bucket';
import { any } from '@amcharts/amcharts4/.internal/core/utils/Array';
import { dataLoader } from '@amcharts/amcharts4/core';
import { DatalakeDataUploadComponent } from '../datalake-data-upload/datalake-data-upload.component';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-datalake-create-table',
  templateUrl: './datalake-create-table.component.html'
})
export class DatalakeCreateTableComponent {
  schemas: DatalakeQuerySchema[] = [];
  buckets: DatalakeBucket[] = [];
  Datavalue: any;
  isLoading: boolean = false;

  @ViewChild("tabs")
  tabs: MatTabGroup;
  
  @ViewChild("upload")
  upload: DatalakeDataUploadComponent;

  constructor(public globals: Globals,public dialogRef: MatDialogRef<DatalakeCreateTableComponent>,
    private service: DatalakeService,
    @Inject(MAT_DIALOG_DATA) public data: {index: any , schemaName: any , tableName: any})
  {
    this.isLoading = true;
    // if(this.data){
    //   this.Datavalue = this.data;
    // }
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
    _this.upload.setschema();
    _this.tabs.realignInkBar ();
  }

  handlerError(_this, result): void
  {
    console.log (result);
    _this.isLoading = false;
    _this.tabs.realignInkBar ();
  }

  onNoClick(event): void
  {
    if(event){      
      this.data=event;
      // this.Datavalue = event;
      // this.upload.setschema();
      // this.globals.isLoading = false;
    }else{
      this.dialogRef.close ();
    }
  }

  checkVisibility(): string
  {
    if (this.isLoading)
      return "none";

    return "block";
  }

  getSelectedIndex(){
    return this.data.index;
  }

  tabIndexChange(event){
    this.data.index=event;
  }

  startLoading(): void
  {
    this.isLoading = true;
  }

  stopLoading(): void
  {
    this.isLoading = false;
  }
}
