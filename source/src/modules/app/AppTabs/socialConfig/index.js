import { CheckOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { BaseTable, BaseTooltip, ListPage } from '@components/cms';
import { STATUS_ACTIVE, STATUS_INACTIVE } from '@constants';
import apiConfig from '@constants/apiConfig';
import { socialProviderOptions } from '@constants/masterData';
import useFetch from '@hooks/useFetch';
import useTranslate from '@hooks/useTranslate';
import useValidatePermission from '@hooks/useValidatePermission';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';
import { getApiErrorMessage } from '@utils/apiError';
import { Button, Form, Input, Modal, Select, Tag, Typography } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useLocation } from 'react-router-dom';

const messages = defineMessages({
    provider: 'Nhà cung cấp',
    clientId: 'Client ID',
    clientIdRequired: 'Vui lòng nhập Client ID',
    providerRequired: 'Vui lòng chọn nhà cung cấp',
    status: 'Trạng thái',
    active: 'Hoạt động',
    inactive: 'Ngừng hoạt động',
    createTitle: 'Thêm cấu hình đăng nhập mạng xã hội',
    editTitle: 'Cập nhật cấu hình đăng nhập mạng xã hội',
    save: 'Lưu',
    cancel: 'Hủy',
    deleteConfirm: 'Bạn có chắc chắn muốn xóa cấu hình này?',
    ok: 'Đồng ý',
    saveSuccess: 'Lưu thành công',
    deleteSuccess: 'Xóa thành công',
    clientSecret: 'Client Secret',
    clientSecretRequired: 'Vui lòng nhập Client Secret',
    clientSecretKeep: 'Để trống để giữ nguyên',
    secretColumn: 'Secret',
    googleHelp: 'Authorized JavaScript origins: {origin}',
    githubHelp: 'Authorization callback URL: {origin}/login/github/callback',
});

const unwrapList = (res) => {
    const d = res?.data;
    if (Array.isArray(d)) return d;
    return d?.content || [];
};

