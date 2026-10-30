import { UserOutlined } from '@ant-design/icons';
import { DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import apiConfig from '@constants/apiConfig';
import { kindPost } from '@constants/masterData';
import useListBase from '@hooks/useListBase';
import useTranslate from '@hooks/useTranslate';
import { AvatarField, BaseTable, ListPage, PageWrapper } from '@components/cms';
import { commonMessage } from '@locales/intl';
import { Tag } from 'antd';
import React from 'react';

const PostListPage = ({ pageOptions }) => {
    const translate = useTranslate();

    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: apiConfig.post,
        options: {
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
            objectName: translate.formatMessage(pageOptions.objectName),
        },
        
    });
    const columns = [
        {
            title: '#',
            dataIndex: 'image_url',
            align: 'center',
            width: 100,
            render: (avatar) => (
                <AvatarField
                    size="large"
                    icon={<UserOutlined />}
                    src={avatar ? avatar[0] : null}
                />
            ),
        },
        { title: translate.formatMessage(commonMessage.username), dataIndex: ['user','name'] },
        { title: translate.formatMessage(commonMessage.likedAmount), dataIndex: 'likedAmount' },
        { title: translate.formatMessage(commonMessage.commentedAmount), dataIndex: 'commentedAmount' },

        {
            title: 'State',
            dataIndex: 'kind',
            align: 'center',
            render: (state) => {
                const kind = kindPost.find((item) => item?.value == state);

                return (
                    <Tag color={kind?.color}>
                        <div style={{ padding: '0 4px', fontSize: 14, textTransform: 'capitalize' }}>
                            {kind?.label}
                        </div>
                    </Tag>
                );
            },
        },
        mixinFuncs.renderStatusColumn({ width: '90px' }),
        mixinFuncs.renderActionColumn({ edit: false, delete: true }, { width: '150px' }),
    ];

    const searchFields = [
        {
            key: 'username',
            placeholder: translate.formatMessage(commonMessage.username),
        },
        {
            key: 'fullName',
            placeholder: translate.formatMessage(commonMessage.fullName),
        },
    ];

    return (
        <PageWrapper routes={pageOptions.renderBreadcrumbs(commonMessage, translate)}>
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({ fields: searchFields, initialValues: queryFilter })}
                actionBar={mixinFuncs.renderActionBar()}
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

export default PostListPage;
