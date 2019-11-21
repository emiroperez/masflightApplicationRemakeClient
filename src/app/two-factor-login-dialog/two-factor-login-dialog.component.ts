import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Globals } from '../globals/Globals';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-two-factor-login-dialog',
  templateUrl: './two-factor-login-dialog.component.html'
})
export class TwoFactorLoginDialogComponent {
  code: number;

  constructor(
    public dialogRef: MatDialogRef<TwoFactorLoginDialogComponent>,
    public globals: Globals,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  validate2FACode()
  {
    this.authService.verify2FACode (this, this.data.session, this.code, this.handleResponse, this.handleError);
  }

  handleResponse(_this, result)
  {
    _this.dialogRef.close ({
      pass: result,
      message: !result ? "Authorization Failed." : null
    });
  }

  closeDialog()
  {
    this.dialogRef.close ({
      pass: false,
      message: null
    });
  }

  handleError(_this, error)
  {
  }
}
