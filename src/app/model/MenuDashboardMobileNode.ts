import { DashboardCategory } from './DashboardCategory';
import { DashboardMenu } from './DashboardMenu';
import { SharedDashboardMenu } from './SharedDashboardMenu';

export class MenuDashboardMobileNode {
    public static READ_ONLY_DASHBOARD = 1;
    public static CATEGORY_MANAGER_OPTION = 2;
    public static SHARED_MENU_OPTION = 3;
    public static ADD_DASHBOARD_OPTION = 4;

    id: number;
    applicationId: number;
    owner: number;
    title: string;    
    expandable: boolean;
    level: number;
    children: DashboardCategory[];
    dashboards: DashboardMenu[];
    sharedDashboards: SharedDashboardMenu[];
    options: DashboardCategory[];
    dashboardMenuId: DashboardMenu;
    parentId: number;
    menuType: number;
  }