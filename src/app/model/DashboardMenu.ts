export class DashboardMenu
{
  "id": number;
  "applicationId": number;
  "owner": number;
  "title": string;
  "parent": any;
  "readOnly": boolean;

  constructor()
  {
    this.id = null;
    this.applicationId = null;
    this.owner = null;
    this.title = '';
    this.parent = null;
    this.readOnly = false;
  }
}
