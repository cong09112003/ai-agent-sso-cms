// Các hàm tiện ích dùng chung (trước đây là package @itz/react-utils)
import dayjs from 'dayjs';

import { DATE_SHORT_MONTH_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';

// localStorage
export const getData = (key) => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const dataStorage = window.localStorage.getItem(key);
        try {
            return JSON.parse(dataStorage);
        } catch (error) {
            return dataStorage;
        }
    }
    return false;
};

export const setData = (key, data) => {
    if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, typeof data === 'object' ? JSON.stringify(data) : data);
    }
};

export const removeItem = (key) => {
    if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
    }
};

export const handleApiResponse = (result, onCompleted, onError) => {
    const { success, responseData } = result;
    if (success && responseData.result) onCompleted(responseData);
    else onError(responseData);
};

export const translateKeys = (intl, message, key = []) => {
    const result = [];
    message.forEach((item) => {
        const newItem = { ...item };
        if (typeof key === 'string') {
            newItem[key] = intl.formatMessage(item[key]);
        } else {
            key.forEach((k) => {
                newItem[k] = intl.formatMessage(item[k]);
            });
        }
        result.push(newItem);
    });
    return result;
};

export const destructCamelCaseString = (string) => {
    const arrString = [...string];
    const newArrString = [];
    arrString.forEach((char, index) => {
        if (char.charCodeAt(0) > 90) {
            newArrString.push(char);
        } else {
            index && newArrString.push('-');
            newArrString.push(char.toLowerCase());
        }
    });
    return newArrString.join('');
};

export const formatDateString = (dateString, formatDate = DATE_SHORT_MONTH_FORMAT) => {
    return dayjs(dateString).format(formatDate);
};

export const ensureArray = (value) => {
    if (value === null || value === undefined) {
        return [];
    }
    if (Array.isArray(value)) {
        return value;
    }
    return [value];
};

export const removePathParams = (paths) => {
    return ensureArray(paths).map((path) => {
        if (typeof path !== 'string') return path;
        return path.replaceAll(/\/:[a-zA-Z]+/g, '');
    });
};

export const validatePermission = (
    requiredPermissions = [],
    userPermissions = [],
    requiredKind,
    excludeKind = [],
    userKind,
    profile,
    path,
    separate,
    apiUrl,
) => {
    if (ensureArray(excludeKind).length > 0) {
        if (ensureArray(excludeKind).some((kind) => kind == userKind)) return false;
    }
    if (requiredKind) {
        if (requiredKind !== userKind) return false;
    }
    if (!requiredPermissions || requiredPermissions?.length == 0) return true;
    if (userPermissions.some((code) => requiredPermissions.includes(code))) {
        return true;
    }
    let permissionsSavePage = [];
    if (separate && requiredPermissions.length > 0) {
        permissionsSavePage.push(path?.type === 'create' ? requiredPermissions[0] : requiredPermissions[1]);
    } else {
        permissionsSavePage = requiredPermissions;
    }
    return removePathParams(permissionsSavePage).every((item) =>
        userPermissions?.includes(item?.replace(apiUrl, '/')),
    );
};

export const orderNumber = (pagination, index, size = DEFAULT_TABLE_ITEM_SIZE) => {
    const page = pagination?.current ? pagination.current - 1 : 1;
    return page * size + (index + 1);
};

export const moveArrayElement = (arr = [], from, to) => {
    if (!Array.isArray(arr)) throw new Error('The first argument must be an array.');
    const copy = arr.slice();
    copy.splice(to, 0, copy.splice(from, 1)[0]);
    return copy;
};

export const copyToClipboard = (text, successText, errorText) => {
    if (text) {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                showSucsessMessage(successText || 'Sao chép thành công');
            })
            .catch((err) => {
                console.error(errorText || 'Sao chép thất bại', err);
                showErrorMessage(errorText || 'Sao chép thất bại');
            });
    } else showErrorMessage('Không có gì để sao chép');
};

// Validator cho antd Form
export const checkPhone = (_, value) => {
    const phoneRegex = /^0[35789][0-9]{8}$/;
    if (!phoneRegex.test(value)) {
        return Promise.reject('Số điện thoại không hợp lệ !');
    }
    return Promise.resolve();
};

export const checkEmail = (_, value) => {
    const emailRegex = /^[a-z0-9.]+@[a-z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
        return Promise.reject('Email không hợp lệ');
    }
    return Promise.resolve();
};
