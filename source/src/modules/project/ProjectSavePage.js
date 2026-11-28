import apiConfig from '@constants/apiConfig';
import { ErrorCode } from '@constants/errorCodes';
import useSaveBase from '@hooks/useSaveBase';
import useTranslate from '@hooks/useTranslate';
import { PageWrapper } from '@components/cms';
import { showErrorMessage } from '@services/notifyService';
import React from 'react';
import { defineMessages } from 'react-intl';
import ProjectForm from './ProjectForm';
import routes from './routes';

const message = defineMessages({
    objectName: 'Dự án',
});

const ProjectSavePage = () => {
    const translate = useTranslate();

    const { detail, mixinFuncs, setIsChangedFormValues, isEditing, title, setSubmit } = useSaveBase({
        apiConfig: {
            getById: apiConfig.project.getById,
            create: apiConfig.project.create,
            update: apiConfig.project.update,
        },
        options: {
            getListUrl: routes.projectListPage.path,
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
                } else {
                    mixinFuncs.handleShowErrorMessage(err, showErrorMessage);
                }
                setSubmit(false);
            };
        },
    });

    return (
        <PageWrapper
            routes={[
                { breadcrumbName: translate.formatMessage(message.objectName), path: routes.projectListPage.path },
                { breadcrumbName: title },
            ]}
        >
            <ProjectForm
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

export default ProjectSavePage;
