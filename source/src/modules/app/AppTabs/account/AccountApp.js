import { DeleteOutlined, PlusOutlined, SyncOutlined, UserOutlined, EditOutlined } from '@ant-design/icons';
import { AppConstants, DEFAULT_TABLE_ITEM_SIZE, OPTION_COVERT_USER, storageKeys } from '@constants';
import apiConfig from '@constants/apiConfig';
import { FieldTypes } from '@constants/formConfig';
import useFetch from '@hooks/useFetch';
import useListBase from '@hooks/useListBase';
import useTranslate from '@hooks/useTranslate';
import { BaseTable, BaseTooltip, ListPage, PageWrapper } from '@components/cms';
import { orderNumber } from '@utils';
import { commonMessage } from '@locales/intl';
import routes from '@routes';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';
import { getData } from '@utils';
import { Button, Flex, Modal } from 'antd';
import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';
const messageIntl = defineMessages({
    objectName: 'Quản trị viên',
});
const message = defineMessages({
    objectName: 'App',
    synchronizeSucces: 'Đồng bộ thành công!',
    synchronizeFailed: 'Đồng bộ thất bại!',
    ERROR_APP_0001: 'App với tên này đã tồn tại',
    ERROR_APP_0002: 'Không tìm đc app',
    ERROR_APP_0007: 'App ko có đường dẫn api',
    ERROR_APP_0008: 'App đồng bộ là sso ( ko đc phép đồng bộ ) ',
    ERROR_APP_0009: 'App chưa có api đồng bộ chủ động',
});
function AccountAppListPage() {
    const translate = useTranslate();
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const appId = params.get('appId');
    const appName = params.get('appName');
    const userKindId = params.get('userKindId');
    const userKindList = getData(storageKeys.USER_KIND_LIST);

    const { execute: executeSynchronize, loading: loadingSynchronize } = useFetch(apiConfig.account.synchronize, {
        immediate: false,
    });
    const { execute: executeUpdateSystem, loading: loadingUpdateSystem } = useFetch(apiConfig.accountApp.updateSystem, {
        immediate: false,
    });

    const handleUpdateSystem = (data, option) => {
        executeUpdateSystem({
            data: {
                accountAppRoleId: data?.id,
                option: option,
            },
            onCompleted: (response) => {
                if (response.result === true) {
                    showSucsessMessage("Chuyển về người dùng hệ thống thành công!");
                    mixinFuncs.getList();
                }
            },
            onError: (err) => {
                showErrorMessage("Chuyển về người dùng hệ thống thất bại!");
            },
        });
    };

    const { data, mixinFuncs, queryFilter, loading, pagination, changePagination, queryParams, serializeParams } =
        useListBase({
            apiConfig: apiConfig.accountApp,
            options: {
                pageSize: DEFAULT_TABLE_ITEM_SIZE,
                objectName: translate.formatMessage(messageIntl.objectName),
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
                funcs.getItemDetailLink = (dataRow) => {
                    return `${location.pathname.replace('role', 'account-app')}/${dataRow.id}${location.search}`;
                };
                funcs.getCreateLink = () => {
                    return `${location.pathname.replace('role', 'account-app')}/create${location.search}`;
                };
                funcs.changeFilter = (filter) => {
                    const params = {
                        appId,
                        appName,
                        userKindId,
                        ...filter,
                    };
                    const filteredParams = Object.fromEntries(
                        Object.entries(params).filter(([_, value]) => value != null),
                    );

                    mixinFuncs.setQueryParams(serializeParams(filteredParams));
                };
                funcs.additionalActionColumnButtons = () => ({
                    syncSystem: (data) => {
                        return (
                            <BaseTooltip title="Chuyển về hệ thống">
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        Modal.confirm({
                                            title: 'Bạn có muốn chuyển về người dùng hệ thống không?',
                                            cancelButtonProps: { danger: true },
                                            onOk: () => {
                                                handleUpdateSystem(data, OPTION_COVERT_USER);
                                            },
                                            okText: 'Có',
                                            cancelText: 'Không',
                                        }); 
                                    }}
                                    type="link"
                                    disabled={loadingUpdateSystem || !data?.account?.appId}
                                    style={{ padding: 0 }}
                                >
                                    <UserOutlined />
                                </Button>
                            </BaseTooltip>
                        );
                    },
                    edit: (record) => {
                        const hasPerm = funcs.hasPermission([apiConfig.accountApp.update.permissionCode]);
                        return (
                            <BaseTooltip type="edit" objectName={'Quản trị viên'}>
                                <Button
                                    type="link"
                                    disabled={!hasPerm || record?.account?.appId}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (hasPerm) {
                                            navigate(funcs.getItemDetailLink(record), {
                                                state: { action: 'edit', prevPath: location.pathname },
                                            });
                                        }
                                    }}
                                    style={{ padding: 0 }}
                                >
                                    <EditOutlined style={{ color: hasPerm ? undefined : 'grey' }}/>
                                </Button>
                            </BaseTooltip>
                        );
                    },
                    deleteA: ({ settings, id, ...dataRow }) => {
                        const setting = settings && settings != {} ? JSON.parse(settings) : {};
                        const enable = (!setting?.isSuperAdmin ||
                                setting?.isSuperAdmin == false ||
                                setting?.isSuperAdmin == 'false'); 
                        return (
                            <BaseTooltip type="delete" objectName={'Quản trị viên'}>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        mixinFuncs.showDeleteItemConfirm(id);
                                    }}
                                    type="link"
                                    style={{ padding: 0 }}
                                    disabled={!enable}
                                >
                                    <DeleteOutlined style={{ color: enable ? 'red' : 'gray' }} />
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
            render: (text, record, index) => {
                return orderNumber(pagination, index);
            },
            width: 50,
        },
        {
            title: <FormattedMessage defaultMessage="Họ và tên" />,
            dataIndex: ['account', 'fullName'],
            key: 'fullName',
        },
        {
            title: <FormattedMessage defaultMessage="Tên đăng nhập" />,
            dataIndex: ['account', 'username'],
            key: 'username',
            width: 140,

        },
        {
            title: <FormattedMessage defaultMessage="Số điện thoại" />,
            dataIndex: ['account', 'phone'],
            key: 'phone',
            width: 200,
        },
        {
            title: <FormattedMessage defaultMessage="Email" />,
            dataIndex: ['account', 'email'],
            key: 'email',
            width: 200,
        },
        {
            title: <FormattedMessage defaultMessage="Vai trò" />,
            dataIndex: ['role', 'name'],
            key: 'roleName',
            width: 200,
        },
        mixinFuncs.renderActionColumn(
            {
                syncSystem: mixinFuncs.hasPermission([apiConfig.accountApp.updateSystem.permissionCode]) && appId != AppConstants.appId,
                edit: mixinFuncs.hasPermission([apiConfig.accountApp.update.permissionCode]),
                delete: mixinFuncs.hasPermission([apiConfig.accountApp.delete.permissionCode]),
            },
            { width: 140 },
        ),
    ].filter(Boolean);

    const searchFields = [
        {
            key: 'fullName',
            placeholder: 'Họ và tên',
        },
        userKindList?.length > 1 ? {
            key: 'userKindId',
            placeholder: "Loại người dùng",
            type: FieldTypes.AUTOCOMPLETE,
            apiConfig: apiConfig.userKind.autocomplete,
            mappingOptions: (item) => ({
                value: item.id,
                label: item.name,
            }),
            initialSearchParams: { appId },
            colSpan: 4,
            searchParams: (text) => ({ name: text, appId }),
            submitOnChanged: true,
            useFetch: useFetch, 
        } : null,
    ].filter(Boolean);
    const isDisabled = appId == 50;

    const handleSynchronize = () => {
        executeSynchronize({
            pathParams: { appId },
            onCompleted: (res) => {
                showSucsessMessage(translate.formatMessage(message.synchronizeSucces));
            },
            onError: (err) => {
                const { code } = err.response.data;
                if (code == 'ERROR-APP-0002') showErrorMessage(translate.formatMessage(message.ERROR_APP_0002));
                else if (code == 'ERROR-APP-0007') showErrorMessage(translate.formatMessage(message.ERROR_APP_0007));
                else if (code == 'ERROR-APP-0008') showErrorMessage(translate.formatMessage(message.ERROR_APP_0008));
                else if (code == 'ERROR-APP-0009') showErrorMessage(translate.formatMessage(message.ERROR_APP_0009));
                else showErrorMessage(translate.formatMessage(message.synchronizeFailed));
            },
        });
    };

    return (
        <PageWrapper
            routes={[
                { breadcrumbName: translate.formatMessage(commonMessage.app), path: routes.AppListPage.path },
                { breadcrumbName: appName },
            ]}
        >
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({ fields: searchFields, initialValues: queryFilter })}
                actionBar={
                    +appId === AppConstants.appId ? (
                        mixinFuncs.renderActionBar()
                    ) : (
                        <Flex gap={12}>
                            {/* {mixinFuncs.renderActionBar()} */}
                            <BaseTooltip title="Thêm mới">
                                <Button
                                    type='primary'
                                    onClick={(e) => {
                                        navigate(routes.NewAccountAppSavePage.path + `?appName=${appName}&appId=${appId}&userKindId=${userKindId}`);
                                    }}
                                    icon={<PlusOutlined />}
                                >
                                    Thêm mới
                                </Button>
                            </BaseTooltip>
                            <BaseTooltip title="Chọn">
                                <Button
                                    type='primary'
                                    onClick={(e) => {
                                        navigate(routes.AccountAppListPage.path + `/create?appName=${appName}&appId=${appId}&userKindId=${userKindId}`);
                                    }}
                                    icon={<PlusOutlined />}
                                >
                                    Chọn
                                </Button>
                            </BaseTooltip>
                            <BaseTooltip title={isDisabled ? '' : 'Đồng bộ'}>
                                <Button
                                    type="link"
                                    style={{ padding: 0, color: isDisabled ? 'gray' : undefined }}
                                    onClick={(e) => {
                                        if (isDisabled) return;
                                        e.stopPropagation();
                                        handleSynchronize();
                                    }}
                                    disabled={isDisabled}
                                >
                                    <SyncOutlined style={{ fontSize: 18 }} />
                                </Button>
                            </BaseTooltip>
                        </Flex>
                    )}
                baseTable={
                    <BaseTable
                        onChange={changePagination}
                        pagination={pagination}
                        loading={loading || loadingSynchronize}
                        dataSource={data}
                        columns={columns}
                        scroll={{ x: 'max-content' }}
                    />
                }
            />
        </PageWrapper>
    );
}
export default AccountAppListPage;
