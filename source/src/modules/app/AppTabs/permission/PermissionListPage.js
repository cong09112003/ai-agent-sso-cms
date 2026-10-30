
import { DEFAULT_TABLE_ITEM_SIZE } from "@constants";
import apiConfig from "@constants/apiConfig";
import useListBase from "@hooks/useListBase";
import useTranslate from "@hooks/useTranslate";
import { BaseTable, ListPage } from '@components/cms';
import { commonMessage } from "@locales/intl";
import routes from '@routes';
import { orderNumber } from '@utils';
import React from "react";
import { defineMessages, FormattedMessage } from 'react-intl';
import { generatePath, useLocation, useNavigate } from 'react-router-dom';
const messageIntl = defineMessages({
    objectName: 'Permission',
});
function PermissionListPage() {
    const translate = useTranslate();
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const appId = params.get('appId');
    const groupId = params.get('groupId');
    const appName = params.get('appName');
    const groupName = params.get('groupName');

    const { data, mixinFuncs, queryFilter, loading, pagination, changePagination, queryParams, serializeParams } =
        useListBase({
            apiConfig: apiConfig.permission,
            options: {
                pageSize: DEFAULT_TABLE_ITEM_SIZE,
                objectName: translate.formatMessage(messageIntl.objectName),
            },
            override: (funcs) => {
                funcs.mappingData = (response) => {

                    if (response.result === true) {
                        return {
                            data: response.data,
                        };
                    }
                 
                };
                funcs.getList = () => {
                    mixinFuncs.handleFetchList({
                        grouppermissionId: groupId,
                        appId: appId,
                    });
                };
                funcs.getItemDetailLink = (dataRow) => {
                    return `${location.pathname.replace("role","permission")}/${dataRow.id}${location.search}`;
                };
                
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
            title: <FormattedMessage defaultMessage="Tên permission" description="" id="source.src.modules.app.AppTabs.PermissionListPage.permisstioonName"/>,
            dataIndex: ['name'],
            key: 'name',
        },

        {
            title: <FormattedMessage defaultMessage="Tên nhóm quyền" description="" id="source.src.modules.app.AppTabs.GroupPermissionListPage.groupName"/>,
            dataIndex: ['permissionGroup', 'name'],
            width: 200,
            key: 'nameGroup',
        },
        
        // {
        //     title: translate.formatMessage(commonMessage.description),
        //     dataIndex: ['description'],
        //     key: 'description',
        // },

        mixinFuncs.renderActionColumn(
            {
                edit: true,
                delete: true,
            },
            { width: '130px' },
        ),


    ].filter(Boolean);

    const setBreadRoutes = () => {
        const breadRoutes = [];
        breadRoutes.push({ breadcrumbName:  translate.formatMessage(commonMessage.app), path: routes.AppListPage.path }),
        breadRoutes.push({ breadcrumbName: appName, path: generatePath(routes.AppTab.path) + `?appId=${appId}&appName=${appName}` }),

        breadRoutes.push({ breadcrumbName: groupName });
        return breadRoutes;
    };

    
    return (
        <>
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({  
                    initialValues: queryFilter, 
                })}
                // actionBar={mixinFuncs.renderActionBar()}

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
        </>
    );
}
export default PermissionListPage;




