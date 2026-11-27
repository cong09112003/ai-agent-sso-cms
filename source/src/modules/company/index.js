import { BankOutlined } from '@ant-design/icons';
import { DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import apiConfig from '@constants/apiConfig';
import { FieldTypes } from '@constants/formConfig';
import { statusOptions } from '@constants/masterData';
import useListBase from '@hooks/useListBase';
import useTranslate from '@hooks/useTranslate';
import { BaseTable, ListPage, PageWrapper } from '@components/cms';
import SsoAvatar from '@components/common/SsoAvatar';
import { orderNumber } from '@utils';
import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

const messageIntl = defineMessages({
    objectName: 'Doanh nghiệp',
    searchName: 'Tên doanh nghiệp',
    searchStatus: 'Tình trạng',
});

function CompanyListPage() {
    const translate = useTranslate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);
    const { data, mixinFuncs, queryFilter, loading, pagination, changePagination } = useListBase({
        apiConfig: apiConfig.company,
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
        },
    });

    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            key: 'index',
            align: 'center',
            width: 60,
            render: (text, record, index) => orderNumber(pagination, index),
        },
        {
            title: <FormattedMessage defaultMessage="Logo" />,
            dataIndex: 'avatarPath',
            align: 'center',
            width: 100,
            render: (avatarPath) => <SsoAvatar size="large" shape="square" icon={<BankOutlined />} filePath={avatarPath} />,
        },
        {
            title: <FormattedMessage defaultMessage="Tên doanh nghiệp" />,
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: <FormattedMessage defaultMessage="Quốc gia" />,
            dataIndex: 'nation',
            key: 'nation',
            width: 160,
        },
        {
            title: <FormattedMessage defaultMessage="Hiệu quả hoạt động" />,
            dataIndex: 'performanceUrl',
            key: 'performanceUrl',
            width: 260,
            render: (url) =>
                url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        {url}
                    </a>
                ) : null,
        },
        mixinFuncs.renderStatusColumn({ width: '100px' }),
        mixinFuncs.renderActionColumn({ edit: true, delete: true }, { width: '120px', fixed: 'right' }),
    ];

    const searchFields = [
        {
            key: 'name',
            placeholder: translate.formatMessage(messageIntl.searchName),
        },
        {
            key: 'status',
            submitOnChanged: true,
            placeholder: translate.formatMessage(messageIntl.searchStatus),
            type: FieldTypes.SELECT,
            options: statusValues,
        },
    ];

    return (
        <PageWrapper routes={[{ breadcrumbName: translate.formatMessage(messageIntl.objectName) }]}>
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
                        scroll={{ x: 'max-content' }}
                    />
                }
            />
        </PageWrapper>
    );
}

export default CompanyListPage;
