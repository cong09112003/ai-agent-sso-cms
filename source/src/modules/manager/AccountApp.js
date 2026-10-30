import { DeleteOutlined } from '@ant-design/icons';
import { DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import apiConfig from '@constants/apiConfig';
import { FieldTypes } from '@constants/formConfig';
import useListBase from '@hooks/useListBase';
import useTranslate from '@hooks/useTranslate';
import { BaseTable, BaseTooltip, ListPage, PageWrapper } from '@components/cms';
import { commonMessage } from '@locales/intl';
import routes from '@routes';
import { orderNumber } from '@utils';
import { Button } from 'antd';
import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../app/index.module.scss';
import useFetch from '@hooks/useFetch';
const messageIntl = defineMessages({
    objectName: 'Quản trị viên',
});
function AccountAppListPage() {
    const translate = useTranslate();
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const accountId = params.get('accountId');
    const username = params.get('username');
    const fullName = params.get('fullName');
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
                    return `${location.pathname}/${dataRow.id}${location.search}`;
                };
                funcs.getCreateLink = () => {
                    return `${location.pathname}/create${location.search}`;
                };
                funcs.changeFilter = (filter) => {
                    const params = {
                        accountId: accountId,
                        fullName: fullName,
                        ...filter,
                    };
                    const filteredParams = Object.fromEntries(
                        Object.entries(params).filter(([_, value]) => value != null),
                    );
                    mixinFuncs.setQueryParams(serializeParams(filteredParams));
                };
                funcs.additionalActionColumnButtons = () => ({
                    delete: ({ settings, id, ...dataRow }) => {
                        if (!mixinFuncs.hasPermission([apiConfig.accountApp.delete?.baseURL])) return null;
                        const setting = settings && settings != {} ? JSON.parse(settings) : {};
                        return (
                            (!setting?.isSuperAdmin ||
                                setting?.isSuperAdmin == false ||
                                setting?.isSuperAdmin == 'false') && (
                                <BaseTooltip type="edit" objectName={'Quản trị viên'}>
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            mixinFuncs.showDeleteItemConfirm(id);
                                        }}
                                        type="link"
                                        style={{ padding: 0 }}
                                    >
                                        <DeleteOutlined style={{ color: 'red' }} />
                                    </Button>
                                </BaseTooltip>
                            )
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
            dataIndex: ['app', 'name'],
            key: 'name',
        },
        {
            title: translate.formatMessage(commonMessage.role),
            dataIndex: ['role', 'name'],
            width: 400,
            key: 'role',
            render: (text, record) => (
                <span
                    style={{ color: '#1677ff', cursor: 'pointer' }}
                    onClick={() => navigate(`/manager/app/role/${record.role.id}?appId=${record.app.id}&accountId=${accountId}&fullName=${fullName}`)}
                >
                    {text}
                </span>
            ),
        },

        mixinFuncs.renderActionColumn(
            {
                edit: true,
                delete: true,
            },
            { width: '120px', fixed: 'right', className: styles['action-column'] },
        ),
    ].filter(Boolean);
    const searchFields = [
        {
            key: 'appId',
            placeholder: "Ứng dụng",
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

    return (
        <PageWrapper
            routes={[
                { breadcrumbName: translate.formatMessage(commonMessage.manager), path: routes.managerListPage.path },
                { breadcrumbName: fullName },
            ]}
        >
            <ListPage
                actionBar={mixinFuncs.renderActionBar()}
                searchForm={mixinFuncs.renderSearchForm({
                    fields: searchFields,
                    initialValues: queryFilter,
                })}
                baseTable={
                    <BaseTable
                        onChange={changePagination}
                        pagination={pagination}
                        loading={loading}
                        dataSource={data}
                        columns={columns}
                    />
                }
            />
        </PageWrapper>
    );
}
export default AccountAppListPage;
