
import apiConfig from '@constants/apiConfig';
import { ErrorCode } from '@constants/errorCodes';
import useSaveBase from '@hooks/useSaveBase';
import useTranslate from '@hooks/useTranslate';
import { PageWrapper } from '@components/cms';
import { commonMessage } from "@locales/intl";
import { showErrorMessage } from '@services/notifyService';
import React from 'react';
import { defineMessages } from 'react-intl';
import { generatePath } from 'react-router-dom';
import ManagerForm from './managerForm';
import routes from './routes';
const message = defineMessages({
    objectName: 'Quản trị viên',
});

const ManagerSavePage = () => {
    const translate = useTranslate();
    const searchParams = new URLSearchParams(location.search);
    const page = searchParams.get('page');
    const path = `?page=${page}`;


    const { detail, mixinFuncs, loading, setIsChangedFormValues, isEditing, title, setSubmit } = useSaveBase({
        apiConfig: {
            getById: apiConfig.user.getById,
            create: apiConfig.user.create,
            update: apiConfig.user.update,
        },
        options: {
            getListUrl: generatePath( routes.managerListPage.path + path),
            objectName: translate.formatMessage(message.objectName),
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

    const setBreadRoutes = () => {
        const breadRoutes = [
            { breadcrumbName: translate.formatMessage(commonMessage.manager), path: routes.managerListPage.path },
            { breadcrumbName: title },
        ];
        return breadRoutes;
    };

    return (
        <PageWrapper routes={setBreadRoutes()}>
            <ManagerForm
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

export default ManagerSavePage;