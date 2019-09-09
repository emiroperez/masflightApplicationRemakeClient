import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-datalake-alarms',
  templateUrl: './datalake-alarms.component.html'
})
export class DatalakeAlarmsComponent implements OnInit {
  alarmFormGroup: FormGroup;
  notifyMode: number = 0;

  constructor(private formBuilder: FormBuilder) {
    this.alarmFormGroup = this.formBuilder.group ({
      schema: ['', Validators.required],
      table: new FormControl ({ value: '', disabled: true }, Validators.required)
    });
  }

  ngOnInit() {
  }

  schemaChanged(): void
  {
  }

}
