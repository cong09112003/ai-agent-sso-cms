import { notification } from 'antd';

export const removeAccents = (str) => {
    if (str)
        return str
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
    return str;
};

export const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export const formatNumber = (value) => {
    if (value) {
        const decimalPosition = value.toString().indexOf('.');
        if (decimalPosition > 0) {
            const intVal = value.toString().substring(0, decimalPosition);
            const decimalVal = value.toString().substring(decimalPosition + 1);
            return `${intVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${decimalVal}`;
        }
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else if (value === 0) return 0;
    return '';
};

export const showErrorMessage = (content) => {
    notification.error({
        message: 'Lỗi',
        description: content,
    });
};