// `isCreateOpen` / `closeCreate` are driven by the shared "Thêm mới" button of the App tabs page
const SocialConfigTab = ({ isCreateOpen, closeCreate }) => {
    const translate = useTranslate();
    const location = useLocation();
    const appId = new URLSearchParams(location.search).get('appId');
    const validatePermission = useValidatePermission();
    const canUpdate = validatePermission([apiConfig.appSocialConfig.update.permissionCode]);
    const canDelete = validatePermission([apiConfig.appSocialConfig.delete.permissionCode]);

    const [form] = Form.useForm();
    const [list, setList] = useState([]);
    const [editing, setEditing] = useState(null);

    const { execute: executeList, loading } = useFetch(apiConfig.appSocialConfig.getList);
    const { execute: executeCreate, loading: creating } = useFetch(apiConfig.appSocialConfig.create);
    const { execute: executeUpdate, loading: updating } = useFetch(apiConfig.appSocialConfig.update);
    const { execute: executeDelete } = useFetch(apiConfig.appSocialConfig.delete);

    const fetchList = useCallback(() => {
        executeList({
            params: { appId },
            onCompleted: (res) => setList(unwrapList(res)),
            onError: (error) => showErrorMessage(getApiErrorMessage(error, translate)),
        });
    }, [appId]);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const selectedProvider = Form.useWatch('provider', form);
    const providerOption = socialProviderOptions.find((o) => o.value === selectedProvider);
    const origin = window.location.origin;
    const providerHelp = {
        GOOGLE: translate.formatMessage(messages.googleHelp, { origin }),
        GITHUB: translate.formatMessage(messages.githubHelp, { origin }),
    }[selectedProvider];

    const modalOpen = isCreateOpen || !!editing;
    const isEditing = !!editing;

    useEffect(() => {
        if (!modalOpen) return;
        form.resetFields();
        if (editing) {
            form.setFieldsValue({ clientId: editing.clientId, status: editing.status });
        } else {
            form.setFieldsValue({ provider: socialProviderOptions[0].value });
        }
    }, [modalOpen, editing]);

    const closeModal = () => {
        setEditing(null);
        closeCreate?.();
    };

    const onSubmit = (values) => {
        const done = {
            onCompleted: () => {
                showSucsessMessage(translate.formatMessage(messages.saveSuccess));
                closeModal();
                fetchList();
            },
            onError: (error) => showErrorMessage(getApiErrorMessage(error, translate)),
        };
        if (isEditing) {
            const secret = values.clientSecret?.trim();
            executeUpdate({
                data: {
                    id: editing.id,
                    clientId: values.clientId.trim(),
                    status: values.status,
                    ...(secret ? { clientSecret: secret } : {}),
                },
                ...done,
            });
        } else {
            const secret = values.clientSecret?.trim();
            executeCreate({
                data: {
                    appId,
                    provider: values.provider,
                    clientId: values.clientId.trim(),
                    ...(secret ? { clientSecret: secret } : {}),
                },
                ...done,
            });
        }
    };

    const confirmDelete = (id) => {
        Modal.confirm({
            title: translate.formatMessage(messages.deleteConfirm),
            content: '',
            okText: translate.formatMessage(messages.ok),
            cancelText: translate.formatMessage(messages.cancel),
            onOk: () =>
                executeDelete({
                    pathParams: { id },
                    onCompleted: () => {
                        showSucsessMessage(translate.formatMessage(messages.deleteSuccess));
                        fetchList();
                    },
                    onError: (error) => showErrorMessage(getApiErrorMessage(error, translate)),
                }),
        });
    };

    const statusOptionsLocal = [
        { value: STATUS_ACTIVE, label: translate.formatMessage(messages.active) },
        { value: STATUS_INACTIVE, label: translate.formatMessage(messages.inactive) },
    ];

    const columns = [
        {
            title: translate.formatMessage(messages.provider),
            dataIndex: 'provider',
            width: 160,
            render: (v) => socialProviderOptions.find((o) => o.value === v)?.label || v,
        },
        { title: translate.formatMessage(messages.clientId), dataIndex: 'clientId' },
        {
            title: translate.formatMessage(messages.secretColumn),
            dataIndex: 'hasClientSecret',
            width: 100,
            align: 'center',
            render: (v) => (v ? <CheckOutlined style={{ color: 'green' }} /> : '—'),
        },
        {
            title: translate.formatMessage(messages.status),
            dataIndex: 'status',
            width: 160,
            render: (v) => {
                const active = v === STATUS_ACTIVE;
                return (
                    <Tag color={active ? 'green' : 'red'}>
                        {translate.formatMessage(active ? messages.active : messages.inactive)}
                    </Tag>
                );
            },
        },
        {
            title: '',
            key: 'actions',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <>
                    {canUpdate && (
                        <BaseTooltip type="edit" objectName="">
                            <Button type="link" style={{ padding: 0 }} onClick={() => setEditing(record)}>
                                <EditOutlined />
                            </Button>
                        </BaseTooltip>
                    )}
                    {canDelete && (
                        <BaseTooltip type="delete" objectName="">
                            <Button type="link" style={{ padding: '0 0 0 8px' }} onClick={() => confirmDelete(record.id)}>
                                <DeleteOutlined style={{ color: 'red' }} />
                            </Button>
                        </BaseTooltip>
                    )}
                </>
            ),
        },
    ];

    return (
        <>
            <ListPage
                baseTable={
                    <BaseTable
                        rowKey="id"
                        loading={loading}
                        dataSource={list}
                        columns={columns}
                        pagination={false}
                        scroll={{ x: 'max-content' }}
                    />
                }
            />
            <Modal
                title={translate.formatMessage(isEditing ? messages.editTitle : messages.createTitle)}
                open={modalOpen}
                onCancel={closeModal}
                onOk={() => form.submit()}
                okText={translate.formatMessage(messages.save)}
                cancelText={translate.formatMessage(messages.cancel)}
                confirmLoading={creating || updating}
                destroyOnClose
                centered
            >
                <Form form={form} layout="vertical" onFinish={onSubmit}>
                    <Form.Item
                        name="provider"
                        label={translate.formatMessage(messages.provider)}
                        rules={[{ required: true, message: translate.formatMessage(messages.providerRequired) }]}
                    >
                        <Select options={socialProviderOptions} disabled={isEditing} />
                    </Form.Item>
                    <Form.Item
                        name="clientId"
                        label={translate.formatMessage(messages.clientId)}
                        rules={[
                            { required: true, whitespace: true, message: translate.formatMessage(messages.clientIdRequired) },
                        ]}
                    >
                        <Input placeholder={selectedProvider === 'GITHUB' ? 'Ov23li...' : 'xxx.apps.googleusercontent.com'} />
                    </Form.Item>
                    {providerOption?.requiresSecret && (
                        <Form.Item
                            name="clientSecret"
                            label={translate.formatMessage(messages.clientSecret)}
                            rules={[
                                {
                                    required: !isEditing,
                                    whitespace: true,
                                    message: translate.formatMessage(messages.clientSecretRequired),
                                },
                            ]}
                        >
                            <Input.Password
                                autoComplete="new-password"
                                placeholder={isEditing ? translate.formatMessage(messages.clientSecretKeep) : undefined}
                            />
                        </Form.Item>
                    )}
                    {isEditing && (
                        <Form.Item name="status" label={translate.formatMessage(messages.status)}>
                            <Select options={statusOptionsLocal} />
                        </Form.Item>
                    )}
                </Form>
                {providerHelp && <Typography.Text type="secondary">{providerHelp}</Typography.Text>}
            </Modal>
        </>
    );
};

export default SocialConfigTab;
