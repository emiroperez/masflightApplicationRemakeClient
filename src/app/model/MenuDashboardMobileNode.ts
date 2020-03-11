import { DashboardCategory } from './DashboardCategory';
import { DashboardMenu } from './DashboardMenu';
import { SharedDashboardMenu } from './SharedDashboardMenu';

export class MenuDashboardMobileNode {
    id: number;
    applicationId: number;
    owner: number;
    title: string;    
    expandable: boolean;
    level: number;
    children: DashboardCategory[];
    dashboards: DashboardMenu[];
    sharedDashboards: SharedDashboardMenu[];
    dashboardMenuId: DashboardMenu;
    parentId: number;
    readOnly: boolean;
  }