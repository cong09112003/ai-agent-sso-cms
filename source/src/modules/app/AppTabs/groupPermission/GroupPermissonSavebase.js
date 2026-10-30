import apiConfig from '@constants/apiConfig';
import { ErrorCode } from '@constants/errorCodes';
import useSaveBase from '@hooks/useSaveBase';
import useTranslate from '@hooks/useTranslate';
import { PageWrapper } from '@components/cms';
import { commonMessage } from '@locales/intl';
import routes from '@routes';
import React from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import { showErrorMessage } from '@services/notifyService';
import GroupPermissionForm from './GroupPermissionForm';

const GroupPermissionSavePage = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const appId = searchParams.get('appId');
    const appName = searchParams.get('appName');
    const path = `?appId=${appId}&appName=${appName}`;

    const { detail, mixinFuncs, loading, setIsChangedFormValues, isEditing, title, setSubmit } = useSaveBase({
        apiConfig: {
            getById: apiConfig.permissionGroup.getById,
            create: apiConfig.permissionGroup.create,
            update: apiConfig.permissionGroup.update,
        },
        options: {
            getListUrl: generatePath(routes.AppTab.path + path),
            objectName: translate.formatMessage(commonMessage.Grouppermission),
        },
        override: (funcs) => {
            funcs.prepareUpdateData = (data) => {
                return {
                    ...data,
                    id: detail.id,
                };
            };
            funcs.prepareCreateData = (data) => {
                return {
                    ...data,
                };
            };
            funcs.onBack = (isSuccess = true) => {
                navigate(-1);
            };
            
            funcs.onSaveError = (err) => {
                const errorCode = err.response?.data?.code;
                const errorMessage = ErrorCode[errorCode]?.message;
                if (errorMessage) {
                    showErrorMessage(errorMessage);
                    setSubmit(false);
                } else {
                    mixinFuncs.handleShowErrorMessage(err, showErrorMessage);
                    setSubmit(false);
                }
            };
        },
    });

    return (
        <PageWrapper
            routes={[
                { breadcrumbName:  translate.formatMessage(commonMessage.app), path: routes.AppListPage.path },
                { breadcrumbName: appName, path: generatePath(routes.AppTab.path) + `?appId=${appId}&appName=${appName}` },            
                { breadcrumbName: title },
            ]}
            title={title}
        >
            <GroupPermissionForm
                setIsChangedFormValues={setIsChangedFormValues}
                dataDetail={detail ? detail : {}}
                formId={mixinFuncs.getFormId()}
                isEditing={isEditing}
                actions={mixinFuncs.renderActions()}
                onSubmit={mixinFuncs.onSave}
            />
        </PageWrapper>
    );
};

export default GroupPermissionSavePage;