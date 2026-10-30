import { EditOutlined } from '@ant-design/icons';
import { DEFAULT_TABLE_ITEM_BIG_SIZE } from "@constants";
import apiConfig from "@constants/apiConfig";
import useDragDrop from "@hooks/useDragDrop";
import useListBase from "@hooks/useListBase";
import useTranslate from "@hooks/useTranslate";
import { DragDropTableV2, ListPage } from '@components/cms';
import { Button } from "antd";
import React, { useState } from "react";
import { defineMessages, FormattedMessage } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';
import GroupModal from "./GroupModal";
import { orderNumber } from '@utils';
const messageIntl = defineMessages({
    objectName: 'Group Permission',
});
function GroupPermissionListPage({ isModalOpen, openModal, closeModal }) {
    const translate = useTranslate();
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const appId = params.get('appId');
    const appName = params.get('appName');
    // const [isModalOpen, { open: openModal, close: closeModal }] = useDisclosure();
    const [ detail, setDetail ] = useState(null);

    const { data, mixinFuncs, queryFilter, loading, pagination, changePagination, queryParams, serializeParams } =
        useListBase({
            apiConfig: apiConfig.permissionGroup,
            options: {
                pageSize: DEFAULT_TABLE_ITEM_BIG_SIZE,
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
                funcs.changePagination = (currentPage, pageSize) => {
                    mixinFuncs.handleFetchList({
                        appId: appId,
                        page: currentPage,
                        size: pageSize,
                    });
                };
    

    
                funcs.getItemDetailLink = (dataRow) => {
                    return `${location.pathname.replace("role","group-permission")}/${dataRow.id}${location.search}`;
                };
                funcs.additionalActionColumnButtons = () => ({
                    edit: (item) => {
                        return (
                            <Button
                                type="link"
                                style={{ padding: 0 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDetail(item);
                                    openModal();
                                }}
                            >
                                <EditOutlined />
                            </Button>
                        );
                    },
                });
                
            },
        });

    const { sortedData, sortColumn, onDragEnd, loadingUpdate } = useDragDrop({
        data,
        apiConfig: apiConfig.permissionGroup.updateSort,
        setTableLoading: () => {},
        indexField: 'ordering',
        idField: 'permissionGroupId',
        dataParams: { appId: appId },
    });

    const columns = [
        sortColumn,
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
            title: <FormattedMessage defaultMessage="Tên nhóm quyền" description="" id="source.src.modules.app.AppTabs.GroupPermissionListPage.groupName"/>,
            dataIndex: ['name'],
            key: 'name',
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
                    <DragDropTableV2
                        pagination={pagination}
                        onDragEnd={onDragEnd}
                        onChange={changePagination}
                        loading={loading || loadingUpdate}
                        dataSource={sortedData}
                        columns={columns}
                    />
                }
            />
            <GroupModal
                open={isModalOpen}
                width="600px"
                height="500px"
                onCancel={() => { 
                    setDetail(null);
                    closeModal();
                }}
                formId="create-permission-form"
                detail={detail}
                handleReloadPermission={() => { mixinFuncs.getList(); }}
                // selectedGroupName={selectedGroupName}
                // isAddingPermission={isAddingPermission}
                // isEditing={isEditingPermission}
            />
        </>
    );
}
export default GroupPermissionListPage;
