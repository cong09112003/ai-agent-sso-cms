import apiConfig from '@constants/apiConfig';
import { ErrorCode } from '@constants/errorCodes';
import useSaveBase from '@hooks/useSaveBase';
import useTranslate from '@hooks/useTranslate';
import routes from '@routes';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';
import React, { useEffect } from 'react';
import { defineMessages } from 'react-intl';
import { useLocation } from 'react-router-dom';
import MobileConfigForm from './MobileConfigForm';
import useQueryParams from '@hooks/useQueryParams';
const message = defineMessages({
    objectName: 'Cấu hình mobile',
});

const MobileConfigSavebase = () => {
    const translate = useTranslate();
    const location = useLocation();
    const search = location.search;
    const { params } = useQueryParams();
    const appId = params.get('appId');
    
    const { detail, mixinFuncs, setIsChangedFormValues, isEditing, setSubmit } = useSaveBase({
        apiConfig: {
            getById: apiConfig.app.getById,
            update: apiConfig.app.updateMobileConfig,
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
            funcs.handleFetchDetail = (params) => {
                funcs.executeGet({
                    ...params,
                    pathParams: { id: appId },
                    onCompleted: (response) => {
                        funcs.setDetail(mixinFuncs.mappingData(response));
                    },
                    onError: mixinFuncs.handleGetDetailError,
                });
            };
            funcs.onBack = () => {
                mixinFuncs.getDetail();
            };
        },
    });

    useEffect(() => {
        mixinFuncs.getDetail();
    }, []);

    return (
        <MobileConfigForm
            setIsChangedFormValues={setIsChangedFormValues}
            dataDetail={detail ? detail : {}}
            formId={mixinFuncs.getFormId()}
            isEditing={isEditing}
            actions={mixinFuncs.renderActions()}
            onSubmit={mixinFuncs.onSave}
        />
    );
};

export default MobileConfigSavebase;