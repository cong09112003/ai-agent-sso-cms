import { DeleteOutlined, EditOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import apiConfig from '@constants/apiConfig';
import { formSize } from '@constants/masterData';
import useBasicForm from '@hooks/useBasicForm';
import useDisclosure from '@hooks/useDisclosure';
import useFetch from '@hooks/useFetch';
import useTranslate from '@hooks/useTranslate';
import { Button, Card, Col, Form, Modal, notification, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import PermissionModal from './PermissionModal';
import { DEFAULT_TABLE_ITEM_BIG_SIZE } from '@constants';

const message = defineMessages({
    deleteConfirm: {
        title: {
            id: 'hook.useListBase.deleteConfirm.title',
            defaultMessage: 'Bạn có chắc chắn muốn xóa {objectName} này không?',
        },
        ok: {
            id: 'hook.useListBase.deleteConfirm.ok',
            defaultMessage: 'Có',
        },
        cancel: {
            id: 'hook.useListBase.deleteConfirm.cancel',
            defaultMessage: 'Không',
        },
    },
});

const PermissionForm = (props) => {
    const {
        formId,
        actions,
        onSubmit,
        setIsChangedFormValues,
        size = 'small',
    } = props;
    const translate = useTranslate();
    const activeApptab = localStorage.getItem('activeApptab');
    const intl = useIntl();
    const [group, setGroup] = useState([]);
    const [selectedGroupName, setSelectedGroupName] = useState(null);
    const [detail, setDetail] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [isEditingPermission, setIsEditingPermission] = useState(false);
    const [isAddingPermission, setIsAddingPermission] = useState(false);
    const [permissionGroups, setPermissionGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const appId = queryParams.get('appId');
    const [isModalOpen, { open: openModal, close: closeModal }] = useDisclosure();

    const { execute: executeDelete } = useFetch(apiConfig.permission.delete, { immediate: false });
    const { execute: executePermissions } = useFetch(apiConfig.permission.getList, { immediate: false });
    const { execute: executeGetPermissionById } = useFetch(apiConfig.permission.getById, { immediate: false });
    const { execute: executeGroupPermission } = useFetch(apiConfig.permissionGroup.getList, { immediate: false });

    const handleEditPermission = (permissionId) => {
        setIsEditingPermission(true);
        setDetail(null);
        executeGetPermissionById({
            pathParams: { id: permissionId },
            onCompleted: (response) => {
                setDetail(response.data);
                openModal();
            },
            onError: (error) => {
                notification.error({
                    message: 'error',
                    type: 'error',
                });
            },
        });
    };

    const handleDeletePermission = (permissionId) => {
        Modal.confirm({
            title: intl.formatMessage(message.deleteConfirm.title, { objectName: 'permission' }),
            content: 'Bạn có chắc chắn muốn xóa quyền này?',
            okText: intl.formatMessage(message.deleteConfirm.ok),
            cancelText: intl.formatMessage(message.deleteConfirm.cancel),
            onOk: () => {
                executeDelete({
                    pathParams: { id: permissionId },
                    onCompleted: (response) => {
                        notification.success({
                            message: 'Xóa thành công',
                        });
                        handleReloadPermission();
                        setPermissions((prevPermissions) =>
                            prevPermissions.filter((permission) => permission.id !== permissionId),
                        );
                    },
                    onError: (error) => {
                        notification.error({
                            message: 'Xóa thất bại!',
                            type: 'error',
                        });
                    },
                });
            },
        });
    };

    const handleSubmit = (values) => {
        if (permissions.length === 0) {
            values.permissions = [];
        }

        return mixinFuncs.handleSubmit({ ...values, appId: appId });
    };

    const getGroupPermission = (permissions = [], dataGroup = []) => {
        if (!dataGroup || dataGroup.length === 0) {
            setGroup([]);
            return;
        }

        const groups = dataGroup.map((g) => ({
            name: g.name,
            id: g.id,
            permissions: [],
        }));

        permissions.forEach((p) => {
            const groupItem = groups.find((g) => g.id === p.permissionGroup.id);
            if (groupItem) {
                groupItem.permissions.push(p);
                groupItem.permissions.sort((a, b) => a.pcode.localeCompare(b.pcode));
            }
        });

        setGroup(groups);
    };

    const handleAddPermission = (groupName, id) => {
        setSelectedGroupName(groupName);
        setDetail({ id, name: groupName  }), setIsEditingPermission(false);
        setIsAddingPermission(true);
        openModal();
    };
    
    const handleGetDataInit = () => {
        setLoading(true);
        executeGroupPermission({
            params: { appId: appId, size: DEFAULT_TABLE_ITEM_BIG_SIZE },
            onCompleted: (res) => {
                const groupItems = res?.data?.content;
                const stortedData = (groupItems.length > 0 && groupItems.sort((a, b) => a?.ordering - b?.ordering)) || [];
                setPermissionGroups(stortedData);
                
                executePermissions({
                    params: { appId: appId, size: DEFAULT_TABLE_ITEM_BIG_SIZE },
                    onCompleted: ({ data }) => {
                        if (data?.length > 0) {
                            getGroupPermission(data || [], stortedData);
                            setLoading(false);
                        }
                    },
                    onError: () => { setLoading(false); },
                });
            },
            onError: () => { setLoading(false); },
        });
    };

    const handleReloadPermission = () => {
        executePermissions({
            params: { appId: appId, size: DEFAULT_TABLE_ITEM_BIG_SIZE },
            onCompleted: ({ data }) => {
                if (data?.length > 0) {
                    getGroupPermission(data || [], permissionGroups);
                }
            },
        });
    };

    useEffect(() => {
        handleGetDataInit();
    }, [activeApptab]);

    return (
        <>
            <Form
                style={{ width: '100%' }}
                id={formId}
                onFinish={handleSubmit}
                form={form}
                layout="vertical"
                onValuesChange={onValuesChange}
            >
                <Card className="card-form" bordered={false} style={{ width: '100%' }}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="permissions"
                                style={{ marginBottom: 0 }}
                            >
                                <div style={{ width: '100%', display: 'block' }} name="permissions">
                                    {group && Object.keys(group).length > 0 ? (
                                        Object.keys(group).map((groupKey) => {
                                            const currentGroup = group[groupKey];
                                            const groupName = currentGroup.name;
                                            const id = currentGroup.id;

                                            return (
                                                <Card
                                                    key={groupKey}
                                                    size="small"
                                                    title={
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <span>{groupName} {" "} ({currentGroup?.permissions?.length} quyền)</span>
                                                            <PlusOutlined
                                                                onClick={() => handleAddPermission(groupName, id)}
                                                                style={{
                                                                    color: '#1677ff',
                                                                    fontSize: '18px',
                                                                    cursor: 'pointer',
                                                                    marginLeft: '10px',
                                                                }}
                                                            />
                                                        </div>
                                                    }
                                                    style={{ width: '100%', marginBottom: 30 }}
                                                >
                                                    {loading ? (
                                                        <div style={{ textAlign: 'center', color: 'gray' }}>
                                                            <LoadingOutlined style={{ fontSize: '24px' }} spin />
                                                        </div>
                                                    ) : currentGroup.permissions.length === 0 ? (
                                                        <div style={{ textAlign: 'center', color: 'gray' }}>
                                                            Chưa có quyền
                                                        </div>
                                                    ) : (
                                                        <Row>
                                                            {currentGroup.permissions.map((permission, index) => (
                                                                <Col
                                                                    key={permission.id}
                                                                    style={{
                                                                        flex: '0 0 33.33%',
                                                                        maxWidth: '33.33%',
                                                                        paddingRight: 20,
                                                                        marginBottom: 15,
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            justifyContent: 'space-between',
                                                                            alignItems: 'center',
                                                                            gap: 12,
                                                                        }}
                                                                    >
                                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                                            <div
                                                                                style={{
                                                                                    overflow: 'hidden',
                                                                                    whiteSpace: 'nowrap',
                                                                                    textOverflow: 'ellipsis',
                                                                                }}
                                                                                title={permission.name}
                                                                            >
                                                                                {permission.name}
                                                                            </div>

                                                                            {permission.pcode && (
                                                                                <div
                                                                                    style={{
                                                                                        fontSize: 8,
                                                                                        fontStyle: 'italic',
                                                                                        fontWeight: 600,
                                                                                        overflow: 'hidden',
                                                                                        whiteSpace: 'nowrap',
                                                                                        textOverflow: 'ellipsis',
                                                                                    }}
                                                                                >
                                                                                    {permission.pcode}
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                                                            <Button
                                                                                icon={<EditOutlined />}
                                                                                type="link"
                                                                                onClick={() => handleEditPermission(permission.id)}
                                                                                style={{ margin: 0 }}
                                                                            />

                                                                            <Button
                                                                                icon={<DeleteOutlined style={{ color: 'red' }} />}
                                                                                type="link"
                                                                                onClick={() => handleDeletePermission(permission.id)}
                                                                                style={{ margin: 0 }}
                                                                            />

                                                                            {(index + 1) % 3 !== 0 && (
                                                                                <div
                                                                                    style={{
                                                                                        borderLeft: '2px solid #d9d9d9',
                                                                                        height: 15,
                                                                                        marginLeft: 15,
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </Col>
                                                            ))}
                                                        </Row>
                                                    )}
                                                </Card>
                                            );
                                        })
                                    ) : (
                                        <div style={{ textAlign: 'center', color: 'gray' }}>Chưa có quyền</div>
                                    )}
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>
                    <div style={{ 
                        width: '100%', 
                        textAlign: 'left', 
                        fontWeight: 600, 
                        fontSize: 20,
                        marginBottom: 10,
                    }}>
                        Tổng số quyền: {
                            group.reduce((sum, g) => sum + (g?.permissions?.length || 0), 0)
                        }
                    </div>
                    <div className="footer-card-form">{actions}</div>
                </Card>
            </Form>

            <PermissionModal
                open={isModalOpen}
                width="800px"
                height="500px"
                onCancel={closeModal}
                formId="create-permission-form"
                selectedGroupName={selectedGroupName}
                isAddingPermission={isAddingPermission}
                detail={detail}
                isEditing={isEditingPermission}
                handleReloadPermission={handleReloadPermission}
            />
        </>
    );
};

export default PermissionForm;
