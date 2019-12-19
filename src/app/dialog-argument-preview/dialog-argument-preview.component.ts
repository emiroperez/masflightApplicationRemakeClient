import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Utils } from '../commons/utils';
import { Arguments } from '../model/Arguments';
import { ComponentType } from '../commons/ComponentType';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-dialog-argument-preview',
  templateUrl: './dialog-argument-preview.component.html'
})
export class DialogArgumentPreviewComponent implements OnInit {
  argList: any[];

  constructor(public dialogRef: MatDialogRef<DialogArgumentPreviewComponent>,
    public globals: Globals,
    public utils: Utils,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.argList = data.argList.arguments;
  }

  ngOnInit()
  {
  }

  ngAfterViewInit()
  {
    this.changeDetectorRef.detectChanges ();
  }

  onNoClick(): void
  {
    this.dialogRef.close ();
  }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }

  isDateRange(argument: Arguments)
  {
    return ComponentType.dateRange == argument.type;
  }

  getDateValue(value: any): any
  {
    if (value != null)
    {
      if (value.id != null)
        return value.id;
    }

    return value;
  }
}
