import apiConfig from "@constants/apiConfig";
import ManagerListPage from ".";
import ManagerSaveBase from "./ManagerSavePage";
import AccountAppListPage from "./AccountApp";
import AccountAppSavePage from "./AccountAppSavebase";
import RoleAppAccountSavebase from "./RoleAppAccountSavebase";
import NotificationListPage from "./Notification";
import { commonMessage } from "@locales/intl";
export default {
    managerListPage: {
        path: '/manager',
        title: 'manager',
        auth: true,
        component: ManagerListPage,
        // permissions: [apiConfig.manager.getList.baseURL],
    },
    managerSaveBase: {
        path: '/manager/:id',
        title: 'manager savebase',
        auth: true,
        component: ManagerSaveBase,
        // permissions: [apiConfig.device.update.baseURL],
    },
    AppAcountListPage: {
        path: '/manager/app',
        title: 'manager',
        auth: true,
        component: AccountAppListPage,
        // permissions: [apiConfig.manager.getList.baseURL],
    },
    AppAcountSaveBase: {
        path: '/manager/app/:id',
        title: 'manager',
        auth: true,
        component: AccountAppSavePage,
        // permissions: [apiConfig.manager.getList.baseURL],
    },
    RoleAppAcountSaveBase: {
        path: '/manager/app/role/:id',
        title: 'manager',
        auth: true,
        component: RoleAppAccountSavebase,
        // permissions: [apiConfig.manager.getList.baseURL],
    },
    notificationListPage: {
        path: '/manager/:managerId/notification',
        auth: true,
        permission: [apiConfig.notification.getList.permissionCode],
        component: NotificationListPage,
        pageOptions: {
            objectName: commonMessage.notification,
            renderBreadcrumb: (messages, t, title, options = {}) => {
                return [
                    { breadcrumbName: 'Quản trị viên', path: `/manager` },
                    { breadcrumbName: title },
                ];
            },
        },
    },
};