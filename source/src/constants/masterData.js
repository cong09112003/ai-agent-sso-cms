import {
    STATUS_ACTIVE,
    STATUS_INACTIVE,
    STATUS_PENDING,
    STATUS_DELETE,
    PROVINCE_KIND,
    DISTRICT_KIND,
    VILLAGE_KIND,
    DEVICE_LOG_KIND_INIT_KITPLAY_SERVER,
    DEVICE_LOG_KIND_UPDATE_KITPLAY_SERVER,
    DEVICE_LOG_KIND_APPROVE_KITPLAY_SERVER,
    DEVICE_LOG_KIND_DELETE_KITPLAY_SERVER,
    DEVICE_LOG_KIND_INIT_KITPLAY_DEVICE,
    DEVICE_LOG_KIND_UPDATE_KITPLAY_DEVICE,
    DEVICE_LOG_KIND_APPROVE_KITPLAY_DEVICE,
    DEVICE_LOG_KIND_DELETE_KITPLAY_DEVICE,
    DEVICE_LOG_KIND_LOCK_KITPLAY_SERVER,
    DEVICE_LOG_KIND_LOCK_KITPLAY_DEVICE,
    NOTIFICATION_STATE_PENDING,
    NOTIFICATION_STATE_SUCCESS,
    NOTIFICATION_STATE_FAIL,
} from '@constants';
import { defineMessages } from 'react-intl';
import { nationKindMessage, actionMessage, kindKitplayMessage } from './intl';

const commonMessage = defineMessages({
    statusActive: 'Active',
    statusPending: 'Pending',
    statusInactive: 'Inactive',
    statusDeleted: 'Deleted',

    notificationPending: 'Đang xử lý',
    notificationSuccess: 'Thành công',
    notificationFail: 'Thất bại',
});

export const languageOptions = [
    { value: 1, label: 'EN' },
    { value: 2, label: 'VN' },
    { value: 3, label: 'Other' },
];

export const orderOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
];

export const commonStatus = [
    { value: STATUS_ACTIVE, label: 'Active', color: 'green' },
    { value: STATUS_PENDING, label: 'Pending', color: 'warning' },
    { value: STATUS_INACTIVE, label: 'Inactive', color: 'red' },
];

export const statusOptions = [
    { value: STATUS_ACTIVE, label: commonMessage.statusActive, color: '#00A648' },
    { value: STATUS_PENDING, label: commonMessage.statusPending, color: '#FFBF00' },
    { value: STATUS_INACTIVE, label: commonMessage.statusInactive, color: '#CC0000' },
];

export const notificationStateOptions = [
    {
        value: NOTIFICATION_STATE_PENDING,
        label: commonMessage.notificationPending,
        color: '#FFBF00',
    },
    {
        value: NOTIFICATION_STATE_SUCCESS,
        label: commonMessage.notificationSuccess,
        color: '#00A648',
    },
    {
        value: NOTIFICATION_STATE_FAIL,
        label: commonMessage.notificationFail,
        color: '#CC0000',
    },
];

export const formSize = {
    small: '700px',
    normal: '800px',
    big: '900px',
};

export const nationKindOptions = [
    {
        value: PROVINCE_KIND,
        label: nationKindMessage.province,
    },
    {
        value: DISTRICT_KIND,
        label: nationKindMessage.district,
    },
    {
        value: VILLAGE_KIND,
        label: nationKindMessage.village,
    },
];

export const kindPost = [
    {
        value: 1,
        label: 'Post',
        color: 'green',
    },
    {
        value: 2,
        label: 'Story',
        color: 'blue',
    },
];

export const settingGroups = {
    GENERAL: 'general',
    PAGE: 'page_config',
    REVENUE: 'revenue_config',
    TRAINING: 'training_config',
};
export const dataTypeSetting = {
    INT: 'int',
    STRING: 'string',
    BOOLEAN: 'boolean',
    DOUBLE: 'double',
    RICHTEXT: 'richtext',
};

export const settingKeyName = {
    MONEY_UNIT: 'money_unit',
    TRAINING_UNIT: 'training_percent',
    BUG_UNIT: 'training_project_percent',
    NUMBER_OF_TRAINING_PROJECT: 'number_of_training_projects',
};

export const actionOptions = [
    {
        value: 1,
        label: actionMessage.contactForm,
    },
    { value: 2, label: actionMessage.navigation },
];

export const nextGroup = [
    {
        value: 0,
        label: 'Đợi nhóm',
    },
    { value: 1, label: 'NEXT' },
];

export const kindPrinter = [
    {
        value: 1,
        label: 'Món ăn theo máy in',
    },
    { value: 2, label: 'Hiển thị toàn bộ món' },
];

export const kindKitplayOptions = [
    {
        value: DEVICE_LOG_KIND_INIT_KITPLAY_SERVER,
        label: kindKitplayMessage.initKitplayServer,
        color: 'blue',
    },
    {
        value: DEVICE_LOG_KIND_UPDATE_KITPLAY_SERVER,
        label: kindKitplayMessage.updateKitplayServer,
        color: 'green',
    },
    {
        value: DEVICE_LOG_KIND_APPROVE_KITPLAY_SERVER,
        label: kindKitplayMessage.approveKitplayServer,
        color: 'yellow',
    },
    {
        value: DEVICE_LOG_KIND_DELETE_KITPLAY_SERVER,
        label: kindKitplayMessage.deleteKitplayServer,
        color: 'red',
    },
    {
        value: DEVICE_LOG_KIND_INIT_KITPLAY_DEVICE,
        label: kindKitplayMessage.initKitplayDevice,
        color: 'gray',
    },
    {
        value: DEVICE_LOG_KIND_UPDATE_KITPLAY_DEVICE,
        label: kindKitplayMessage.updateKitplayDevice,
        color: 'orange',
    },
    {
        value: DEVICE_LOG_KIND_APPROVE_KITPLAY_DEVICE,
        label: kindKitplayMessage.approveKitplayDevice,
        color: 'purple',
    },
    {
        value: DEVICE_LOG_KIND_DELETE_KITPLAY_DEVICE,
        label: kindKitplayMessage.deleteKitplayDevice,
        color: 'brown',
    },
    {
        value: DEVICE_LOG_KIND_LOCK_KITPLAY_SERVER,
        label: kindKitplayMessage.lockKitplayServer,
        color: 'slategray',
    },
    {
        value: DEVICE_LOG_KIND_LOCK_KITPLAY_DEVICE,
        label: kindKitplayMessage.lockKitplayDevice,
        color: 'saddlebrown',
    },
];

export const renderCMS = (kind, customerName, deviceId) => {
    switch (kind) {
                    case 1:
                        return `${customerName} tạo thiết bị Kitplay Server`;
                    case 5:
                        return `${customerName} tạo thiết bị Kitplay`;
                    case 2:
                    case 6:
                        return `${customerName} sửa thiết bị ID ${deviceId}`;
                    case 4:
                    case 8:
                        return `${customerName} xóa thiết bị ID ${deviceId}`;
                    case 9:
                    case 10:
                        return `${customerName} khóa thiết bị ID ${deviceId}`;
                    case 3:
                    case 7:
                        return `${customerName} sửa thiết bị ID ${deviceId} thành đang hoạt động`;
                    default:
                        return 'Unknown Action';
    }
};
