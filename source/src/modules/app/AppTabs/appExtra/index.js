import { DeleteOutlined } from '@ant-design/icons';
import { DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import useTranslate from '@hooks/useTranslate';
import { BaseTable, BaseTooltip, ListPage } from '@components/cms';
import { orderNumber } from '@utils';
import { Button } from 'antd';
import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';
const messageIntl = defineMessages({
    objectName: 'Mở rộng',
});

const isValidUrl = (url) => {
    try {
        const u = new URL(url);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
        return false;
    }
};

function AppExtraListPage() {
    const translate = useTranslate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const appId = params.get('appId');
    const { data, mixinFuncs, queryFilter, loading, pagination, changePagination, queryParams, serializeParams } =
        useListBase({
            apiConfig: apiConfig.appExtra,
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
                funcs.getList = () => {
                    const params = mixinFuncs.prepareGetListParams(queryFilter);
                    mixinFuncs.handleFetchList({ ...params, appId });
                };
                funcs.getItemDetailLink = (dataRow) => {
                    return `${location.pathname.replace('role', 'app-extra')}/${dataRow.id}${location.search}`;
                };
                funcs.additionalActionColumnButtons = () => ({
                    delete: ({ settings, id, ...dataRow }) => {
                        if (!mixinFuncs.hasPermission([apiConfig.accountApp.delete?.permissionCode])) return null;
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
            render: (text, record, index) => {
                return orderNumber(pagination, index);
            },
            width: 50,
        },
        {
            title: <FormattedMessage defaultMessage="Tên" />,
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => {
                const valid = isValidUrl(record?.linkUrl);

                return (
                    <BaseTooltip title="Mở đường dẫn">
                        <span
                            style={{
                                color: valid ? '#1677ff' : '',
                                cursor: valid ? 'pointer' : 'not-allowed',
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!valid) return;
                                window.open(record.linkUrl, '_blank', 'noopener,noreferrer');
                            }}
                        >
                            {text}
                        </span>
                    </BaseTooltip>
                );
            },
        },
        mixinFuncs.renderActionColumn(
            {
                edit: true,
                delete: true,
            },
            { width: '130px' },
        ),
    ].filter(Boolean);

    return (
        <>
            <ListPage
                baseTable={
                    <BaseTable
                        onChange={changePagination}
                        pagination={pagination}
                        loading={loading}
                        dataSource={data}
                        columns={columns}
                        scroll={{ x: 'max-content' }}
                    />
                }
            />
        </>
    );
}
export default AppExtraListPage;
