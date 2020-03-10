import { DashboardCategory } from './DashboardCategory';
import { DashboardMenu } from './DashboardMenu';
import { SharedDashboardMenu } from './SharedDashboardMenu';

export class MenuDashboardMobileNode {
    id: any;
    applicationId: any;
    owner: any;
    title: any;    
    expandable: boolean;
    level: number;
    children: DashboardCategory[];
    dashboards: DashboardMenu[];
    sharedDashboards: SharedDashboardMenu[];
    dashboardMenuId: DashboardMenu;
    readOnly: any;
  }