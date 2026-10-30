import { SaveOutlined, StopOutlined } from '@ant-design/icons';
import TextSelectedField from '@components/common/form/TextSelectedField';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import useListBase from '@hooks/useListBase';
import useNotification from '@hooks/useNotification';
import useTranslate from '@hooks/useTranslate';
import { AutoCompleteField, BaseForm, TextField } from '@components/cms';
import { Button, Col, Form, Modal, Row, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';

const messages = defineMessages({
    objectName: 'permission',
    update: 'Thêm mới',
    updateSuccess: 'Cập nhật {objectName} thành công',
    createSuccess: 'Thêm mới {objectName} thành công',
});

const permissionOptions = [
    { value: 'Tạo', label: 'Tạo' },
    { value: 'Cập nhật', label: 'Cập nhật' },
    { value: 'Lấy danh sách', label: 'Lấy danh sách' },
    { value: 'Lấy chi tiết', label: 'Lấy chi tiết' },
    { value: 'Xóa', label: 'Xóa' },
];

const PermissionModal = ({
    open,
    onCancel,
    onOk,
    title,
    //data,
    introduceData,
    executeLoading,
    formId,
    selectedGroupName,
    isAddingPermission,
    initialValues,
    detail,
    isEditing,
    handleReloadPermission,
    ...props
}) => {
    const { Title } = Typography;
    const [form] = Form.useForm();
    const [isChanged, setChange] = useState(false);
    const notification = useNotification();
    const intl = useIntl();
    const translate = useTranslate();

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const appId = queryParams.get('appId');
    const appName = queryParams.get('appName');

    const { execute: executeCreate } = useFetch(apiConfig.permission.create, { immediate: false });
    const { execute: executeUpdate } = useFetch(apiConfig.permission.update, { immediate: false });

    const { data, mixinFuncs, queryFilter, loading, pagination, changePagination, serializeParams } = useListBase({
        apiConfig: apiConfig.permission,
        override: (funcs) => {
            funcs.mappingData = (response) => {
                if (response.result === true) {
                    return {
                        data: response.data,
                    };
                }
            };
            funcs.getList = () => {
                mixinFuncs.handleFetchList({
                    appId: appId,
                    appName: appName,
                });
            };
        },
    });
    const CheckJson = (rule, value) => {
        if (!value) {
            return Promise.resolve();
        }

        try {
            JSON.parse(value);
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(new Error('Dữ liệu không đúng định dạng JSON!'));
        }
    };

    const submitPermission = (values) => {
        if (isEditing) {
            executeUpdate({
                data: {
                    ...values,
                    appId: appId,
                    id: detail?.id,
                    showMenu: values.showMenu === undefined ? false : values.showMenu,
                },
                onCompleted: (response) => {
                    if (response.result === true) {
                        onCancel();
                        handleReloadPermission();
                        notification({
                            message: 'Cập nhật thành công',
                        });
                        setChange(false);
                        form.resetFields();
                    }
                },
                onError: (err) => {
                    notification.error({
                        message: 'Cập nhật thất bại!',
                    });
                },
            });
        } else {
            executeCreate({
                data: {
                    ...values,
                    appId: appId,
                    showMenu: values.showMenu === undefined ? false : values.showMenu,
                },
                onCompleted: (response) => {
                    if (response.result === true) {
                        onCancel();
                        handleReloadPermission();
                        notification({
                            message: intl.formatMessage(messages.createSuccess, {
                                objectName: translate.formatMessage(messages.objectName),
                            }),
                        });
                        setChange(false);
                        form.resetFields();
                    }
                },
                onError: (err) => {
                    notification({ type: 'error', message: 'Thêm mới thất bại' });
                },
            });
        }
    };

    useEffect(() => {
        if (detail && isEditing) {
            form.resetFields();
            form.setFieldsValue({
                ...detail,
                id: detail?.id,
                permissionCode: detail?.pcode,
                permissionGroupId: detail?.permissionGroup?.id,
            });
        }
        if (open && !isEditing) {
            form.resetFields();

            form.setFieldsValue({
                permissionGroupId: detail?.id,
            });
            if (selectedGroupName && isAddingPermission) {
                form.setFieldsValue({
                    nameGroup: selectedGroupName,
                });
            } else {
                form.resetFields(['nameGroup']);
            }
        }
    }, [open, detail, selectedGroupName, isAddingPermission]);

    return (
        <Modal centered open={open} onCancel={onCancel} footer={null} {...props}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <BaseForm
                    id={formId}
                    style={{ width: '800px', padding: '0px' }}
                    onFinish={submitPermission}
                    form={form}
                >
                    <Title
                        level={3}
                        style={{ textAlign: 'center', marginBottom: '8px', marginTop: '0px', height: '40px' }}
                    >
                        {isEditing ? 'Cập nhật quyền' : 'Thêm mới quyền'}
                    </Title>

                    <Row gutter={10}>
                        <Col span={12}>
                            <AutoCompleteField
                                label={<FormattedMessage defaultMessage="Tên nhóm quyền" />}
                                name={['permissionGroupId']}
                                apiConfig={apiConfig.permissionGroup.autocomplete}
                                initialSearchParams={{ appId: appId }}
                                mappingOptions={(item) => ({ value: item.id, label: item.name })}
                                searchParams={(text) => ({ name: text })}
                                useFetch={useFetch}
                                required
                                disabled
                            />
                        </Col>
                        <Col span={12}>
                            <TextSelectedField 
                                key={open ? Date.now() : 'closed'}
                                required
                                label={
                                    <FormattedMessage
                                        defaultMessage="Tên permission"
                                        description=""
                                        id="source.src.modules.app.AppTabs.PermissionListPage.permisstioonName"
                                    />
                                }
                                options={permissionOptions}
                                name="name"
                            />
                        </Col>
                    </Row>
                    <Row gutter={10}>
                        <Col span={12}>
                            <TextField
                                required
                                label={
                                    <FormattedMessage
                                        defaultMessage="Mã Permisson"
                                        description=""
                                        id="source.src.modules.app.AppTabs.PermissionForm.permissionCode"
                                    />
                                }
                                name="permissionCode"
                            />
                        </Col>
                        <Col span={12}>
                            <TextField
                                required
                                label={
                                    <FormattedMessage
                                        defaultMessage="action"
                                        description=""
                                        id="source.src.modules.app.AppTabs.PermissionForm.action"
                                    />
                                }
                                name="action"
                            />
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col span={24}>
                            <TextField label="Mô tả" type="textarea" name="description" required style={{ minHeight: 120 }}/>
                        </Col>
                        {/* <Col span={12}>
                            <TextField
                                label="settings"
                                type="textarea"
                                placeholder="Nhập dữ liệu Json"
                                name="settings"
                                rules={[
                                    {
                                        validator: CheckJson,
                                    },
                                ]}
                            />
                        </Col> */}
                    </Row>
                    {/* <Row gutter={10}>
                        <Col span={12}>
                            <BooleanField
                                name="showMenu"
                                label={
                                    <FormattedMessage
                                        defaultMessage="Hiển thị Menu"
                                        description=""
                                        id="source.src.modules.app.AppTabs.PermissionForm.showMenu"
                                    />
                                }
                            />
                        </Col>
                    </Row> */}

                    {/* <div className="footer-card-form">{actions}</div> */}

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
                        >
                            {isEditing ? 'Cập nhật' : 'Thêm mới'}
                        </Button>
                    </div>
                </BaseForm>
            </div>
        </Modal>
    );
};

export default PermissionModal;
