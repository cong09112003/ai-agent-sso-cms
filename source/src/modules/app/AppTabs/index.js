import { ExportOutlined, ImportOutlined, PlusOutlined } from '@ant-design/icons';
import UploadZipProcessField from '@components/common/form/UploadZipProcessField';
import apiConfig from '@constants/apiConfig';
import useDisclosure from '@hooks/useDisclosure';
import useFetch from '@hooks/useFetch';
import useQueryParams from '@hooks/useQueryParams';
import useTranslate from '@hooks/useTranslate';
import useValidatePermission from '@hooks/useValidatePermission';
import { ListPage, PageWrapper } from '@components/cms';
import { commonMessage } from '@locales/intl';
import PermissionForm from '@modules/app/AppTabs/permission/PermissionForm';
import routes from '@routes';
import { hideAppLoading, showAppLoading } from '@store/actions/app';
import { Button, Modal, notification, Tabs } from 'antd';
import { useForm } from 'antd/es/form/Form';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../index.module.scss';
import AppExtraListPage from './appExtra';
import GroupPermissionListPage from './groupPermission/GroupPermissionListPage';
import MobileConfigSavebase from './mobileConfig/MobileConfigSavebase';
import RoleListPage from './role/Role';
import UserTypeListPage from './userType';

const AppTab = () => {
    const translate = useTranslate();
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const appName = searchParams.get('appName');
    const appId = searchParams.get('appId');
    const [isModalOpen, { open: openModal, close: closeModal }] = useDisclosure();
    const { params, setQueryParams, deserializeParams } = useQueryParams();
    const [isModalUpload, setIsModalUpload] = useState(false);
    const [form] = useForm();
    const [zipInfo, setZipInfo] = useState({ name: null, file: null });
    const validatePermission = useValidatePermission();
    const { execute: executeExport, loading: loadingExport } = useFetch(apiConfig.permission.export, {
        immediate: false,
    });
    const { execute: executeImport, loading: loadingImport } = useFetch(apiConfig.permission.import, {
        immediate: false,
    });
    const dispatch = useDispatch();

    const [activeTab, setActiveTab] = useState(
        localStorage.getItem(routes.AppTab.keyActiveTab)
            ? localStorage.getItem(routes.AppTab.keyActiveTab)
            : translate.formatMessage(commonMessage.Role),
    );
    const handleTabClick = (key) => {
        setActiveTab(key);
        localStorage.setItem(routes.AppTab.keyActiveTab, key);

        const query = deserializeParams(params);

        setQueryParams({
            appId: query.appId,
            appName: query.appName,
        });
    };

    const handleCreateClick = () => {
        if (activeTab === 'grouppermission') {
            // navigate(`${location.pathname.replace('role', 'group-permission')}/create${location.search}`);
            openModal();
        }
        if (activeTab === 'Role') {
            navigate(`${location.pathname}/create${location.search}`);
        }
        // if (activeTab === 'accountApp') {
        //     navigate(`${location.pathname.replace('role', 'account-app')}/create${location.search}`);
        // }
        if (activeTab === 'userType') {
            navigate(`${location.pathname.replace('role', 'user-type')}/create${location.search}`);
        }
        if (activeTab === 'appExtra') {
            navigate(`${location.pathname.replace('role', 'app-extra')}/create${location.search}`);
        }
    };
    const exportConfirm = (record) => {
        Modal.confirm({
            title: translate.formatMessage(commonMessage.exportConfirm),
            content: '',
            okText: translate.formatMessage(commonMessage.confirm),
            cancelText: translate.formatMessage(commonMessage.cancel),
            onOk: () => {
                dispatch(showAppLoading());
                executeExport({
                    pathParams: { id: appId },
                    onCompleted: (res) => {
                        dispatch(hideAppLoading());
                        try {
                            const jsonString = JSON.stringify(res, null, 2);
                            const blob = new Blob([jsonString], { type: "application/json" });
                            const url = URL.createObjectURL(blob);

                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${appName}-permission.json`; // đặt tên file
                            a.click();

                            URL.revokeObjectURL(url);

                        } catch (e) {
                            notification.error({
                                message: translate.formatMessage(commonMessage.error),
                                description: "Dữ liệu trả về không phải JSON hợp lệ",
                            });
                        }
                    },
                    onError: (error) => {
                        Modal.destroyAll();
                        dispatch(hideAppLoading());
                        notification.error({
                            message: translate.formatMessage(commonMessage.error),
                            description: translate.formatMessage(commonMessage.exportFail),
                        });
                    },
                });
            },
        });
    };
    const onCancel = () => {
        setIsModalUpload(false);
        updateZipInfo('name', null);
        updateZipInfo('file', null);
        form.resetFields();
    };
    const updateZipInfo = (key, value) => {
        setZipInfo(prev => ({
            ...prev,
            [key]: value,
        }));
    };
    const handleImportFile = () => {
        executeImport({
            data: {
                file: zipInfo.file,
                newAppId: appId,
            },
            onCompleted: (response) => {
                if (response.result === true) {
                    onCancel();
                    window.location.reload();
                    notification.success({
                        message: translate.formatMessage(commonMessage.success),
                        description: translate.formatMessage(commonMessage.importSuccess),
                    });
                }
            },
            onError: (error) => {
                notification.error({
                    message: translate.formatMessage(commonMessage.error),
                    description: translate.formatMessage(commonMessage.importFail),
                });
            },
        });
    };
    return (
        <PageWrapper
            routes={[
                { breadcrumbName: translate.formatMessage(commonMessage.app), path: routes.AppListPage.path },
                { breadcrumbName: appName },
            ]}
        >
            <ListPage
                searchForm={<div className={styles.btn}>
                    {validatePermission([apiConfig.permission.export.permissionCode]) && <Button
                        icon={<ExportOutlined style={{ marginRight: '8px' }} />}
                        onClick={() => {
                            exportConfirm();
                        }}
                        type='primary'
                        loading={loadingExport}
                        disabled={loadingExport}
                    >
                        {translate.formatMessage(commonMessage.export)}
                    </Button>}
                    {validatePermission([apiConfig.permission.import.permissionCode]) && <Button
                        icon={<ImportOutlined style={{ marginRight: '8px' }} />}
                        onClick={() => {
                            setIsModalUpload(true);
                        }}
                        type='primary'
                        loading={loadingImport}
                        disabled={loadingImport}
                    >
                        {translate.formatMessage(commonMessage.import)}
                    </Button>}
                </div>}
                actionBar={<div className={styles.btn}>
                    {(activeTab !== 'permission' || activeTab !== 'mobileConfig') && (
                        <Button
                            type="primary"
                            style={{ width: '120px', height: '32px' }}
                            onClick={handleCreateClick}
                        >
                            <PlusOutlined />
                            <FormattedMessage
                                defaultMessage="Thêm mới"
                                description=""
                                id="source.src.modules.app.AppTabs.index.addNew"
                            />
                        </Button>
                    )}
                </div>}
                baseTable={
                    <>
                        <Tabs
                            type="card"
                            onTabClick={handleTabClick}
                            destroyInactiveTabPane
                            activeKey={activeTab}
                            items={[
                                {
                                    key: 'Role',
                                    label: translate.formatMessage(commonMessage.role),
                                    children: <RoleListPage />,
                                },

                                {
                                    key: 'permission',
                                    label: translate.formatMessage(commonMessage.permission),
                                    children: <PermissionForm />,
                                },
                                {
                                    key: 'grouppermission',
                                    label: translate.formatMessage(commonMessage.Grouppermission),
                                    children:
                                        <GroupPermissionListPage
                                            isModalOpen={isModalOpen}
                                            openModal={openModal}
                                            closeModal={closeModal}
                                        />,
                                },
                                // {
                                //     key: 'accountApp',
                                //     label: translate.formatMessage(commonMessage.accountApp),
                                //     children: <AccountAppListPage />,
                                // },
                                {
                                    key: 'userType',
                                    label: translate.formatMessage(commonMessage.userType),
                                    children: <UserTypeListPage />,
                                },
                                {
                                    key: 'appExtra',
                                    label: translate.formatMessage(commonMessage.appExtra),
                                    children: <AppExtraListPage />,
                                },
                                {
                                    key: 'mobileConfig',
                                    label: translate.formatMessage(commonMessage.mobileConfig),
                                    children: <MobileConfigSavebase />,
                                },
                            ]}
                        />
                        <Modal
                            title={translate.formatMessage(commonMessage.import)}
                            open={isModalUpload}
                            onCancel={onCancel}
                            footer={<div>
                                <Button type='primary'
                                    onClick={handleImportFile}
                                    disabled={zipInfo?.file == null}
                                    loading={loadingImport}>
                                    Import
                                </Button>
                            </div>}
                            centered
                            modalRender={(modal) => {
                                return React.cloneElement(modal, {
                                    style: {
                                        ...modal.props.style,
                                        padding: '20px',
                                        overflow: 'hidden',
                                    },
                                });
                            }}
                            styles={{
                                body: {
                                    height: 'max-content',
                                },
                                footer: {
                                    marginTop: '-8px',
                                },
                            }}
                            width={550}
                        >
                            <UploadZipProcessField
                                name="content"
                                onCancel={onCancel}
                                updateZipInfo={updateZipInfo}
                                zipInfo={zipInfo}
                            />
                        </Modal>
                    </>
                }
            />
        </PageWrapper>
    );
};

export default AppTab;
