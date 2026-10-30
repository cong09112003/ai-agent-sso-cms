import {
    CloseOutlined,
    CopyOutlined,
    DeleteOutlined,
    SettingOutlined,
    SnippetsOutlined,
    StopOutlined,
    SyncOutlined,
} from '@ant-design/icons';
import { DEFAULT_TABLE_ITEM_SIZE, storageKeys } from '@constants';
import apiConfig from '@constants/apiConfig';
import { FieldTypes } from '@constants/formConfig';
import useFetch from '@hooks/useFetch';
import useListBase from '@hooks/useListBase';
import useNotification from '@hooks/useNotification';
import useTranslate from '@hooks/useTranslate';
import { BaseForm, BaseTable, BaseTooltip, ListPage, PageWrapper, TextField } from '@components/cms';
import { commonMessage } from '@locales/intl';
import routes from '@routes';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';
import { orderNumber, removeItem, setData } from '@utils';
import { Button, Col, Form, Modal, Row, Table, Typography } from 'antd';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../app/index.module.scss';
import SettingsModal from './SettingModal';
const message = defineMessages({
    objectName: 'App',
    synchronizeSucces: 'Đồng bộ thành công!',
    synchronizeFailed: 'Đồng bộ thất bại!',
    ERROR_APP_0001: 'App với tên này đã tồn tại',
    ERROR_APP_0002: 'Không tìm đc app',
    ERROR_APP_0007: 'App ko có đường dẫn api',
    ERROR_APP_0008: 'App đồng bộ là sso ( ko đc phép đồng bộ ) ',
    ERROR_APP_0009: 'App chưa có api đồng bộ chủ động',
    notifidelete: 'Xóa thành công',
    cloneSuccess: 'Clone app thành công',
    updateSucess: 'Cập nhật thành công',
    deleteConfirm: {
        title: {
            id: 'hook.useListBase.deleteConfirm.title',
            defaultMessage: 'Bạn có chắc chắn muốn xóa app này không?',
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
    notification: {
        deleteSuccess: {
            id: 'hook.useListBase.notification.deleteSuccess',
            defaultMessage: 'Xóa thành công',
        },
    },
});

const AppListPage = () => {
    const translate = useTranslate();
    const { Title } = Typography;
    const location = useLocation();
    const navigate = useNavigate();
    const notification = useNotification();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);
    const [selectedUpdateAppId, setSelectedUpdateAppId] = useState(null);
    const intl = useIntl();
    const [appIdClone, setAppIdClone] = useState();
    const { pathname: pagePath } = useLocation();
    const search = location.search;

    const [arraySetting, setArraySetting] = useState([]);
    const [isChanged, setChange] = useState(false);
    const setIsChangedFormValues = (flag) => {
        if (flag !== isChanged) {
            setChange(flag);
        }
    };
    const [form] = Form.useForm();
    const { execute: executeClone } = useFetch(apiConfig.app.cloneApp, {
        immediate: false,
    });

    const { execute: executeUserKind, loading: loadingUserKind } = useFetch(apiConfig.userKind.autocomplete, {
        immediate: false,
    });

    const { execute: executeDelete } = useFetch(apiConfig.app.delete, {
        immediate: false,
    });
    const { execute: executeUpdatePermissionApp, loading: loadingUpdatePermissionApp } = useFetch(apiConfig.app.updatePermissoinApp, {
        immediate: false,
    });

    const handleUpdatePermissionApp = (id) => {
        setSelectedUpdateAppId(id);
        setSelectedRowKeys([]);
        setUpdateModalVisible(true);
    };

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys, selectedRows) => {
            setSelectedRowKeys(newSelectedRowKeys);
        },
        getCheckboxProps: (record) => ({
            disabled: record.id === selectedUpdateAppId || record.id == 50,
            name: record.name,
        }),
    };

    const handleCloneApp = (id) => {
        form.resetFields();
        setAppIdClone(id);
        // setArraySetting([{ key: 'tenantId', value: 1 }]);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setUpdateModalVisible(false);
    };
    const convertArrayToJson = (array) => {
        return array.reduce((acc, item) => {
            if (item.key === 'isSuperAdmin') {
                acc[item.key] = item.value === 'true';
            } else {
                acc[item.key] = isNaN(item.value) || typeof item.value === 'boolean'
                    ? item.value
                    : Number(item.value);
            }
            return acc;
        }, {});
    };

    const handleSubmitUpdatePermissionApp = async (values) => {
        const data = {
            idApp: selectedUpdateAppId,
            idCloneApp: selectedRowKeys,
        };

        try {
            await executeUpdatePermissionApp({
                method: 'PUT',
                data: data,
                onCompleted: (response) => {
                    close();
                    mixinFuncs.handleFetchList();
                    setUpdateModalVisible(false);
                    showSucsessMessage(intl.formatMessage(message.updateSucess));
                },
                onError: (err) => {
                    const { code } = err.response.data;
                    if (code == 'ERROR-APP-0001') showErrorMessage(intl.formatMessage(message.ERROR_APP_0001));
                },
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const handleSubmit = async (values) => {
        const settings = convertArrayToJson(arraySetting);
        const jsonString = JSON.stringify(settings);
        const data = {
            ...values,
            id: appIdClone,
            settings: jsonString,
        };

        try {
            await executeClone({
                method: 'POST',
                data: data,
                onCompleted: (response) => {
                    close();
                    mixinFuncs.handleFetchList();
                    setIsModalVisible(false);
                    showSucsessMessage(intl.formatMessage(message.cloneSuccess));
                },
                onError: (err) => {
                    const { code } = err.response.data;
                    if (code == 'ERROR-APP-0001') showErrorMessage(intl.formatMessage(message.ERROR_APP_0001));
                },
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const handleDeleteItem = (id) => {
        Modal.confirm({
            title: intl.formatMessage(message.deleteConfirm.title),
            content: '',
            okText: intl.formatMessage(message.deleteConfirm.ok),
            cancelText: intl.formatMessage(message.deleteConfirm.cancel),
            onOk: () => {
                executeDelete({
                    pathParams: { id },
                    onCompleted: (response) => {
                        mixinFuncs.onDeleteItemCompleted(id);
                        notification({
                            message: intl.formatMessage(message.notification.deleteSuccess, {
                                objectName: 'app',
                            }),
                        });
                    },
                    onError: (error) => {
                        mixinFuncs.handleDeleteItemError(error);
                    },
                });
            },
        });
    };

    const { execute: executeSynchronize, loading: loadingSynchronize } = useFetch(apiConfig.account.synchronize, {
        immediate: false,
    });
    const { execute: executeSynchronizeAll, loading: loadingSynchronizeAll } = useFetch(
        apiConfig.account.synchronizeAll,
        {
            immediate: false,
        },
    );

    const handleSynchronize = (id) => {
        executeSynchronize({
            pathParams: { appId: id },
            onCompleted: (res) => {
                showSucsessMessage(intl.formatMessage(message.synchronizeSucces));
            },
            onError: (err) => {
                const { code } = err.response.data;
                if (code == 'ERROR-APP-0002') showErrorMessage(intl.formatMessage(message.ERROR_APP_0002));
                else if (code == 'ERROR-APP-0007') showErrorMessage(intl.formatMessage(message.ERROR_APP_0007));
                else if (code == 'ERROR-APP-0008') showErrorMessage(intl.formatMessage(message.ERROR_APP_0008));
                else if (code == 'ERROR-APP-0009') showErrorMessage(intl.formatMessage(message.ERROR_APP_0009));
                else showErrorMessage(intl.formatMessage(message.synchronizeFailed));
            },
        });
    };
    const handleSynchronizeAll = (id) => {
        executeSynchronizeAll({
            onCompleted: (res) => {
                showSucsessMessage(intl.formatMessage(message.synchronizeSucces));
            },
            onError: (err) => {
                const { code } = err.response.data;
                if (code == 'ERROR-APP-0002') showErrorMessage(intl.formatMessage(message.ERROR_APP_0002));
                else if (code == 'ERROR-APP-0007') showErrorMessage(intl.formatMessage(message.ERROR_APP_0007));
                else if (code == 'ERROR-APP-0008') showErrorMessage(intl.formatMessage(message.ERROR_APP_0008));
                else if (code == 'ERROR-APP-0009') showErrorMessage(intl.formatMessage(message.ERROR_APP_0009));
                else showErrorMessage(intl.formatMessage(message.synchronizeFailed));
            },
        });
    };
    const { data, mixinFuncs, queryFilter, loading, pagination, changePagination, serializeParams } = useListBase({
        apiConfig: apiConfig.app,
        options: {
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
            objectName: translate.formatMessage(message.objectName),
        },
        override: (funcs) => {
            funcs.mappingData = (response) => {
                if (response.result === true) {
                    return {
                        data: response.data.content,
                        total: response.data.totalElements,
                    };
                }
            };
            funcs.changeFilter = (filter) => {
                const params = {
                    ...filter,
                };
                const filteredParams = Object.fromEntries(
                    Object.entries(params).filter(([_, value]) => value != null),
                );
                mixinFuncs.setQueryParams(serializeParams(filteredParams));
            };
            funcs.getCreateLink = () => {
                return `${pagePath}/create${search}`;
            };
            funcs.getItemDetailLink = (dataRow) => {
                return `${pagePath}/${dataRow.id}${search}`;
            };
            funcs.additionalActionColumnButtons = () => ({
                updatePermissionApp: ({ id }) => {
                    const isDisabled = id === 50;
                    return (
                        <BaseTooltip title={isDisabled ? '' : 'Cập nhật quyền cho app'}>
                            <Button
                                type="link"
                                style={{ padding: 0, color: isDisabled ? 'gray' : undefined }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdatePermissionApp(id);
                                }}
                                disabled={isDisabled}
                            >
                                <SnippetsOutlined size={16} />
                            </Button>
                        </BaseTooltip>
                    );
                },
                sync: ({ id }) => {
                    const isDisabled = id == 50;
                    return (
                        <BaseTooltip title={isDisabled ? '' : 'Đồng bộ'}>
                            <Button
                                type="link"
                                style={{ padding: 0, color: isDisabled ? 'gray' : undefined }}
                                onClick={(e) => {
                                    if (isDisabled) return;
                                    e.stopPropagation();
                                    handleSynchronize(id);
                                }}
                                disabled={isDisabled}
                            >
                                <SyncOutlined size={16} />
                            </Button>
                        </BaseTooltip>
                    );
                },
                clone: ({ id }) => {
                    return (
                        <BaseTooltip title={'Sao chép app'}>
                            <Button
                                type="link"
                                style={{ padding: 0 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCloneApp(id);
                                }}
                            >
                                <CopyOutlined size={16} />
                            </Button>
                        </BaseTooltip>
                    );
                },
                deleteApp: ({ id }) => {
                    const isDisabled = id == 50;
                    return (
                        <BaseTooltip title={isDisabled ? '' : 'Xóa'}>
                            <Button
                                type="link"
                                style={{ padding: 0, color: isDisabled ? 'gray' : 'red' }}
                                onClick={(e) => {
                                    if (isDisabled) return;
                                    e.stopPropagation();
                                    handleDeleteItem(id);
                                }}
                                disabled={isDisabled}
                            >
                                <DeleteOutlined size={16} />
                            </Button>
                        </BaseTooltip>
                    );
                },
                listUsers: (record) => {
                    return (
                        <BaseTooltip title={'Cài đặt'}>
                            <Button
                                type="link"
                                style={{ padding: 0 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    localStorage.setItem(
                                        routes.AppTab.keyActiveTab,
                                        translate.formatMessage(commonMessage.Role),
                                    );
                                    navigate(`${location.pathname}/role?appId=${record.id}&appName=${record.name}`);
                                    const container = document.getElementById('app-content');
                                    if (container) container.scrollTop = 0;
                                }}
                            >
                                <SettingOutlined size={16} />
                            </Button>
                        </BaseTooltip>
                    );
                },
            });
        },
    });

    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            key: 'id',
            align: 'center',
            render: (text, record, index) => {
                return orderNumber(pagination, index);
            },
            width: 50,
        },
        {
            title: (
                <FormattedMessage
                    defaultMessage="Tên ứng dụng"
                    description=""
                    id="source.src.modules.manager.AccountApp.appName"
                />
            ),
            dataIndex: 'name',
            render: (name) => <span style={{ color: '#1677ff', cursor: 'pointer' }}>{name}</span>,
        },
        {
            title: (
                <FormattedMessage
                    defaultMessage="Mô tả"
                    description=""
                    id="source.src.modules.manager.AccountApp.descripstion"
                />
            ),
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: (
                <FormattedMessage
                    defaultMessage="Phiên bản"
                    description=""
                    id="source.src.modules.manager.AccountApp.version"
                />
            ),
            dataIndex: 'version',
            key: 'version',
        },
        mixinFuncs.renderActionColumn(
            {
                updatePermissionApp: false,
                sync: false,
                clone: false,
                listUsers: true,
                edit: true,
                deleteApp: true,

                // delete: true,
            },
            { width: '120px', fixed: 'right', className: styles['action-column'] },
        ),
    ].filter(Boolean);

    const columnsUpdate = [
        {
            title: '#',
            dataIndex: 'index',
            key: 'index',
            align: 'center',
            render: (text, record, index) => {
                return orderNumber(pagination, index);
            },
            width: 50,
        },
        {
            title: (
                <FormattedMessage
                    defaultMessage="Tên ứng dụng"
                    description=""
                    id="source.src.modules.manager.AccountApp.appName"
                />
            ),
            dataIndex: 'name',

        },
    ].filter(Boolean);
    const dataWithKeys = Array.isArray(data)
        ? data.map((item, index) => ({
            ...item,
            key: item.id || index,
        }))
        : [];

    const searchFields = [
        {
            key: 'id',
            placeholder: translate.formatMessage(commonMessage.app),
            type: FieldTypes.AUTOCOMPLETE,
            apiConfig: apiConfig.app.autocomplete,
            mappingOptions: (item) => ({
                value: item.id,
                label: item.name,
            }),
            colSpan: 4,
            searchParams: (text) => ({ name: text }),
            submitOnChanged: true,
            useFetch: useFetch,
        },
    ].filter(Boolean);

    const handleRowClick = (record) => {
        if (record.id !== selectedUpdateAppId && record.id !== 50) {
            const newSelectedRowKeys = [...selectedRowKeys];
            const index = newSelectedRowKeys.indexOf(record.key);

            if (index > -1) {
                newSelectedRowKeys.splice(index, 1);
            } else {
                newSelectedRowKeys.push(record.key);
            }

            setSelectedRowKeys(newSelectedRowKeys);
        }
    };

    return (
        <PageWrapper routes={[{ breadcrumbName: translate.formatMessage(commonMessage.app) }]}>
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({
                    fields: searchFields,
                    initialValues: queryFilter,
                })}
                actionBar={
                    <div className={styles.btn}>
                        <Button
                            icon={<SyncOutlined style={{ marginRight: '8px' }} />}
                            onClick={() => {
                                handleSynchronizeAll();
                            }}
                        >
                            <FormattedMessage defaultMessage="Đồng bộ tất cả" description="" id="sync-all" />
                        </Button>
                        {mixinFuncs.renderActionBar()}
                    </div>
                }
                baseTable={
                    <BaseTable
                        onChange={changePagination}
                        pagination={pagination}
                        loading={loading || loadingSynchronize || loadingSynchronizeAll || loadingUserKind}
                        dataSource={data}
                        columns={columns}
                        style={{ cursor: 'pointer' }}
                        onRow={({ id, name }) => ({
                            onClick: (e) => {
                                e.stopPropagation();
                                executeUserKind({
                                    params: { appId: id },
                                    onCompleted: ({ data }) => {
                                        let listData = [];
                                        if (data?.content?.length > 0) {
                                            listData = data.content.map((item) => ({
                                                value: item?.id,
                                                label: item?.name,
                                            }));
                                        }
                                        if (listData.length > 0 ){
                                            setData(storageKeys.USER_KIND_LIST, listData);
                                            navigate(routes.AccountAppListPage.path + `?appName=${name}&appId=${id}&userKindId=${listData[0].value}`);
                                        } else {
                                            removeItem(storageKeys.USER_KIND_LIST);
                                            navigate(routes.AccountAppListPage.path + `?appName=${name}&appId=${id}`);
                                        }
                                    },
                                    onError: () => {
                                        setData(storageKeys.USER_KIND_LIST, []);
                                        navigate(routes.AccountAppListPage.path + `?appName=${name}&appId=${id}`);
                                    },
                                });
                            },
                        })}
                    />
                }
            />
            <Modal centered open={isModalVisible} onCancel={handleCancel} footer={null} width={800}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <BaseForm
                        style={{ width: '744px', padding: '0px' }}
                        onFinish={handleSubmit}
                        form={form}
                    >
                        <Title
                            level={3}
                            style={{ textAlign: 'center', marginBottom: '10px', marginTop: '0px', height: '40px' }}
                        >
                            Sao chép App
                        </Title>

                        <Row gutter={10}>
                            <Col span={12}>
                                <TextField required label="Tên app" name="name" />
                            </Col>
                            <Col span={12}>
                                <TextField label="Đường link" name="url" required />
                            </Col>
                            <Col span={24}>
                                <TextField label="Mô tả" type="textarea" name="description" />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <SettingsModal
                                    arraySetting={arraySetting}
                                    setArraySetting={setArraySetting}
                                    setIsChangedFormValues={setIsChangedFormValues}
                                />
                            </Col>
                        </Row>
                        <div style={{ float: 'right', marginTop: '14px' }}>
                            <Button
                                style={{ marginRight: '16px' }}
                                danger
                                key="cancel"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancel();
                                }}
                                icon={<StopOutlined />}
                            >
                                Huỷ
                            </Button>
                            <Button
                                key="submit"
                                type="primary"
                                htmlType="submit"
                            >
                                Lưu
                            </Button>
                        </div>
                    </BaseForm>
                </div>
            </Modal>

            <Modal
                centered
                open={isUpdateModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={700}
                closeIcon={<CloseOutlined style={{ color: 'red' }} />}
            >

                <div style={{ width: "624px", marginLeft: 20, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <BaseForm
                        style={{ width: '700px', marginRight: '9px' }}
                        onFinish={handleSubmitUpdatePermissionApp}
                        form={form}
                    >
                        <Title level={4} style={{ marginTop: '0px', marginBottom: '24px', height: '30px' }}>
                            Cập nhật quyền cho App
                        </Title>

                        <div style={{ width: "656px" }} >

                            <Table
                                rowSelection={{
                                    ...rowSelection,
                                }}
                                columns={columnsUpdate}
                                dataSource={dataWithKeys}
                                loading={loadingUpdatePermissionApp}
                                style={{ height: "440px" }}
                                className={styles.scrollContainer}
                                rowHoverable={false}

                                pagination={{ pageSize: 20, hideOnSinglePage: true }}
                                // scroll={{ y: 400  }}
                                onRow={(record) => ({
                                    onClick: () => handleRowClick(record),
                                    style: {
                                        cursor: record.id === selectedUpdateAppId || record.id == 50 ? 'not-allowed' : 'pointer',
                                        backgroundColor: record.id === selectedUpdateAppId || record.id == 50 ? '#f0f0f0' : 'inherit',
                                    },

                                })}
                            />
                        </div>

                        <div style={{ float: 'right' }}>
                            <Button
                                style={{ marginRight: '16px' }}
                                danger
                                key="cancel"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancel();
                                }}
                                icon={<StopOutlined />}
                            >
                                Huỷ
                            </Button>
                            <Button key="submit" type="primary" htmlType="submit" style={{ marginTop: 20, marginBottom: 8 }}>
                                Cập nhật
                            </Button>
                        </div>
                    </BaseForm>
                </div>
            </Modal>
        </PageWrapper>
    );
};

export default AppListPage;
