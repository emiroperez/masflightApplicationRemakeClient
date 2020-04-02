import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';

import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-public-dashboard',
  templateUrl: './public-dashboard.component.html'
})
export class PublicDashboardComponent {
  dashboard: any;

  constructor(private route: ActivatedRoute, private router: Router,
    private services: ApplicationService, public globals: Globals,
    private dialog: MatDialog)
  {
    this.globals.setOverlayTheme ({ checked: false }, true);

    this.route.params.subscribe (params =>
    {
      if (params['name'])
      {
        this.globals.isLoading = true;
        this.services.getPublicDashboard (this, params['name'], this.publicDashboardSuccess, this.publicDashboardError);
      }
      else
        this.router.navigate (['']); // go to the login screen if there is no parameter set
    });
  }

  publicDashboardSuccess(_this, data): void
  {
    if (!data)
    {
      _this.globals.isLoading = false;
      _this.router.navigate(['']);
      return;
    }

    _this.dashboard = data;
    _this.services.getApplication (_this, data.applicationId, _this.appSuccess, _this.publicDashboardError);
  }

  publicDashboardError(_this): void
  {
    _this.globals.isLoading = false;

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to load dashboard!" }
    });

    _this.router.navigate (['']);
  }

  appSuccess(_this, application): void
  {
    if (!application)
    {
      _this.globals.isLoading = false;
      _this.router.navigate(['']);
      return;
    }

    _this.setDashboard (application);
  }

  setDashboard(application): void
  {
    this.globals.showDashboard = true;

    this.globals.minDate = null;
    this.globals.maxDate = null;

    this.globals.currentOption = 'dashboard';
    this.globals.currentApplication = application;
    this.globals.currentDashboardMenu = this.dashboard;
    this.globals.readOnlyDashboard = this.dashboard;
  }
}
