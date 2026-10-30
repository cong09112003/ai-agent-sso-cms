import apiConfig from '@constants/apiConfig';
import { ErrorCode } from '@constants/errorCodes';
import useSaveBase from '@hooks/useSaveBase';
import useTranslate from '@hooks/useTranslate';
import { PageWrapper } from '@components/cms';
import { commonMessage } from '@locales/intl';
import routes from '@routes';
import { showErrorMessage } from '@services/notifyService';
import React from 'react';
import { defineMessages } from 'react-intl';
import { generatePath, useNavigate } from 'react-router-dom';
import AccountAppForm from './AccountForm';
const message = defineMessages({
    objectName: 'Account app',
});

const AccountAppSavePage = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const fullName = searchParams.get('fullName');
    const { detail, mixinFuncs, loading, setIsChangedFormValues, isEditing, title, setSubmit } = useSaveBase({
        apiConfig: {
            getById: apiConfig.accountApp.getById,
            create: apiConfig.accountApp.create,
            update: apiConfig.accountApp.update,
        },
        options: {
            objectName: translate.formatMessage(message.objectName),            
            getListUrl: generatePath(routes.AppAcountListPage.path, { accountId: searchParams.accountId, fullName: searchParams.fullName }),
        },
        override: (funcs) => {
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
                { breadcrumbName:  translate.formatMessage(commonMessage.manager), path: routes.managerListPage.path },
                { breadcrumbName: fullName, path: routes.AppAcountListPage.path + location.search },
                { breadcrumbName: title },
            ]}
            title={title}
        >
            <AccountAppForm
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

export default AccountAppSavePage;