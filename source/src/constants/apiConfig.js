import { AppConstants, apiUrl, apiTenantUrl } from '.';

const baseHeader = {
    'Content-Type': 'application/json',
};

const multipartFormHeader = {
    'Content-Type': 'multipart/form-data',
};

const apiConfig = {
    account: {
        login: {
            baseURL: `${apiUrl}v1/account/login`,
            method: 'POST',
            headers: baseHeader,
        },
        loginSso: {
            baseURL: `${apiUrl}v1/account/sso-login`,
            method: 'POST',
            headers: baseHeader,
        },
        loginBasic: {
            baseURL: `${apiUrl}api/token`,
            method: 'POST',
            headers: baseHeader,
        },
        getProfile: {
            baseURL: `${apiUrl}v1/account/profile`,
            method: 'GET',
            headers: baseHeader,
        },
        updateProfile: {
            baseURL: `${apiUrl}v1/account/update_profile_admin`,
            method: 'PUT',
            headers: baseHeader,
            permissionCode: "ACC_U_PROFILE_AD",
        },
        changePassword: {
            baseURL: `${apiUrl}v1/account/change-password`,
            method: 'PUT',
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/account/get/:id`,
            method: 'GET',
            headers: baseHeader,
            permissionCode: "ACC_V",
        },
        refreshToken: {
            baseURL: `${apiUrl}v1/account/refresh_token`,
            method: 'POST',
            headers: baseHeader,
        },
        logout: {
            baseURL: `${apiUrl}v1/account/logout`,
            method: 'GET',
            headers: baseHeader,
        },
        mfaStatus: {
            baseURL: `${apiUrl}v1/account/update-mfa-status`,
            method: 'PUT',
            headers: baseHeader,
            permissionCode: "ACC_U_MFA",
        },
        verifyOtp: {
            baseURL: `${apiUrl}v1/account/verify-otp`,
            method: 'POST',
            headers: baseHeader,
            permissionCode: "ACC_TOTP",
        },
        verifyCredential: {
            baseURL: `${apiUrl}v1/account/verify-credential`,
            method: 'POST',
            headers: baseHeader,
        },
        resetMfa: {
            baseURL: `${apiUrl}v1/account/reset-mfa`,
            method: 'PUT',
            headers: baseHeader,
            permissionCode: "ACC_S_MFA",
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/account/auto-complete`,
            method: 'GET',
            headers: baseHeader,
        },
        synchronize: {
            baseURL: `${apiUrl}v1/account/synchronize/:appId`,
            method: 'GET',
            headers: baseHeader,
            permissionCode: "ACC_SA",
        },
        synchronizeAll: {
            baseURL: `${apiUrl}v1/account/synchronize-all`,
            method: 'GET',
            headers: baseHeader,
            permissionCode: "ACC_SA",
        },
        checkToken: {
            baseURL: `${apiUrl}v1/account/verify-token`,
            method: "GET",
            headers: baseHeader,
        },
    },
    user: {
        getList: {
            baseURL: `${apiUrl}v1/account/list`,
            method: `GET`,
            headers: baseHeader,
            permissionCode: "ACC_L",
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/account/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/account/get/:id`,
            method: `GET`,
            headers: baseHeader,
            permissionCode: "ACC_V",
        },
        create: {
            baseURL: `${apiUrl}v1/account/create_admin`,
            method: `POST`,
            headers: baseHeader,
            permissionCode: "ACC_C_AD",
        },
        update: {
            baseURL: `${apiUrl}v1/account/update_admin`,
            method: `PUT`,
            headers: baseHeader,
            permissionCode: "ACC_U_AD",
        },
        delete: {
            baseURL: `${apiUrl}v1/account/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
            permissionCode: "ACC_D",
        },
    },
    accountApp: {
        getList: {
            baseURL: `${apiUrl}v1/account-app-role/list`,
            method: `GET`,
            headers: baseHeader,
            permissionCode: "AAR_L",
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/account-app-role/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/account-app-role/get/:id`,
            method: `GET`,
            headers: baseHeader,
            permissionCode: "AAR_V",
        },
        create: {
            baseURL: `${apiUrl}v1/account-app-role/create`,
            method: `POST`,
            headers: baseHeader,
            permissionCode: "AAR_C",
        },
        update: {
            baseURL: `${apiUrl}v1/account-app-role/update`,
            method: `PUT`,
            headers: baseHeader,
            permissionCode: "AAR_U",
        },
        delete: {
            baseURL: `${apiUrl}v1/account-app-role/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
            permissionCode: "AAR_D",
        },
        privateCreate: {
            baseURL: `${apiUrl}v1/account-app-role/private-create`,
            method: `POST`,
            headers: baseHeader,
            permissionCode: "AAR_C",
        },
        updateSystem: {
            baseURL: `${apiUrl}v1/account-app-role/update-system`,
            method: `PUT`,
            headers: baseHeader,
            permissionCode: "AAR_U",
        },
    },
    role: {
        getList: {
            baseURL: `${apiUrl}v1/role/list`,
            method: `GET`,
            headers: baseHeader,
            permissionCode: "RO_L",
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/role/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/role/get/:id`,
            method: `GET`,
            headers: baseHeader,
            permissionCode: "RO_V",
        },
        create: {
            baseURL: `${apiUrl}v1/role/create`,
            method: `POST`,
            headers: baseHeader,
            permissionCode: "RO_C",
        },
        update: {
            baseURL: `${apiUrl}v1/role/update`,
            method: `PUT`,
            headers: baseHeader,
            permissionCode: "RO_U",
        },
        delete: {
            baseURL: `${apiUrl}v1/role/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
            permissionCode: "RO_D",
        },
    },
    customer: {
        getList: {
            baseURL: `${apiUrl}v1/customer/list`,
            method: `GET`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/customer/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/customer/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/customer/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/customer/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/customer/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
    },
    post: {
        getList: {
            baseURL: `${apiUrl}api/posts/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}api/posts/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}api/posts/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}api/posts/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}api/posts/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}api/posts/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
    },
    file: {
        upload: {
            path: `${AppConstants.mediaRootUrl}v1/file/upload`,
            method: 'POST',
            headers: multipartFormHeader,
        },
        image: {
            path: `${AppConstants.mediaRootUrl}admin/api/image/upload`,
            method: 'POST',
            headers: multipartFormHeader,
        },
        video: {
            path: `${AppConstants.mediaRootUrl}admin/api/video/upload`,
            method: 'POST',
            headers: multipartFormHeader,
        },
    },
    category: {
        getList: {
            baseURL: `${apiUrl}api/category/list`,
            method: 'GET',
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}api/category/get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}api/category/create`,
            method: 'POST',
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}api/category/update`,
            method: 'PUT',
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}api/category/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}api/category/auto-complete`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    languages: {
        getList: {
            baseURL: `${apiUrl}admin/api/languages`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    groupPermission: {
        getGroupList: {
            baseURL: `${apiUrl}v1/group/list`,
            method: 'GET',
            headers: baseHeader,
        },
        getList: {
            baseURL: `${apiUrl}v1/group/list`,
            method: 'GET',
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/group/get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/group/create`,
            method: 'POST',
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/group/update`,
            method: 'PUT',
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/group/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
        },
        getGroupListCombobox: {
            baseURL: `${apiUrl}v1/group/list_combobox`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    permission: {
        getList: {
            baseURL: `${apiUrl}v1/permission/list`,
            method: 'GET',
            headers: baseHeader,
            permissionCode: "PER_L",
        },
        getById: {
            baseURL: `${apiUrl}v1/permission/get/:id`,
            method: 'GET',
            headers: baseHeader,
            permissionCode: "PER_V",
        },
        create: {
            baseURL: `${apiUrl}v1/permission/create`,
            method: 'POST',
            headers: baseHeader,
            permissionCode: "PER_C",
        },
        update: {
            baseURL: `${apiUrl}v1/permission/update`,
            method: 'PUT',
            headers: baseHeader,
            permissionCode: "PER_U",
        },
        delete: {
            baseURL: `${apiUrl}v1/permission/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
            permissionCode: "PER_D",
        },
        export: {
            baseURL: `${apiUrl}v1/permission/export-data/:id`,
            method: 'GET',
            headers: baseHeader,
            permissionCode: "PER_EX",
        },
        import: {
            path: `${apiUrl}v1/permission/import-data`,
            method: 'POST',
            headers: multipartFormHeader,
            permissionCode: "PER_I",
        },
    },
    permissionGroup: {
        getList: {
            baseURL: `${apiUrl}v1/permission-group/list`,
            method: 'GET',
            headers: baseHeader,
            permissionCode: "PER_G_L",
        },
        getById: {
            baseURL: `${apiUrl}v1/permission-group/get/:id`,
            method: 'GET',
            headers: baseHeader,
            permissionCode: "PER_G_V",
        },
        create: {
            baseURL: `${apiUrl}v1/permission-group/create`,
            method: 'POST',
            headers: baseHeader,
            permissionCode: "PER_G_C",
        },
        update: {
            baseURL: `${apiUrl}v1/permission-group/update`,
            method: 'PUT',
            headers: baseHeader,
            permissionCode: "PER_G_U",
        },
        delete: {
            baseURL: `${apiUrl}v1/permission-group/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
            permissionCode: "PER_G_D",
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/permission-group/auto-complete`,
            method: 'GET',
            headers: baseHeader,
        },
        updateSort: {
            baseURL: `${apiUrl}v1/permission-group/update-sort`,
            method: 'PUT',
            headers: baseHeader,
            permissionCode: "PER_G_U",
        },
    },

    branchs: {
        getListCombobox: {
            baseURL: `${apiUrl}api/branch/list_combobox`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    news: {
        getList: {
            baseURL: `${apiUrl}api/news/list`,
            method: 'GET',
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}api/news/get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}api/news/create`,
            method: 'POST',
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}api/news/update`,
            method: 'PUT',
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}api/news/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
        },
    },
    address: {
        getList: {
            baseURL: `${apiUrl}api/address/list`,
            method: 'GET',
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}api/address/get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}api/address/create`,
            method: 'POST',
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}api/address/update`,
            method: 'PUT',
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}api/address/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
        },
    },
    nation: {
        getList: {
            baseURL: `${apiUrl}api/nation/list`,
            method: 'GET',
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}api/nation/get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}api/nation/create`,
            method: 'POST',
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}api/nation/update`,
            method: 'PUT',
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}api/nation/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}api/nation/auto-complete`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    settings: {
        getList: {
            baseURL: `${apiTenantUrl}v1/setting/list`,
            method: 'GET',
            headers: baseHeader,
            isRequiredTenantId: true,
        },
        getById: {
            baseURL: `${apiTenantUrl}v1/setting/get/:id`,
            method: 'GET',
            headers: baseHeader,
            isRequiredTenantId: true,
        },
        create: {
            baseURL: `${apiTenantUrl}v1/setting/create`,
            method: 'POST',
            headers: baseHeader,
            isRequiredTenantId: true,
        },
        update: {
            baseURL: `${apiTenantUrl}v1/setting/update`,
            method: 'PUT',
            headers: baseHeader,
            isRequiredTenantId: true,
        },
        delete: {
            baseURL: `${apiTenantUrl}v1/setting/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
            isRequiredTenantId: true,
        },
        autocomplete: {
            baseURL: `${apiTenantUrl}v1/setting/auto-complete`,
            method: 'GET',
            headers: baseHeader,
            isRequiredTenantId: true,
        },
        settings: {
            baseURL: `${apiTenantUrl}v1/setting/settings`,
            method: 'GET',
            headers: baseHeader,
            isRequiredTenantId: true,
        },
    },
    order: {
        getList: {
            baseURL: `${apiUrl}v1/order/list`,
            method: 'GET',
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/order/get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/order/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
        },
        changeState: {
            baseURL: `${apiUrl}v1/order/delete/change-state`,
            method: 'PUT',
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/order/auto-complete`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    device: {
        getList: {
            baseURL: `${apiUrl}v1/device/list`,
            method: 'GET',
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/device/get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/device/create`,
            method: 'POST',
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/device/update`,
            method: 'PUT',
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/device/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/device/auto-complete`,
            method: 'GET',
            headers: baseHeader,
        },
        approveDevice: {
            baseURL: `${apiUrl}v1/device/approve`,
            method: 'PUT',
            headers: baseHeader,
        },
        lockDevice: {
            baseURL: `${apiUrl}v1/device/lock`,
            method: 'PUT',
            headers: baseHeader,
        },
    },
    deviceLog: {
        getList: {
            baseURL: `${apiUrl}v1/device-log/list`,
            method: 'GET',
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/device-log/get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/device-log/create`,
            method: 'POST',
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/device-log/update`,
            method: 'PUT',
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/device-log/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/device-log/auto-complete`,
            method: 'GET',
            headers: baseHeader,
        },
        highlightDeviceLog: {
            baseURL: `${apiUrl}v1/device-log/change-highlight`,
            method: 'PUT',
            headers: baseHeader,
        },
    },
    printerGroup: {
        getList: {
            baseURL: `${apiUrl}v1/printer-group/list`,
            method: 'GET',
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/printer-group/get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/printer-group/create`,
            method: 'POST',
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/printer-group/update`,
            method: 'PUT',
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/printer-group/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/printer-group/auto-complete`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    printer: {
        getList: {
            baseURL: `${apiUrl}v1/printer/list`,
            method: 'GET',
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/printer/get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/printer/create`,
            method: 'POST',
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/printer/update`,
            method: 'PUT',
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/printer/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
        },
    },
    app: {
        getList: {
            baseURL: `${apiUrl}v1/app/list`,
            method: 'GET',
            headers: baseHeader,
            permissionCode: "APP_L",
        },
        getById: {
            baseURL: `${apiUrl}v1/app/get/:id`,
            method: 'GET',
            headers: baseHeader,
            permissionCode: "APP_V",
        },
        create: {
            baseURL: `${apiUrl}v1/app/create`,
            method: 'POST',
            headers: baseHeader,
            permissionCode: "APP_C",
        },
        cloneApp: {
            baseURL: `${apiUrl}v1/app/clone`,
            method: 'POST',
            headers: baseHeader,
            permissionCode: "APP_CL",
        },
        update: {
            baseURL: `${apiUrl}v1/app/update`,
            method: 'PUT',
            headers: baseHeader,
            permissionCode: "APP_U",
        },
        updateMobileConfig: {
            baseURL: `${apiUrl}v1/app/update-mobile-config`,
            method: 'PUT',
            headers: baseHeader,
            permissionCode: "APP_U",
        },
        updatePermissoinApp: {
            baseURL: `${apiUrl}v1/app/update-permission-app`,
            method: 'PUT',
            headers: baseHeader,
            permissionCode: "APP_U_PER",
        },
        delete: {
            baseURL: `${apiUrl}v1/app/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
            permissionCode: "APP_D",
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/app/auto-complete`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    userKind: {
        getList: {
            baseURL: `${apiUrl}v1/user-kind/list`,
            method: `GET`,
            headers: baseHeader,
            permissionCode: "USE_K_L",
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/user-kind/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/user-kind/get/:id`,
            method: `GET`,
            headers: baseHeader,
            permissionCode: "USE_K_V",
        },
        create: {
            baseURL: `${apiUrl}v1/user-kind/create`,
            method: `POST`,
            headers: baseHeader,
            permissionCode: "USE_K_C",
        },
        update: {
            baseURL: `${apiUrl}v1/user-kind/update`,
            method: `PUT`,
            headers: baseHeader,
            permissionCode: "USE_K_U",
        },
        delete: {
            baseURL: `${apiUrl}v1/user-kind/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
            permissionCode: "USE_K_D",
        },
    },
    appExtra: {
        getList: {
            baseURL: `${apiUrl}v1/app-extra/list`,
            method: `GET`,
            headers: baseHeader,
            permissionCode: "APP_E_L",
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/app-extra/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/app-extra/get/:id`,
            method: `GET`,
            headers: baseHeader,
            permissionCode: "APP_E_V",
        },
        create: {
            baseURL: `${apiUrl}v1/app-extra/create`,
            method: `POST`,
            headers: baseHeader,
            permissionCode: "APP_E_C",
        },
        update: {
            baseURL: `${apiUrl}v1/app-extra/update`,
            method: `PUT`,
            headers: baseHeader,
            permissionCode: "APP_E_U",
        },
        delete: {
            baseURL: `${apiUrl}v1/app-extra/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
            permissionCode: "APP_E_D",
        },
    },
    notification: {
        getList: {
            baseURL: `${apiUrl}v1/notification/list`,
            method: 'GET',
            headers: baseHeader,
            permissionCode: "NOT_L",
        },
    },
};

export default apiConfig;
