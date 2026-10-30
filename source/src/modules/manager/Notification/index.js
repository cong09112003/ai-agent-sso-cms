
import { DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import apiConfig from '@constants/apiConfig';
import { notificationStateOptions } from '@constants/masterData';
import useListBase from '@hooks/useListBase';
import useQueryParams from '@hooks/useQueryParams';
import useTranslate from '@hooks/useTranslate';
import { BaseTable, ListPage, PageWrapper } from '@components/cms';
import { commonMessage } from '@locales/intl';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { useParams } from 'react-router-dom';

const NotificationListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const statusValues = translate.formatKeys(notificationStateOptions, ['label']);
    const { managerId } = useParams();
    const { params } = useQueryParams();
    const managerName = params.get('managerName');
    
    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: apiConfig.notification,
        options: {
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
            objectName: translate.formatMessage(pageOptions.objectName)?.toLowerCase(),
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
                mixinFuncs.handleFetchList({ ...params, accountId: managerId });
            };
        },
    });

    const columns = [
        {
            title: translate.formatMessage(commonMessage.sendDate),
            dataIndex: 'date',
            render: (date) => dayjs(date, DEFAULT_FORMAT).add(7, 'hour').format(DEFAULT_FORMAT),
            width: 200,
        },
        { 
            title: translate.formatMessage(commonMessage.message), 
            dataIndex: 'message',
            render: (message) => {
                try {
                    const parsed = JSON.parse(message);
                    return parsed?.contents?.en || '';
                } catch (e) {
                    return message;
                }
            },
        },
        {
            title: translate.formatMessage(commonMessage.state),
            dataIndex: 'state',
            width: 160,
            align: 'center',
            render: (state) => {
                const status = statusValues.find(item => item.value === state);
                if (!status) return null;

                return (
                    <Tag
                        color={status.color}
                        style={{
                            display: 'inline-block',
                            width: '100%',
                            textAlign: 'center',
                            fontSize: 14,
                        }}
                    >
                        <div style={{ padding: '0 4px', fontSize: 14 }}>
                            {status.label}
                        </div> 
                    </Tag>
                );
            },
        },
    ];


    return (
        <PageWrapper routes={pageOptions.renderBreadcrumb(commonMessage, translate, managerName)}>
            <ListPage
                searchForm={null}
                actionBar={null}
                baseTable={
                    <BaseTable
                        onChange={mixinFuncs.changePagination}
                        columns={columns}
                        dataSource={data}
                        loading={loading}
                        rowKey={(record) => record.id}
                        pagination={pagination}
                    />
                }
            />
        </PageWrapper>
    );
};

export default NotificationListPage;
