import apiConfig from '@constants/apiConfig';
import { ErrorCode } from '@constants/errorCodes';
import useFetch from '@hooks/useFetch';
import useSaveBase from '@hooks/useSaveBase';
import useTranslate from '@hooks/useTranslate';
import { PageWrapper } from '@components/cms';
import { commonMessage } from '@locales/intl';
import routes from '@routes';
import { showErrorMessage } from '@services/notifyService';
import React, { useState } from 'react';
import { defineMessages } from 'react-intl';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import RoleForm from './RoleForm';
const message = defineMessages({
    objectName: 'Quyền',
});


const RoleSavePage = () => {
    const { id } = useParams();
    const translate = useTranslate();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);

    const appName = searchParams.get('appName');
    const appId = searchParams.get('appId');
    const path = `?appId=${appId}&appName=${appName}`;
    const [permissions, setPermissions] = useState([]);
    const { execute: executeGetPermission } = useFetch(apiConfig.permission.getList, {       
        immediate: false,
        params: { appId: appId },
    });

    const { detail, mixinFuncs, loading, onSave, setIsChangedFormValues, isEditing, title, setSubmit } = useSaveBase({
        apiConfig: {
            getById: apiConfig.role.getById,
            create: apiConfig.role.create,
            update: apiConfig.role.update,
        },
        options: {           
            objectName: translate.formatMessage(commonMessage.role), 
            getListUrl: generatePath(routes.AppTab.path + path),
        },
        override: (funcs) => {
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

            funcs.onBack = (isSuccess = true) => {
                navigate(-1);
            };
            
            funcs.prepareUpdateData = (data) => {
                return {
                    ...data,
                    id: detail.id,
                    status: 1,
                };
            };

            funcs.prepareCreateData = (data) => {
                return {
                    ...data,
                    status: 1,
                };
            };
            funcs.mappingData = (response) => {
                if (response.result === true)
                    return {
                        ...response.data,
                        permissions: response.data?.permissions
                            ? response.data?.permissions.map((permission) => permission.id)
                            : [],
                    };
            };
           
        },
    });

    // useEffect(() => {
    //     executeGetPermission({          
    //         onCompleted: (res) => {
    //             setPermissions(res?.data);
    //         },
    //     });
    // }, []);

    return (
        <PageWrapper
            loading={loading}
            routes={[
                { breadcrumbName:  translate.formatMessage(commonMessage.app), path: routes.AppListPage.path },
                { breadcrumbName: appName, path: generatePath(routes.AppTab.path) + location.search },
                { breadcrumbName: title },
            ]}
        >
            <RoleForm
                size="normal"
                setIsChangedFormValues={setIsChangedFormValues}
                dataDetail={detail ? detail : {}}
                formId={mixinFuncs.getFormId()}
                isEditing={isEditing}
                actions={mixinFuncs.renderActions()}
                onSubmit={onSave}
                // permissions={permissions || []}
            />
        </PageWrapper>
    );
};

export default RoleSavePage;
