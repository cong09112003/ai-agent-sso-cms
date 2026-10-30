import { DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import useTranslate from '@hooks/useTranslate';
import { BaseTable, ListPage, PageWrapper } from '@components/cms';
import { commonMessage } from '@locales/intl';
import React from 'react';
import { useLocation } from 'react-router-dom';

const AddressListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { pathname: pagePath } = useLocation();
    const queryParameters = new URLSearchParams(window.location.search);
    const userId = queryParameters.get('userId');
    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: apiConfig.address,
        options: {
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
            objectName: translate.formatMessage(pageOptions.objectName),
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

            funcs.getCreateLink = () => {
                return `${pagePath}/create?userId=${userId}`;
            };
            funcs.getItemDetailLink = (dataRow) => {
                return `${pagePath}/${dataRow.id}?userId=${userId}`;
            };
        },
    });
    const columns = [
        {
            title: translate.formatMessage(commonMessage.Name),
            dataIndex: 'name',
            width: '150',
        },
        {
            title: translate.formatMessage(commonMessage.phone),
            dataIndex: 'phone',
            width: '30',
        },
        {
            title: translate.formatMessage(commonMessage.address),
            dataIndex: 'address',
            width: '280',
            render: (address, dataRow) => {
                return (
                    <div>
                        {address}, {dataRow?.wardInfo.name}, {dataRow?.districtInfo.name}, {dataRow?.provinceInfo.name}
                    </div>
                );
            },
        },
    
        mixinFuncs.renderStatusColumn({ width: '150px' }),
        mixinFuncs.renderActionColumn({ edit: true, delete: true }, { width: '130px' }),
    ];

    const searchFields = [
        {
            key: 'name',
            placeholder: translate.formatMessage(commonMessage.Name),
        },
    ];

    return (
        <PageWrapper routes={pageOptions.renderBreadcrumbs(commonMessage, translate)}>
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({ fields: searchFields, initialValues: queryFilter })}
                baseTable={
                    <BaseTable
                        onChange={mixinFuncs.changePagination}
                        columns={columns}
                        dataSource={data}
                        loading={loading}
                        pagination={pagination}
                    />
                }
            />
        </PageWrapper>
    );
};

export default AddressListPage;
