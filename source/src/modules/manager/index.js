import { BellOutlined, RedoOutlined, UserOutlined } from '@ant-design/icons';
import { AppConstants, DEFAULT_TABLE_ITEM_SIZE, storageKeys } from "@constants";
import apiConfig from "@constants/apiConfig";
import { FieldTypes } from '@constants/formConfig';
import { statusOptions } from '@constants/masterData';
import useFetch from "@hooks/useFetch";
import useListBase from "@hooks/useListBase";
import useTranslate from "@hooks/useTranslate";
import { AvatarField, BaseTable, BaseTooltip, ListPage, PageWrapper } from '@components/cms';
import { commonMessage } from "@locales/intl";
import routes from '@routes';
import { showErrorMessage, showSucsessMessage } from "@services/notifyService";
import { Button } from "antd";
import React from "react";
import { defineMessages, FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import styles from '../app/index.module.scss';
import { getData } from '@utils';
const messageIntl = defineMessages({
    objectName: 'Quản trị viên',
    resetFaild: 'Reset Mfa thất bại !',
    resetSuccess: 'Reset Mfa thành công !',
});
function ManagerListPage() {
    const translate = useTranslate();
    const { execute: executeReset } = useFetch(apiConfig.account.resetMfa, {  immediate: false });
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const fullName = params.get('fullName');
    const username = params.get('username');
    const page = params.get('page') || 1;
    const statusValues = translate.formatKeys(statusOptions, ['label']);
    const isMfaEnableFromLogin = getData(storageKeys.IS_MFA_ENABLE);
    const { data, mixinFuncs, queryFilter, loading, pagination, changePagination, queryParams, serializeParams } =
        useListBase({
            apiConfig: apiConfig.user,
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
                // funcs.getList = () => {
                //     mixinFuncs.handleFetchList({
                //         status: 1,
                //         username: username,
                //         fullName: fullName,
                //     });
                // };
     
                funcs.additionalActionColumnButtons = () => ({
                    reset: ({ id, isMfa }) => {
                        if (!isMfaEnableFromLogin) return null;
                        return (
                            <BaseTooltip title={'Reset MFA'}>
                                <Button
                                    type="link"
                                    style={{ padding: 0 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleResetMfa(id);
                                    }}
                                    disabled={!isMfa}
                                >
                                    <RedoOutlined size={16} />
                                </Button>
                            </BaseTooltip>
                        );
                    },
                    viewNotification: (record) => {
                        return (
                            <BaseTooltip title='Xem thông báo'>
                                <Button
                                    type="link"
                                    style={{ padding: 0 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(routes.notificationListPage.path.replace(':managerId', record?.id) + `?managerId=${record?.id}&managerName=${record?.fullName}`);
                                    }}
                                >
                                    <BellOutlined size={16} />
                                </Button>
                            </BaseTooltip>
                        );
                    },
                });
                funcs.getItemDetailLink = (dataRow) => {
                    return `${location.pathname}/${dataRow.id}?page=${page}`;
                };
            },
        });

    const handleResetMfa = (id) => {
        executeReset({
            data: { id: id },
            onCompleted: () => {
                showSucsessMessage(translate.formatMessage(messageIntl.resetSuccess));
            },
            onError: () => {
                showErrorMessage(translate.formatMessage(messageIntl.resetFaild));
            },
        });
    };
    const columns = [
        {
            title: '#',
            dataIndex: 'avatarPath',
            align: 'center',
            width: 100,
            render: (avatar) => (
                <AvatarField
                    size="large"
                    icon={<UserOutlined />}
                    src={avatar ? `${AppConstants.contentRootUrl}${avatar}` : null}
                />
            ),
        },

        {
            title: <FormattedMessage defaultMessage="Họ và tên" description="" id="source.src.modules.manager.index.fullName"/>,
            dataIndex: 'fullName',
            key: 'fullName',
            width: 300,
            render: (fullName) => (
                <span style={{ color: '#1677ff', cursor: 'pointer' }}>
                    {fullName}
                </span>
            ),
        },
        {
            title: <FormattedMessage defaultMessage="Tên đăng nhập" description="" id="source.src.modules.manager.index.userName"/>,
            dataIndex: 'username',
            width: 140,
            key: 'username',          
            
        },
        {
            title: <FormattedMessage defaultMessage="Số điện thoại" />,
            dataIndex: 'phone',
            width: 140,
            key: 'phone',
        },
        {
            title: <FormattedMessage defaultMessage="Email" />,
            dataIndex: 'email',
            width: 250,
            key: 'email',
        },
        mixinFuncs.renderStatusColumn({ width: '90px' }),
        mixinFuncs.renderActionColumn(
            {
                reset: mixinFuncs.hasPermission([ apiConfig.account.resetMfa.permissionCode ]),
                viewNotification: mixinFuncs.hasPermission([ apiConfig.notification.getList.permissionCode ]),
                edit: true,
                delete: true,
            },
            { width: '120px', fixed: 'right', className: styles['action-column'] },
        ),



    ].filter(Boolean);

    const searchFields = [
        {
            key: 'username',
            placeholder: translate.formatMessage(commonMessage.userName),
        },

        {
            key: 'fullName',
            placeholder: translate.formatMessage(commonMessage.fullName),
        },
        {
            key: 'status',
            submitOnChanged: true,
            placeholder: 'Tình trạng',
            type: FieldTypes.SELECT,
            options: statusValues,
            
        },
        
    
    ];


    const setBreadRoutes = () => {
        const breadRoutes = [];
        breadRoutes.push({ breadcrumbName: translate.formatMessage(commonMessage.manager) });
        return breadRoutes;
    };

    return (
        <PageWrapper routes={setBreadRoutes()}>
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({ fields: searchFields, initialValues: queryFilter })}
                actionBar={mixinFuncs.renderActionBar()}
                baseTable={
                    <BaseTable
                        onChange={changePagination}
                        pagination={pagination}
                        loading={loading}
                        dataSource={data}
                        columns={columns} 
                        style={{ cursor: 'pointer' }}
                        onRow={(record, rowIndex) => ({
                            onClick: (e) => {
                                e.stopPropagation();
                                navigate(
                                    `${location.pathname}/app?accountId=${record.id}&fullName=${encodeURIComponent(record.fullName)}`,
                                );
                            },
                        })}
                        scroll={{ x: 'max-content' }}
                        
                    />
                }
            />
        </PageWrapper>
    );
}
export default ManagerListPage;
