import { DashboardMenu } from './DashboardMenu';

export class SharedDashboardMenu
{
  "id": number;
  "applicationId": number;
  "owner": number;
  "title": string;
  "parent": any;
  "dashboardMenuId": DashboardMenu;
  "readOnly": boolean;

  constructor()
  {
    this.id = null;
    this.applicationId = null;
    this.owner = null;
    this.title = '';
    this.parent = null;
    this.dashboardMenuId = null;
    this.readOnly = true;
  }
}
