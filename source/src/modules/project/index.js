import { ProjectOutlined } from '@ant-design/icons';
import { DATE_FORMAT_DISPLAY, DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import apiConfig from '@constants/apiConfig';
import { FieldTypes } from '@constants/formConfig';
import { statusOptions } from '@constants/masterData';
import useFetch from '@hooks/useFetch';
import useListBase from '@hooks/useListBase';
import useTranslate from '@hooks/useTranslate';
import { BaseTable, ListPage, PageWrapper } from '@components/cms';
import SsoAvatar from '@components/common/SsoAvatar';
import { orderNumber } from '@utils';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

dayjs.extend(customParseFormat);

const messageIntl = defineMessages({
    objectName: 'Dự án',
    searchCompany: 'Doanh nghiệp',
    searchName: 'Tên dự án',
    searchCode: 'Mã dự án',
    searchStatus: 'Tình trạng',
});

function ProjectListPage() {
    const translate = useTranslate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);
    const { data, mixinFuncs, queryFilter, loading, pagination, changePagination } = useListBase({
        apiConfig: apiConfig.project,
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
            title: <FormattedMessage defaultMessage="Ảnh" />,
            dataIndex: 'avatarPath',
            align: 'center',
            width: 100,
            render: (avatarPath) => (
                <SsoAvatar size="large" shape="square" icon={<ProjectOutlined />} filePath={avatarPath} />
            ),
        },
        {
            title: <FormattedMessage defaultMessage="Mã dự án" />,
            dataIndex: 'code',
            key: 'code',
            width: 140,
        },
        {
            title: <FormattedMessage defaultMessage="Tên dự án" />,
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: <FormattedMessage defaultMessage="Doanh nghiệp" />,
            dataIndex: ['company', 'name'],
            key: 'company',
        },
        {
            title: <FormattedMessage defaultMessage="Số thành viên" />,
            dataIndex: 'numberOfMembers',
            key: 'numberOfMembers',
            align: 'right',
            width: 130,
        },
        {
            title: <FormattedMessage defaultMessage="Giai đoạn hiện tại" />,
            dataIndex: 'currentPhase',
            key: 'currentPhase',
            width: 180,
        },
        {
            title: <FormattedMessage defaultMessage="Ngày bắt đầu" />,
            dataIndex: 'startAt',
            key: 'startAt',
            width: 130,
            render: (startAt) => (startAt ? dayjs(startAt, DEFAULT_FORMAT).format(DATE_FORMAT_DISPLAY) : null),
        },
        mixinFuncs.renderStatusColumn({ width: '100px' }),
        mixinFuncs.renderActionColumn({ edit: true, delete: true }, { width: '120px', fixed: 'right' }),
    ];

    const searchFields = [
        {
            key: 'companyId',
            placeholder: translate.formatMessage(messageIntl.searchCompany),
            type: FieldTypes.AUTOCOMPLETE,
            apiConfig: apiConfig.company.autocomplete,
            mappingOptions: (item) => ({ value: item.id, label: item.name }),
            searchParams: (text) => ({ name: text }),
            submitOnChanged: true,
            useFetch: useFetch,
        },
        {
            key: 'name',
            placeholder: translate.formatMessage(messageIntl.searchName),
        },
        {
            key: 'code',
            placeholder: translate.formatMessage(messageIntl.searchCode),
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

export default ProjectListPage;
