export class DashboardMenu
{
  "id": number;
  "applicationId": number;
  "owner": number;
  "title": string;
  "description": string;
  "parent": any;
  "readOnly": boolean;

  constructor()
  {
    this.id = null;
    this.applicationId = null;
    this.owner = null;
    this.title = '';
    this.description = '';
    this.parent = null;
    this.readOnly = false;
  }
}
