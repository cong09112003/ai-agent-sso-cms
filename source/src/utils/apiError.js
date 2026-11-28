import { defineMessages } from 'react-intl';

import { defaultLocale } from '@constants';
import { ErrorCode } from '@constants/errorCodes';
import { showErrorMessage } from '@services/notifyService';

const messages = defineMessages({
    generic: 'Đã có lỗi xảy ra, vui lòng thử lại',
});

// Single place that turns an API failure into the text shown to the user:
// 1. the backend `message` (already localized by the Accept-Language header)
// 2. the local text for the error `code` in the current locale (locale json key `errorCode.<CODE>`)
// 3. `fallback` (a caller specific, already translated text) or the translated generic message
export const getApiErrorMessage = (error, intl, fallback) => {
    const data = error?.response?.data;
    if (typeof data?.message === 'string' && data.message.trim()) {
        return data.message;
    }

    const code = data?.code;
    if (code) {
        const localized = intl?.messages?.[`errorCode.${code}`];
        if (typeof localized === 'string' && localized) return localized;
        if (intl?.locale === defaultLocale && ErrorCode[code]?.message) return ErrorCode[code].message;
    }

    return fallback || intl.formatMessage(messages.generic);
};

export const showApiError = (error, intl, fallback) => {
    showErrorMessage(getApiErrorMessage(error, intl, fallback));
};
