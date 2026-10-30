import React from 'react';
import { Tooltip } from 'antd';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
    edit: {
        id: 'lib.baseTooltip.edit',
        defaultMessage: 'Chỉnh sửa {object}',
    },
    delete: {
        id: 'lib.baseTooltip.delete',
        defaultMessage: 'Xóa {object}',
    },
});

const BaseTooltip = ({
    placement = 'bottom',
    type,
    objectName = '',
    title,
    toLowerCase = true,
    children,
    ...props
}) => {
    const intl = useIntl();
    
    if (toLowerCase) {
        objectName = objectName.toLowerCase();
    }
    const titleMapping = {
        edit: intl.formatMessage(messages.edit, { object: objectName }),
        delete: intl.formatMessage(messages.delete, { object: objectName }),
    };

    title = titleMapping[type] || title;
    return (
        <Tooltip placement={placement} title={title} {...props}>
            {children}
        </Tooltip>
    );
};

export default BaseTooltip;