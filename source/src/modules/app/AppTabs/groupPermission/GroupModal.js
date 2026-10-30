import { SaveOutlined, StopOutlined } from '@ant-design/icons';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import useTranslate from '@hooks/useTranslate';
import { BaseForm, TextField } from '@components/cms';
import { Button, Col, Form, Modal, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';

const messages = defineMessages({
    objectName: 'Nhóm quyền',
    update: 'Thêm mới',
    updateSuccess: 'Cập nhật {objectName} thành công',
    createSuccess: 'Thêm mới {objectName} thành công',
});

const GroupModal = ({
    open,
    onCancel,
    onOk,
    title,
    formId,
    detail,
    handleReloadPermission,
    ...props
}) => {
    const [form] = Form.useForm();
    const [isChanged, setChange] = useState(false);
    const intl = useIntl();
    const translate = useTranslate();

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const appId = queryParams.get('appId');
    const appName = queryParams.get('appName');

    const { execute: executeCreate, loading: loadingCreate } = useFetch(apiConfig.permissionGroup.create, { immediate: false });
    const { execute: executeUpdate, loading: loadingUpdate } = useFetch(apiConfig.permissionGroup.update, { immediate: false });

    const handleSubmit = (values) => {
        if (detail) {
            executeUpdate({
                data: {
                    ...values,
                    appId: appId,
                    id: detail?.id,
                },
                onCompleted: (response) => {
                    if (response.result === true) {
                        onCancel();
                        handleReloadPermission();
                        notification.success({
                            message: 'Success',
                            description: 'Cập nhật thành công!',
                        });
                        setChange(false);
                        form.resetFields();
                    }
                },
                onError: (err) => {
                    console.log(err);
                    
                    notification.error({
                        message: 'Error',
                        description: 'Cập nhật thất bại',
                    });
                },
            });
        } else {
            executeCreate({
                data: {
                    ...values,
                    appId: appId,
                },
                onCompleted: (response) => {
                    if (response.result === true) {
                        onCancel();
                        handleReloadPermission();
                        notification.success({
                            message: 'Success',
                            description: 'Thêm mới thành công!',
                        });
                        setChange(false);
                        form.resetFields();
                    }
                },
                onError: (err) => {
                    notification.error({
                        message: 'Error',
                        description: 'Thêm mới thất bại',
                    });
                },
            });
        }
    };

    useEffect(() => {
        if (detail) {
            form.setFieldsValue({
                ...detail,
            });
        } else form.resetFields();
    }, [detail]);

    return (
        <Modal centered open={open} onCancel={onCancel} footer={null} title={detail ? 'Cập nhật' : 'Thêm mới'} {...props}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <BaseForm
                    id={formId}
                    style={{ width: '800px', padding: '0px' }}
                    onFinish={handleSubmit}
                    form={form}
                >
                    <Col span={24}>
                        <TextField
                            required
                            label={<FormattedMessage defaultMessage="Tên nhóm quyền" description="" id="source.src.modules.app.AppTabs.GroupPermissionListPage.groupName" />}
                            name="name"
                            onChange={() => { setChange(true); }}
                        />
                    </Col>

                    <div style={{ display: "flex", justifyContent: 'flex-end' }}>
                        <Button
                            style={{ marginRight: '16px' }}
                            danger
                            key="cancel"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCancel();
                            }}
                            icon={<StopOutlined />}
                        >
                            Huỷ
                        </Button>
                        <Button
                            key="submit"
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            disabled={!isChanged}
                            loading={loadingCreate || loadingUpdate}
                        >
                            {detail ? 'Cập nhật' : 'Thêm mới'}
                        </Button>
                    </div>
                </BaseForm>
            </div>
        </Modal>
    );
};

export default GroupModal;
