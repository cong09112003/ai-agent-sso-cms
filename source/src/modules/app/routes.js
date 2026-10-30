import PermissionForm from "@modules/app/AppTabs/permission/PermissionForm";
import AppSavePage from "./AppSavebase";
import AppTab from "./AppTabs";
import AccountAppSavePage from "./AppTabs/account/AccountAppSavebase";
import GroupPermissionSavePage from "./AppTabs/groupPermission/GroupPermissonSavebase";
import PermissionSavePage from "./AppTabs/permission/PermissionSaveBase";
import RoleSavePage from "./AppTabs/role/RoleSaveBase";
import UserTypeSavePage from "./AppTabs/userType/UserTypeSavePage";
import AppListPage from "./index";
import AccountAppListPage from "./AppTabs/account/AccountApp";
import NewAccountAppSavePage from "./AppTabs/account/NewAccountAppSavebase";
import AppExtraSavePage from "./AppTabs/appExtra/AppExtraSavePage";
export default {
    AppListPage: {
        path: '/app',
        title: 'app',
        auth: true,
        component: AppListPage,
        // permissions: [apiConfig.manager.getList.baseURL],
    },
    AppSavePage: {
        path: '/app/:id',
        title: 'app savebase',
        auth: true,
        component: AppSavePage,
        // permissions: [apiConfig.device.update.baseURL],
    },
    AppTab: {
        path: '/app/role',
        title: 'apptab',
        auth: true,
        keyActiveTab: 'activeApptab',
        component: AppTab,
        // permissions: [apiConfig.device.update.baseURL],
    },
    AccountAppListPage: {
        path: '/app/account-app',
        title: 'account app list base',
        auth: true,
        component: AccountAppListPage,
        // permissions: [apiConfig.device.update.baseURL],
    },
    AccountAppSavePage: {
        path: '/app/account-app/:id',
        title: 'account app save base',
        auth: true,
        component: AccountAppSavePage,
        // permissions: [apiConfig.device.update.baseURL],
    },
    NewAccountAppSavePage: {
        path: '/app/new-account-app',
        title: 'select account app save base',
        auth: true,
        component: NewAccountAppSavePage,
        // permissions: [apiConfig.device.update.baseURL],
    },
    UserTypeSavePage: {
        path: '/app/user-type/:id',
        title: 'User type save page',
        auth: true,
        component: UserTypeSavePage,
        // permissions: [apiConfig.device.update.baseURL],
    },

    RoleSavePage: {
        path: '/app/role/:id',
        title: 'role save base',
        auth: true,
        component: RoleSavePage,
        // permissions: [apiConfig.device.update.baseURL],
    },
    AppExtraSavePage: {
        path: '/app/app-extra/:id',
        title: 'App extra save page',
        auth: true,
        component: AppExtraSavePage,
        // permissions: [apiConfig.device.update.baseURL],
    },
    PermissionListPage: {
        path: '/app/permission',
        title: 'permission',
        auth: true,
        component: PermissionForm,
        // permissions: [apiConfig.manager.getList.baseURL],
    },
    PermissionSavePage: {
        path: '/app/permission/:id',
        title: 'app',
        auth: true,
        component: PermissionSavePage,
        // permissions: [apiConfig.manager.getList.baseURL],
    },

    GroupPermissionSavePage: {
        path: '/app/group-permission/:id',
        title: 'app',
        auth: true,
        component: GroupPermissionSavePage,
        // permissions: [apiConfig.manager.getList.baseURL],
    },

};