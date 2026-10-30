import { commonMessage } from '@locales/intl';

export const apiUrl = process.env.REACT_APP_API;
export const apiTenantUrl = 'http://api-path/';

export const fixedPath = {
    privacy: `${apiUrl}${process.env.REACT_APP_PRIVACY_PATH}`,
    help: `${apiUrl}${process.env.REACT_APP_HELP_PATH}`,
    aboutUs: `${apiUrl}${process.env.REACT_APP_ABOUT_US_PATH}`,
};

export const brandName = 'CMS';

export const appName = 'sso-cms';

export const storageKeys = {
    USER_ACCESS_TOKEN: `${appName}-user-access-token`,
    USER_REFRESH_TOKEN: `${appName}-user-refresh-token`,
    USER_KIND: `${appName}-${process.env.REACT_APP_ENV}-user-kind`,
    TENANT_HEADER: `X-tenant`,
    TENANT_API_URL: `${appName}-${process.env.REACT_APP_ENV}-tenant-api-url`,
    IS_MFA_ENABLE: 'IS_MFA_ENABLE',
    USER_KIND_LIST: `${appName}-${process.env.REACT_APP_ENV}-user-kind-list`,
};

export const AppConstants = {
    apiRootUrl: process.env.REACT_APP_API,
    contentRootUrl: `${process.env.REACT_APP_API_MEDIA}v1/file/download`,
    mediaRootUrl: `${process.env.REACT_APP_API_MEDIA}`,
    appId: process.env.REACT_APP_APP_ID,
    secretId: process.env.REACT_APP_SECRET_ID,
    userKinds: JSON.parse(process.env.REACT_APP_USER_KINDS || '[]'),
    langKey: 'vi',
};

export const THEMES = {
    DARK: 'dark',
    LIGHT: 'light',
};

export const defaultLocale = 'vi';
export const locales = ['en', 'vi'];

export const activityType = {
    GAME: 'game',
    VIDEO: 'video',
    ARTICLE: 'article',
    FOCUS_AREA: 'focus-area',
};

export const DATE_DISPLAY_FORMAT = 'DD-MM-YYYY HH:mm';
export const DATE_SHORT_MONTH_FORMAT = 'DD MMM YYYY';
export const TIME_FORMAT_DISPLAY = 'HH:mm';
export const DATE_FORMAT_VALUE = 'DD/MM/YYYY';
export const DATE_FORMAT_DISPLAY = 'DD/MM/YYYY';
export const DEFAULT_FORMAT = 'DD/MM/YYYY HH:mm:ss';

export const navigateTypeEnum = {
    PUSH: 'PUSH',
    POP: 'POP',
    REPLACE: 'REPLACE',
};

export const articleTypeEnum = {
    URL: 'url',
    PLAIN: 'plain',
};

export const accessRouteTypeEnum = {
    NOT_LOGIN: false,
    REQUIRE_LOGIN: true,
    BOTH: null,
};

export const UploadFileTypes = {
    AVATAR: 'AVATAR',
    LOGO: 'LOGO',
    DOCUMENT: 'DOCUMENT',
};

export const LIMIT_IMAGE_SIZE = 512000;

export const STATUS_PENDING = 0;
export const STATUS_ACTIVE = 1;
export const STATUS_INACTIVE = -1;
export const STATUS_DELETE = -2;

export const DEFAULT_TABLE_ITEM_SIZE = 20;
export const DEFAULT_TABLE_ITEM_BIG_SIZE = 1000;
export const DEFAULT_TABLE_PAGE_START = 0;

export const commonStatus = {
    PENDING: 0,
    ACTIVE: 1,
    INACTIVE: -1,
    DELETE: -2,
};

export const UserTypes = {
    ADMIN: 1,
    MANAGER: 2,
    STUDENT: 3,
    LEADER: 4,
    COMPANY: 5,
    DEVELOPER: 4,
};

export const commonStatusColor = {
    [commonStatus.PENDING]: 'warning',
    [commonStatus.ACTIVE]: 'green',
    [commonStatus.INACTIVE]: 'orange',
    [commonStatus.DELETE]: 'red',
};

export const categoryKind = {
    news: 1,
};

export const appAccount = {
    APP_USERNAME: process.env.REACT_APP_USERNAME,
    APP_PASSWORD: process.env.REACT_APP_PASSWORD,
};

export const GROUP_KIND_ADMIN = 1;
export const GROUP_KIND_MANAGER = 2;
export const GROUP_KIND_USER = 3;

export const groupPermissionKindsOptions = [
    { label: 'Admin', value: GROUP_KIND_ADMIN },
    { label: 'Manager', value: GROUP_KIND_MANAGER },
    { label: 'User', value: GROUP_KIND_USER },
];

export const isSystemSettingOptions = [
    { label: commonMessage.showSystemSettings, value: 1 },
    { label: commonMessage.hideSystemSettings, value: 0 },
];

export const PROVINCE_KIND = 1;
export const DISTRICT_KIND = 2;
export const VILLAGE_KIND = 3;

export const SettingTypes = {
    Money: 'Money',
    Timezone: 'Timezone',
    System: 'System',
};

export const DEVICE_LOG_KIND_INIT_KITPLAY_SERVER = 1;
export const DEVICE_LOG_KIND_UPDATE_KITPLAY_SERVER = 2;
export const DEVICE_LOG_KIND_APPROVE_KITPLAY_SERVER = 3;
export const DEVICE_LOG_KIND_DELETE_KITPLAY_SERVER = 4;
export const DEVICE_LOG_KIND_INIT_KITPLAY_DEVICE = 5;
export const DEVICE_LOG_KIND_UPDATE_KITPLAY_DEVICE = 6;
export const DEVICE_LOG_KIND_APPROVE_KITPLAY_DEVICE = 7;
export const DEVICE_LOG_KIND_DELETE_KITPLAY_DEVICE = 8;
export const DEVICE_LOG_KIND_LOCK_KITPLAY_SERVER = 9;
export const DEVICE_LOG_KIND_LOCK_KITPLAY_DEVICE = 10;

export const ADMIN_LOGIN_TYPE = 'password_mfa';

export const OPTION_COVERT_KIND = 1;
export const OPTION_COVERT_USER = 2;

export const NOTIFICATION_STATE_PENDING = 1;
export const NOTIFICATION_STATE_SUCCESS = 2;
export const NOTIFICATION_STATE_FAIL = 3;
