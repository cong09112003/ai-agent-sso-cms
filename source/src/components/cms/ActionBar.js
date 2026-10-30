import React, { useCallback } from 'react';
import { Button, Col, Modal, Row } from 'antd';
import { useIntl, defineMessages } from 'react-intl';
import { useNavigate } from 'react-router-dom'; // Thêm hook điều hướng
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import HasPermission from './HasPermission';
import styles from './ActionBar.module.scss';

const messages = defineMessages({
    create: {
        id: 'lib.actionBar.create',
        defaultMessage: 'Thêm mới',
    },
    bulkDeleteTitle: {
        id: 'lib.actionBar.bulkDeleteTitle',
        defaultMessage: 'Bạn có chắc chắn muốn xóa {count} mục {objectName} đã chọn?',
    },
    deleteSelected: {
        id: 'lib.actionBar.deleteSelected',
        defaultMessage: 'Xóa đã chọn ({count})',
    },
    yes: { id: 'lib.common.yes', defaultMessage: 'Có' },
    no: { id: 'lib.common.no', defaultMessage: 'Không' },
});

function ActionBar({
    createLink,
    createPermission,
    selectedRows = [],
    onBulkDelete,
    objectName = '',
    location = { pathname: '' },
    style,
    buttons,
    onValidate,
    useValidatePermission,
    rowProps,
}) {
    const intl = useIntl();
    const navigate = useNavigate();

    const onBulkDeleteButtonClick = () => {
        Modal.confirm({
            title: intl.formatMessage(messages.bulkDeleteTitle, { 
                objectName, 
                count: selectedRows.length, 
            }),
            centered: true,
            okText: intl.formatMessage(messages.yes),
            okType: 'danger',
            cancelText: intl.formatMessage(messages.no),
            onOk: () => onBulkDelete && onBulkDelete(selectedRows),
        });
    };

    const renderButtons = useCallback(() => {
        if (buttons) {
            return buttons.map((button, index) => (
                <Col key={button.linkTo || index}>
                    <Button
                        type="link"
                        onClick={() => navigate(button.linkTo, { state: { prevPath: location.pathname } })}
                        style={{ padding: 0, height: 'auto' }} 
                    >
                        {button.component}
                    </Button>
                </Col>
            ));
        }

        if (createLink) {
            return (
                <Col>
                    <HasPermission 
                        requiredPermissions={createPermission} 
                        onValidate={onValidate} 
                        useValidatePermission={useValidatePermission}
                    >
                        <Button 
                            type="primary" 
                            style={style} 
                            icon={<PlusOutlined />}
                            onClick={() => navigate(createLink, { 
                                state: { action: 'create', prevPath: location.pathname }, 
                            })}
                        >
                            {intl.formatMessage(messages.create, { objectName })}
                        </Button>
                    </HasPermission>
                </Col>
            );
        }
        return null;
    }, [buttons, createLink, createPermission, location.pathname, objectName, intl, style, navigate, onValidate, useValidatePermission]);

    return (
        <Row wrap {...rowProps} className={`${styles.actionBar} ${rowProps?.className || ''}`}>
            <Col>
                {selectedRows.length > 0 && onBulkDelete && (
                    <Button 
                        danger
                        icon={<DeleteOutlined />} 
                        onClick={onBulkDeleteButtonClick}
                    >
                        {intl.formatMessage(messages.deleteSelected, { count: selectedRows.length })}
                    </Button>
                )}
            </Col>
            {renderButtons()}
        </Row>
    );
}

export default ActionBar;