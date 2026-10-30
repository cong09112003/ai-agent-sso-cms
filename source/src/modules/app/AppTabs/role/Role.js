
import { DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import apiConfig from '@constants/apiConfig';
import useAuth from '@hooks/useAuth';
import useListBase from '@hooks/useListBase';
import useQueryParams from '@hooks/useQueryParams';
import useTranslate from '@hooks/useTranslate';
import { BaseTable, ListPage } from '@components/cms';
import { commonMessage } from '@locales/intl';
import { orderNumber } from '@utils';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function groupByUserKind(data) {
    const withKind = data.filter(item => item.userKind?.kind !== undefined && item.userKind?.kind !== null);
    const withoutKind = data.filter(item => !item.userKind?.kind);

    const grouped = withKind.sort((a, b) => a.userKind.kind - b.userKind.kind);

    return [...grouped, ...withoutKind];
}

const RoleListPage = () => {
    const { setQueryParams } = useQueryParams();
    const translate = useTranslate();
    const { profile } = useAuth();

    const { data, mixinFuncs, queryFilter, loading, pagination, setQueryFilter } = useListBase({
        apiConfig: apiConfig.role,
        params: {
            isSystemRole: profile?.isSuperAdmin ? true : false,
        },
        options: {
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
            objectName: 'Quyền',
        },
        override: (funcs) => {
            funcs.mappingData = (response) => {
                if (response.result === true) {
                    return {
                        data: response?.data?.content ? groupByUserKind(response.data.content) : [],
                        total: response.data.totalElements,
                    };
                }
            };

            funcs.getItemDetailLink = (dataRow) => {
                return `${location.pathname.replace('account-app', 'role')}/${dataRow.id}${location.search}`;
            };
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

        { title: translate.formatMessage(commonMessage.Name), dataIndex: 'name' },
        {
            title: translate.formatMessage(commonMessage.userType),
            dataIndex: ['userKind', 'name'],
            width: 200,
            key: 'description',
        },
        mixinFuncs.renderActionColumn({ edit: true, delete: true }, { width: '130px' }),
    ];

    const searchFields = [
        {
            key: 'name',
            placeholder: translate.formatMessage(commonMessage.Name),
        },
    ];

    const location = useLocation();

    useEffect(() => {
        const content = document.getElementById('app-content');
        if (content) {
            content.scrollTop = 0; 
        }
    }, []);

    return (
        <>
            <ListPage
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
        </>
    );
};

export default RoleListPage;
