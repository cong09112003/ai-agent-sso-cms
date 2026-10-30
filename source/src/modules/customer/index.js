import { MobileOutlined } from '@ant-design/icons';
import { DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import useTranslate from '@hooks/useTranslate';
import { BaseTable, BaseTooltip, ListPage, PageWrapper } from '@components/cms';
import { commonMessage } from '@locales/intl';
import routes from '@routes';
import { orderNumber } from '@utils';
import { Button } from 'antd';
import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { generatePath, useNavigate } from 'react-router-dom';
import styles from './index.module.scss';
const messageIntl = defineMessages({
    objectName: 'Khách hàng',
});
function CustomerListPage() {
    const translate = useTranslate();
    const navigate = useNavigate();
    const { data, mixinFuncs, queryFilter, loading, pagination, changePagination, queryParams, serializeParams } =
        useListBase({
            apiConfig: apiConfig.customer,
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
                funcs.additionalActionColumnButtons = () => ({
                    device: ({ id }) => (
                        <BaseTooltip title={'Quản lí thiết bị'}>
                            <Button
                                type="link"
                                style={{ padding: 0 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(
                                        generatePath(routes.DeviceListPage.path, {
                                            customerId: id,
                                        }),
                                    );
                                }}
                            >
                                <MobileOutlined size={16} />
                            </Button>
                        </BaseTooltip>
                    ),
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
            dataIndex: 'name',
            key: 'name',
            render: (dataRow) => {
                return <div className={styles.div}>{dataRow}</div>;
            },
        },
        mixinFuncs.renderActionColumn(
            {
                device: false,
                edit: true,
                delete: true,
            },
            { width: '130px' },
        ),
    ].filter(Boolean);

    const searchFields = [
        {
            key: 'name',
            placeholder: translate.formatMessage(commonMessage.fullName),
        },
    ];

    const setBreadRoutes = () => {
        const breadRoutes = [];
        breadRoutes.push({ breadcrumbName: translate.formatMessage(messageIntl.objectName) });
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
                        rowKey={(record) => record.id}
                        style={{ cursor: 'pointer' }}
                        onRow={(record, rowIndex) => ({
                            onClick: (e) => {
                                e.stopPropagation();
                                navigate(
                                    `${generatePath(routes.DeviceListPage.path, {
                                        customerId: record.id,
                                    })}?customerName=${record.name}&customerId=${record.id}`,
                                );
                            },
                        })}
                    />
                }
            />
        </PageWrapper>
    );
}
export default CustomerListPage;
