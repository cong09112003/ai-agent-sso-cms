
import apiConfig from '@constants/apiConfig';
import { ErrorCode } from '@constants/errorCodes';
import useSaveBase from '@hooks/useSaveBase';
import useTranslate from '@hooks/useTranslate';
import { PageWrapper } from '@components/cms';
import routes from '@routes';
import { showErrorMessage } from '@services/notifyService';
import React from 'react';
import { defineMessages } from 'react-intl';
import { useLocation } from 'react-router-dom';
import AppForm from './AppForm';
const message = defineMessages({
    objectName: 'App',
});

const AppSavePage = () => {
    const translate = useTranslate();
    const location = useLocation();
    const search = location.search;
    
    const { detail, mixinFuncs, loading, setIsChangedFormValues, isEditing, title, setSubmit } = useSaveBase({
        apiConfig: {
            getById: apiConfig.app.getById,
            create: apiConfig.app.create,
            update: apiConfig.app.update,
        },
        options: {
            getListUrl: routes.AppListPage.path + search,
            objectName: translate.formatMessage(message.objectName),
        },
        override: (funcs) => {
            funcs.prepareUpdateData = (data) => {
                return {
                    ...data,
                    id: detail.id,
                };
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
            funcs.prepareCreateData = (data) => {
                return {
                    ...data,
                };
            };
        },
    });

    return (
        <PageWrapper
            routes={[
                { breadcrumbName: translate.formatMessage(message.objectName), path: routes.AppListPage.path + search },
                { breadcrumbName: title },
            ]}
            title={title}
            loading={loading}
        >
            <AppForm
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

export default AppSavePage;