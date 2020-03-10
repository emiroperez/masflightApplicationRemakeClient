import { DashboardMenu } from './DashboardMenu';

export class DashboardCategory
{
  "id": number;
  "applicationId": number;
  "owner": number;
  "title": string;
  "parent": any;
  "children": Array<DashboardCategory>;
  "dashboards": Array<DashboardMenu>;
  "sharedDashboards": Array<DashboardMenu>;

  constructor()
  {
    this.id = null;
    this.applicationId = null;
    this.owner = null;
    this.title = '';
    this.parent = null;
    this.children = [];
    this.dashboards = [];
    this.sharedDashboards = [];
  }
}
